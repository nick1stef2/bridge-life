import fs from "node:fs";
import path from "node:path";
import { resolveOfficialTiedPositions } from "./lib/standings-position.mjs";
import { fileURLToPath } from "node:url";
import { virtualMatchpoints } from "./lib/virtual-matchpoints.mjs";
import { scoreContract, sideForDeclarer } from "./lib/bridge-scoring.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePbn = process.argv[2] || "C:/Users/ΔΕΛΤΑ/Downloads/boards-205598 (1).pbn";
const suppliedLin = process.argv[3] || "C:/Users/ΔΕΛΤΑ/Downloads/boards-205598.lin";
const outDir = path.join(root, "boards", "training", "real-tournament-replay-2026-08-23");
const baseUrl = "https://hellasbridge.org/results/205598";
const seats = ["N", "E", "S", "W"];
const seatNumber = { S: 1, W: 2, N: 3, E: 4 };
const vulToLin = { None: "o", NS: "n", EW: "e", All: "b", Both: "b" };
const suitSymbol = { club: "♣", diamond: "♦", heart: "♥", spade: "♠" };
const greekSeat = { Β: "N", Α: "E", Ν: "S", Δ: "W", "-": null };

const decode = (value) => value
  .replace(/&nbsp;|&#160;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"')
  .replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const text = (html) => decode(html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]*>/g, " ")).replace(/[ \t]+/g, " ").replace(/\s*\n\s*/g, "\n").trim();
const cells = (row, tag = "td") => [...row.matchAll(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi"))].map((match) => match[1]);
const rows = (html) => [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((match) => match[1]);
const tables = (html) => [...html.matchAll(/<table[^>]*>([\s\S]*?)<\/table>/gi)].map((match) => match[1]);
const links = (html) => [...html.matchAll(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)].map((match) => ({ href: decode(match[1]), text: text(match[2]) }));

function parsePbn(source) {
  const records = [];
  for (const block of source.replace(/^\uFEFF/, "").split(/\r?\n\s*\r?\n/)) {
    const tags = Object.fromEntries([...block.matchAll(/^\[([A-Za-z0-9_]+)\s+"(.*)"\]\s*$/gm)].map((match) => [match[1], match[2]]));
    if (tags.Board && tags.Deal) records.push({ board: Number(tags.Board), tags, block: block.trim() });
  }
  return records.sort((a, b) => a.board - b.board);
}

function pbnHands(deal) {
  const match = deal.match(/^([NESW]):(.+)$/);
  if (!match) throw new Error(`invalid PBN Deal: ${deal}`);
  const start = seats.indexOf(match[1]);
  const hands = match[2].trim().split(/\s+/);
  if (hands.length !== 4) throw new Error(`Deal does not contain four hands: ${deal}`);
  return Object.fromEntries(hands.map((hand, index) => [seats[(start + index) % 4], hand]));
}

function validateDeal(record) {
  const hands = pbnHands(record.tags.Deal);
  const cards = [];
  const hcpBySeat = {};
  const shapeBySeat = {};
  for (const seat of seats) {
    const suits = hands[seat].split(".");
    if (suits.length !== 4) throw new Error(`Board ${record.board}: invalid hand for ${seat}`);
    shapeBySeat[seat] = suits.map((suit) => suit.length);
    const handCards = suits.flatMap((suit, suitIndex) => [...suit].map((rank) => `${"SHDC"[suitIndex]}${rank}`));
    if (handCards.length !== 13) throw new Error(`Board ${record.board}: ${seat} has ${handCards.length} cards`);
    cards.push(...handCards);
    hcpBySeat[seat] = handCards.reduce((sum, card) => sum + ({ A: 4, K: 3, Q: 2, J: 1 }[card[1]] || 0), 0);
  }
  if (new Set(cards).size !== 52) throw new Error(`Board ${record.board}: cards are not unique`);
  if (Object.values(hcpBySeat).reduce((sum, value) => sum + value, 0) !== 40) throw new Error(`Board ${record.board}: HCP total is not 40`);
  return { hands, hcpBySeat, shapeBySeat };
}

function linHand(hand) {
  const [spades = "", hearts = "", diamonds = "", clubs = ""] = hand.split(".");
  return `S${spades}H${hearts}D${diamonds}C${clubs}`;
}

function recordToLin(record) {
  const hands = pbnHands(record.tags.Deal);
  const dealer = record.tags.Dealer;
  const vulnerability = record.tags.Vulnerable;
  if (!(dealer in seatNumber)) throw new Error(`Board ${record.board}: invalid dealer ${dealer}`);
  if (!(vulnerability in vulToLin)) throw new Error(`Board ${record.board}: invalid vulnerability ${vulnerability}`);
  // BBO Teaching Table Hand Records use three explicitly supplied hands
  // (South, West, North); East is inferred from the remaining thirteen cards.
  return `qx|o${record.board}|pn|Μιχάλης,West,Νίκος,East|st||md|${seatNumber[dealer]}${["S", "W", "N"].map((seat) => linHand(hands[seat])).join(",")}|rh||ah|Board ${record.board}|sv|${vulToLin[vulnerability]}|pg||`;
}

function parseTraveller(html, board) {
  const table = tables(html).at(-1);
  if (!table) throw new Error(`Board ${board}: traveller table missing`);
  return rows(table).slice(1).map((row) => {
    const c = cells(row);
    if (c.length < 11) throw new Error(`Board ${board}: malformed traveller row`);
    const suitClass = c[4].match(/icon-(club|diamond|heart|spade)/)?.[1] || null;
    const publishedContract = text(c[4]).replace(/^(?:[ΒΑΝΔ]|-):\s*/, "").replace(/\s+/g, "") || "Pass";
    const nsScoreText = text(c[7]);
    const ewScoreText = text(c[8]);
    const nsScore = nsScoreText === "Pass" ? 0 : nsScoreText ? Number(nsScoreText) : ewScoreText ? -Number(ewScoreText) : 0;
    const suffix = publishedContract.match(/([+-]\d+)$/)?.[1] || (publishedContract === "Pass" ? null : "=");
    const baseContract = publishedContract.replace(/[+-]\d+$/, "");
    return {
      round: Number(text(c[0])), table: Number(text(c[1])),
      nsPlayers: links(c[2]).map((link) => link.text), ewPlayers: links(c[3]).map((link) => link.text),
      contract: baseContract === "Pass" ? "Pass" : baseContract.replace("ΧΑ", "NT") + (suitClass ? suitSymbol[suitClass] : ""),
      publishedContract, result: suffix, declarer: greekSeat[text(c[5])], publishedDeclarer: text(c[5]),
      openingLead: text(c[6]), nsScore, nsPercentage: text(c[9]), ewPercentage: text(c[10])
    };
  });
}

function parseStandings(html) {
  const table = tables(html).at(-1);
  const parsedRows = rows(table).slice(1).map((row) => {
    const c = cells(row);
    const rowLinks = links(row);
    const ids = rowLinks.filter((link) => /^\d{5}$/.test(link.text)).map((link) => link.text).slice(0, 2);
    const fullNames = rowLinks.filter((link) => !/^\d{5}$/.test(link.text) && link.text.split(/\s+/).length > 1 && !/^[Α-ΩΆΈΉΊΌΎΏ]\.?(?:\s|$)/.test(link.text));
    const uniqueNames = [...new Set(fullNames.map((link) => link.text))].slice(0, 2);
    return {
      position: text(c[0]), playerIds: ids, players: uniqueNames,
      categories: (text(c[5]).match(/\d+\s*-\s*\d+/)?.[0] || text(c[5])).replace(/\s+/g, " "), percentage: text(c[6]), masterPoints: text(c[7]) || null
    };
  });
  return resolveOfficialTiedPositions(parsedRows);
}

async function fetchHtml(url) {
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    const response = await fetch(url, { headers: { "user-agent": "Bridge-Life training replay validator" } });
    if (response.ok) return response.text();
    if (response.status !== 429 || attempt === 6) throw new Error(`${url}: HTTP ${response.status}`);
    const retryAfter = Number(response.headers.get("retry-after")) || 10;
    await new Promise((resolve) => setTimeout(resolve, Math.min(retryAfter, 30) * 1000));
  }
  throw new Error(`${url}: retry limit exceeded`);
}

const pbnRecords = parsePbn(fs.readFileSync(sourcePbn, "utf8"));
const selected = pbnRecords.filter((record) => record.board >= 1 && record.board <= 21);
if (selected.length !== 21 || selected.some((record, index) => record.board !== index + 1)) throw new Error("PBN must contain Boards 1–21 exactly once");
const dealMetadata = selected.map((record) => ({ board: record.board, dealer: record.tags.Dealer, vulnerability: record.tags.Vulnerable, deal: record.tags.Deal, ...validateDeal(record) }));
const collectionLin = selected.map(recordToLin).join("\r\n");
const qxBoards = [...collectionLin.matchAll(/qx\|o(\d+)\|/g)].map((match) => Number(match[1]));
if (qxBoards.join(",") !== Array.from({ length: 21 }, (_, index) => index + 1).join(",")) throw new Error("LIN board sequence mismatch");
if (/(?:mb|pc|mc|rs)\|/i.test(collectionLin)) throw new Error("solution/result leak detected in BBO LIN");
const linLines = collectionLin.split(/\r?\n/);
if (linLines.length !== 21) throw new Error(`BBO collection must contain 21 separate lines, found ${linLines.length}`);
for (const [index, line] of linLines.entries()) {
  const md = line.match(/\|md\|\d([^|]+)\|/)?.[1];
  if (!md || md.split(",").length !== 3) throw new Error(`Board ${index + 1}: BBO md must contain exactly S,W,N hands`);
  if (!line.endsWith("|pg||")) throw new Error(`Board ${index + 1}: missing BBO board terminator`);
}
const supplied = fs.readFileSync(suppliedLin, "utf8");
const suppliedBoardCount = [...supplied.matchAll(/qx\|o(\d+)\|/g)].length;

const standings = parseStandings(await fetchHtml(baseUrl));
if (standings.length !== 14) throw new Error(`expected 14 pairs, found ${standings.length}`);
const travellers = [];
for (let board = 1; board <= 21; board += 1) {
  const results = parseTraveller(await fetchHtml(`${baseUrl}/board/${board}`), board);
  if (results.length !== 6) throw new Error(`Board ${board}: expected 6 results, found ${results.length}`);
  if (results.some((result) => !Number.isFinite(result.nsScore))) throw new Error(`Board ${board}: invalid score`);
  travellers.push({ board, dealer: dealMetadata[board - 1].dealer, vulnerability: dealMetadata[board - 1].vulnerability, source: `${baseUrl}/board/${board}`, results });
  await new Promise((resolve) => setTimeout(resolve, 350));
}

let scoreChecks = 0;
let percentageChecks = 0;
for (const board of travellers) {
  const scores = board.results.map((result) => result.nsScore);
  for (const result of board.results) {
    if (result.contract !== "Pass") {
      const level = Number(result.contract[0]);
      const denomination = result.contract.includes("NT") ? "NT" : ({ "♣": "C", "♦": "D", "♥": "H", "♠": "S" })[result.contract.at(-1)];
      const delta = result.result === "=" ? 0 : Number(result.result);
      const tricks = level + 6 + delta;
      const calculated = scoreContract({ level, denomination, declarerSide: sideForDeclarer(result.declarer), tricks, vulnerability: board.vulnerability });
      if (calculated !== result.nsScore) throw new Error(`Board ${board.board}: published score ${result.nsScore} conflicts with ${result.contract}${result.result} by ${result.declarer} (${calculated})`);
    } else if (result.nsScore !== 0) throw new Error(`Board ${board.board}: Pass must score zero`);
    scoreChecks += 1;
    const lower = scores.filter((score) => result.nsScore > score).length;
    const equalsIncludingSelf = scores.filter((score) => result.nsScore === score).length;
    const expectedPercentage = ((lower * 2 + equalsIncludingSelf - 1) / 10) * 100;
    const publishedPercentage = Number(result.nsPercentage.replace("%", "").replace(",", "."));
    if (Math.abs(expectedPercentage - publishedPercentage) > 0.011) throw new Error(`Board ${board.board}: published NS% ${publishedPercentage} conflicts with traveller scores (${expectedPercentage})`);
    percentageChecks += 1;
  }
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "Real-Tournament-2026-08-23-Boards-1-21.lin"), collectionLin + "\n", "utf8");
fs.writeFileSync(path.join(outDir, "Real-Tournament-2026-08-23-Boards-1-21.pbn"), selected.map((record) => record.block).join("\n\n") + "\n", "utf8");
fs.writeFileSync(path.join(outDir, "travellers-boards-1-21.json"), JSON.stringify({ eventId: 205598, event: "Ζεύγη 1-6 Κυριακής 5 Ημερίδα 23/8/26", scoringMethod: "A", comparisonCount: 6, boardTop: 12, boards: travellers }, null, 2) + "\n", "utf8");
fs.writeFileSync(path.join(outDir, "final-standings.json"), JSON.stringify({ source: baseUrl, pairs: standings }, null, 2) + "\n", "utf8");
fs.writeFileSync(path.join(outDir, "deal-metadata.json"), JSON.stringify(dealMetadata, null, 2) + "\n", "utf8");
fs.writeFileSync(path.join(outDir, "virtual-results-template.json"), JSON.stringify({
  pair: ["Νίκος", "Μιχάλης"], axis: "NS", method: "A",
  results: selected.map(({ board }) => ({ board, contract: null, declarer: null, result: null, tricks: null, openingLead: null, notes: null }))
}, null, 2) + "\n", "utf8");
fs.writeFileSync(path.join(outDir, "POST-GAME-REPORT-TEMPLATE.md"), `# Board {{board}} — Post-game report\n\n- Νίκος–Μιχάλης: {{contract}} από {{declarer}}, {{result}}\n- Raw score NS: {{nsScore}}\n- Virtual matchpoints: {{matchpoints}} / 12 ({{percentage}}%)\n- Πραγματικά NS scores field: {{fieldScores}}\n- Top / average / bottom: {{top}} / {{average}} / {{bottom}}\n- Συνηθέστερο συμβόλαιο: {{commonContract}}\n- DDS tricks / optimum (μόνο για ανάλυση): {{dds}}\n\n## Σύντομη ανάλυση\n\n- Αγορά: {{biddingAnalysis}}\n- Εκτέλεση ή άμυνα: {{playAnalysis}}\n- Συμπέρασμα: {{conclusion}}\n`, "utf8");

const examples = [
  { board: 1, nsScore: 110 }, { board: 1, nsScore: -100 }, { board: 1, nsScore: -200 }
].map((example) => ({ ...example, ...virtualMatchpoints(example.nsScore, travellers[example.board - 1].results.map((result) => result.nsScore)) }));
const validation = {
  status: "PASS", pbnRecords: pbnRecords.length, selectedBoards: 21, linBoards: qxBoards.length,
  validDeals: dealMetadata.length, travellerBoards: travellers.length, travellerRows: travellers.reduce((sum, board) => sum + board.results.length, 0),
  travellerRawScoreChecks: scoreChecks, publishedPercentageChecks: percentageChecks,
  standingsPairs: standings.length, noResultLeakInLin: true,
  bboSeparateBoardLines: linLines.length, bboExplicitHandsPerBoard: 3,
  suppliedSourceLinBoards: suppliedBoardCount, generatedFromCanonicalPbn: true,
  fixedVirtualAxis: "NS", scoringMethod: "A — virtual score compared with six published field NS scores; published percentages remain unchanged",
  examples
};
fs.writeFileSync(path.join(outDir, "validation-report.json"), JSON.stringify(validation, null, 2) + "\n", "utf8");
fs.writeFileSync(path.join(outDir, "README.md"), `# Real Tournament Replay — 23/08/2026\n\n- Event: Ζεύγη 1-6 Κυριακής 5 Ημερίδα\n- Boards: 1–21 only\n- Virtual pair: Νίκος–Μιχάλης, always NS\n- Official standings: ${baseUrl}\n- Official travellers: ${baseUrl}/board/1 through /board/21\n- Deals/dealer/vulnerability: official PBN\n\n## Virtual scoring\n\nMethod A is used. The virtual NS raw score is compared against the six published NS scores. Each lower field score gives 2 MP, each tie 1 MP and each higher field score 0 MP. Board top is 12 MP and the percentage is MP / 12 × 100. Published field percentages are never recalculated.\n\n## Post-game input\n\nRecord board, contract, declarer, tricks/result and opening lead. The raw score is calculated with the board vulnerability, then compared with the six field NS scores. DDS, if added later, is analysis only and never changes matchpoint scoring.\n`, "utf8");
console.log(JSON.stringify(validation, null, 2));
