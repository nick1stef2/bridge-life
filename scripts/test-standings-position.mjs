import assert from "node:assert/strict";
import { resolveOfficialTiedPositions } from "./lib/standings-position.mjs";

const resolved = resolveOfficialTiedPositions([
  { position: "2", percentage: "57,14" },
  { position: "-", percentage: "57,14" },
  { position: "4", percentage: "53,17" },
  { position: "-", percentage: "53,17" },
  { position: "-", percentage: "53,17" },
  { position: "7", percentage: "51,00" },
  { position: "-", percentage: "50,00" },
]);

assert.deepEqual(
  resolved.map(({ position, isTied }) => ({ position, isTied })),
  [
    { position: "2", isTied: false },
    { position: "2", isTied: true },
    { position: "4", isTied: false },
    { position: "4", isTied: true },
    { position: "4", isTied: true },
    { position: "7", isTied: false },
    { position: null, isTied: false },
  ],
);

console.log("PASS official standings tie resolver");
