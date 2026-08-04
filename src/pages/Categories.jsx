import { Link } from "react-router-dom";
import { categoriesData, categoriesDataStatus } from "../data/categoriesData";
import { playerData } from "../data/playerData";
import "./Categories.css";

const missingValue = "—";

function toDisplay(value) {
  return value === null || value === undefined || value === "" ? missingValue : value;
}

function formatDate(date) {
  if (!date) return missingValue;

  const [year, month, day] = date.split("-");
  return year && month && day ? `${day}/${month}/${year}` : date;
}

function getTotalBlackProgress(player) {
  const officialBlack = Number(player.officialPoints.black) || 0;
  const neededBlack = Number(player.nextCategory.blackNeeded) || 0;
  const total = officialBlack + neededBlack;

  if (!total) return 0;

  return Math.min(100, Math.round((officialBlack / total) * 100));
}

function formatPoints(points) {
  return [
    { label: "Μαύροι", value: points.black },
    { label: "Χρυσοί", value: points.gold },
    { label: "Platinum", value: points.platinum },
  ];
}

function Categories() {
  const progress = getTotalBlackProgress(playerData);
  const officialPoints = formatPoints(playerData.officialPoints);
  const pendingPoints = formatPoints(playerData.pendingPoints);

  return (
    <div className="categories-page">
      <Link to="/" className="categories-back">
        Επιστροφή στην αρχική
      </Link>

      <section className="categories-hero">
        <span>Bridge Life</span>
        <h1>Categories</h1>
        <p>
          Παρακολούθηση επίσημης κατηγορίας, βαθμών και προσωρινής προόδου με
          καθαρό διαχωρισμό από τα στοιχεία που οριστικοποιεί η ΕΟΜ.
        </p>
      </section>

      <section className="categories-overview">
        <article className="categories-card progress-card">
          <div className="categories-card-heading">
            <span>Η πρόοδός μου</span>
            <strong>{playerData.currentCategoryName}</strong>
          </div>

          <p className="categories-status">
            Επίσημη κατάσταση έως την τελευταία οριστικοποίηση
          </p>
          <p className="categories-status muted">
            Τελευταία ενημέρωση: {formatDate(playerData.officialStatus.lastUpdated)}
          </p>
          <p className="categories-status muted">
            Επόμενη οριστικοποίηση:{" "}
            {formatDate(playerData.officialStatus.nextFinalizationDate)}
          </p>

          <div className="points-grid">
            {officialPoints.map((point) => (
              <div key={point.label}>
                <span>{point.label}</span>
                <strong>{toDisplay(point.value)}</strong>
              </div>
            ))}
          </div>

          <div className="progress-block">
            <div className="progress-label">
              <span>Πρόοδος προς την επόμενη κατηγορία</span>
              <strong>{progress}%</strong>
            </div>
            <div className="progress-track">
              <i style={{ width: `${progress}%` }} />
            </div>
            <p>
              Απομένουν {toDisplay(playerData.nextCategory.blackNeeded)} μαύροι
              βαθμοί
            </p>
          </div>
        </article>

        <article className="categories-card pending-card">
          <div className="categories-card-heading">
            <span>Προσωρινοί βαθμοί</span>
            <strong>Προσωρινή εκτίμηση — όχι επίσημη κατηγορία</strong>
          </div>

          <p className="warning-text">
            Οι βαθμοί αυτοί ΔΕΝ έχουν οριστικοποιηθεί από την ΕΟΜ και μπορεί να
            αλλάξουν μέχρι την επόμενη οριστικοποίηση. Δεν προστίθενται στους
            επίσημους βαθμούς και δεν υπολογίζουν νέα επίσημη κατηγορία.
          </p>

          <div className="points-grid">
            {pendingPoints.map((point) => (
              <div key={point.label}>
                <span>{point.label}</span>
                <strong>{toDisplay(point.value)}</strong>
              </div>
            ))}
          </div>

          <p className="categories-status muted">
            Κύκλος ενημέρωσης: {playerData.officialStatus.updateCycle}
          </p>
        </article>
      </section>

      <section className="categories-table-card">
        <div className="categories-section-heading">
          <h2>Πίνακας κατηγοριών</h2>
          <p>{toDisplay(categoriesDataStatus.notes)}</p>
        </div>

        <div className="categories-table-wrap">
          <table className="categories-table">
            <thead>
              <tr>
                <th>Κατηγορία</th>
                <th>Όνομα</th>
                <th>Μαύροι</th>
                <th>Χρυσοί</th>
                <th>Platinum</th>
                <th>Σημειώσεις</th>
              </tr>
            </thead>
            <tbody>
              {categoriesData.length ? (
                categoriesData.map((category) => (
                  <tr
                    className={
                      category.category === playerData.currentCategory
                        ? "current-category-row"
                        : ""
                    }
                    key={category.id}
                  >
                    <td>{toDisplay(category.category)}</td>
                    <td>{toDisplay(category.name)}</td>
                    <td>{toDisplay(category.requiredPoints?.black)}</td>
                    <td>{toDisplay(category.requiredPoints?.gold)}</td>
                    <td>{toDisplay(category.requiredPoints?.platinum)}</td>
                    <td>{toDisplay(category.notes)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">
                    Δεν υπάρχει ακόμη διαθέσιμος πίνακας αναφοράς χωρίς
                    μαντεμένες τιμές.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Categories;
