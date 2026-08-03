import { Link, useParams } from "react-router-dom";
import { tournamentsData } from "../data/tournamentsData";
import "./TournamentDetail.css";

const missingValue = "—";

const detailSections = [
  { key: "results", title: "Αποτελέσματα" },
  { key: "photos", title: "Φωτογραφίες" },
  { key: "videos", title: "Βίντεο" },
  { key: "boards", title: "Διανομές / Boards" },
  { key: "lessons", title: "Μαθήματα / Lessons" },
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

function formatScore(tournament) {
  if (!tournament.score) {
    return missingValue;
  }

  if (tournament.scoreType !== "percentage") {
    return tournament.score;
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
  return {
    results: [
      { label: "Θέση", value: toDisplay(tournament.position) },
      { label: tournament.scoreType === "percentage" ? "Ποσοστό" : "Σκορ", value: formatScore(tournament) },
      { label: "Σύνολο συμμετοχών", value: toDisplay(tournament.participants) },
      { label: "Master points / M", value: toDisplay(tournament.masterPoints) },
      { label: "Κατηγορίες παικτών", value: formatPlayerCategories(tournament) },
      { label: "Πηγή αποτελέσματος", value: "Screenshot", image: tournament.resultImage },
    ],
    photos: [],
    videos: [],
    boards: tournament.boardImages.map((image, index) => ({
      title: `Board screenshot ${index + 1}`,
      image,
      text: "Πραγματικό screenshot από τον φάκελο boards.",
    })),
    lessons: [],
  };
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
              {item.image && <img src={item.image} alt={item.title || item.label} />}
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
          <strong>{formatDate(tournament.date)}</strong>
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
          <span>Συμπαίκτης</span>
          <strong>{toDisplay(tournament.partner)}</strong>
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
        {detailSections.map((section) => (
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
