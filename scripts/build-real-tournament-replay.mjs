import fs from "node:fs";
import path from "node:path";
import { resolveOfficialTiedPositions } from "./lib/standings-position.mjs";
import { fileURLToPath } from "node:url";
import { scoreContract, sideForDeclarer } from "./lib/bridge-scoring.mjs";
import { virtualMatchpoints } from "./lib/virtual-matchpoints.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [eventId, isoDate] = process.argv.slice(2);
if (!/^\d+$/.test(eventId || "") || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate || "")) {
  throw new Error("Usage: node scripts/build-real-tournament-replay.mjs <eventId> <YYYY-MM-DD>");
}
const outDir = path.join(root, "output", `real-tournament-replay-${isoDate}`);
const sourcePbn = path.join(outDir, `boards-${eventId}.pbn`);
const baseUrl = `https://hellasbridge.org/results/${eventId}`;
const seats = ["N", "E", "S", "W"];
const seatNumber = { S: 1, W: 2, N: 3, E: 4 };
const vulToLin = { None: "o", NS: "n", EW: "e", All: "b", Both: "b" };
const suitSymbol = { club: "♣", diamond: "♦", heart: "♥", spade: "♠" };
const greekSeat = { Β: "N", Α: "E", Ν: "S", Δ: "W", "-": null };

const decode = (value) => value.replace(/&nbsp;|&#160;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const plainText = (html) => decode(html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]*>/g, " ")).replace(/[ \t]+/g, " ").replace(/\s*\n\s*/g, "\n").trim();
const cells = (row, tag = "td") => [...row.matchAll(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi"))].map((match) => match[1]);
const rows = (html) => [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((match) => match[1]);
const tables = (html) => [...html.matchAll(/<table[^>]*>([\s\S]*?)<\/table>/gi)].map((match) => match[1]);
const links = (html) => [...html.matchAll(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)].map((match) => ({ href: decode(match[1]), text: plainText(match[2]) }));

function parsePbn(source) {
  return source.replace(/^\uFEFF/, "").split(/\r?\n\s*\r?\n/).map((block) => {
    const tags = Object.fromEntries([...block.matchAll(/^\[([A-Za-z0-9_]+)\s+"(.*)"\]\s*$/gm)].map((match) => [match[1], match[2]]));
    return tags.Board && tags.Deal ? { board: Number(tags.Board), tags, block: block.trim() } : null;
  }).filter(Boolean).sort((a, b) => a.board - b.board);
}

function pbnHands(deal) {
  const match = deal.match(/^([NESW]):(.+)$/);
  if (!match) throw new Error(`invalid PBN deal ${deal}`);
  const start = seats.indexOf(match[1]);
  const hands = match[2].trim().split(/\s+/);
  if (hands.length !== 4) throw new Error("PBN deal must contain four hands");
  return Object.fromEntries(hands.map((hand, index) => [seats[(start + index) % 4], hand]));
}

function validateDeal(record) {
  const hands = pbnHands(record.tags.Deal), cards = [], hcpBySeat = {}, shapeBySeat = {};
  for (const seat of seats) {
    const suits = hands[seat].split(".");
    if (suits.length !== 4) throw new Error(`Board ${record.board}: invalid ${seat} hand`);
    shapeBySeat[seat] = suits.map((suit) => suit.length);
    const handCards = suits.flatMap((suit, index) => [...suit].map((rank) => `${"SHDC"[index]}${rank}`));
    if (handCards.length !== 13) throw new Error(`Board ${record.board}: ${seat} has ${handCards.length} cards`);
    cards.push(...handCards);
    hcpBySeat[seat] = handCards.reduce((sum, card) => sum + ({ A: 4, K: 3, Q: 2, J: 1 }[card[1]] || 0), 0);
  }
  if (new Set(cards).size !== 52) throw new Error(`Board ${record.board}: duplicate/missing cards`);
  if (Object.values(hcpBySeat).reduce((sum, value) => sum + value, 0) !== 40) throw new Error(`Board ${record.board}: HCP total is not 40`);
  return { hands, hcpBySeat, shapeBySeat };
}

function pageHands(html, board) {
  const boardTable = tables(html)[0];
  const handCells = rows(boardTable).flatMap((row) => cells(row)).filter((cell) => ["spade", "heart", "diamond", "club"].every((suit) => cell.includes(`icon-${suit}`)));
  if (handCells.length !== 4) throw new Error(`Board ${board}: official page hand diagram is incomplete`);
  const parse = (cell) => ["spade", "heart", "diamond", "club"].map((suit) => decode(cell.match(new RegExp(`icon-${suit}[^>]*><\\/i>\\s*([^<]*)`, "i"))?.[1] || "").replace(/\s+/g, "")).join(".");
  return Object.fromEntries(["N", "W", "E", "S"].map((seat, index) => [seat, parse(handCells[index])]));
}

function linHand(hand) { const [s = "", h = "", d = "", c = ""] = hand.split("."); return `S${s}H${h}D${d}C${c}`; }
function replaySeating(board) {
  if (eventId === "205791") {
    return board <= 4
      ? { pn: "Νίκος,West,Μιχάλης,East", axis: "NS" }
      : { pn: "South,Μιχάλης,North,Νίκος", axis: "EW" };
  }
  if (eventId === "205728" && board >= 25 && board <= 28) {
    return { pn: "South,Μιχάλης,North,Νίκος", axis: "EW" };
  }
  return { pn: "Μιχάλης,West,Νίκος,East", axis: "NS" };
}
function recordToLin(record) {
  const hands = pbnHands(record.tags.Deal), dealer = record.tags.Dealer, vulnerability = record.tags.Vulnerable;
  if (!(dealer in seatNumber) || !(vulnerability in vulToLin)) throw new Error(`Board ${record.board}: invalid dealer/vulnerability`);
  return `qx|o${record.board}|pn|${replaySeating(record.board).pn}|st||md|${seatNumber[dealer]}${["S", "W", "N"].map((seat) => linHand(hands[seat])).join(",")}|rh||ah|Board ${record.board}|sv|${vulToLin[vulnerability]}|pg||`;
}

function parseTraveller(html, board) {
  const table = tables(html).at(-1);
  if (!table) return [];
  return rows(table).slice(1).map((row) => {
    const c = cells(row);
    if (c.length < 11) return null;
    const suitClass = c[4].match(/icon-(club|diamond|heart|spade)/)?.[1] || null;
    const publishedContract = plainText(c[4]).replace(/^(?:[ΒΑΝΔ]|-):\s*/, "").replace(/\s+/g, "") || "Pass";
    const nsText = plainText(c[7]), ewText = plainText(c[8]);
    const adjusted = publishedContract === "-" || /%$/.test(nsText) || /%$/.test(ewText);
    const nsScore = adjusted ? null : nsText === "Pass" ? 0 : nsText ? Number(nsText) : ewText ? -Number(ewText) : 0;
    const result = adjusted ? null : publishedContract.match(/([+-]\d+)$/)?.[1] || (publishedContract === "Pass" ? null : "=");
    const base = publishedContract.replace(/[+-]\d+$/, "");
    return { round: Number(plainText(c[0])), table: Number(plainText(c[1])), nsPlayers: links(c[2]).map((link) => link.text), ewPlayers: links(c[3]).map((link) => link.text), contract: adjusted ? null : base === "Pass" ? "Pass" : base.replace("ΧΑ", "NT") + (suitClass ? suitSymbol[suitClass] : ""), publishedContract, result, declarer: adjusted ? null : greekSeat[plainText(c[5])], publishedDeclarer: plainText(c[5]), openingLead: plainText(c[6]), nsScore, nsPercentage: plainText(c[9]), ewPercentage: plainText(c[10]), adjusted };
  }).filter(Boolean);
}

function parseStandings(html) {
  const table = tables(html).at(-1);
  const parsedRows = rows(table).slice(1).map((row) => {
    const c = cells(row);
    if (c.length < 8) return null;
    return { position: plainText(c[0]), playerIds: [plainText(c[1]).split("\n")[0], plainText(c[3]).split("\n")[0]], players: [plainText(c[2]).split("\n")[0], plainText(c[4]).split("\n")[0]], categories: (plainText(c[5]).match(/\d+\s*-\s*\d+/)?.[0] || plainText(c[5])).replace(/\s+/g, " "), percentage: plainText(c[6]), masterPoints: plainText(c[7]) || null };
  }).filter(Boolean);
  return resolveOfficialTiedPositions(parsedRows);
}

async function fetchPage(url, allowMissing = false) {
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    const response = await fetch(url, { headers: { "user-agent": "Bridge-Life replay validator" } });
    if (response.ok) return response.text();
    if (allowMissing && response.status === 404) return null;
    if (response.status !== 429 || attempt === 6) throw new Error(`${url}: HTTP ${response.status}`);
    await new Promise((resolve) => setTimeout(resolve, (Number(response.headers.get("retry-after")) || 10) * 1000));
  }
}

if (!fs.existsSync(sourcePbn)) throw new Error(`PBN not found: ${sourcePbn}`);
const allPbn = parsePbn(fs.readFileSync(sourcePbn, "utf8"));
const standingsHtml = await fetchPage(baseUrl);
const standings = parseStandings(standingsHtml);
const eventTitle = plainText(standingsHtml.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i)?.[1] || `Event ${eventId}`);
const boardPages = [];
for (let board = 1; board <= Math.max(...allPbn.map((record) => record.board)); board += 1) {
  const html = await fetchPage(`${baseUrl}/board/${board}`, true);
  if (!html) break;
  const results = parseTraveller(html, board);
  if (results.length === 0) break;
  boardPages.push({ board, html, results });
  await new Promise((resolve) => setTimeout(resolve, 350));
}
const boardCount = boardPages.length;
if (!boardCount || boardPages.some((page, index) => page.board !== index + 1)) throw new Error("Could not discover a contiguous played-board range");
const selected = allPbn.filter((record) => record.board >= 1 && record.board <= boardCount);
if (selected.length !== boardCount) throw new Error(`PBN is missing one of Boards 1-${boardCount}`);
const metadata = selected.map((record) => ({ board: record.board, dealer: record.tags.Dealer, vulnerability: record.tags.Vulnerable, deal: record.tags.Deal, ...validateDeal(record) }));

let pageDealChecks = 0, rawScoreChecks = 0, percentageChecks = 0, adjustedRows = 0, adjustedBoardCount = 0;
const travellers = boardPages.map((page) => {
  const pbn = metadata[page.board - 1], officialHands = pageHands(page.html, page.board);
  for (const seat of seats) if (officialHands[seat] !== pbn.hands[seat]) throw new Error(`Board ${page.board}: official page ${seat} hand differs from PBN`);
  pageDealChecks += 1;
  const hasAdjustment = page.results.some((result) => result.adjusted);
  if (hasAdjustment) adjustedBoardCount += 1;
  const scores = page.results.map((result) => result.nsScore).filter(Number.isFinite), publishedTop = 2 * (page.results.length - 1);
  for (const result of page.results) {
    if (result.adjusted) { adjustedRows += 1; continue; }
    if (!Number.isFinite(result.nsScore)) throw new Error(`Board ${page.board}: invalid raw score`);
    if (result.contract !== "Pass") {
      const level = Number(result.contract[0]), denomination = result.contract.includes("NT") ? "NT" : ({ "♣": "C", "♦": "D", "♥": "H", "♠": "S" })[result.contract.at(-1)];
      const doubled = Math.min((result.contract.match(/\*/g) || []).length, 2);
      const tricks = level + 6 + (result.result === "=" ? 0 : Number(result.result));
      const calculated = scoreContract({ level, denomination, declarerSide: sideForDeclarer(result.declarer), tricks, vulnerability: pbn.vulnerability, doubled });
      if (calculated !== result.nsScore) throw new Error(`Board ${page.board}: ${result.contract}${result.result} score mismatch (${calculated} vs ${result.nsScore})`);
    } else if (result.nsScore !== 0) throw new Error(`Board ${page.board}: Pass must score zero`);
    rawScoreChecks += 1;
    if (!hasAdjustment) {
      const lower = scores.filter((score) => result.nsScore > score).length, equals = scores.filter((score) => result.nsScore === score).length;
      const expected = ((lower * 2 + equals - 1) / publishedTop) * 100;
      const publishedText = result.nsPercentage.replace("%", "").replace(",", ".");
      const published = Number(publishedText), decimals = publishedText.includes(".") ? publishedText.split(".")[1].length : 0;
      const roundedExpected = Number(expected.toFixed(decimals));
      if (roundedExpected !== published) throw new Error(`Board ${page.board}: published NS% mismatch (${published} vs rounded ${roundedExpected} from ${expected})`);
      percentageChecks += 1;
    }
  }
  return { board: page.board, dealer: pbn.dealer, vulnerability: pbn.vulnerability, source: `${baseUrl}/board/${page.board}`, fieldEntries: page.results.length, comparableRawScores: scores.length, virtualBoardTop: scores.length * 2, percentageValidation: hasAdjustment ? "official-adjusted — preserved, not recomputed" : "recomputed-and-matched", results: page.results };
});

const lin = selected.map(recordToLin).join("\r\n"), linLines = lin.split(/\r?\n/);
if (linLines.length !== boardCount || /(?:mb|pc|mc|rs)\|/i.test(lin)) throw new Error("Blind LIN count/leak validation failed");
let linHandChecks = 0, linDealerChecks = 0, linVulnerabilityChecks = 0, linSeatingChecks = 0;
for (const [index, line] of linLines.entries()) {
  const record = selected[index], hands = pbnHands(record.tags.Deal), expectedSeating = replaySeating(record.board).pn;
  const md = line.match(/\|md\|(\d)([^|]+)\|/)?.slice(1);
  if (line.match(/\|md\|\d([^|]+)\|/)?.[1].split(",").length !== 3 || !line.endsWith("|pg||")) throw new Error(`Board ${index + 1}: invalid BBO Teaching Table record`);
  if (!line.includes(`|pn|${expectedSeating}|`)) throw new Error(`Board ${record.board}: incorrect seating metadata`);
  linSeatingChecks += 1;
  if (!md || Number(md[0]) !== seatNumber[record.tags.Dealer]) throw new Error(`Board ${record.board}: LIN dealer differs from PBN`);
  linDealerChecks += 1;
  const expectedHands = ["S", "W", "N"].map((seat) => linHand(hands[seat])).join(",");
  if (md[1] !== expectedHands) throw new Error(`Board ${record.board}: LIN hands differ from unrotated PBN seats`);
  linHandChecks += 1;
  if (!line.includes(`|sv|${vulToLin[record.tags.Vulnerable]}|`)) throw new Error(`Board ${record.board}: LIN vulnerability differs from PBN`);
  linVulnerabilityChecks += 1;
}
const resultCounts = travellers.map((board) => board.results.length), comparisonCounts = travellers.map((board) => board.comparableRawScores);
if (!resultCounts.every((count) => count === resultCounts[0])) throw new Error(`Unequal traveller entry counts: ${resultCounts.join(",")}`);
const fieldEntriesPerBoard = resultCounts[0], standardComparisonCount = Math.max(...comparisonCounts), standardBoardTop = standardComparisonCount * 2;
const linName = `Real-Tournament-${isoDate}-Boards-1-${boardCount}.lin`;
fs.writeFileSync(path.join(outDir, linName), `${lin}\n`, "utf8");
fs.writeFileSync(path.join(outDir, `Real-Tournament-${isoDate}-Boards-1-${boardCount}.pbn`), `${selected.map((record) => record.block).join("\n\n")}\n`, "utf8");
fs.writeFileSync(path.join(outDir, "deal-metadata.json"), `${JSON.stringify(metadata, null, 2)}\n`, "utf8");
fs.writeFileSync(path.join(outDir, "travellers.json"), `${JSON.stringify({ eventId: Number(eventId), event: eventTitle, source: baseUrl, scoringMethod: "A", fieldEntriesPerBoard, standardComparisonCount, standardBoardTop, adjustedPolicy: "Adjusted entries without raw scores are preserved but excluded from virtual raw-score comparison; board top is 2 × comparable raw scores.", boards: travellers }, null, 2)}\n`, "utf8");
fs.writeFileSync(path.join(outDir, "final-standings.json"), `${JSON.stringify({ source: baseUrl, pairs: standings }, null, 2)}\n`, "utf8");
fs.writeFileSync(path.join(outDir, "virtual-results-template.json"), `${JSON.stringify({ pair: ["Νίκος", "Μιχάλης"], axis: "mixed", method: "A", results: selected.map(({ board }) => ({ board, axis: replaySeating(board).axis, contract: null, declarer: null, result: null, tricks: null, openingLead: null, notes: null })) }, null, 2)}\n`, "utf8");
fs.writeFileSync(path.join(outDir, "POST-GAME-REPORT-TEMPLATE.md"), `# Real Tournament Replay ${isoDate} — Post-game report\n\n- Board: {{board}}\n- Άξονας Νίκου–Μιχάλη: {{axis}}\n- Συμβόλαιο/αποτέλεσμα: {{contract}} από {{declarer}}, {{result}}\n- Raw score στον άξονά μας: {{axisScore}}\n- Virtual MP: {{matchpoints}} / {{maximumMatchpoints}} ({{percentage}}%)\n- Πραγματικά συγκρίσιμα scores του ίδιου άξονα: {{fieldScores}}\n- Επίσημες adjusted εγγραφές: {{adjustedEntries}}\n- Συνηθέστερο συμβόλαιο: {{commonContract}}\n- DDS (μόνο μετά το παιχνίδι): {{dds}}\n\n## Σύντομη ανάλυση\n\n- Αγορά: {{biddingAnalysis}}\n- Εκτέλεση/άμυνα: {{playAnalysis}}\n- Συμπέρασμα: {{conclusion}}\n`, "utf8");
const sampleScores = [...new Set(travellers[0].results.map((result) => result.nsScore))].sort((a, b) => b - a);
const testScores = [sampleScores[0] + 10, sampleScores[Math.floor(sampleScores.length / 2)], sampleScores.at(-1) - 10];
const examples = testScores.map((nsScore) => ({ board: 1, ...virtualMatchpoints(nsScore, travellers[0].results.map((result) => result.nsScore)) }));
const validation = { status: adjustedBoardCount ? "PASS_WITH_OFFICIAL_ADJUSTMENT" : "PASS", eventId: Number(eventId), pbnRecords: allPbn.length, playedBoards: boardCount, selectedPbnBoards: selected.length, officialPageDealChecks: pageDealChecks, validDeals: metadata.length, uniqueCardsPerBoard: 52, cardsPerSeat: 13, hcpPerBoard: 40, travellerBoards: travellers.length, travellerRows: travellers.reduce((sum, board) => sum + board.results.length, 0), fieldEntriesPerBoard, standardComparableRawScores: standardComparisonCount, comparisonCountsByBoard: Object.fromEntries(travellers.map((board) => [board.board, board.comparableRawScores])), rawScoreChecks, publishedPercentageChecks: percentageChecks, officialAdjustedBoards: adjustedBoardCount, officialAdjustedRows: adjustedRows, standingsPairs: standings.length, linBoards: linLines.length, linHandChecks, linDealerChecks, linVulnerabilityChecks, linSeatingChecks, bboExplicitHandsPerBoard: 3, bboFieldOrder: ["qx", "pn", "st", "md", "rh", "ah", "sv", "pg"], bboRecordTerminator: "pg||", utf8Bom: false, lineEndings: "CRLF between records; final LF", noAuctionResultOrDdsLeak: true, requiredDealArchivePnMetadata: true, virtualAxis: Object.fromEntries(selected.map(({ board }) => [board, replaySeating(board).axis])), handsRotatedForSeating: false, scoringMethod: `A — compare virtual score on the board's assigned axis with numeric published field scores; standard top ${standardBoardTop}, adjusted boards use 2 × comparable scores`, examples };
fs.writeFileSync(path.join(outDir, "validation-report.json"), `${JSON.stringify(validation, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ event: eventTitle, lin: path.join(outDir, linName), ...validation }, null, 2));
