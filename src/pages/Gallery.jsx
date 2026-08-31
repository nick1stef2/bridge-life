import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import GalleryCard from "../components/GalleryCard";
import { galleryData } from "../data/galleryData";
import "./Gallery.css";

const filters = ["Όλα", "Αγώνες", "Μαθήματα", "Παρέες", "Εκδηλώσεις"];
const missingValue = "—";

function toDisplay(value) {
  return value === null || value === undefined || value === "" ? missingValue : value;
}

function sortByDateDesc(a, b) {
  if (a.date && b.date) {
    const dateComparison = b.date.localeCompare(a.date);
    if (dateComparison !== 0) return dateComparison;
    return a.id.localeCompare(b.id);
  }

  if (a.date) {
    return -1;
  }

  if (b.date) {
    return 1;
  }

  return a.id.localeCompare(b.id);
}

function Gallery() {
  const [activeFilter, setActiveFilter] = useState("Όλα");
  const [selectedIndex, setSelectedIndex] = useState(null);

  const uniqueGalleryItems = useMemo(
    () => galleryData.filter((item) => !item.duplicateOf).sort(sortByDateDesc),
    [],
  );

  const filteredItems = useMemo(() => {
    if (activeFilter === "Όλα") return uniqueGalleryItems;
    return uniqueGalleryItems.filter((item) => item.category === activeFilter);
  }, [activeFilter, uniqueGalleryItems]);

  const selectedItem =
    selectedIndex === null ? null : filteredItems[selectedIndex] || null;

  const closeModal = () => setSelectedIndex(null);

  const showPrevious = () => {
    setSelectedIndex((current) => {
      if (current === null || !filteredItems.length) return current;
      return current === 0 ? filteredItems.length - 1 : current - 1;
    });
  };

  const showNext = () => {
    setSelectedIndex((current) => {
      if (current === null || !filteredItems.length) return current;
      return current === filteredItems.length - 1 ? 0 : current + 1;
    });
  };

  useEffect(() => {
    if (!selectedItem) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeModal();
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedItem, filteredItems.length]);

  return (
    <div className="gallery-page">
      <Link to="/" className="gallery-back">
        Επιστροφή στην αρχική
      </Link>

      <header className="gallery-header">
        <h1>Gallery</h1>
        <p>
          Φωτογραφίες, στιγμές από αγώνες, υλικό μαθημάτων και μικρές
          αναμνήσεις από την καθημερινότητα του Bridge Life.
        </p>
      </header>

      <div className="gallery-filters" aria-label="Φίλτρα φωτογραφιών">
        {filters.map((filter) => (
          <button
            className={filter === activeFilter ? "active" : ""}
            key={filter}
            type="button"
            onClick={() => {
              setActiveFilter(filter);
              setSelectedIndex(null);
            }}
          >
            {filter}
          </button>
        ))}
      </div>

      <main className="gallery-grid">
        {filteredItems.map((item, index) => (
          <GalleryCard
            key={item.id}
            image={item.image}
            title={toDisplay(item.title)}
            text={toDisplay(item.description)}
            date={toDisplay(item.date)}
            category={toDisplay(item.category)}
            onClick={() => setSelectedIndex(index)}
          />
        ))}
      </main>

      {selectedItem && (
        <div
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={toDisplay(selectedItem.title)}
          onClick={closeModal}
        >
          <button
            className="gallery-modal-close"
            type="button"
            onClick={closeModal}
            aria-label="Κλείσιμο"
          >
            ×
          </button>

          <button
            className="gallery-modal-nav previous"
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              showPrevious();
            }}
            aria-label="Προηγούμενη φωτογραφία"
          >
            ‹
          </button>

          <figure
            className="gallery-modal-content"
            onClick={(event) => event.stopPropagation()}
          >
            <img src={selectedItem.image} alt={toDisplay(selectedItem.title)} />
            <figcaption>
              <span>{toDisplay(selectedItem.category)}</span>
              <h2>{toDisplay(selectedItem.title)}</h2>
              <time>{toDisplay(selectedItem.date)}</time>
              <p>{toDisplay(selectedItem.description)}</p>
            </figcaption>
          </figure>

          <button
            className="gallery-modal-nav next"
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              showNext();
            }}
            aria-label="Επόμενη φωτογραφία"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}

export default Gallery;
