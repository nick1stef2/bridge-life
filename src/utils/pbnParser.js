const seats = ["N", "E", "S", "W"];
const suits = ["S", "H", "D", "C"];
const ranks = "AKQJT98765432";

function contentId(source) {
  let hash = 0x811c9dc5;
  const normalizedSource = source.replace(/\r\n/g, "\n").trim();

  for (const character of normalizedSource) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }

  return `pbn-${hash.toString(16).padStart(8, "0")}`;
}

function parseTags(record) {
  return Object.fromEntries(
    [...record.matchAll(/^\[([^\s]+)\s+"([^"]*)"\]$/gm)].map((match) => [match[1], match[2]]),
  );
}

function parseHand(handText) {
  const suitValues = handText.split(".");
  if (suitValues.length !== 4) {
    throw new Error(`Invalid PBN hand: ${handText}`);
  }

  return Object.fromEntries(suits.map((suit, index) => [suit, suitValues[index] || ""]));
}

function cardsInHand(hand) {
  return suits.flatMap((suit) => [...hand[suit]].map((rank) => `${suit}${rank}`));
}

function parseDeal(dealText) {
  const match = dealText.match(/^([NESW]):(.+)$/);
  if (!match) {
    throw new Error(`Invalid PBN Deal tag: ${dealText}`);
  }

  const firstSeatIndex = seats.indexOf(match[1]);
  const handValues = match[2].trim().split(/\s+/);
  if (handValues.length !== 4) {
    throw new Error("A PBN Deal must contain four hands");
  }

  const hands = {};
  handValues.forEach((handText, index) => {
    hands[seats[(firstSeatIndex + index) % seats.length]] = parseHand(handText);
  });

  const cards = seats.flatMap((seat) => cardsInHand(hands[seat]));
  if (seats.some((seat) => cardsInHand(hands[seat]).length !== 13)) {
    throw new Error("Every PBN hand must contain 13 cards");
  }
  if (cards.some((card) => !suits.includes(card[0]) || !ranks.includes(card[1]))) {
    throw new Error("PBN deal contains an invalid card");
  }
  if (cards.length !== 52 || new Set(cards).size !== 52) {
    throw new Error("PBN deal must contain 52 unique cards");
  }

  return hands;
}

export function parsePbn(source) {
  const records = source
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n(?=\[Board\s)/)
    .map((record) => record.trim())
    .filter((record) => record.includes("[Board "));

  const boards = records.map((record) => {
    const tags = parseTags(record);
    if (!tags.Board || !tags.Dealer || !tags.Vulnerable || !tags.Deal) {
      throw new Error("PBN board is missing Board, Dealer, Vulnerable, or Deal");
    }

    const boardNumber = Number(tags.Board);
    if (!Number.isInteger(boardNumber) || boardNumber < 1 || !seats.includes(tags.Dealer)) {
      throw new Error(`Invalid board identity: ${tags.Board}/${tags.Dealer}`);
    }

    return {
      boardNumber,
      dealer: tags.Dealer,
      vulnerability: tags.Vulnerable,
      hands: parseDeal(tags.Deal),
      extensions: {},
    };
  });

  if (!boards.length || new Set(boards.map((board) => board.boardNumber)).size !== boards.length) {
    throw new Error("PBN must contain uniquely numbered boards");
  }

  return {
    contentId: contentId(source),
    tags: parseTags(records[0]),
    boards: boards.sort((a, b) => a.boardNumber - b.boardNumber),
  };
}

