import { Link, useParams } from "react-router-dom";
import { tournamentsData } from "../data/tournamentsData";
import { galleryData } from "../data/galleryData";
import { videosData } from "../data/videosData";
import { formatPlacement } from "../utils/placements";
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

function formatTeamRoundText(round) {
  const parts = [];

  if (round.teamVps !== null && round.teamVps !== undefined) {
    parts.push(
      round.opponentVps !== null && round.opponentVps !== undefined
        ? `${round.teamVps}–${round.opponentVps} VP`
        : `${round.teamVps} VP`,
    );
  }

  if (round.deals) {
    parts.push(`${round.deals} διανομές`);
  }

  return parts.join(" · ") || null;
}

function buildDetailItems(tournament) {
  const resultItems = tournament.eventFormat === "teams"
    ? [
        ...(tournament.sourceResultIds?.length
          ? [{ label: "Event ID ΕΟΜ", value: tournament.sourceResultIds.join(", ") }]
          : []),
        ...(tournament.completionStatus === "inProgress"
          ? [
              { label: "Κατάσταση", value: "Σε εξέλιξη" },
              { label: "Κατάταξη", value: "ΠΡΟΣΩΡΙΝΗ ΚΑΤΑΤΑΞΗ" },
            ]
          : []),
        {
          label: tournament.completionStatus === "inProgress" ? "Τρέχουσα θέση" : "Τελική θέση",
          value: formatPlacement(tournament.position, tournament.isTied),
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
        ...(tournament.teamMemberAwards || []).map((award) => ({
          label: `Απονομή · ${award.player}`,
          value: `${award.black} Μ · ${award.gold} Χ · ${String(award.platinum).replace(".", ",")} Π`,
        })),
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
            value: day.dailyVps
              ? `${day.dailyVps} VP · ${day.dailyImpBalance > 0 ? "+" : ""}${day.dailyImpBalance} IMP`
              : `${day.cumulativeVps} VP σωρευτικά`,
            text: [
              day.position ? `Συγκεντρωτικά: ${day.position}/${day.participants} · ${day.cumulativeVps} VP` : null,
              day.highlight,
              day.seating,
            ].filter(Boolean).join(" · ") || null,
          },
          ...(day.rounds || []).map((round) => ({
            label: `Γύρος ${round.roundNumber} · ${round.opponent}`,
            value: `${round.teamImps}–${round.opponentImps} IMP`,
            text: formatTeamRoundText(round),
          })),
          ...(day.rounds || []).flatMap((round) =>
            (round.segments || []).map((segment) => ({
              label: `${segment.label} · ${segment.opponent}`,
              value: `${segment.teamImps}–${segment.opponentImps} IMP`,
            })),
          ),
        ]),
        ...(tournament.rounds || []).map((round) => ({
          label: `Γύρος ${round.roundNumber} · ${round.opponent}`,
          value: `${round.teamImps}–${round.opponentImps} IMP`,
          text: formatTeamRoundText(round),
        })),
        ...(tournament.finalStandings || tournament.provisionalStandings || []).map((standing) => ({
          label: `${standing.position}η · ${standing.teamName}`,
          value: `${standing.score} VP`,
        })),
      ]
    : [
        ...(tournament.sourceResultId
          ? [{ label: "Event ID ΕΟΜ", value: tournament.sourceResultId }]
          : []),
        { label: "Θέση", value: formatPlacement(tournament.position, tournament.isTied) },
        { label: tournament.scoreType === "percentage" ? "Ποσοστό" : "Σκορ", value: formatScore(tournament) },
        { label: "Σύνολο συμμετοχών", value: toDisplay(tournament.participants) },
        { label: "Master points / M", value: toDisplay(tournament.masterPoints) },
        ...(tournament.extraPoints?.x
          ? [{ label: "Master points / X", value: tournament.extraPoints.x }]
          : []),
        ...(tournament.extraPoints?.p
          ? [{ label: "Master points / Π", value: tournament.extraPoints.p }]
          : []),
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
          <article>
            <span>Ρεκόρ</span>
            <strong>
              {tournament.wins} νίκες
              {tournament.draws !== undefined ? ` · ${tournament.draws} ισοπαλία` : ""}
              {` · ${tournament.losses} ήττα`}
            </strong>
          </article>
        )}
        <article><span>IMP</span><strong>{tournament.impFor}–{tournament.impAgainst}</strong></article>
        <article><span>Διαφορά</span><strong>{tournament.impBalance > 0 ? "+" : ""}{tournament.impBalance} IMP</strong></article>
        <article><span>VP</span><strong>{formatScore(tournament)}</strong></article>
        <article>
          <span>{tournament.completionStatus === "inProgress" ? "Τρέχουσα θέση" : "Τελική θέση"}</span>
          <strong>{formatPlacement(tournament.position, tournament.isTied)}/{tournament.participants}</strong>
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

function SeriesProgressSection({ tournament }) {
  if (!tournament.seriesSessions?.length) return null;

  const completedSessions = new Map(
    tournament.seriesSessions.map((session) => [session.sessionNumber, session]),
  );

  return (
    <section className="tournament-section series-progress-section">
      <div className="tournament-section-heading">
        <h2>Πρόοδος σειράς</h2>
        <span>{tournament.seriesCompletedSessions}/{tournament.seriesTotalSessions}</span>
      </div>
      <div className="series-progress-grid">
        {Array.from({ length: tournament.seriesTotalSessions }, (_, index) => index + 1).map((sessionNumber) => {
          const session = completedSessions.get(sessionNumber);
          return (
            <article className={session ? "complete" : "pending"} key={sessionNumber}>
              <span aria-hidden="true">{session ? "●" : "○"}</span>
              <div>
                <strong>{sessionNumber}η ημερίδα</strong>
                {session ? (
                  <>
                    <small>{formatDate(session.date)} · {session.position}/{session.participants} · {session.score}%</small>
                    <Link to={`/tournament/${session.tournamentId}`}>Προβολή αποτελέσματος</Link>
                  </>
                ) : (
                  <small>Δεν έχει ολοκληρωθεί</small>
                )}
              </div>
            </article>
          );
        })}
      </div>
      {tournament.officialAggregateStatus === "notPublished" && (
        <p className="series-aggregate-note">
          Η επίσημη συγκεντρωτική κατάταξη δεν έχει ακόμη δημοσιευτεί από την ΕΟΜ.
        </p>
      )}
    </section>
  );
}

function RelatedGallerySection({ tournament }) {
  if (!tournament.showRelatedGallery || !tournament.galleryIds?.length) return null;

  const relatedImages = tournament.galleryIds
    .map((galleryId) => galleryData.find((item) => item.id === galleryId))
    .filter(Boolean);

  if (!relatedImages.length) return null;

  return (
    <section className="tournament-section tournament-gallery-section">
      <div className="tournament-section-heading">
        <h2>Φωτογραφίες απονομής</h2>
        <span>{relatedImages.length}</span>
      </div>
      <div className="tournament-gallery-grid">
        {relatedImages.map((item) => (
          <article key={item.id}>
            <a href={item.image} target="_blank" rel="noreferrer">
              <img src={item.image} alt={item.title} />
            </a>
            <div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          </article>
        ))}
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
            <video controls playsInline preload="metadata">
              <source src={video.src} type="video/mp4" />
            </video>
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
          <strong>{formatPlacement(tournament.position, tournament.isTied)}</strong>
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
        <SeriesProgressSection tournament={tournament} />
        <RelatedGallerySection tournament={tournament} />
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
