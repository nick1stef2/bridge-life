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

export const lessonsData = [
  {
    id: "stayman",
    title: "Stayman",
    category: "Συμβάσεις",
    text: "Σύμβαση μετά από 1ΧΑ",
    images: [staymanImg],
  },

  {
    id: "transfer",
    title: "Transfer",
    category: "Συμβάσεις",
    text: "Μεταφορά σε major",
    images: [transferImg],
  },

  {
    id: "defense",
    title: "Κανόνες Άμυνας",
    category: "Άμυνα",
    text: "Κανόνες άμυνας",
    images: [defenseImg],
  },

  {
    id: "bidding",
    title: "Κανόνες Αγοράς",
    category: "Αγορά",
    text: "Κανόνες αγοράς",
    images: [biddingImg],
  },

  {
    id: "opening1nt",
    title: "Άνοιγμα 1ΧΑ",
    category: "Ανοίγματα",
    text: "Άνοιγμα 1ΧΑ",
    images: [opening1ntImg],
  },

  {
    id: "opening2clubs",
    title: "Άνοιγμα 2♣",
    category: "Ανοίγματα",
    text: "Άνοιγμα 2♣",
    images: [opening2clubsImg],
  },

  {
    id: "opening2nt",
    title: "Άνοιγμα 2ΧΑ",
    category: "Ανοίγματα",
    text: "Άνοιγμα 2ΧΑ",
    images: [opening2ntImg],
  },

  {
    id: "major",
    title: "Ανοίγματα Major",
    category: "Ανοίγματα",
    text: "Ανοίγματα major",
    images: [majorOpeningImg],
  },

  {
    id: "minor",
    title: "Ανοίγματα Minor",
    category: "Ανοίγματα",
    text: "Ανοίγματα minor",
    images: [minorOpeningImg],
  },

  {
    id: "preemptive",
    title: "Ανοίγματα Φραγμού",
    category: "Ανοίγματα",
    text: "Weak openings",
    images: [preemptiveImg],
  },

  {
    id: "overcall",
    title: "Παρεμβολές",
    category: "Παρεμβολές",
    text: "Overcall",
    images: [overcallImg],
  },

  {
    id: "response-overcall",
    title: "Απαντήσεις μετά από Παρέμβαση",
    category: "Παρεμβολές",
    text: "Responses",
    images: [responseAfterOvercallImg],
  },

  {
    id: "double-overcall",
    title: "Double Overcall",
    category: "Παρεμβολές",
    text: "Takeout Double",
    images: [doubleOvercallImg],
  },
];