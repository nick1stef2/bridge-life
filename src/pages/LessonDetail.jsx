import { Link, useParams } from "react-router-dom";

import staymanImg from "../assets/images/lessons/stayman.jpg";
import transferImg from "../assets/images/lessons/transfer.jpg";

const lessons = {
  stayman: {
    title: "Stayman",
    image: staymanImg,
    description: `
Η σύμβαση Stayman χρησιμοποιείται μετά από άνοιγμα 1ΧΑ.

Σκοπός:
Να βρούμε αν ο συμπαίκτης έχει τετράφυλλη κούπα ή πίκα.

Απάντηση:
2♣

Αν ο ανοίξας έχει:
4♥ → απαντά 2♥
4♠ → απαντά 2♠
Καμία τετράφυλλη major → απαντά 2♦
`
  },

  transfer: {
    title: "Transfer",
    image: transferImg,
    description: `
Τα Transfers χρησιμοποιούνται μετά από άνοιγμα 1ΧΑ.

2♦ = μεταφορά στις ♥
2♥ = μεταφορά στις ♠

Ο ανοίξας είναι υποχρεωμένος να αποδεχθεί τη μεταφορά.
`
  }
};

function LessonDetail() {
  const { lessonId } = useParams();

  const lesson = lessons[lessonId];

  if (!lesson) {
    return (
      <div style={{ padding: "30px" }}>
        <h2>Το μάθημα δεν βρέθηκε.</h2>
        <Link to="/lessons">⬅ Επιστροφή</Link>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      <Link
        to="/lessons"
        style={{
          color: "#fff",
          textDecoration: "none",
          fontSize: "18px",
        }}
      >
        ⬅ Επιστροφή στα Μαθήματα
      </Link>

      <h1 style={{ marginTop: "20px" }}>
        {lesson.title}
      </h1>

      <img
        src={lesson.image}
        alt={lesson.title}
        style={{
          width: "100%",
          borderRadius: "20px",
          marginTop: "20px",
        }}
      />

      <div
        style={{
          marginTop: "25px",
          lineHeight: "1.8",
          whiteSpace: "pre-line",
          fontSize: "18px",
        }}
      >
        {lesson.description}
      </div>
    </div>
  );
}

export default LessonDetail;