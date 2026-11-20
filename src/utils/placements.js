export function formatPlacement(position, isTied = false) {
  if (
    position === null
    || position === undefined
    || position === ""
    || ["-", "–", "—"].includes(String(position).trim())
  ) {
    return "—";
  }

  return isTied ? `${position}η (ισοβαθμία)` : String(position);
}

export function resolveOfficialPlacements(rows) {
  let previousExplicitPosition = null;
  let previousScore = null;

  return rows.map((row) => {
    const rawPosition = String(row.position ?? "").trim();
    const rawScore = String(row.score ?? "").trim();
    const isOfficialDash = ["-", "–", "—"].includes(rawPosition);

    if (!isOfficialDash) {
      previousExplicitPosition = rawPosition || null;
      previousScore = rawScore || null;
      return { ...row, position: previousExplicitPosition, isTied: false };
    }

    const belongsToPreviousTieBlock = Boolean(
      previousExplicitPosition
      && previousScore
      && rawScore
      && rawScore === previousScore,
    );

    return {
      ...row,
      position: belongsToPreviousTieBlock ? previousExplicitPosition : null,
      isTied: belongsToPreviousTieBlock,
    };
  });
}
