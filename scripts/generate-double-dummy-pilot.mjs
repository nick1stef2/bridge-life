import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const lock = JSON.parse(readFileSync(resolve(root, "scripts/dds-pilot.lock.json"), "utf8"));
const independentCheck = JSON.parse(
  readFileSync(resolve(root, "scripts/dds-pilot-independent-check.json"), "utf8"),
);
const executableArgument = process.argv.indexOf("--dds-executable");
if (executableArgument === -1 || !process.argv[executableArgument + 1]) {
  throw new Error("Use --dds-executable <path-to-locally-built-official-dds-wrapper>");
}
const ddsExecutable = resolve(root, process.argv[executableArgument + 1]);
const executableSha256 = sha256(readFileSync(ddsExecutable));
if (executableSha256 !== lock.pilotExecutable.sha256) {
  throw new Error(`DDS executable checksum mismatch: ${executableSha256}`);
}

const seats = ["N", "E", "S", "W"];
const strains = ["S", "H", "D", "C", "NT"];
const dealerCodes = Object.fromEntries(seats.map((seat, index) => [seat, index]));
// Official DDS encoding: 0=None, 1=Both, 2=NS, 3=EW.
const vulnerabilityCodes = { None: 0, All: 1, NS: 2, EW: 3 };
const parDenominations = ["NT", "S", "H", "D", "C"];
const parSeats = ["N", "E", "S", "W", "NS", "EW"];

const targets = [
  { source: "src/assets/pbn/2026-08-04.pbn", tournamentId: "aot-26404-2026-08-04", expectedBoards: 32 },
  { source: "src/assets/pbn/2026-08-06.pbn", tournamentId: "aot-26406-2026-08-06", expectedBoards: 32 },
];

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function contentFingerprint(source) {
  let hash = 0x811c9dc5;
  for (const character of source.replace(/\r\n/g, "\n").trim()) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `pbn-${hash.toString(16).padStart(8, "0")}`;
}

function parseBoards(source) {
  return source.replace(/\r\n/g, "\n").split(/\n\s*\n(?=\[Board\s)/)
    .map((record) => Object.fromEntries(
      [...record.matchAll(/^\[([^\s]+)\s+"([^"]*)"\]$/gm)].map((match) => [match[1], match[2]]),
    ))
    .filter((tags) => tags.Board);
}

function parseSolverOutput(output) {
  const lines = output.trim().split(/\r?\n/);
  const tableValues = lines[0].trim().split(/\s+/).slice(1).map(Number);
  if (lines[0].split(/\s+/)[0] !== "TABLE" || tableValues.length !== 20) {
    throw new Error("DDS did not return exactly 20 double-dummy values");
  }
  if (tableValues.some((value) => !Number.isInteger(value) || value < 0 || value > 13)) {
    throw new Error("DDS returned a trick value outside 0-13");
  }

  const table = Object.fromEntries(seats.map((seat, seatIndex) => [
    seat,
    Object.fromEntries(strains.map((strain, strainIndex) => [strain, tableValues[strainIndex * 4 + seatIndex]])),
  ]));
  const [, scoreText, countText] = lines[1].trim().split(/\s+/);
  const score = Number(scoreText);
  const count = Number(countText);
  const contracts = lines.slice(2).map((line) => {
    const [label, underText, overText, levelText, denominationText, seatText] = line.trim().split(/\s+/);
    if (label !== "CONTRACT") throw new Error(`Unexpected DDS output: ${line}`);
    const underTricks = Number(underText);
    const overTricks = Number(overText);
    const level = Number(levelText);
    const denomination = parDenominations[Number(denominationText)];
    const declarer = parSeats[Number(seatText)];
    const result = underTricks ? `-${underTricks}` : overTricks ? `+${overTricks}` : "=";
    return { contract: `${level}${denomination}${result}`, level, denomination, declarer, result };
  });
  if (contracts.length !== count) throw new Error("DDS par contract count mismatch");
  return { table, contracts, score };
}

function decodeBsolTable(encoded) {
  if (!/^[0-9a-d]{20}$/.test(encoded)) throw new Error("Invalid BSOL data-contracts value");
  const bsolOrder = ["NT", "S", "H", "D", "C"];
  const bsolSeats = ["N", "S", "E", "W"];
  const table = Object.fromEntries(seats.map((seat) => [seat, {}]));
  bsolSeats.forEach((seat, seatIndex) => {
    [...encoded.slice(seatIndex * 5, seatIndex * 5 + 5)].forEach((value, strainIndex) => {
      table[seat][bsolOrder[strainIndex]] = Number.parseInt(value, 16);
    });
  });
  return Object.fromEntries(seats.map((seat) => [
    seat,
    Object.fromEntries(strains.map((strain) => [strain, table[seat][strain]])),
  ]));
}

const generatedAt = new Date().toISOString();
const entries = [];
for (const target of targets) {
  const source = readFileSync(resolve(root, target.source), "utf8");
  const pbnFingerprint = contentFingerprint(source);
  const records = parseBoards(source);
  const boardNumbers = records.map((record) => Number(record.Board));
  if (records.length !== target.expectedBoards
    || new Set(boardNumbers).size !== target.expectedBoards
    || boardNumbers.some((boardNumber) => !Number.isInteger(boardNumber))) {
    throw new Error(`Expected ${target.expectedBoards} unique boards in ${target.source}`);
  }
  for (const tags of records.sort((a, b) => Number(a.Board) - Number(b.Board))) {
    const boardNumber = Number(tags.Board);
    if (!tags?.Deal || !(tags.Dealer in dealerCodes) || !(tags.Vulnerable in vulnerabilityCodes)) {
      throw new Error(`Missing or invalid PBN input for ${target.tournamentId} board ${boardNumber}`);
    }
    const solverInput = {
      deal: tags.Deal,
      dealer: tags.Dealer,
      vulnerability: tags.Vulnerable,
    };
    const output = execFileSync(ddsExecutable, [
      solverInput.deal,
      String(dealerCodes[solverInput.dealer]),
      String(vulnerabilityCodes[solverInput.vulnerability]),
    ], { encoding: "utf8" });
    const solved = parseSolverOutput(output);
    const independent = independentCheck.entries.find((entry) => (
      entry.tournamentId === target.tournamentId && entry.boardNumber === boardNumber
    ));
    if (independent) {
      const bsolTable = decodeBsolTable(independent.dataContracts);
      const contracts = solved.contracts.map((contract) => contract.contract);
      if (JSON.stringify(bsolTable) !== JSON.stringify(solved.table)
        || JSON.stringify(independent.parContracts) !== JSON.stringify(contracts)
        || independent.parScore !== solved.score) {
        throw new Error(`Independent BSOL comparison failed for ${target.tournamentId}/${boardNumber}`);
      }
    }
    entries.push({
      tournamentId: target.tournamentId,
      boardNumber,
      pbnFingerprint,
      solverInputFingerprint: sha256(JSON.stringify(solverInput)),
      ddsVersion: {
        tag: lock.tag,
        commit: lock.commit,
        sourceArchiveSha256: lock.sourceArchiveSha256,
      },
      generatedAt,
      validationStatus: independent ? "validated-with-independent-bsol" : "validated",
      independentValidation: independent ? {
        source: independentCheck.source,
        checkedAt: independentCheck.checkedAt,
        status: "match",
      } : null,
      source: {
        dealer: tags.Dealer,
        vulnerability: tags.Vulnerable,
        deal: tags.Deal,
      },
      doubleDummyTricks: solved.table,
      parContracts: solved.contracts,
      parScore: solved.score,
      optimumScore: solved.score,
      parResult: `${solved.contracts.map((contract) => `${contract.declarer} ${contract.contract}`).join(" / ")}; ${solved.score >= 0 ? "+" : ""}${solved.score} NS`,
    });
  }
}

const entryKeys = entries.map((entry) => `${entry.tournamentId}/${entry.boardNumber}`);
if (entries.length !== 64 || new Set(entryKeys).size !== 64) {
  throw new Error(`Expected 64 unique DDS entries, received ${entries.length}`);
}
if (independentCheck.entries.length < 8) {
  throw new Error("At least eight independent checks are required: four pilot and four additional boards");
}

const outputPath = resolve(root, "src/data/generated/doubleDummyData.json");
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify({ schemaVersion: 1, entries }, null, 2)}\n`, "utf8");
console.log(`Generated and validated ${entries.length} DDS results at ${outputPath}`);
