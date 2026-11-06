export function formatPlacement(position, isTied = false) {
  if (position === null || position === undefined || position === "") {
    return "—";
  }

  return isTied ? `${position}η (ισοβαθμία)` : String(position);
}
