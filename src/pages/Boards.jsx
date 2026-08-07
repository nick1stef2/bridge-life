import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { boardCollections, getBoardCollectionByTournamentId } from "../data/boardsData";
import doubleDummyData from "../data/generated/doubleDummyData.json";
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

function BoardCard({ board, percentage, onOpen }) {
  return (
    <button type="button" className="pbn-board-card" onClick={onOpen}>
      <h2>Board {board.boardNumber}</h2>
      <p><span>Dealer</span>{seatNames[board.dealer]}</p>
      <p><span>Vulnerability</span>{board.vulnerability}</p>
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

function BoardModal({ board, percentage, doubleDummy, hasPrevious, hasNext, onPrevious, onNext, onClose }) {
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
    const collection = getBoardCollectionByTournamentId(tournamentId);
    if (!collection) {
      return (
        <main className="boards-page">
          <Link to="/boards">Επιστροφή στα Boards</Link>
          <p>Δεν βρέθηκε PBN για αυτόν τον αγώνα.</p>
        </main>
      );
    }

    const percentageByBoardNumber = Object.fromEntries(
      (collection.tournament?.boardResults ?? []).map((result) => [result.boardNumber, result.percentage]),
    );
    const selectedBoard = selectedBoardIndex === null ? null : collection.boards[selectedBoardIndex];
    const selectedDoubleDummy = selectedBoard
      ? doubleDummyData.entries.find((entry) => (
        entry.tournamentId === collection.tournamentId && entry.boardNumber === selectedBoard.boardNumber
      ))
      : null;

    return (
      <main className="boards-page">
        <nav className="boards-actions">
          <Link to="/boards">Επιστροφή στα Boards</Link>
          <Link to={`/tournament/${collection.tournamentId}`}>Tournament Detail</Link>
        </nav>
        <h1>{collection.title}</h1>
        <p>{formatDate(collection.date)} · {collection.boardCount} boards</p>
        <div className="pbn-board-list">
          {collection.boards.map((board, index) => (
            <BoardCard
              key={board.boardNumber}
              board={board}
              percentage={percentageByBoardNumber[board.boardNumber]}
              onOpen={() => setSelectedBoardIndex(index)}
            />
          ))}
        </div>
        {selectedBoard && (
          <BoardModal
            key={`${collection.tournamentId}-${selectedBoard.boardNumber}`}
            board={selectedBoard}
            percentage={percentageByBoardNumber[selectedBoard.boardNumber]}
            doubleDummy={selectedDoubleDummy}
            hasPrevious={selectedBoardIndex > 0}
            hasNext={selectedBoardIndex < collection.boards.length - 1}
            onPrevious={() => setSelectedBoardIndex((index) => Math.max(0, index - 1))}
            onNext={() => setSelectedBoardIndex((index) => Math.min(collection.boards.length - 1, index + 1))}
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
