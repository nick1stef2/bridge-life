import { useState } from "react";
import "./Lessons.css";

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

const lessons = [
  { title: "Stayman", image: staymanImg, text: "Σύμβαση μετά από 1ΧΑ" },
  { title: "Transfer", image: transferImg, text: "Μεταφορά σε major" },
  { title: "Defense Rules", image: defenseImg, text: "Κανόνες άμυνας" },
  { title: "Bidding Rules", image: biddingImg, text: "Κανόνες αγοράς" },
  { title: "Opening 1NT", image: opening1ntImg, text: "Άνοιγμα 1ΧΑ" },
  { title: "Opening 2 Clubs", image: opening2clubsImg, text: "Άνοιγμα 2♣" },
  { title: "Opening 2NT", image: opening2ntImg, text: "Άνοιγμα 2ΧΑ" },
  { title: "Major Openings", image: majorOpeningImg, text: "Ανοίγματα major" },
  { title: "Minor Openings", image: minorOpeningImg, text: "Ανοίγματα minor" },
  { title: "Preemptive Openings", image: preemptiveImg, text: "Ανοίγματα φραγμού" },
  { title: "Overcall Rules", image: overcallImg, text: "Παρέμβαση με κόντρ ομιλίας" },
  { title: "Response After Overcall", image: responseAfterOvercallImg, text: "Απαντήσεις μετά από παρέμβαση" },
  { title: "Double Overcall", image: doubleOvercallImg, text: "Απλή παρέμβαση" },
];

function Lessons() {
  const [selectedLesson, setSelectedLesson] = useState(null);

  return (
    <div className="lessons-page">

      <h1 className="lessons-title">
        📚 Bridge Lessons
      </h1>

      {selectedLesson && (
        <div
          style={{
            marginBottom: "30px",
            textAlign: "center",
          }}
        >
          <h2>{selectedLesson.title}</h2>

          <img
            src={selectedLesson.image}
            alt={selectedLesson.title}
            style={{
              maxWidth: "100%",
              borderRadius: "20px",
              border: "3px solid #444",
            }}
          />
        </div>
      )}

      <div className="lessons-grid">
        {lessons.map((lesson, index) => (
          <div
            className="lesson-card"
            key={index}
            onClick={() => setSelectedLesson(lesson)}
          >
            <img
              src={lesson.image}
              alt={lesson.title}
              className="lesson-image"
            />

            <div className="lesson-content">
              <h2>{lesson.title}</h2>
              <p>{lesson.text}</p>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}

export default Lessons;