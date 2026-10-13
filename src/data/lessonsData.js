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
    id: "defense-opening-leads",
    title: "4 βασικοί κανόνες αντάμ στην άμυνα",
    category: "Άμυνα",
    text: "Σύντομος οδηγός για την πρώτη έξοδο",
    images: [defenseImg],
    introduction:
      "Οι παρακάτω κανόνες δεν είναι απόλυτοι νόμοι, αλλά πολύ χρήσιμες βασικές αρχές για να ξεκινάμε σωστά την άμυνα και να έχουμε κοινή λογική στο ζευγάρι.",
    rules: [
      {
        number: "1️⃣",
        title: "Σε 3NT, άκου τον συμπαίκτη",
        text: "Αν ο συμπαίκτης έχει αγοράσει κάποιο χρώμα κατά την αγορά, συνήθως προτιμάμε αντάμ στο χρώμα του. Η αγορά του δείχνει μήκος και πιθανή δύναμη, άρα μας έχει ήδη δώσει πολύτιμη πληροφορία για την πρώτη έξοδο.",
        takeaway: "3NT + αγορά συμπαίκτη → κοίτα πρώτα το χρώμα του.",
      },
      {
        number: "2️⃣",
        title: "Σε 1NT, προτίμησε το μακρύτερο χρώμα σου",
        text: "Όταν οι αντίπαλοι παίζουν 1NT και δεν έχουμε άλλη σαφή πληροφορία από την αγορά, συνήθως προτιμάμε αντάμ από το μακρύτερο χρώμα μας. Από τετράφυλλο ή μεγαλύτερο χρώμα, κλασική επιλογή είναι συχνά το 4ο καλύτερο φύλλο από πάνω.",
        example: "K-10-8-6-3 → αντάμ το 6",
        takeaway: "1NT χωρίς άλλη πληροφορία → μακρύ χρώμα, συχνά 4ο καλύτερο.",
      },
      {
        number: "3️⃣",
        title: "Ψάξε το μη αγορασμένο χρώμα",
        text: "Όταν οι αντίπαλοι έχουν αγοράσει κάποια χρώματα, το χρώμα που δεν έχει εμφανιστεί καθόλου στην αγορά μπορεί να είναι το αδύναμο σημείο τους. Δεν είναι απόλυτος κανόνας, αλλά είναι πολύ καλή πρώτη σκέψη όταν δεν υπάρχει ισχυρότερη ένδειξη.",
        takeaway: "Αγορασμένα χρώματα των αντιπάλων → εξέτασε το μη αγορασμένο.",
      },
      {
        number: "4️⃣",
        title: "Σε σλεμ, πρώτα ασφάλεια",
        text: "Εναντίον σλεμ δεν κάνουμε επιθετική αντάμ μόνο και μόνο επειδή έχουμε μεγάλα ονέρ σε ένα χρώμα. Συνήθως προτιμάμε ασφαλή αντάμ και αποφεύγουμε να βγούμε κάτω από Άσο ή Ρήγα χωρίς συγκεκριμένο λόγο, γιατί μπορεί να χαρίσουμε αμέσως λεβέ. Αν όμως η αγορά ή κάποιο κοντρ του συμπαίκτη μάς δίνει σαφή ένδειξη, τότε ακολουθούμε αυτή την πληροφορία.",
        takeaway: "Σλεμ → ασφαλής αντάμ, εκτός αν υπάρχει σαφής ένδειξη.",
      },
    ],
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
