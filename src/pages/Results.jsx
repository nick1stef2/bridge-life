import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { tournamentsData } from "../data/tournamentsData";
import "./Results.css";

const filters = ["Όλοι", "Ζεύγη", "Ομαδικά", "Mitchell", "Howell"];
const missingValue = "—";

function toDisplay(value) {
  return value === null || value === undefined || value === "" ? missingValue : value;
}

function parseScore(score) {
  if (!score) {
    return null;
  }

  const value = Number(String(score).replace("%", "").replace(",", "."));
  return Number.isFinite(value) ? value : null;
}

function parsePosition(position) {
  const value = Number.parseInt(position, 10);
  return Number.isFinite(value) ? value : null;
}

function formatScore(value) {
  return `${value.toFixed(2).replace(".", ",")}%`;
}

function formatResultScore(result) {
  const parsedScore = parseScore(result.score);

  if (parsedScore === null) {
    return missingValue;
  }

  if (result.scoreType === "percentage") {
    return formatScore(parsedScore);
  }

  return result.scoreUnit ? `${toDisplay(result.score)} ${result.scoreUnit}` : toDisplay(result.score);
}

function formatPartnerOrTeam(result) {
  return result.eventFormat === "teams" && result.teamName
    ? `Ομάδα ${result.teamName}`
    : toDisplay(result.partner);
}

function isPercentageResult(result) {
  return (
    result.eventFormat === "pairs" &&
    result.scoreType === "percentage" &&
    result.includeInPersonalStats !== false
  );
}

function formatDate(date) {
  if (!date) {
    return missingValue;
  }

  const [year, month, day] = date.split("-");
  return year && month && day ? `${day}/${month}/${year}` : date;
}

function formatPlayerCategories(result) {
  if (result.playerCategory === null || result.playerCategory === undefined) {
    return missingValue;
  }

  if (result.partnerCategory === null || result.partnerCategory === undefined) {
    return `Κατηγορίες παικτών: ${result.playerCategory} – ${missingValue}`;
  }

  return `Κατηγορίες παικτών: ${result.playerCategory} – ${result.partnerCategory}`;
}

function getPersonalScoredResults(results) {
  return results
    .filter(isPercentageResult)
    .map((result) => ({ ...result, scoreValue: parseScore(result.score) }))
    .filter((result) => result.scoreValue !== null);
}

function buildSummaryCards(results) {
  const personalScoredResults = getPersonalScoredResults(results);
  const sortedResults = [...personalScoredResults].sort((a, b) => b.date.localeCompare(a.date));
  const positionedResults = personalScoredResults
    .map((result) => ({ ...result, positionValue: parsePosition(result.position) }))
    .filter((result) => result.positionValue !== null);

  const latestResult = sortedResults[0] || null;
  const bestScore = personalScoredResults.reduce(
    (best, result) => (!best || result.scoreValue > best.scoreValue ? result : best),
    null,
  );
  const bestPosition = positionedResults.reduce(
    (best, result) => (!best || result.positionValue < best.positionValue ? result : best),
    null,
  );
  const averageScore = personalScoredResults.length
    ? personalScoredResults.reduce((sum, result) => sum + result.scoreValue, 0) / personalScoredResults.length
    : null;
  const latestPlayerCategory = sortedResults.find(
    (result) => result.playerCategory !== null && result.playerCategory !== undefined,
  )?.playerCategory;

  return [
    {
      label: "Τελευταίο αποτέλεσμα",
      value: latestResult ? formatScore(latestResult.scoreValue) : missingValue,
      text: latestResult ? `${latestResult.title || missingValue} - ${formatDate(latestResult.date)}` : missingValue,
    },
    {
      label: "Καλύτερο ποσοστό",
      value: bestScore ? formatScore(bestScore.scoreValue) : missingValue,
      text: bestScore ? `${bestScore.title || missingValue} - ${formatDate(bestScore.date)}` : missingValue,
    },
    {
      label: "Μέσο ποσοστό",
      value: averageScore !== null ? formatScore(averageScore) : missingValue,
      text: personalScoredResults.length
        ? `Υπολογισμένο από ${personalScoredResults.length} επιβεβαιωμένους προσωπικούς αγώνες`
        : missingValue,
    },
    {
      label: "Συνολικοί αγώνες",
      value: String(personalScoredResults.length),
      text: "Επιβεβαιωμένοι προσωπικοί αγώνες με ποσοστό",
    },
    {
      label: "Καλύτερη θέση",
      value: bestPosition ? bestPosition.position : missingValue,
      text: bestPosition ? `${bestPosition.title || missingValue} - ${formatDate(bestPosition.date)}` : missingValue,
    },
    {
      label: "Κατηγορία Νίκου",
      value: latestPlayerCategory !== undefined ? String(latestPlayerCategory) : missingValue,
      text: latestPlayerCategory !== undefined ? "Από την πιο πρόσφατη επιβεβαιωμένη προσωπική εγγραφή" : missingValue,
    },
  ];
}

function buildProgressPoints(results) {
  return getPersonalScoredResults(results)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-6)
    .map((result) => ({
      label: formatDate(result.date).slice(0, 5),
      value: result.scoreValue,
    }));
}

function Results() {
  const [activeFilter, setActiveFilter] = useState("Όλοι");
  const [searchTerm, setSearchTerm] = useState("");

  const sortedTournaments = useMemo(
    () => [...tournamentsData].sort((a, b) => b.date.localeCompare(a.date)),
    [],
  );
  const summaryCards = useMemo(() => buildSummaryCards(tournamentsData), []);
  const progressPoints = useMemo(() => buildProgressPoints(tournamentsData), []);

  const filteredResults = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return sortedTournaments.filter((result) => {
      const searchableText = [
        result.title,
        result.partner,
        result.organization,
        result.type,
        result.playerCategory,
        result.partnerCategory,
      ]
        .filter((value) => value !== null && value !== undefined)
        .join(" ")
        .toLowerCase();
      const matchesFilter =
        activeFilter === "Όλοι" ||
        (result.type && result.type.toLowerCase().includes(activeFilter.toLowerCase())) ||
        (result.title && result.title.toLowerCase().includes(activeFilter.toLowerCase()));
      const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchTerm, sortedTournaments]);

  return (
    <div className="results-page">
      <Link to="/" className="results-back">
        Επιστροφή στην αρχική
      </Link>

      <section className="results-hero">
        <div>
          <span className="results-kicker">Νίκος Στεφανάκης</span>
          <h1>Bridge Results</h1>
          <p>
            Αγωνιστική πορεία, πρόσφατα αποτελέσματα και βασικά στατιστικά από
            επιβεβαιωμένα screenshots αποτελεσμάτων και boards.
          </p>
        </div>
      </section>

      <section className="results-summary">
        {summaryCards.map((card) => (
          <article className="result-stat-card" key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <p>{card.text}</p>
          </article>
        ))}
      </section>

      <section className="results-progress-card">
        <div className="results-section-heading">
          <h2>Πρόοδος</h2>
          <p>Γράφημα εξέλιξης βασισμένο στα τελευταία επιβεβαιωμένα προσωπικά ποσοστά.</p>
        </div>

        <div className="progress-chart" aria-label="Γράφημα εξέλιξης ποσοστών">
          {progressPoints.map((point) => (
            <div className="progress-column" key={`${point.label}-${point.value}`}>
              <span>{formatScore(point.value)}</span>
              <div className="progress-track">
                <i style={{ height: `${point.value}%` }} />
              </div>
              <strong>{point.label}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="results-table-card">
        <div className="results-table-heading">
          <div className="results-section-heading">
            <h2>Τελευταίοι αγώνες</h2>
            <p>Φιλτράρισμα και αναζήτηση στα επιβεβαιωμένα και μη επιβεβαιωμένα αρχεία.</p>
          </div>

          <div className="results-controls">
            <div className="results-filter-group" aria-label="Φίλτρα αγώνων">
              {filters.map((filter) => (
                <button
                  className={filter === activeFilter ? "active" : ""}
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>

            <label className="results-search">
              <span>Αναζήτηση αγώνα</span>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Π.χ. ΑΟΤ ή συμπαίκτης"
              />
            </label>
          </div>
        </div>

        <div className="results-table-wrap">
          <table className="results-table">
            <thead>
              <tr>
                <th>Ημερομηνία</th>
                <th>Αγώνας</th>
                <th>Συμπαίκτης</th>
                <th>Θέση</th>
                <th>Σκορ</th>
                <th>Κατηγορίες παικτών</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((result) => (
                <tr key={result.id}>
                  <td>{formatDate(result.date)}</td>
                  <td>
                    <Link
                      className="results-tournament-link"
                      to={`/tournament/${result.id}`}
                    >
                      {toDisplay(result.title)}
                    </Link>
                  </td>
                  <td>{formatPartnerOrTeam(result)}</td>
                  <td>{toDisplay(result.position)}</td>
                  <td>{formatResultScore(result)}</td>
                  <td>{formatPlayerCategories(result)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!filteredResults.length && (
          <p className="results-empty">Δεν βρέθηκαν αγώνες για τα φίλτρα.</p>
        )}
      </section>
    </div>
  );
}

export default Results;
