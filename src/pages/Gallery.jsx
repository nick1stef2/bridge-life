import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import GalleryCard from "../components/GalleryCard";
import { galleryData } from "../data/galleryData";
import "./Gallery.css";

const filters = ["Όλα", "Αγώνες", "Μαθήματα", "Παρέες", "Εκδηλώσεις"];

function Gallery() {
  const [activeFilter, setActiveFilter] = useState("Όλα");
  const [selectedIndex, setSelectedIndex] = useState(null);

  const filteredItems = useMemo(() => {
    if (activeFilter === "Όλα") return galleryData;
    return galleryData.filter((item) => item.category === activeFilter);
  }, [activeFilter]);

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
            key={`${item.title}-${item.date}`}
            image={item.image}
            title={item.title}
            text={item.text}
            date={item.date}
            category={item.category}
            onClick={() => setSelectedIndex(index)}
          />
        ))}
      </main>

      {selectedItem && (
        <div
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={selectedItem.title}
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
            <img src={selectedItem.image} alt={selectedItem.title} />
            <figcaption>
              <span>{selectedItem.category}</span>
              <h2>{selectedItem.title}</h2>
              <time>{selectedItem.date}</time>
              <p>{selectedItem.details || selectedItem.text}</p>
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
