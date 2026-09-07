import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { boardCollections, getBoardCollectionsByTournamentId } from "../data/boardsData";
import doubleDummyData from "../data/generated/doubleDummyData.json";
import teamsDoubleDummyData from "../data/generated/lazopoulosTeamsDoubleDummy.json";
import "./Boards.css";

const seatNames = { N: "North", E: "East", S: "South", W: "West" };
const suitSymbols = { S: "♠", H: "♥", D: "♦", C: "♣" };
const ddDenominations = ["NT", "S", "H", "D", "C"];
const ddSeats = ["N", "E", "S", "W"];
const ddDeclarerNames = { N: "North", E: "East", S: "South", W: "West", NS: "North", EW: "East" };

function formatContract(contract) {
  const denomination = contract.denomination === "NT" ? "NT" : suitSymbols[contract.denomination];
  return `${contract.level}${denomination} by ${ddDeclarerNames[contract.declarer]}`;
}

function formatDate(date) {
  if (!date) return "—";
  const [year, month, day] = date.split("-");
  return year && month && day ? `${day}/${month}/${year}` : date;
}

function Hand({ seat, hand }) {
  return (
    <section className="pbn-hand">
      <h3>{seatNames[seat]}</h3>
      {Object.entries(suitSymbols).map(([suit, symbol]) => (
        <p key={suit} className={suit === "H" || suit === "D" ? "red-suit" : ""}>
          <span>{symbol}</span> {hand[suit] || "—"}
        </p>
      ))}
    </section>
  );
}

function BoardCard({ board, percentage, context, onOpen }) {
  return (
    <button type="button" className="pbn-board-card" onClick={onOpen}>
      <h2>Board {board.boardNumber}</h2>
      <p><span>Dealer</span>{seatNames[board.dealer]}</p>
      <p><span>Vulnerability</span>{board.vulnerability}</p>
      {context?.roundNumber && <p><span>Γύρος</span>{context.roundNumber}</p>}
      {context?.seating && <p><span>Θέσεις</span>{context.seating}</p>}
      {context?.netImps !== undefined && <p><span>IMP swing</span>{context.netImps > 0 ? "+" : ""}{context.netImps}</p>}
      {percentage !== undefined && <strong>{percentage}%</strong>}
    </button>
  );
}

function DoubleDummyPanel({ data }) {
  if (!data) return null;

  return (
    <section className="double-dummy-panel">
      <h3>🧠 Double Dummy Analysis</h3>
      <dl className="double-dummy-summary">
        <div><dt>Optimum</dt><dd>{data.parContracts.map(formatContract).join(" / ")}</dd></div>
        <div><dt>Par</dt><dd>{data.parScore > 0 ? "+" : ""}{data.parScore} NS</dd></div>
      </dl>
      <details className="double-dummy-details">
        <summary>Show Double Dummy Table</summary>
        <div className="double-dummy-table-wrap">
          <table>
            <thead>
              <tr><th scope="col">Contract</th>{ddSeats.map((seat) => <th scope="col" key={seat}>{seat}</th>)}</tr>
            </thead>
            <tbody>
              {ddDenominations.map((denomination) => (
                <tr key={denomination}>
                  <th scope="row" className={denomination === "H" || denomination === "D" ? "red-suit" : ""}>
                    {denomination === "NT" ? "NT" : suitSymbols[denomination]}
                  </th>
                  {ddSeats.map((seat) => <td key={seat}>{data.doubleDummyTricks[seat][denomination]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}

function BoardModal({ board, percentage, doubleDummy, context, hasPrevious, hasNext, onPrevious, onNext, onClose }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && hasPrevious) onPrevious();
      if (event.key === "ArrowRight" && hasNext) onNext();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasNext, hasPrevious, onClose, onNext, onPrevious]);

  return (
    <div className="board-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="board-modal" role="dialog" aria-modal="true" aria-labelledby="board-modal-title">
        <header className="board-modal-header">
          <div>
            <h2 id="board-modal-title">Board {board.boardNumber}</h2>
            <p>Dealer: {seatNames[board.dealer]} · Vulnerability: {board.vulnerability}</p>
            {context?.dayDate && <p>{formatDate(context.dayDate)} · Γύρος {context.roundNumber} · Θέσεις {context.seating}</p>}
          </div>
          {percentage !== undefined && <strong>{percentage}%</strong>}
        </header>

        <div className="bridge-table-layout">
          {(["N", "W", "E", "S"]).map((seat) => <Hand key={seat} seat={seat} hand={board.hands[seat]} />)}
        </div>

        <DoubleDummyPanel data={doubleDummy} />

        <footer className="board-modal-actions">
          <button type="button" onClick={onPrevious} disabled={!hasPrevious}>Previous Board</button>
          <button type="button" onClick={onClose}>Close</button>
          <button type="button" onClick={onNext} disabled={!hasNext}>Next Board</button>
        </footer>
      </section>
    </div>
  );
}

function Boards() {
  const { tournamentId } = useParams();
  const [selectedBoardIndex, setSelectedBoardIndex] = useState(null);

  if (tournamentId) {
    const collections = getBoardCollectionsByTournamentId(tournamentId);
    if (!collections.length) {
      return (
        <main className="boards-page">
          <Link to="/boards">Επιστροφή στα Boards</Link>
          <p>Δεν βρέθηκε PBN για αυτόν τον αγώνα.</p>
        </main>
      );
    }

    const tournament = collections[0].tournament;
    const allDoubleDummyEntries = [...doubleDummyData.entries, ...teamsDoubleDummyData.entries];
    const boardItems = collections.flatMap((collection) => {
      const percentageByBoardNumber = Object.fromEntries(
        (collection.tournament?.boardResults ?? []).map((result) => [result.boardNumber, result.percentage]),
      );
      const rounds = collection.extensions.rounds ?? [];
      return collection.boards.map((board) => {
        const round = rounds.find((item) => item.boards.some((entry) => entry.boardNumber === board.boardNumber));
        const result = round?.boards.find((entry) => entry.boardNumber === board.boardNumber);
        return {
          collection,
          board,
          percentage: percentageByBoardNumber[board.boardNumber],
          context: collection.extensions.dayNumber ? {
            dayNumber: collection.extensions.dayNumber,
            dayDate: collection.date,
            roundNumber: round?.roundNumber,
            seating: round?.seating ?? collection.extensions.seating,
            netImps: result?.netImps,
          } : null,
        };
      });
    });
    const selectedItem = selectedBoardIndex === null ? null : boardItems[selectedBoardIndex];
    const selectedDoubleDummy = selectedItem
      ? allDoubleDummyEntries.find((entry) => (
        entry.pbnFingerprint === selectedItem.collection.id && entry.boardNumber === selectedItem.board.boardNumber
      ))
      : null;

    return (
      <main className="boards-page">
        <nav className="boards-actions">
          <Link to="/boards">Επιστροφή στα Boards</Link>
          <Link to={`/tournament/${tournamentId}`}>Tournament Detail</Link>
        </nav>
        <h1>{tournament?.title ?? collections[0].title}</h1>
        <p>{collections.length > 1 ? `${collections.length} ημερίδες · ${boardItems.length} boards` : `${formatDate(collections[0].date)} · ${boardItems.length} boards`}</p>
        {collections.map((collection) => (
          <section className="pbn-day-section" key={collection.id}>
            {collections.length > 1 && <h2>Ημερίδα {collection.extensions.dayNumber} · {formatDate(collection.date)} · {collection.boardCount} boards</h2>}
            <div className="pbn-board-list">
              {boardItems.map((item, index) => item.collection.id === collection.id && (
                <BoardCard
                  key={`${collection.id}-${item.board.boardNumber}`}
                  board={item.board}
                  percentage={item.percentage}
                  context={item.context}
                  onOpen={() => setSelectedBoardIndex(index)}
                />
              ))}
            </div>
          </section>
        ))}
        {selectedItem && (
          <BoardModal
            key={`${selectedItem.collection.id}-${selectedItem.board.boardNumber}`}
            board={selectedItem.board}
            percentage={selectedItem.percentage}
            doubleDummy={selectedDoubleDummy}
            context={selectedItem.context}
            hasPrevious={selectedBoardIndex > 0}
            hasNext={selectedBoardIndex < boardItems.length - 1}
            onPrevious={() => setSelectedBoardIndex((index) => Math.max(0, index - 1))}
            onNext={() => setSelectedBoardIndex((index) => Math.min(boardItems.length - 1, index + 1))}
            onClose={() => setSelectedBoardIndex(null)}
          />
        )}
      </main>
    );
  }

  return (
    <main className="boards-page">
      <Link to="/">Επιστροφή στην αρχική</Link>
      <h1>Boards</h1>
      <div className="pbn-collection-list">
        {boardCollections.map((collection) => (
          <article key={collection.id} className="pbn-collection-card">
            <h2>{collection.title}</h2>
            <p>{formatDate(collection.date)}</p>
            <p>{collection.boardCount} boards</p>
            {collection.tournamentId ? (
              <div className="boards-actions">
                <Link to={`/boards/${collection.tournamentId}`}>Προβολή boards</Link>
                <Link to={`/tournament/${collection.tournamentId}`}>Tournament Detail</Link>
              </div>
            ) : <p>Δεν έχει αντιστοιχιστεί με αγώνα.</p>}
          </article>
        ))}
      </div>
    </main>
  );
}

export default Boards;
