import "./Lessons.css";
import { Link } from "react-router-dom";
import { lessonsData } from "../data/lessonsData";

function Lessons() {
  return (
    <div className="lessons-page">
      <h1 className="lessons-title">
        📚 Bridge Lessons
      </h1>

      <div className="lessons-grid">
        {lessonsData.map((lesson) => (
          <Link
            key={lesson.id}
            to={`/lesson/${lesson.id}`}
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div className="lesson-card">
              <img
                src={lesson.images[0]}
                alt={lesson.title}
                className="lesson-image"
              />

              <div className="lesson-content">
                <h2>{lesson.title}</h2>
                <p>{lesson.text}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Lessons;