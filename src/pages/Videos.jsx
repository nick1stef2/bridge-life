import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { videosData } from "../data/videosData";
import "./Videos.css";

const missingValue = "—";

function toDisplay(value) {
  return value === null || value === undefined || value === "" ? missingValue : value;
}

function Videos() {
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const modalVideoRef = useRef(null);

  const selectedVideo = useMemo(
    () => videosData.find((video) => video.id === selectedVideoId) || null,
    [selectedVideoId],
  );

  const closeModal = () => {
    if (modalVideoRef.current) {
      modalVideoRef.current.pause();
      modalVideoRef.current.currentTime = 0;
    }

    setSelectedVideoId(null);
  };

  useEffect(() => {
    if (!selectedVideo) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeModal();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (modalVideoRef.current) {
        modalVideoRef.current.pause();
      }
    };
  }, [selectedVideo]);

  return (
    <div className="videos-page">
      <Link to="/" className="videos-back">
        Επιστροφή στην αρχική
      </Link>

      <header className="videos-header">
        <h1>Videos</h1>
        <p>
          Συγκεντρωμένο αρχείο βίντεο από το υπάρχον υλικό του Bridge Life, με
          αναπαραγωγή σε κάρτα και μεγαλύτερη προβολή σε lightbox.
        </p>
      </header>

      <main className="videos-grid">
        {videosData.map((video) => (
          <article
            className="video-card"
            key={video.id}
            onClick={() => setSelectedVideoId(video.id)}
          >
            <div className="video-preview">
              <span className="video-play-icon" aria-hidden="true">
                ▶
              </span>
            </div>

            <div className="video-card-content">
              <span>{toDisplay(video.category)}</span>
              <h2>{video.title}</h2>
              <p>{video.description}</p>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedVideoId(video.id);
                }}
              >
                Αναπαραγωγή
              </button>
            </div>
          </article>
        ))}
      </main>

      {selectedVideo && (
        <div
          className="video-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={selectedVideo.title}
          onClick={closeModal}
        >
          <button
            className="video-modal-close"
            type="button"
            onClick={closeModal}
            aria-label="Κλείσιμο"
          >
            ×
          </button>

          <figure
            className="video-modal-content"
            onClick={(event) => event.stopPropagation()}
          >
            <video
              ref={modalVideoRef}
              controls
              autoPlay={false}
              playsInline
              preload="metadata"
              poster={selectedVideo.poster || undefined}
              src={selectedVideo.src}
            />
            <figcaption>
              <span>{toDisplay(selectedVideo.category)}</span>
              <h2>{selectedVideo.title}</h2>
              <p>{selectedVideo.description}</p>
            </figcaption>
          </figure>
        </div>
      )}
    </div>
  );
}

export default Videos;
