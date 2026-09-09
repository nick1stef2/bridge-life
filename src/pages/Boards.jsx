import { Link } from "react-router-dom";
import { boardCollections } from "../data/boardsData";
import { tournamentsData } from "../data/tournamentsData";
import "./Boards.css";

function formatDate(date) {
  if (!date) return "—";
  const [year, month, day] = date.split("-");
  return year && month && day ? `${day}/${month}/${year}` : date;
}

function getStoredBoardCount(tournament) {
  const collectionCount = boardCollections
    .filter((collection) => collection.tournamentId === tournament.id)
    .reduce((total, collection) => total + collection.boardCount, 0);

  return collectionCount || tournament.totalBoards || tournament.boardResults?.length || 0;
}

function Boards() {
  const tournamentsWithBoards = tournamentsData
    .map((tournament) => ({
      tournament,
      boardCount: getStoredBoardCount(tournament),
    }))
    .filter((item) => item.boardCount > 0)
    .sort((a, b) => b.tournament.date.localeCompare(a.tournament.date));

  return (
    <main className="boards-page">
      <Link to="/">Επιστροφή στην αρχική</Link>
      <header className="boards-header">
        <h1>Boards</h1>
        <p>
          Συγκεντρωτικά στοιχεία διανομών ανά αγώνα. Οι αναλυτικές πληροφορίες
          κάθε διοργάνωσης παραμένουν διαθέσιμες στο Tournament Detail.
        </p>
      </header>

      <div className="boards-summary-list">
        {tournamentsWithBoards.map(({ tournament, boardCount }) => (
          <article key={tournament.id} className="boards-summary-card">
            <div>
              <span>{formatDate(tournament.date)}</span>
              <h2>{tournament.title}</h2>
              <p>{tournament.organization}</p>
            </div>
            <div className="boards-summary-meta">
              <strong>{boardCount}</strong>
              <span>boards</span>
            </div>
            <Link to={`/tournament/${tournament.id}`}>Tournament Detail</Link>
          </article>
        ))}
      </div>
    </main>
  );
}

export default Boards;
