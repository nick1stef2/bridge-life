import { Link, useParams } from "react-router-dom";
import { tournamentsData } from "../data/tournamentsData";
import "./TournamentDetail.css";

const missingValue = "—";

const detailSections = [
  { key: "results", title: "Αποτελέσματα" },
  { key: "boardImages", title: "Board screenshots" },
];

function toDisplay(value) {
  return value === null || value === undefined || value === "" ? missingValue : value;
}

function formatDate(date) {
  if (!date) {
    return missingValue;
  }

  const [year, month, day] = date.split("-");
  return year && month && day ? `${day}/${month}/${year}` : date;
}

function formatTournamentDate(tournament) {
  if (tournament.startDate && tournament.endDate && tournament.startDate !== tournament.endDate) {
    return `${formatDate(tournament.startDate)}–${formatDate(tournament.endDate)}`;
  }
  return formatDate(tournament.date);
}

function formatScore(tournament) {
  if (!tournament.score) {
    return missingValue;
  }

  if (tournament.scoreType !== "percentage") {
  return tournament.scoreUnit ? `${tournament.score} ${tournament.scoreUnit}` : tournament.score;
  }

  return String(tournament.score).includes("%") ? tournament.score : `${tournament.score}%`;
}

function formatPlayerCategories(tournament) {
  if (tournament.playerCategory === null || tournament.playerCategory === undefined) {
    return missingValue;
  }

  if (tournament.partnerCategory === null || tournament.partnerCategory === undefined) {
    return `${tournament.playerCategory} – ${missingValue}`;
  }

  return `${tournament.playerCategory} – ${tournament.partnerCategory}`;
}

function buildDetailItems(tournament) {
  const resultItems = tournament.eventFormat === "teams"
    ? [
        { label: "Τελική θέση", value: toDisplay(tournament.position) },
        { label: "Τελικό σκορ", value: formatScore(tournament) },
        { label: "Σύνολο ομάδων", value: toDisplay(tournament.participants) },
        { label: "Προσωρινοί βαθμοί Μ", value: toDisplay(tournament.masterPoints) },
        { label: "Προσωρινοί βαθμοί Χ", value: toDisplay(tournament.extraPoints?.x) },
        { label: "Προσωρινοί βαθμοί Π", value: toDisplay(tournament.extraPoints?.p) },
        { label: "Πηγή τελικού αποτελέσματος", value: "Screenshot", image: tournament.resultImage },
        ...(tournament.relatedResultImages || []).map((image, index) => ({
          label: `Αναλυτικό αποτέλεσμα ${index + 1}`,
          value: "Screenshot",
          image,
        })),
      ]
    : [
        { label: "Θέση", value: toDisplay(tournament.position) },
        { label: tournament.scoreType === "percentage" ? "Ποσοστό" : "Σκορ", value: formatScore(tournament) },
        { label: "Σύνολο συμμετοχών", value: toDisplay(tournament.participants) },
        { label: "Master points / M", value: toDisplay(tournament.masterPoints) },
        { label: "Κατηγορίες παικτών", value: formatPlayerCategories(tournament) },
        { label: "Πηγή αποτελέσματος", value: "Screenshot", image: tournament.resultImage },
      ];

  return {
    results: resultItems,
    boardImages: (tournament.boardImages || []).map((image, index) => ({
      title: `Board screenshot ${index + 1}`,
      image,
      text: "Πραγματικό screenshot από τον φάκελο boards.",
    })),
  };
}

function formatRoomResult(result) {
  if (!result) {
    return missingValue;
  }

  if (result.contract === "Pass") {
    return "Pass";
  }

  return [
    result.contract,
    result.declarer ? `από ${result.declarer}` : null,
    result.openingLead ? `αντάμ ${result.openingLead}` : null,
    result.score !== null && result.score !== undefined ? `σκορ ${result.score}` : null,
    result.nsRawScore !== null && result.nsRawScore !== undefined ? `NS ${result.nsRawScore}` : null,
  ].filter(Boolean).join(" · ");
}

function TeamSummarySection({ tournament }) {
  if (tournament.eventFormat !== "teams" || !tournament.totalRounds) return null;

  return (
    <section className="tournament-section team-summary-section">
      <div className="tournament-section-heading">
        <h2>Συνολικό αποτέλεσμα τριημέρου</h2>
        <span>{tournament.totalBoards} boards</span>
      </div>
      <div className="team-summary-grid">
        <article><span>Γύροι</span><strong>{tournament.totalRounds}</strong></article>
        <article><span>IMP</span><strong>{tournament.impFor}–{tournament.impAgainst}</strong></article>
        <article><span>Διαφορά</span><strong>{tournament.impBalance > 0 ? "+" : ""}{tournament.impBalance} IMP</strong></article>
        <article><span>VP</span><strong>{formatScore(tournament)}</strong></article>
        <article><span>Τελική θέση</span><strong>{tournament.position}/{tournament.participants}</strong></article>
      </div>
    </section>
  );
}

function ReplaySection({ tournament }) {
  if (!tournament.replayDays?.length) return null;

  return (
    <section className="tournament-section replay-section">
      <div className="tournament-section-heading">
        <h2>BBO Replay / Training</h2>
        <span>Blind LIN</span>
      </div>
      <p className="replay-note">Αρχεία χωρίς λύσεις ή ανάλυση, έτοιμα για εισαγωγή στο BBO.</p>
      <div className="replay-days-grid">
        {tournament.replayDays.map((day) => (
          <article key={day.dayNumber}>
            <h3>Ημερίδα {day.dayNumber} · {formatDate(day.date)}</h3>
            <a href={day.url} download>Όλα τα boards της ημέρας</a>
            <div>
              {day.rounds.map((round) => <a href={round.url} download key={round.roundNumber}>Γύρος {round.roundNumber}</a>)}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function TeamEventSection({ tournament }) {
  if (tournament.eventFormat !== "teams" || !tournament.teamDays?.length) {
    return null;
  }

  return (
    <section className="tournament-section team-event-section">
      <div className="tournament-section-heading">
        <h2>Ημερίδες και γύροι</h2>
        <span>{tournament.teamDays.length}</span>
      </div>

      <div className="team-days-list">
        {tournament.teamDays.map((day) => (
          <article className="team-day" key={day.dayNumber}>
            <header className="team-day-header">
              <div>
                <h3>Ημερίδα {day.dayNumber} · {formatDate(day.date)}</h3>
                {day.dailyVps ? (
                  <p>Event ID {day.eventId} · {day.dailyImpFor}–{day.dailyImpAgainst} IMP ({day.dailyImpBalance > 0 ? "+" : ""}{day.dailyImpBalance}) · {day.dailyVps} VP · Θέσεις {day.seatingSummary}</p>
                ) : (
                  <p>Κατάταξη ημέρας: {day.position}/{day.participants} · Αθροιστικό σκορ: {day.cumulativeVps} VP</p>
                )}
              </div>
              {day.resultImage && <img src={day.resultImage} alt={`Αποτέλεσμα ημερίδας ${day.dayNumber}`} />}
            </header>

            <div className="team-rounds-summary-wrap">
              <table className="team-rounds-summary">
                <thead>
                  <tr>
                    <th>Γύρος</th>
                    <th>Αντίπαλος</th>
                    <th>IMP {tournament.teamName}</th>
                    <th>IMP αντιπάλου</th>
                    <th>VP {tournament.teamName}</th>
                    <th>VP αντιπάλου</th>
                  </tr>
                </thead>
                <tbody>
                  {day.rounds.map((round) => (
                    <tr key={round.roundNumber}>
                      <td>{round.roundNumber}</td>
                      <td>{round.opponent}</td>
                      <td>{round.teamImps}</td>
                      <td>{round.opponentImps}</td>
                      <td>{round.teamVps}</td>
                      <td>{round.opponentVps}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {day.rounds.map((round) => (
              <details className="team-round-details" key={`boards-${round.roundNumber}`}>
                <summary>Boards γύρου {round.roundNumber} με {round.opponent}</summary>
                <div className="tournament-boards-table-wrap">
                  <table className="tournament-boards-table team-board-results-table">
                    <thead>
                      <tr>
                        <th>Board</th>
                        <th>{round.boards.some((board) => board.ourTable) ? "Τραπέζι Στεφανάκη–Βακάλη" : `Αποτέλεσμα ${tournament.teamName}`}</th>
                        <th>{round.boards.some((board) => board.otherTable) ? "Άλλο τραπέζι" : "Αποτέλεσμα αντιπάλου"}</th>
                        <th>IMP {tournament.teamName}</th>
                        <th>IMP αντιπάλου</th>
                      </tr>
                    </thead>
                    <tbody>
                      {round.boards.map((board) => (
                        <tr key={`${round.roundNumber}-${board.boardNumber}`}>
                          <td>{board.boardNumber}</td>
                          <td>{formatRoomResult(board.ourTable || board.teamResult)}</td>
                          <td>{formatRoomResult(board.otherTable || board.opponentResult)}</td>
                          <td>{board.teamImps || missingValue}</td>
                          <td>{board.opponentImps || missingValue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            ))}
          </article>
        ))}
      </div>
    </section>
  );
}

function BoardResultsSection({ boardResults }) {
  if (!boardResults?.length) {
    return null;
  }

  const sortedBoardResults = [...boardResults].sort((a, b) => a.boardNumber - b.boardNumber);

  return (
    <section className="tournament-section tournament-boards-section">
      <div className="tournament-section-heading">
        <h2>Boards</h2>
        <span>{sortedBoardResults.length}</span>
      </div>

      <div className="tournament-boards-table-wrap">
        <table className="tournament-boards-table">
          <thead>
            <tr>
              <th>Board</th>
              <th>Ποσοστό</th>
            </tr>
          </thead>
          <tbody>
            {sortedBoardResults.map((board) => (
              <tr key={`${board.tournamentId}-${board.boardNumber}`}>
                <td>{board.boardNumber}</td>
                <td>{board.percentage === null || board.percentage === undefined ? missingValue : `${board.percentage}%`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TournamentSection({ title, items }) {
  return (
    <section className="tournament-section">
      <div className="tournament-section-heading">
        <h2>{title}</h2>
        <span>{items.length || 0}</span>
      </div>

      <div className="tournament-section-grid">
        {items.length ? (
          items.map((item, index) => (
            <article className="tournament-info-card" key={`${title}-${index}`}>
              {item.image && (
                <a href={item.image} target="_blank" rel="noreferrer" aria-label={`Άνοιγμα ${item.title || item.label}`}>
                  <img src={item.image} alt={item.title || item.label} />
                </a>
              )}
              <div>
                <h3>{item.title || item.label}</h3>
                {item.value && <strong>{item.value}</strong>}
                {item.text && <p>{item.text}</p>}
              </div>
            </article>
          ))
        ) : (
          <article className="tournament-info-card empty">
            <div>
              <h3>{missingValue}</h3>
              <p>Δεν υπάρχει ακόμη επιβεβαιωμένο υλικό για αυτή την ενότητα.</p>
            </div>
          </article>
        )}
      </div>
    </section>
  );
}

function TournamentDetail() {
  const { tournamentId } = useParams();
  const tournament = tournamentsData.find((item) => item.id === tournamentId);

  if (!tournament) {
    return (
      <div className="tournament-detail-page">
        <Link to="/results" className="tournament-back">
          Επιστροφή στα Results
        </Link>
        <section className="tournament-missing">
          <h1>Ο αγώνας δεν βρέθηκε</h1>
          <p>Το αρχείο δεδομένων δεν περιέχει αυτόν τον αγώνα.</p>
          <Link to="/" className="tournament-home-link">
            Επιστροφή στην αρχική
          </Link>
        </section>
      </div>
    );
  }

  const detailItems = buildDetailItems(tournament);

  return (
    <div className="tournament-detail-page">
      <nav className="tournament-actions" aria-label="Πλοήγηση αγώνα">
        <Link to="/results" className="tournament-back">
          Επιστροφή στα Results
        </Link>
        <Link to="/" className="tournament-back">
          Επιστροφή στην αρχική
        </Link>
      </nav>

      <header className="tournament-hero">
        <div>
          <span>{toDisplay(tournament.type)}</span>
          <h1>{toDisplay(tournament.title)}</h1>
          <p>{toDisplay(tournament.notes)}</p>
        </div>
      </header>

      <section className="tournament-meta-grid">
        <article>
          <span>Ημερομηνία</span>
          <strong>{formatTournamentDate(tournament)}</strong>
        </article>
        <article>
          <span>Διοργάνωση / ΑΟΤ</span>
          <strong>{toDisplay(tournament.organization)}</strong>
        </article>
        <article>
          <span>Τοποθεσία</span>
          <strong>{toDisplay(tournament.location)}</strong>
        </article>
        <article>
          <span>Βαθμίδα</span>
          <strong>{toDisplay(tournament.grade)}</strong>
        </article>
        <article>
          <span>{tournament.eventFormat === "teams" ? "Ομάδα" : "Συμπαίκτης"}</span>
          <strong>{toDisplay(tournament.eventFormat === "teams" ? tournament.teamName : tournament.partner)}</strong>
        </article>
        <article>
          <span>Θέση</span>
          <strong>{toDisplay(tournament.position)}</strong>
        </article>
        <article>
          <span>{tournament.scoreType === "percentage" ? "Ποσοστό" : "Σκορ"}</span>
          <strong>{formatScore(tournament)}</strong>
        </article>
        <article>
          <span>Κατηγορίες παικτών</span>
          <strong>{formatPlayerCategories(tournament)}</strong>
        </article>
      </section>

      <main className="tournament-sections">
        <TeamSummarySection tournament={tournament} />
        <TeamEventSection tournament={tournament} />
        <ReplaySection tournament={tournament} />
        <BoardResultsSection boardResults={tournament.boardResults} />
        {detailSections.filter((section) => (detailItems[section.key] || []).length).map((section) => (
          <TournamentSection
            key={section.key}
            title={section.title}
            items={detailItems[section.key] || []}
          />
        ))}
      </main>
    </div>
  );
}

export default TournamentDetail;
