import { Link, useParams } from "react-router-dom";
import { tournamentsData } from "../data/tournamentsData";
import { videosData } from "../data/videosData";
import "./TournamentDetail.css";

const missingValue = "—";

const detailSections = [{ key: "results", title: "Αποτελέσματα" }];

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
        ...(tournament.sourceResultIds?.length
          ? [{ label: "Event ID ΕΟΜ", value: tournament.sourceResultIds.join(", ") }]
          : []),
        {
          label: tournament.completionStatus === "inProgress" ? "Τρέχουσα θέση" : "Τελική θέση",
          value: toDisplay(tournament.position),
        },
        {
          label: tournament.completionStatus === "inProgress" ? "Τρέχον σκορ" : "Τελικό σκορ",
          value: formatScore(tournament),
        },
        { label: "Σύνολο ομάδων", value: toDisplay(tournament.participants) },
        ...(tournament.teamMembers?.length
          ? [{ label: "Σύνθεση ομάδας", value: tournament.teamMembers.join(" · ") }]
          : []),
        ...(tournament.masterPoints !== null && tournament.masterPoints !== undefined
          ? [{ label: "Προσωρινοί βαθμοί Μ", value: tournament.masterPoints }]
          : []),
        ...(tournament.extraPoints?.x
          ? [{ label: "Προσωρινοί βαθμοί Χ", value: tournament.extraPoints.x }]
          : []),
        ...(tournament.extraPoints?.p
          ? [{ label: "Προσωρινοί βαθμοί Π", value: tournament.extraPoints.p }]
          : []),
        ...(tournament.resultImage
          ? [{ label: "Πηγή τελικού αποτελέσματος", value: "Screenshot", image: tournament.resultImage }]
          : []),
        ...(tournament.relatedResultImages || []).map((image, index) => ({
          label: `Αναλυτικό αποτέλεσμα ${index + 1}`,
          value: "Screenshot",
          image,
        })),
        ...(tournament.teamDays || []).flatMap((day) => [
          {
            label: `Ημέρα ${day.dayNumber} · ${formatDate(day.date)}`,
            value: day.position
              ? `${day.position}/${day.participants} · ${day.cumulativeVps} VP`
              : `${day.cumulativeVps} VP σωρευτικά`,
            text: day.seating || null,
          },
          ...(day.rounds || []).map((round) => ({
            label: `Γύρος ${round.roundNumber} · ${round.opponent}`,
            value: `${round.teamImps}–${round.opponentImps} IMP`,
            text: `${round.teamVps}–${round.opponentVps} VP · ${round.deals} διανομές`,
          })),
        ]),
        ...(tournament.rounds || []).map((round) => ({
          label: `Γύρος ${round.roundNumber} · ${round.opponent}`,
          value: `${round.teamImps}–${round.opponentImps} IMP`,
          text: `${round.teamVps}–${round.opponentVps} VP · ${round.deals} διανομές`,
        })),
      ]
    : [
        ...(tournament.sourceResultId
          ? [{ label: "Event ID ΕΟΜ", value: tournament.sourceResultId }]
          : []),
        { label: "Θέση", value: toDisplay(tournament.position) },
        { label: tournament.scoreType === "percentage" ? "Ποσοστό" : "Σκορ", value: formatScore(tournament) },
        { label: "Σύνολο συμμετοχών", value: toDisplay(tournament.participants) },
        { label: "Master points / M", value: toDisplay(tournament.masterPoints) },
        { label: "Κατηγορίες παικτών", value: formatPlayerCategories(tournament) },
        ...(tournament.pairCardNumber
          ? [{ label: "Κάρτα ζεύγους", value: tournament.pairCardNumber }]
          : []),
        ...(tournament.totalRounds
          ? [{ label: "Γύροι / διανομές", value: `${tournament.totalRounds} γύροι · ${tournament.playedBoards} διανομές` }]
          : []),
        ...(tournament.rounds || []).map((round) => ({
          label: `Γύρος ${round.roundNumber} · ${round.opponents}`,
          value: `Boards ${round.boards}`,
          text: `Τραπέζι ${round.table} · ${round.direction}`,
        })),
        ...(tournament.resultImage
          ? [{ label: "Πηγή αποτελέσματος", value: "Screenshot", image: tournament.resultImage }]
          : []),
      ];

  return {
    results: resultItems,
  };
}

function TeamSummarySection({ tournament }) {
  if (tournament.eventFormat !== "teams" || !tournament.totalRounds) return null;

  return (
    <section className="tournament-section team-summary-section">
      <div className="tournament-section-heading">
        <h2>
          {tournament.completionStatus === "inProgress"
            ? `Κατάσταση μετά την Ημέρα ${tournament.currentDay}`
            : "Συνολικό αποτέλεσμα διοργάνωσης"}
        </h2>
      </div>
      <div className="team-summary-grid">
        <article><span>Γύροι</span><strong>{tournament.totalRounds}</strong></article>
        {tournament.wins !== undefined && tournament.losses !== undefined && (
          <article><span>Ρεκόρ</span><strong>{tournament.wins} νίκες · {tournament.losses} ήττα</strong></article>
        )}
        <article><span>IMP</span><strong>{tournament.impFor}–{tournament.impAgainst}</strong></article>
        <article><span>Διαφορά</span><strong>{tournament.impBalance > 0 ? "+" : ""}{tournament.impBalance} IMP</strong></article>
        <article><span>VP</span><strong>{formatScore(tournament)}</strong></article>
        <article>
          <span>{tournament.completionStatus === "inProgress" ? "Τρέχουσα θέση" : "Τελική θέση"}</span>
          <strong>{tournament.position}/{tournament.participants}</strong>
        </article>
        {tournament.runnerUp && (
          <article>
            <span>Διαφορά από 2η · {tournament.runnerUp.teamName}</span>
            <strong>+{tournament.runnerUp.gap} VP</strong>
          </article>
        )}
      </div>
    </section>
  );
}

function RelatedVideosSection({ tournament }) {
  if (!tournament.showRelatedVideos || !tournament.videoIds?.length) return null;

  const relatedVideos = tournament.videoIds
    .map((videoId) => videosData.find((video) => video.id === videoId))
    .filter(Boolean);

  if (!relatedVideos.length) return null;

  return (
    <section className="tournament-section tournament-videos-section">
      <div className="tournament-section-heading">
        <h2>Σχετικό βίντεο</h2>
        <span>{relatedVideos.length}</span>
      </div>
      <div className="tournament-videos-grid">
        {relatedVideos.map((video) => (
          <article key={video.id}>
            <video controls playsInline preload="metadata" src={video.src} />
            <div>
              <h3>{video.title}</h3>
              <p>{video.description}</p>
            </div>
          </article>
        ))}
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
  const officialUrls = tournament.officialUrls || (tournament.officialUrl ? [tournament.officialUrl] : []);

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
          {!!officialUrls.length && (
            <div className="tournament-official-links">
              {officialUrls.map((url, index) => (
                <a href={url} target="_blank" rel="noreferrer" key={url}>
                  Επίσημα αποτελέσματα ΕΟΜ{officialUrls.length > 1 ? ` ${index + 1}` : ""} ↗
                </a>
              ))}
            </div>
          )}
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
        <RelatedVideosSection tournament={tournament} />
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
