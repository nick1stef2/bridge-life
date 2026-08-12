import { tournamentsData } from "./tournamentsData";
import { parsePbn } from "../utils/pbnParser";

const pbnSources = import.meta.glob("../assets/pbn/*.pbn", {
  eager: true,
  query: "?raw",
  import: "default",
});

// Explicitly confirmed links keyed by PBN content, never by filename.
const tournamentIdByContentId = {
  "pbn-1021987e": "aot-26404-2026-08-04",
  "pbn-837036ee": "aot-26406-2026-08-06",
  "pbn-82a72089": "aot-26407-2026-08-09",
  "pbn-439b81f8": "aot-26411-2026-08-11",
};

export const boardCollections = Object.entries(pbnSources)
  .map(([sourcePath, source]) => {
    const parsed = parsePbn(source);
    const tournamentId = tournamentIdByContentId[parsed.contentId] ?? null;
    const tournament = tournamentsData.find((item) => item.id === tournamentId) ?? null;

    return {
      id: parsed.contentId,
      sourcePath,
      tournamentId,
      tournament,
      date: tournament?.date ?? parsed.tags.Date ?? null,
      title: tournament?.title ?? parsed.tags.Event ?? "Μη αντιστοιχισμένο PBN",
      boardCount: parsed.boards.length,
      boards: parsed.boards,
      extensions: {},
    };
  })
  .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

export function getBoardCollectionByTournamentId(tournamentId) {
  return boardCollections.find((collection) => collection.tournamentId === tournamentId) ?? null;
}
