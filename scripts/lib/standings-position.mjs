function normalizedScore(value) {
  return String(value ?? "")
    .trim()
    .replace("%", "")
    .replace(",", ".");
}

export function resolveOfficialTiedPositions(rows) {
  let previousExplicitPosition = null;
  let tieBlockScore = null;

  return rows.map((row) => {
    const rawPosition = String(row.position ?? "").trim();
    const score = normalizedScore(row.percentage ?? row.score);
    const numericPosition = /^\d+$/.test(rawPosition) ? rawPosition : null;

    if (numericPosition) {
      previousExplicitPosition = numericPosition;
      tieBlockScore = score;
      return { ...row, position: numericPosition, isTied: false, officialPosition: rawPosition };
    }

    if ((rawPosition === "-" || rawPosition === "") && previousExplicitPosition && score && score === tieBlockScore) {
      return { ...row, position: previousExplicitPosition, isTied: true, officialPosition: rawPosition || null };
    }

    previousExplicitPosition = null;
    tieBlockScore = null;
    return { ...row, position: null, isTied: false, officialPosition: rawPosition || null };
  });
}
