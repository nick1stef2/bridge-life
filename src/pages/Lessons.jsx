import "./Lessons.css";
import { Link } from "react-router-dom";

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
  {
    id: "stayman",
    title: "Stayman",
    image: staymanImg,
    text: "Σύμβαση μετά από 1ΧΑ",
  },
  {
    id: "transfer",
    title: "Transfer",
    image: transferImg,
    text: "Μεταφορά σε major",
  },
  {
    id: "defense",
    title: "Defense Rules",
    image: defenseImg,
    text: "Κανόνες άμυνας",
  },
  {
    id: "bidding",
    title: "Bidding Rules",
    image: biddingImg,
    text: "Κανόνες αγοράς",
  },
  {
    id: "opening1nt",
    title: "Opening 1NT",
    image: opening1ntImg,
    text: "Άνοιγμα 1ΧΑ",
  },
  {
    id: "opening2clubs",
    title: "Opening 2 Clubs",
    image: opening2clubsImg,
    text: "Άνοιγμα 2♣",
  },
  {
    id: "opening2nt",
    title: "Opening 2NT",
    image: opening2ntImg,
    text: "Άνοιγμα 2ΧΑ",
  },
  {
    id: "major",
    title: "Major Openings",
    image: majorOpeningImg,
    text: "Ανοίγματα major",
  },
  {
    id: "minor",
    title: "Minor Openings",
    image: minorOpeningImg,
    text: "Ανοίγματα minor",
  },
  {
    id: "preemptive",
    title: "Preemptive Openings",
    image: preemptiveImg,
    text: "Ανοίγματα φραγμού",
  },
  {
    id: "overcall",
    title: "Overcall Rules",
    image: overcallImg,
    text: "Παρέμβαση",
  },
  {
    id: "response-overcall",
    title: "Response After Overcall",
    image: responseAfterOvercallImg,
    text: "Απαντήσεις μετά από παρέμβαση",
  },
  {
    id: "double-overcall",
    title: "Double Overcall",
    image: doubleOvercallImg,
    text: "Απλή παρέμβαση",
  },
];

function Lessons() {
  return (
    <div className="lessons-page">
      <h1 className="lessons-title">
        📚 Bridge Lessons
      </h1>

      <div className="lessons-grid">
        {lessons.map((lesson) => (
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
                src={lesson.image}
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