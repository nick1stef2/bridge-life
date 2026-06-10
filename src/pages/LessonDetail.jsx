import { Link, useParams } from "react-router-dom";

import staymanImg from "../assets/images/lessons/stayman.jpg";
import transferImg from "../assets/images/lessons/transfer.jpg";
import defenseImg from "../assets/images/lessons/defense-rules.jpg";
import biddingImg from "../assets/images/lessons/bidding-rules.jpg";
import opening1ntImg from "../assets/images/lessons/opening-1nt-rules.jpg";
import opening2clubsImg from "../assets/images/lessons/opening-2-clubs.jpg";
import opening2ntImg from "../assets/images/lessons/opening-2nt.jpg";
import majorOpeningImg from "../assets/images/lessons/major-opening-rules.jpg";
import minorOpeningImg from "../assets/images/lessons/minor-opening-rules.jpg";
import preemptiveImg from "../assets/images/lessons/preemptive-openings.jpg";
import overcallImg from "../assets/images/lessons/overcall-rules.jpg";
import responseAfterOvercallImg from "../assets/images/lessons/response-after-overcall.jpg";
import doubleOvercallImg from "../assets/images/lessons/double-overcall.jpg";

const lessons = {
  stayman: {
    title: "Stayman",
    images: [staymanImg],
  },

  transfer: {
    title: "Transfer",
    images: [transferImg],
  },

  defense: {
    title: "Κανόνες Άμυνας",
    images: [defenseImg],
  },

  bidding: {
    title: "Κανόνες Αγοράς",
    images: [biddingImg],
  },

  opening1nt: {
    title: "Άνοιγμα 1ΧΑ",
    images: [opening1ntImg],
  },

  opening2clubs: {
    title: "Άνοιγμα 2♣",
    images: [opening2clubsImg],
  },

  opening2nt: {
    title: "Άνοιγμα 2ΧΑ",
    images: [opening2ntImg],
  },

  major: {
    title: "Ανοίγματα Major",
    images: [majorOpeningImg],
  },

  minor: {
    title: "Ανοίγματα Minor",
    images: [minorOpeningImg],
  },

  preemptive: {
    title: "Ανοίγματα Φραγμού",
    images: [preemptiveImg],
  },

  overcall: {
    title: "Παρεμβολές",
    images: [overcallImg],
  },

  "response-overcall": {
    title: "Απαντήσεις μετά από Παρέμβαση",
    images: [responseAfterOvercallImg],
  },

  "double-overcall": {
    title: "Double Overcall",
    images: [doubleOvercallImg],
  },
};

function LessonDetail() {
  const { lessonId } = useParams();

  const lesson = lessons[lessonId];

  if (!lesson) {
    return (
      <div style={{ padding: "30px" }}>
        <h2>Το μάθημα δεν βρέθηκε</h2>
        <Link to="/lessons">⬅ Επιστροφή στα Μαθήματα</Link>
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
          color: "#fff",
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