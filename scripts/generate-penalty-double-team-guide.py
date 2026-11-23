from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "Penalty_Double_Team_Guide_GR.pdf"
PUBLIC = ROOT / "public" / "training" / "penalty-double" / OUTPUT.name

NAVY = colors.HexColor("#17384a")
BLUE = colors.HexColor("#2b6f91")
PALE = colors.HexColor("#edf5f8")
GOLD = colors.HexColor("#d4a438")
CREAM = colors.HexColor("#fff7dc")
INK = colors.HexColor("#23343e")
RED = colors.HexColor("#a83939")


def table(data, widths, header=True):
    style = [
        ("FONTNAME", (0, 0), (-1, -1), "Arial"),
        ("FONTSIZE", (0, 0), (-1, -1), 9.6),
        ("LEADING", (0, 0), (-1, -1), 12),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#9eb2bd")),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]
    if header:
        style += [("BACKGROUND", (0, 0), (-1, 0), NAVY), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white), ("FONTNAME", (0, 0), (-1, 0), "Arial-Bold")]
    for row in range(1 if header else 0, len(data)):
        if row % 2 == 0:
            style.append(("BACKGROUND", (0, row), (-1, row), PALE))
    return Table(data, colWidths=widths, repeatRows=1 if header else 0, style=TableStyle(style))


def page_number(canvas, doc):
    canvas.saveState()
    canvas.setFont("Arial", 8)
    canvas.setFillColor(colors.HexColor("#60747f"))
    canvas.drawString(17 * mm, 10 * mm, "Bridge Life - Κόντρ Τιμωρίας")
    canvas.drawRightString(193 * mm, 10 * mm, f"Σελίδα {doc.page}")
    canvas.restoreState()


def main():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC.parent.mkdir(parents=True, exist_ok=True)
    fonts = Path("C:/Windows/Fonts")
    pdfmetrics.registerFont(TTFont("Arial", str(fonts / "arial.ttf")))
    pdfmetrics.registerFont(TTFont("Arial-Bold", str(fonts / "arialbd.ttf")))
    styles = {
        "title": ParagraphStyle("title", fontName="Arial-Bold", fontSize=25, leading=29, textColor=NAVY, alignment=1, spaceAfter=8),
        "subtitle": ParagraphStyle("subtitle", fontName="Arial", fontSize=12, leading=16, textColor=INK, alignment=1, spaceAfter=12),
        "h1": ParagraphStyle("h1", fontName="Arial-Bold", fontSize=17, leading=21, textColor=NAVY, spaceBefore=6, spaceAfter=8),
        "h2": ParagraphStyle("h2", fontName="Arial-Bold", fontSize=12.5, leading=16, textColor=BLUE, spaceBefore=4, spaceAfter=5),
        "body": ParagraphStyle("body", fontName="Arial", fontSize=10.5, leading=14.5, textColor=INK, spaceAfter=6),
        "bullet": ParagraphStyle("bullet", fontName="Arial", fontSize=10.2, leading=14, leftIndent=12, firstLineIndent=-8, textColor=INK, spaceAfter=4),
        "callout": ParagraphStyle("callout", fontName="Arial-Bold", fontSize=11, leading=15, textColor=NAVY, alignment=1),
        "number": ParagraphStyle("number", fontName="Arial-Bold", fontSize=11, leading=15, textColor=colors.white, alignment=1),
        "small": ParagraphStyle("small", fontName="Arial", fontSize=8.8, leading=11.5, textColor=INK),
    }
    story = [Spacer(1, 20 * mm), Paragraph("ΚΟΝΤΡ ΤΙΜΩΡΙΑΣ", styles["title"]), Paragraph("PENALTY DOUBLE", styles["title"]), Spacer(1, 3 * mm), Paragraph("Σύντομος πρακτικός οδηγός για την ομάδα", styles["subtitle"])]
    story += [Table([[Paragraph("Το Double δεν είναι δήλωση δύναμης από μόνο του.<br/>Είναι απόφαση ότι θέλουμε να αμυνθούμε και ότι η πιθανή ποινή αξίζει περισσότερο από το δικό μας συμβόλαιο.", styles["callout"])]], colWidths=[170 * mm], style=TableStyle([("BOX", (0, 0), (-1, -1), 1.2, GOLD), ("BACKGROUND", (0, 0), (-1, -1), CREAM), ("PADDING", (0, 0), (-1, -1), 14)])), Spacer(1, 12 * mm)]
    story += [Paragraph("Η βασική απόφαση", styles["h1"]), table([
        ["Επιλογή", "Τι σημαίνει πρακτικά"],
        ["DOUBLE", "Έχουμε συγκεκριμένες αμυντικές λεβέ και θέλουμε να εισπράξουμε ποινή."],
        ["PASS", "Δεν έχουμε αρκετές αποδείξεις για τιμωρία ή το Double έχει άλλο συστημικό νόημα."],
        ["BID", "Το δικό μας fit / χρώμα / game προσφέρει καλύτερη προοπτική από την ποινή."],
    ], [34 * mm, 136 * mm]), Spacer(1, 9 * mm), Paragraph("Σημαντικό για το ζευγάρι", styles["h2"]), Paragraph("Στο σύστημα Νίκου–Μιχάλη το άμεσο Double φυσικού ανοίγματος μπορεί να είναι Takeout, ενώ συγκεκριμένα Double του responder είναι Negative. Responsive, Support, forcing-pass και άλλες ειδικές χρήσεις πρέπει να συμφωνηθούν ρητά. Αν δεν είναι συμφωνημένες: <b>Χρειάζεται συμφωνία ζευγαριού.</b>", styles["body"]), PageBreak()]

    story += [Paragraph("1. Double δεν σημαίνει πάντα τιμωρία", styles["h1"]), table([
        ["Είδος Double", "Σκοπός"],
        ["Penalty Double", "Θέλουμε να αμυνθούμε και περιμένουμε θετικό penalty score."],
        ["Takeout Double", "Ζητά από τον συμπαίκτη να αγοράσει. Δεν είναι αυτόματα τιμωρητικό."],
        ["Negative Double", "Ο responder δείχνει συγκεκριμένα μη αγορασμένα χρώματα και δύναμη."],
        ["Responsive / Support", "Ειδικές πληροφοριακές χρήσεις που απαιτούν συμφωνία ζευγαριού."],
    ], [48 * mm, 122 * mm]), Spacer(1, 8 * mm), Paragraph("2. Πότε το Penalty Double είναι σωστό", styles["h1"])]
    for item in ["Έχουμε μήκος και τιμές στα ατού, κατά προτίμηση πίσω από τον εκτελεστή.", "Μπορούμε να μετρήσουμε συγκεκριμένες άμεσες αμυντικές λεβέ.", "Υπάρχουν ασφαλείς είσοδοι και επικοινωνίες μεταξύ των δύο αμυνόμενων.", "Η αγορά των αντιπάλων έχει φτάσει ψηλότερα από όσο αντέχουν τα φύλλα τους.", "Με βάση τη vulnerability, η αναμενόμενη ποινή ξεπερνά το σκορ του δικού μας συμβολαίου.", "Η ακολουθία έχει ήδη ξεκαθαρίσει ότι το Double είναι τιμωρητικό."]:
        story.append(Paragraph("• " + item, styles["bullet"]))
    story += [Spacer(1, 5 * mm), Paragraph("3. Πότε ΔΕΝ κοντράρουμε", styles["h1"])]
    for item in ["Έχουμε απλώς πολλούς HCP, αλλά λίγα ή αδύναμα ατού.", "Οι τιμές μας βρίσκονται μπροστά από τον εκτελεστή και μπορεί να μη γίνουν λεβέ.", "Έχουμε καθαρό fit ή δικό μας μακρύ χρώμα και καλύτερη επιθετική προοπτική.", "Το συμβόλαιο των αντιπάλων είναι χαμηλό και το Double μπορεί να τους βοηθήσει στην εκτέλεση.", "Δεν γνωρίζουμε τι σημαίνει το Double στη συγκεκριμένη αγορά."]:
        story.append(Paragraph("• " + item, styles["bullet"]))
    story.append(PageBreak())

    story += [Paragraph("Vulnerability και penalty score", styles["h1"]), Paragraph("Η vulnerability αλλάζει δραματικά την αξία του Double. Πριν αποφασίσουμε, συγκρίνουμε πάντα το πιθανό penalty με το σκορ του δικού μας συμβολαίου.", styles["body"]), table([
        ["Αποτέλεσμα", "Χωρίς Double", "Με Double"],
        ["Μη ευάλωτοι - 1 κάτω", "50", "100"],
        ["Μη ευάλωτοι - 2 κάτω", "100", "300"],
        ["Μη ευάλωτοι - 3 κάτω", "150", "500"],
        ["Ευάλωτοι - 1 κάτω", "100", "200"],
        ["Ευάλωτοι - 2 κάτω", "200", "500"],
        ["Ευάλωτοι - 3 κάτω", "300", "800"],
    ], [78 * mm, 46 * mm, 46 * mm]), Spacer(1, 9 * mm), Paragraph("Matchpoints και IMPs", styles["h1"]), table([
        ["Scoring", "Τι προσέχουμε"],
        ["Matchpoints", "Κάθε μικρή διαφορά μετρά. Το +200 μπορεί να είναι top, αλλά ένα αποτυχημένο Double μπορεί να γίνει καθαρό bottom."],
        ["IMPs", "Προστατεύουμε κυρίως game και slam swings. Κοντράρουμε όταν η ποινή είναι συγκεκριμένη, όχι για αβέβαιο μικρό κέρδος."],
    ], [38 * mm, 132 * mm]), Spacer(1, 9 * mm), Paragraph("Παράδειγμα σύγκρισης", styles["h2"]), Paragraph("Αν η δική μας μανς γράφει περίπου +620, το να κοντράρουμε μια μη ευάλωτη θυσία για μόνο μία κάτω (+100) είναι κακή ανταλλαγή. Για δύο κάτω (+300) μπορεί επίσης να μην αρκεί. Για τρεις κάτω (+500) πλησιάζει, αλλά ακόμη πρέπει να συγκριθεί με το πραγματικό game score και το format.", styles["body"]), PageBreak()]

    story += [Paragraph("Ποιος κοντράρει και πώς αμυνόμαστε", styles["h1"]), Paragraph("Ο παίκτης που γνωρίζει ότι η πλευρά διαθέτει αρκετές αμυντικές λεβέ - συχνά εκείνος που κρατά το trump stack - παίρνει την τελική απόφαση. Το Pass πάνω στο τιμωρητικό Double του συμπαίκτη διατηρεί το κοντρ: δεν είναι αδράνεια.", styles["body"]), Paragraph("Μετά το Double", styles["h2"])]
    for item in ["Δεν τραβάμε μηχανικά ατού για τον εκτελεστή.", "Μετράμε ατού, άμεσες λεβέ, κοψίματα και επικοινωνίες.", "Δεν ανοίγουμε δωρεάν νέο χρώμα χωρίς λόγο.", "Κρατάμε τις εισόδους του συμπαίκτη και προσέχουμε να μη μπλοκάρουμε το δυνατό χρώμα.", "Στόχος είναι η μέγιστη ασφαλής ποινή - όχι το πιο θεαματικό παίξιμο."]:
        story.append(Paragraph("• " + item, styles["bullet"]))
    story += [Spacer(1, 7 * mm), Paragraph("Τρία σύντομα παραδείγματα", styles["h1"]), table([
        ["Αγορά", "Απόφαση", "Γιατί"],
        ["1♠ - 3♦ - 4♠ - 5♦ - ?", "Double", "Η αντίπαλη πλευρά θυσιάζεται και μετράμε αρκετές αμυντικές λεβέ."],
        ["1♣ - 1♥ - Pass - 2♥ - Pass - Pass - ?", "Συνήθως Pass", "Χαμηλό partscore, λίγα ατού και αβέβαιες λεβέ."],
        ["1♥ - 1♠ - 2♥ - 2♠ - 3♥ - ?", "Bid όταν έχουμε fit", "Η επιθετική αξία του fit μπορεί να είναι μεγαλύτερη από αβέβαιη ποινή."],
    ], [54 * mm, 28 * mm, 88 * mm]), Spacer(1, 7 * mm), Table([[Paragraph("Δεν κοντράρουμε επειδή “έχουμε πολλούς πόντους”.<br/>Κοντράρουμε επειδή μπορούμε να εξηγήσουμε από πού θα έρθουν οι λεβέ και γιατί το penalty score είναι καλύτερο.", styles["callout"])]], colWidths=[170 * mm], style=TableStyle([("BOX", (0, 0), (-1, -1), 1, RED), ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#fff0ee")), ("PADDING", (0, 0), (-1, -1), 11)])), PageBreak()]

    story += [Paragraph("ΚΟΝΤΡ ΤΙΜΩΡΙΑΣ - QUICK GUIDE", styles["title"]), Spacer(1, 3 * mm)]
    checklist = [
        ("1", "Τι σημαίνει το Double σε αυτή ακριβώς την ακολουθία;"),
        ("2", "Πόσα και πόσο καλά ατού κρατώ;"),
        ("3", "Ποιες αμυντικές λεβέ είναι πραγματικά σίγουρες;"),
        ("4", "Πού βρίσκονται τα ονέρ σε σχέση με τον εκτελεστή;"),
        ("5", "Ποια πλευρά είναι ευάλωτη;"),
        ("6", "Παίζουμε Matchpoints ή IMPs;"),
        ("7", "Τι θα γράψουμε αν Double / Pass / Bid πετύχει ή αποτύχει;"),
        ("8", "Έχουμε καλύτερο δικό μας συμβόλαιο;"),
    ]
    rows = [[Paragraph(f"<b>{n}</b>", styles["number"]), Paragraph(text, styles["body"])] for n, text in checklist]
    story.append(Table(rows, colWidths=[15 * mm, 155 * mm], style=TableStyle([("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#9eb2bd")), ("BACKGROUND", (0, 0), (0, -1), NAVY), ("TEXTCOLOR", (0, 0), (0, -1), colors.white), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("PADDING", (0, 0), (-1, -1), 7)])))
    story += [Spacer(1, 10 * mm), Table([[Paragraph("ΜΝΗΜΗ", styles["callout"])], [Paragraph("ΑΤΟΥ + ΛΕΒΕ + ΘΕΣΗ ΟΝΕΡ + VULNERABILITY + SCORING", styles["callout"])], [Paragraph("Αν λείπει ένα από αυτά, ξανασκέψου πριν πεις Double.", styles["callout"])]], colWidths=[170 * mm], style=TableStyle([("BOX", (0, 0), (-1, -1), 1.2, GOLD), ("BACKGROUND", (0, 0), (-1, -1), CREAM), ("PADDING", (0, 0), (-1, -1), 10)])), Spacer(1, 8 * mm), Paragraph("Bridge Life - Εκπαιδευτικό υλικό ομάδας", styles["subtitle"])]

    doc = SimpleDocTemplate(str(OUTPUT), pagesize=A4, leftMargin=18 * mm, rightMargin=18 * mm, topMargin=16 * mm, bottomMargin=17 * mm, title="Κόντρ Τιμωρίας - Οδηγός Ομάδας", author="Bridge Life")
    doc.build(story, onFirstPage=page_number, onLaterPages=page_number)
    PUBLIC.write_bytes(OUTPUT.read_bytes())
    print(OUTPUT)


if __name__ == "__main__":
    main()
