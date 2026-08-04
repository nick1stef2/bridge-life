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

function toNumber(value) {
  if (value === null || value === undefined || value === "") return 0;
  return Number(String(value).replaceAll(".", "")) || 0;
}

function meetsCategory(points, category) {
  return Object.entries(category.requiredPoints).every(
    ([pointType, requirement]) =>
      requirement === null || toNumber(points[pointType]) >= toNumber(requirement),
  );
}

function getPendingEstimate(points, categories) {
  const ascendingCategories = [...categories].sort(
    (first, second) => first.category - second.category,
  );
  const estimatedCategory = [...ascendingCategories]
    .reverse()
    .find((category) => meetsCategory(points, category));
  const nextCategory = ascendingCategories.find(
    (category) => category.category === estimatedCategory.category + 1,
  );
  const remainingPoints = Object.fromEntries(
    Object.entries(nextCategory.requiredPoints).map(([pointType, requirement]) => [
      pointType,
      Math.max(0, toNumber(requirement) - toNumber(points[pointType])),
    ]),
  );

  return { estimatedCategory, nextCategory, remainingPoints };
}

function formatPoints(points) {
  return [
    { label: "Μαύροι", value: points.black },
    { label: "Χρυσοί", value: points.gold },
    { label: "Platinum", value: points.platinum },
  ];
}

function Categories() {
  const officialPoints = formatPoints(playerData.officialPoints);
  const { estimatedCategory, nextCategory, remainingPoints } = getPendingEstimate(
    playerData.pendingPoints,
    categoriesData,
  );

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
        <article className="categories-card official-card">
          <div className="categories-card-heading">
            <span>Επίσημη κατηγορία</span>
            <strong>
              Κατηγορία {playerData.officialCategory} —{" "}
              {playerData.officialCategoryName}
            </strong>
          </div>

          <p className="categories-status">
            Ισχύει μέχρι την επόμενη οριστικοποίηση
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

        </article>

        <article className="categories-card pending-card">
          <div className="categories-card-heading">
            <span>Προσωρινή εκτίμηση</span>
            <strong>
              Προσωρινή Κατηγορία {estimatedCategory.category} —{" "}
              {estimatedCategory.name}
            </strong>
          </div>

          <p className="warning-text">
            Δεν αποτελεί επίσημη κατηγορία μέχρι την οριστικοποίηση της ΕΟΜ στις{" "}
            {formatDate(playerData.officialStatus.nextFinalizationDate)}.
          </p>

          <div className="pending-targets">
            <div>
              <span>Μαύροι</span>
              <strong>{playerData.pendingPoints.black} / {toNumber(nextCategory.requiredPoints.black)}</strong>
            </div>
            <div>
              <span>Χρυσοί</span>
              <strong>{playerData.pendingPoints.gold} / {toNumber(nextCategory.requiredPoints.gold)}</strong>
              <small>Το όριο έχει καλυφθεί</small>
            </div>
          </div>

          <p className="remaining-points">
            Απομένουν {remainingPoints.black} μαύροι βαθμοί για την Κατηγορία{" "}
            {nextCategory.category} — {nextCategory.name}
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
                      category.category === playerData.officialCategory
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
