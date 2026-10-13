import { Link, useParams } from "react-router-dom";
import { lessonsData } from "../data/lessonsData";
import "./LessonDetail.css";

function LessonDetail() {
  const { lessonId } = useParams();

  const lesson = lessonsData.find(
    (item) => item.id === lessonId
  );

  if (!lesson) {
    return (
      <div style={{ padding: "30px" }}>
        <h2>Το μάθημα δεν βρέθηκε</h2>

        <Link to="/lessons">
          ⬅ Επιστροφή στα Μαθήματα
        </Link>
      </div>
    );
  }

  return (
    <div className="lesson-detail-page">
      <Link
        to="/lessons"
        style={{
          color: "#ffffff",
          textDecoration: "none",
          fontSize: "18px",
        }}
      >
        ⬅ Επιστροφή στα Μαθήματα
      </Link>

      <h1
        style={{
          textAlign: "center",
          marginTop: "20px",
          marginBottom: "30px",
        }}
      >
        {lesson.title}
      </h1>

      {lesson.rules ? (
        <>
          <p className="lesson-introduction">{lesson.introduction}</p>

          <div className="lesson-rules-grid">
            {lesson.rules.map((rule) => (
              <section className="lesson-rule-card" key={rule.title}>
                <div className="lesson-rule-heading">
                  <span className="lesson-rule-number" aria-hidden="true">
                    {rule.number}
                  </span>
                  <h2>{rule.title}</h2>
                </div>

                <p>{rule.text}</p>

                {rule.example && (
                  <p className="lesson-rule-example">
                    <strong>Παράδειγμα:</strong> {rule.example}
                  </p>
                )}

                <p className="lesson-rule-takeaway">
                  <strong>Τι να θυμάμαι:</strong> {rule.takeaway}
                </p>
              </section>
            ))}
          </div>
        </>
      ) : (
        lesson.images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={lesson.title}
            className="lesson-detail-image"
          />
        ))
      )}
    </div>
  );
}

export default LessonDetail;
