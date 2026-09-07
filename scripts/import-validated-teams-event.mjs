import { createHash } from "node:crypto";
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parsePbn } from "../src/utils/pbnParser.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const lock = JSON.parse(readFileSync(resolve(root, "scripts/dds-pilot.lock.json"), "utf8"));

const days = [
  { dayNumber: 1, date: "2026-09-04", eventId: "206013", package: "real-teams-replay-2026-09-04-day1", rounds: [1, 2, 3], seating: "EW" },
  { dayNumber: 2, date: "2026-09-05", eventId: "206035", package: "real-teams-replay-2026-09-05-day2", rounds: [4, 5, 6], seating: "mixed" },
  { dayNumber: 3, date: "2026-09-06", eventId: "206062", package: "real-teams-replay-2026-09-06-day3", rounds: [7, 8, 9], seating: "NS" },
];

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const toComma = (value) => Number(value).toFixed(2).replace(".", ",");
const suits = { "♠": "S", "♥": "H", "♦": "D", "♣": "C", S: "S", H: "H", D: "D", C: "C" };

function parseParContract(value) {
  const match = String(value).match(/^([1-7])(NT|[SHDC♠♥♦♣])([NESW])(x{0,2})((?:[+-]\d+)|=)?$/);
  if (!match) throw new Error(`Unsupported validated par contract: ${value}`);
  return {
    contract: value,
    level: Number(match[1]),
    denomination: match[2] === "NT" ? "NT" : suits[match[2]],
    declarer: match[3],
    result: match[5] || "=",
  };
}

const tournamentDays = [];
const ddsEntries = [];

for (const day of days) {
  const packageDir = resolve(root, "output", day.package);
  const validation = readJson(resolve(packageDir, "validation-report.json"));
  const team = readJson(resolve(packageDir, "team-results.json"));
  const rounds = readJson(resolve(packageDir, "round-results.json"));
  const dds = readJson(resolve(packageDir, "dds-analysis.json"));
  const sourcePbn = resolve(packageDir, "reconstructed-boards-1-21.pbn");
  const appPbn = resolve(root, "src/assets/pbn", `${day.date}.pbn`);
  const replayDir = resolve(root, "public/replays/lazopoulos-2026-09");
  mkdirSync(dirname(appPbn), { recursive: true });
  mkdirSync(replayDir, { recursive: true });
  copyFileSync(sourcePbn, appPbn);
  copyFileSync(resolve(packageDir, `Blind-Day${day.dayNumber}-Boards-1-21.lin`), resolve(replayDir, `day-${day.dayNumber}.lin`));
  for (const roundNumber of day.rounds) {
    copyFileSync(resolve(packageDir, `Blind-Round-${roundNumber}.lin`), resolve(replayDir, `round-${roundNumber}.lin`));
  }
  const pbnSource = readFileSync(sourcePbn, "utf8");
  const parsedPbn = parsePbn(pbnSource);

  if (validation.status !== "PASS" || validation.boardsUsed !== 21 || parsedPbn.boards.length !== 21) {
    throw new Error(`Validated package failed for ${day.date}`);
  }
  if (String(team.eventId) !== day.eventId || rounds.length !== 3 || dds.length !== 21) {
    throw new Error(`Structured source mismatch for ${day.date}`);
  }
  if (readFileSync(appPbn).compare(readFileSync(sourcePbn)) !== 0) {
    throw new Error(`App PBN is not byte-identical for ${day.date}`);
  }
  if (rounds.some((round, index) => round.round !== day.rounds[index] || round.boards.length !== 7)) {
    throw new Error(`Round mapping failed for ${day.date}`);
  }

  tournamentDays.push({
    dayNumber: day.dayNumber,
    date: day.date,
    eventId: day.eventId,
    position: team.standing ?? null,
    participants: null,
    dailyVps: toComma(team.dayVp),
    dailyImpFor: team.impFor,
    dailyImpAgainst: team.impAgainst,
    dailyImpBalance: team.impBalance,
    pbnContentId: parsedPbn.contentId,
    seating: day.seating,
    seatingSummary: day.dayNumber === 2 ? "R4–R5 W/E · R6 N/S" : (day.seating === "EW" ? "W/E" : "N/S"),
    nikosSeat: day.seating === "mixed" ? null : (day.seating === "EW" ? "W" : "N"),
    vakalisSeat: day.seating === "mixed" ? null : (day.seating === "EW" ? "E" : "S"),
    replayUrl: `/replays/lazopoulos-2026-09/day-${day.dayNumber}.lin`,
    rounds: rounds.map((round) => ({
      roundNumber: round.round,
      opponent: round.opponent,
      teamImps: round.impNtaikou,
      opponentImps: round.impOpponent,
      teamVps: toComma(round.vpNtaikou),
      opponentVps: toComma(round.vpOpponent),
      seating: round.round <= 5 ? "EW" : "NS",
      replayUrl: `/replays/lazopoulos-2026-09/round-${round.round}.lin`,
      boards: round.boardResults.map((board) => ({
        boardNumber: board.board,
        boardId: `${day.date}-board-${board.board}`,
        ourTable: board.ourTable,
        otherTable: board.otherTable,
        teamImps: board.impNtaikou,
        opponentImps: board.impOpponent,
        netImps: board.impNetNtaikou,
        winner: board.winner,
      })),
    })),
  });

  for (const board of dds) {
    const pbnBoard = parsedPbn.boards.find((entry) => entry.boardNumber === board.board);
    if (!pbnBoard || board.uniqueCards !== 52 || board.totalHcp !== 40) {
      throw new Error(`DDS/PBN board mismatch ${day.date} board ${board.board}`);
    }
    const tableValues = Object.values(board.dds.table).flatMap((seat) => Object.values(seat));
    if (tableValues.length !== 20 || tableValues.some((value) => !Number.isInteger(value) || value < 0 || value > 13)) {
      throw new Error(`Invalid DDS table ${day.date} board ${board.board}`);
    }
    const solverInput = {
      dealer: board.dealer,
      vulnerability: board.vulnerability,
      hands: board.hands,
    };
    const parContracts = board.dds.parContracts.map(parseParContract);
    ddsEntries.push({
      tournamentId: "eom-206013-206035-206062-2026-09-04-06",
      dayDate: day.date,
      boardNumber: board.board,
      boardId: `${day.date}-board-${board.board}`,
      pbnFingerprint: parsedPbn.contentId,
      solverInputFingerprint: sha256(JSON.stringify(solverInput)),
      ddsVersion: {
        tag: lock.tag,
        commit: lock.commit,
        sourceArchiveSha256: lock.sourceArchiveSha256,
      },
      generatedAt: new Date().toISOString(),
      validationStatus: "validated-source-package",
      source: solverInput,
      doubleDummyTricks: board.dds.table,
      parContracts,
      parScore: board.dds.parScoreNS,
      optimumScore: board.dds.parScoreNS,
      parResult: `${parContracts.map((contract) => contract.contract).join(" / ")}; ${board.dds.parScoreNS >= 0 ? "+" : ""}${board.dds.parScoreNS} NS`,
    });
  }
}

const summary = readJson(resolve(root, "output/real-teams-replay-2026-09-06-day3/full-tournament-summary.json"));
const tournament = {
  teamName: "ΝΤΑΙΚΟΥ",
  teamMembers: ["Μαριέλα Ντάικου", "Παναγιώτης Εξαρχόπουλος", "Νικόλαος Βακάλης", "Νίκος Στεφανάκης"],
  trackedPair: ["Νίκος Στεφανάκης", "Νικόλαος Βακάλης"],
  summary,
  days: tournamentDays,
};

writeFileSync(resolve(root, "src/data/generated/lazopoulosTeamsTournament.json"), `${JSON.stringify(tournament, null, 2)}\n`, "utf8");
writeFileSync(resolve(root, "src/data/generated/lazopoulosTeamsDoubleDummy.json"), `${JSON.stringify({ entries: ddsEntries }, null, 2)}\n`, "utf8");

console.log(`Validated ${tournamentDays.length} days, ${tournamentDays.flatMap((day) => day.rounds).length} rounds, and ${ddsEntries.length} boards.`);
