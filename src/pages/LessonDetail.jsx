import { Link, useParams } from "react-router-dom";
import { lessonsData } from "../data/lessonsData";

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
    <div
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
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

      {lesson.images.map((img, index) => (
        <img
          key={index}
          src={img}
          alt={lesson.title}
          style={{
            width: "100%",
            borderRadius: "15px",
            marginBottom: "20px",
          }}
        />
      ))}
    </div>
  );
}

export default LessonDetail;