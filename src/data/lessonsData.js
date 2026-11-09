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
import openerRebidCheatSheet from "../assets/images/lessons/Lesson1_Epanadilosi_Anoixantos.png";
import openerRebidPdf from "../assets/images/lessons/Lesson1_Epanadilosi_Anoixantos.pdf";
import responderSecondBidDocx from "../assets/images/lessons/ΔΕΥΤΕΡΗ ΑΠΑΝΤΗΣΗ ΑΠΑΝΤΩΤΟΣ ΜΕΤΑ ΑΠΟ ΕΠΑΝΑΔΗΛΩΣΗ ΑΝΟΙΞΑΝΤΟΣ.docx?url";

export const lessonsData = [
  {
    id: "opener-rebid-after-response",
    title: "Η Επαναδήλωση του Ανοίξαντος",
    category: "2η Χρονιά",
    lessonNumber: "1ο Μάθημα",
    text: "Μετά από αλλαγή χρώματος του απαντώντος",
    images: [openerRebidCheatSheet],
    pdf: openerRebidPdf,
    cheatSheet: openerRebidCheatSheet,
    structuredType: "openerRebid",
    subtitle: "Με τη δεύτερη αγορά μας περιγράφουμε ΔΥΝΑΜΗ + ΚΑΤΑΝΟΜΗ.",
    strengthLevels: [
      { range: "12-14", label: "ΑΔΥΝΑΜΟ" },
      { range: "15-17", label: "ΜΕΣΑΙΟ" },
      { range: "18-21", label: "ΙΣΧΥΡΟ" },
    ],
    rebidMatrix: [
      {
        label: "FIT στο χρώμα του responder",
        weak: "Δίνουμε fit οικονομικά",
        medium: "Δίνουμε fit με πήδημα",
        strong: "Δίνουμε fit με διπλό πήδημα",
      },
      {
        label: "ΟΜΑΛΗ ΚΑΤΑΝΟΜΗ",
        weak: "Αγοράζουμε οικονομικά ΧΑ",
        medium: "Ανοίγουμε 1ΧΑ",
        strong: "Αγοράζουμε ΧΑ με πήδημα",
      },
      {
        label: "ΔΕΥΤΕΡΟ ΧΡΩΜΑ",
        weak: "Αγοράζουμε οικονομικά το 2ο χρώμα",
        medium: "Αγοράζουμε οικονομικά το 2ο χρώμα",
        strong: "Αγοράζουμε με πήδημα το 2ο χρώμα",
      },
      {
        label: "ΕΝΑ ΜΑΚΡΥ ΧΡΩΜΑ",
        weak: "Επαναδηλώνουμε οικονομικά το χρώμα μας",
        medium: "Επαναδηλώνουμε το χρώμα μας με πήδημα",
        strong: "Συνήθως αγοράζουμε στο 4 επίπεδο",
      },
    ],
    rebidCases: [
      {
        number: 1,
        title: "FIT ΣΤΟ ΧΡΩΜΑ ΤΟΥ ΑΠΑΝΤΩΝΤΟΣ",
        takeaway: "Το ύψος που δίνω το fit δείχνει τη δύναμή μου.",
        examples: [
          { range: "12-14", rule: "Δίνουμε το fit οικονομικά.", hand: "♠ A764  ♥ AKJ64  ♦ 94  ♣ 63", auction: "1♥ - 1♠  /  2♠" },
          { range: "15-17", rule: "Δίνουμε το fit κάνοντας ένα πήδημα.", hand: "♠ A764  ♥ AKJ64  ♦ K4  ♣ 63", auction: "1♥ - 1♠  /  3♠" },
          { range: "18-21", rule: "Δίνουμε το fit με διπλό πήδημα.", hand: "♠ A764  ♥ AKJ64  ♦ A4  ♣ K3", auction: "1♥ - 1♠  /  4♠" },
        ],
      },
      {
        number: 2,
        title: "ΟΜΑΛΗ ΚΑΤΑΝΟΜΗ",
        takeaway: "Με ομαλή κατανομή περιγράφω τη δύναμη μου με τα ΧΑ.",
        examples: [
          { range: "12-14", rule: "Αγοράζουμε οικονομικά ΧΑ.", hand: "♠ A75  ♥ A987  ♦ K87  ♣ Q53", auction: "1♣ - 1♠  /  1ΧΑ" },
          { range: "15-17", rule: "Σύμφωνα με το πρωτότυπο μάθημα: Ανοίγουμε 1ΧΑ.", hand: "♠ A75  ♥ A987  ♦ K87  ♣ AQ3", auction: "Άνοιγμα 1ΧΑ" },
          { range: "18-19", rule: "Αγοράζουμε ΧΑ με πήδημα.", hand: "♠ A75  ♥ AK87  ♦ K87  ♣ AJ3", auction: "1♣ - 1♠  /  2ΧΑ" },
        ],
      },
      {
        number: 3,
        title: "ΔΕΥΤΕΡΟ ΧΡΩΜΑ",
        takeaway: "Δείχνουμε 5φυλλο πρώτο χρώμα και 4φυλλο δεύτερο χρώμα.",
        examples: [
          { range: "12-14", rule: "Αγοράζουμε οικονομικά το δεύτερο χρώμα.", hand: "♠ 6  ♥ J86  ♦ AK986  ♣ AJ63", auction: "1♦ - 1♠  /  2♣" },
          { range: "15-17", rule: "Αγοράζουμε επίσης οικονομικά το δεύτερο χρώμα.", hand: "♠ 6  ♥ KJ6  ♦ AK986  ♣ AJ63", auction: "1♦ - 1♠  /  2♣" },
          { range: "18-21", rule: "Αγοράζουμε με πήδημα το δεύτερο χρώμα.", hand: "♠ 6  ♥ KJ6  ♦ AK986  ♣ AKJ3", auction: "1♦ - 1♠  /  3♣" },
        ],
      },
      {
        number: 4,
        title: "ΕΝΑ ΜΟΝΟ ΜΑΚΡΥ ΧΡΩΜΑ",
        takeaway: "Χωρίς fit και χωρίς δεύτερο χρώμα, επαναδηλώνω το μακρύ χρώμα μου.",
        examples: [
          { range: "12-14", rule: "Αγοράζουμε οικονομικά ξανά το χρώμα μας.", hand: "♠ 5  ♥ KQJ642  ♦ A53  ♣ Q32", auction: "1♥ - 1♠  /  2♥" },
          { range: "15-17", rule: "Επαναδηλώνουμε το χρώμα μας με πήδημα.", hand: "♠ 5  ♥ KQJ642  ♦ A53  ♣ AQ2", auction: "1♥ - 1♠  /  3♥" },
          { range: "18-21", rule: "Συνήθως αγοράζουμε στο 4 επίπεδο το χρώμα μας.", hand: "♠ 5  ♥ KQJ642  ♦ AK3  ♣ AQ2", auction: "1♥ - 1♠  /  4♥" },
        ],
      },
    ],
  },
  {
    id: "responder-second-bid-after-opener-rebid",
    title: "Δεύτερη Απάντηση του Απαντώντος",
    category: "2η Χρονιά",
    lessonNumber: "2ο Μάθημα",
    text: "Μετά από την επαναδήλωση του ανοίξαντος",
    images: [openerRebidCheatSheet],
    document: responderSecondBidDocx,
    structuredType: "responderSecondBid",
    subtitle: "Ο απαντών συνδυάζει τη δική του δύναμη με όσα έδειξε ο ανοίξας και αποφασίζει το τελικό ύψος.",
    secondBidTable: [
      {
        situation: "Η πρώτη απάντηση ήταν οριακή",
        action: "Pass στο τελικό συμβόλαιο του ανοίξαντος",
        meaning: "Έχουμε ήδη δείξει δύναμη και κατανομή. Σε πρόταση του ανοίξαντος: minimum Pass, maximum μανς.",
      },
      {
        situation: "Αδύνατο χέρι περίπου 6–9 πόντων",
        action: "Pass ή οικονομική βελτίωση του συμβολαίου",
        meaning: "Δεν ελπίζουμε σε μανς. Αλλάζουμε χρώμα μόνο για να παίξουμε πιο ασφαλές μερικό συμβόλαιο.",
      },
      {
        situation: "Χέρι πρότασης περίπου 10–11 πόντων",
        action: "2ΧΑ, αύξηση στο επίπεδο 3 ή πήδημα στο δικό μακρύ χρώμα",
        meaning: "Ρωτάμε αν ο άξονας έχει τη δύναμη για μανς. Ο ανοίξας με minimum πασάρει, με maximum αγοράζει τη μανς.",
      },
      {
        situation: "Βέβαιη δύναμη μανς",
        action: "Δηλώνουμε αμέσως τη μανς",
        meaning: "Με την επαναδήλωση ξέρουμε ότι ο άξονας διαθέτει τουλάχιστον 25 πόντους και επιλέγουμε το καλύτερο συμβόλαιο.",
      },
      {
        situation: "Χρειαζόμαστε περισσότερες πληροφορίες",
        action: "Αγοράζουμε νέο χρώμα",
        meaning: "Η αγορά είναι επιτακτική και ζητά νέα περιγραφή του χεριού του ανοίξαντος, πριν αποφασίσουμε το τελικό συμβόλαιο.",
      },
      {
        situation: "Κοντά στους 33 πόντους",
        action: "Πρόταση για σλεμ",
        meaning: "Συνεχίζουμε επιτακτικά ή, αν έχει βρεθεί fit, διερευνούμε το σλεμ.",
      },
      {
        situation: "33 ή περισσότεροι πόντοι",
        action: "Δηλώνουμε σλεμ ή ρωτάμε άσους με 4ΧΑ",
        meaning: "Ο άξονας έχει τη δύναμη για σλεμ και ελέγχουμε τους άσους πριν οριστικοποιήσουμε το συμβόλαιο.",
      },
    ],
    secondBidReminders: [
      "Πρώτα αποφασίζω αν έχω fit και ποιο είναι το καλύτερο συμβόλαιο.",
      "Με fit σε minor και δύναμη μανς, συνήθως προτιμάμε 3ΧΑ όταν υπάρχουν κρατήματα.",
      "Με αδύνατο μισφίτ χέρι σταματάμε όσο γίνεται χαμηλότερα.",
      "Κάθε δεύτερη απάντηση πρέπει να δείχνει αν θέλουμε να σταματήσουμε, να προτείνουμε ή να επιβάλουμε το τελικό συμβόλαιο.",
    ],
  },
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
