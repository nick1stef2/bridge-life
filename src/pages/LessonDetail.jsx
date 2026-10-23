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

  const renderOpenerRebidLesson = () => (
    <div className="rebid-lesson">
      <p className="rebid-kicker">{lesson.lessonNumber} - {lesson.category}</p>
      <p className="rebid-subtitle">{lesson.subtitle}</p>

      <div className="rebid-resources" aria-label="Υλικό μαθήματος">
        <a href={lesson.pdf} target="_blank" rel="noreferrer">Ανοιγμα PDF</a>
        <a href={lesson.cheatSheet} target="_blank" rel="noreferrer">Προβολή PNG σκονακιού</a>
      </div>

      <div className="rebid-strengths">
        {lesson.strengthLevels.map((level) => (
          <div className="rebid-strength" key={level.range}>
            <strong>{level.range}</strong>
            <span>{level.label}</span>
          </div>
        ))}
      </div>

      <section className="rebid-matrix" aria-labelledby="rebid-matrix-title">
        <h2 id="rebid-matrix-title">Το βασικο σκονακι</h2>
        <div className="rebid-matrix-head" aria-hidden="true">
          <span>Κατανομή</span><span>12-14</span><span>15-17</span><span>18-21</span>
        </div>
        {lesson.rebidMatrix.map((row) => (
          <div className="rebid-matrix-row" key={row.label}>
            <h3>{row.label}</h3>
            <div><b>12-14</b><span>{row.weak}</span></div>
            <div><b>15-17</b><span>{row.medium}</span></div>
            <div><b>18-21</b><span>{row.strong}</span></div>
          </div>
        ))}
      </section>

      <div className="rebid-cases">
        {lesson.rebidCases.map((item) => (
          <section className="rebid-case" key={item.number}>
            <h2>{item.number}. {item.title}</h2>
            <div className="rebid-examples">
              {item.examples.map((example) => (
                <article key={example.range}>
                  <span className="rebid-range">{example.range}</span>
                  <p>{example.rule}</p>
                  <p className="rebid-hand">{example.hand}</p>
                  <p className="rebid-auction">{example.auction}</p>
                </article>
              ))}
            </div>
            <p className="rebid-takeaway"><strong>Τι να θυμάμαι:</strong> {item.takeaway}</p>
          </section>
        ))}
      </div>

      <section className="rebid-remember">
        <h2>ΤΙ ΝΑ ΘΥΜΑΜΑΙ</h2>
        <ol>
          <li>Πόσους πόντους έχω;</li><li>Έχω fit;</li><li>Έχω ομαλή κατανομή;</li><li>Έχω δεύτερο χρώμα;</li><li>Έχω μόνο ένα μακρύ χρώμα;</li>
        </ol>
        <p>Και μετά επιλέγω το σωστό ύψος της επαναδήλωσης.</p>
        <div className="rebid-memory-line"><b>12-14 → ΟΙΚΟΝΟΜΙΚΑ</b><b>15-17 → ΣΥΧΝΑ ΠΗΔΗΜΑ</b><b>18-21 → ΙΣΧΥΡΗ ΕΠΑΝΑΔΗΛΩΣΗ</b></div>
      </section>
    </div>
  );

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

      {lesson.structuredType === "openerRebid" ? renderOpenerRebidLesson() : lesson.rules ? (
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
