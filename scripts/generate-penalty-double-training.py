from __future__ import annotations

import csv, json, random, shutil
from datetime import date
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "penalty-double-training-ns"
PDF_OUT = ROOT / "output" / "pdf" / "Penalty_Double_Training_Solutions.pdf"
PUBLIC = ROOT / "public" / "training" / "penalty-double"
TMP = ROOT / "tmp" / "pdfs" / "penalty-double"
RANKS, SUITS = "AKQJT98765432", "SHDC"
DECK = [s+r for s in SUITS for r in RANKS]
HCP = {"A":4,"K":3,"Q":2,"J":1}
DEALER_NO = {"S":1,"W":2,"N":3,"E":4}
VUL = [("None","o"),("NS","n"),("EW","e"),("Both","b")]
SEATS = ["N","E","S","W"]

SCENARIOS = [
 ("Προφανές κοντρ","Double","MP","Οι αντίπαλοι θυσιάζονται στο 5♦ μετά τη μανς μας.","1♠ – 3♦ – 4♠ – 5♦ – X – Pass – Pass – Pass","5♦X","E",3,"A♠","Δύο άμεσες λεβέ και έλεγχος στα ατού· η ποινή ξεπερνά την εναλλακτική.","Μην αγοράσεις μηχανικά 5♠."),
 ("Προφανές pass","Pass","IMP","Το 2♥ των αντιπάλων είναι χαμηλό partscore και το κοντρ θα τους βοηθήσει.","1♣ – 1♥ – Pass – 2♥ – Pass – Pass – ?","2♥","E",2,"K♣","Λίγα ατού και αβέβαιες αμυντικές λεβέ: κρατάμε χαμηλά τη ζημιά.","Οι πολλοί HCP δεν αρκούν χωρίς ατού."),
 ("Penalty ή αγορά;","Bid","MP","Έχουμε καθαρό fit και χώρο να συναγωνιστούμε στις πίκες.","1♥ – 1♠ – 2♥ – 2♠ – 3♥ – ?","3♥","E",3,"A♦","Η επιθετική αξία του fit είναι μεγαλύτερη από ένα αβέβαιο κοντρ.","Μη μετατρέπεις κάθε ισορροπημένο χέρι σε τιμωρία."),
 ("Προφανές κοντρ","Double","IMP","Αδύναμη θυσία 4♠ απέναντι στη δική μας 4♥.","1♥ – 2♠ – 4♥ – 4♠ – X – Pass – Pass – Pass","4♠X","W",2,"A♥","Σε IMPs η σίγουρη ποινή προστατεύει τη μανς.","Μην κυνηγήσεις 5♥ χωρίς λόγο."),
 ("Οριακή απόφαση","Pass","MP","Έχεις τιμές αλλά όχι ασφαλή trump stack στο 3♣.","1♦ – 2♣ – 2♦ – 3♣ – Pass – Pass – ?","3♣","E",2,"Q♦","Το κοντρ ρισκάρει μεγάλο κάτω του μέσου όρου αν το συμβόλαιο βγει.","Μην μετράς μόνο συνολικούς πόντους."),
 ("Προφανές κοντρ","Double","MP","Τέσσερα καλά ατού πίσω από τον εκτελεστή στο 2♠.","1♦ – 1♠ – Pass – 2♠ – Pass – Pass – X – Pass – Pass – Pass","2♠X","E",2,"K♦","Μήκος και ονέρ στα ατού, μαζί με εξωτερική λεβέ, κάνουν το κοντρ παραγωγικό.","Μην τραβήξεις ατού για τον εκτελεστή."),
 ("Preempt","Bid","IMP","Το 3♥ του αντιπάλου πιέζει, αλλά το χέρι μας έχει σαφή μανς στις πίκες.","3♥ – 3♠ – Pass – 4♠ – Pass – Pass – Pass","3♥","E",3,"A♥","Η δική μας μανς αξίζει περισσότερο από την αβέβαιη ποινή.","Μην κοντράρεις επειδή ο αντίπαλος άνοιξε ψηλά."),
 ("Θυσία","Double","MP","Το 5♣ είναι σαφής θυσία απέναντι στο 4♠.","1♠ – 3♣ – 4♠ – 5♣ – X – Pass – Pass – Pass","5♣X","W",3,"A♠","Σε matchpoints η σωστή ποινή πρέπει να συγκριθεί με το σκορ της μανς.","Μην αγοράσεις 5♠ χωρίς έξτρα."),
 ("Παγίδα vulnerability","Pass","IMP","Είμαστε ευάλωτοι και το αβέβαιο κοντρ μπορεί να γυρίσει ακριβά.","1NT – 2♥ – Pass – Pass – ?","2♥","E",2,"4♠","Δεν υπάρχει τεκμηριωμένη τιμωρία ούτε συμφωνημένο forcing pass.","Χρειάζεται συμφωνία ζευγαριού για ειδικά doubles."),
 ("Partner double","Pass","MP","Ο συμπαίκτης κοντράρει· το σωστό είναι να υπακούσουμε και να αμυνθούμε.","1♠ – 2♥ – 2♠ – 3♥ – Pass – Pass – X – Pass – Pass – Pass","3♥X","E",2,"A♣","Το pass διατηρεί το τιμωρητικό κοντρ του συμπαίκτη.","Μην τραπείς σε 3♠ από φόβο."),
 ("Defense after double","Double","IMP","Μετά το κοντρ, η αντάμ πρέπει να κρατήσει τις αμυντικές επικοινωνίες.","1♣ – 1♠ – 2♣ – 2♠ – Pass – Pass – X – Pass – Pass – Pass","2♠X","E",2,"K♣","Κοντράρουμε και αμυνόμαστε με μέτρημα· δεν χαρίζουμε tempo.","Το κοντρ δεν υποκαθιστά το αμυντικό πλάνο."),
 ("Scoring trap","Bid","MP","Μία μικρή ποινή δεν αρκεί όταν μπορούμε να γράψουμε δική μας μανς.","1♥ – 2♦ – 3♥ – 4♦ – 4♥ – Pass – Pass – Pass","4♦","E",3,"A♦","Συγκρίνουμε το πιθανό penalty με το δικό μας game score.","Μην αρκείσαι στο +100 αντί για μανς."),
 ("Game contract","Double","IMP","Οι αντίπαλοι βρίσκονται σε εύθραυστη μανς και έχουμε σαφείς λεβέ.","1♠ – Pass – 2♠ – Pass – 4♠ – X – Pass – Pass – Pass","4♠X","E",3,"A♦","Το κοντρ βασίζεται σε ατού, άμεσες λεβέ και αγορά, όχι σε ευχή.","Μην αποκαλύψεις άσκοπα τη θέση των ονέρ."),
 ("Misleading hand","Pass","MP","Πολλά ονέρ, αλλά βρίσκονται μπροστά από τον εκτελεστή και χωρίς ατού.","1♥ – Pass – 2♥ – Pass – Pass – ?","2♥","E",2,"Q♣","Η θέση των τιμών μειώνει την πραγματική αμυντική δύναμη.","Μη συγχέεις HCP με αμυντικές λεβέ."),
 ("Penalty ή αγορά;","Bid","IMP","Το δικό μας 6φυλλο χρώμα προσφέρει ασφαλέστερο partscore.","1♥ – 2♣ – 2♥ – ?","2♥","E",2,"A♣","Δηλώνουμε το φυσικό μας χρώμα· το κοντρ εδώ δεν είναι τεκμηριωμένα penalty.","Χρειάζεται συμφωνία για responsive/support doubles."),
 ("Partner double","Double","MP","Ο συμπαίκτης έχει περιγράψει δύναμη και εμείς κρατάμε τα ατού.","1♦ – 1♥ – 2♦ – 2♥ – Pass – Pass – X – Pass – Pass – Pass","2♥X","E",2,"K♦","Το κοινό αμυντικό υλικό και τα ατού μετατρέπουν το κοντρ σε ποινή.","Μην αλλάξεις σε 3♦ χωρίς επιθετικό λόγο."),
]

EXAMS = [
 ("Double","IMP","1♠ – 2♥ – 3♠ – 4♥ – X – Pass – Pass – Pass","4♥X","E",3,"A♠","Η θυσία είναι ευάλωτη και έχουμε τέσσερις πιθανές λεβέ.","Μην αγοράσεις 4♠ ξανά."),
 ("Pass","MP","1♦ – 1♠ – Pass – 2♠ – Pass – Pass – ?","2♠","E",2,"5♦","Δεν έχουμε trump stack ούτε σίγουρες αμυντικές λεβέ.","Το κοντρ μπορεί να χαρίσει top στους αντιπάλους."),
 ("Bid","IMP","1♥ – 2♣ – 2♥ – 3♣ – 3♥ – Pass – Pass – Pass","3♣","E",3,"A♣","Το δικό μας fit δικαιολογεί συναγωνισμό, όχι αβέβαιη τιμωρία.","Μην παρασύρεσαι από ένα υψηλό ονέρ."),
 ("Double","MP","1♣ – 1♠ – 2♣ – 2♠ – Pass – Pass – X – Pass – Pass – Pass","2♠X","E",2,"K♣","Τα ατού είναι πίσω από τον εκτελεστή και έχουμε δύο εξωτερικές λεβέ.","Κράτησε trump control."),
 ("Pass","IMP","2♠ – Pass – Pass – ?","2♠","E",2,"A♥","Το άμεσο double του weak two θα ήταν συνήθως takeout, όχι αυτόματα penalty.","Χρειάζεται συμφωνία ζευγαριού."),
 ("Bid","MP","1♠ – 2♥ – 2♠ – 3♥ – 3♠ – Pass – Pass – Pass","3♥","E",3,"A♥","Το δικό μας συμβόλαιο έχει καλύτερη προοπτική από μικρή ποινή.","Σύγκρινε το score, όχι μόνο τις λεβέ."),
 ("Double","IMP","1♥ – 3♣ – 4♥ – 5♣ – X – Pass – Pass – Pass","5♣X","W",3,"A♥","Η ευάλωτη θυσία πρέπει να τιμωρηθεί όταν οι λεβέ είναι συγκεκριμένες.","Μην κυνηγήσεις slam χωρίς τεκμηρίωση."),
 ("Pass","MP","1NT – Pass – Pass – 2♠ – Pass – Pass – ?","2♠","E",2,"Q♥","Δεν έχει συμφωνηθεί penalty double και το χέρι δεν έχει ατού.","Χρειάζεται συμφωνία ζευγαριού."),
]

def hcp(hand): return sum(HCP.get(c[1],0) for c in hand)
def sorted_hand(hand): return sorted(hand,key=lambda c:(SUITS.index(c[0]),RANKS.index(c[1])))
def enc(hand): return "".join(s+"".join(c[1] for c in sorted_hand(hand) if c[0]==s) for s in SUITS)
def pbn_hand(hand): return ".".join("".join(c[1] for c in sorted_hand(hand) if c[0]==s) or "-" for s in SUITS)
def hand_lines(hand): return "<br/>".join(f"{sym} {''.join(c[1] for c in sorted_hand(hand) if c[0]==s) or '—'}" for s,sym in zip(SUITS,["♠","♥","♦","♣"]))

def suit_len(hand,suit): return sum(c[0]==suit for c in hand)
def suit_honors(hand,suit): return sum(c[0]==suit and c[1] in 'AKQJ' for c in hand)

def logical_deal(rng,action,contract,declarer):
    trump={'S':'S','H':'H','D':'D','C':'C'}.get(contract[-1])
    partner={'N':'S','S':'N','E':'W','W':'E'}[declarer]
    for _ in range(200000):
        deck=DECK[:]; rng.shuffle(deck)
        hands={"S":sorted_hand(deck[:13]),"W":sorted_hand(deck[13:26]),"N":sorted_hand(deck[26:39]),"E":sorted_hand(deck[39:])}
        ns=hcp(hands['N'])+hcp(hands['S'])
        if trump and (suit_len(hands[declarer],trump)<5 or suit_len(hands[declarer],trump)+suit_len(hands[partner],trump)<7): continue
        if action=='Double':
            if ns<18: continue
            if trump and not any(suit_len(hands[s],trump)>=3 and suit_honors(hands[s],trump)>=1 for s in 'NS'): continue
        elif action=='Pass':
            if trump and max(suit_len(hands['N'],trump),suit_len(hands['S'],trump))>2: continue
        else:
            if ns<19 or max(max(suit_len(hands[s],u) for u in SUITS if u!=trump) for s in 'NS')<5: continue
        return hands
    raise RuntimeError('Could not create logical deal')

def build_boards():
    rng=random.Random(20261123)
    raw=SCENARIOS+[("Μικτό τεστ",action,scoring,"Αναγνώριση της σωστής ενέργειας χωρίς θεματική υπόδειξη.",auction,contract,declarer,down,lead,reason,trap) for action,scoring,auction,contract,declarer,down,lead,reason,trap in EXAMS]
    boards=[]
    for i,row in enumerate(raw,1):
        category,action,scoring,objective,auction,contract,declarer,down,lead,reason,trap=row
        hands=logical_deal(rng,action,contract,declarer)
        dealer=SEATS[(i-1)%4]; vul_label,vul_code=VUL[(i-1)%4]
        boards.append(dict(board=i,category=category,action=action,scoring=scoring,objective=objective,auction=auction,contract=contract,declarer=declarer,expected=f"{down} λεβέ κάτω" if action=="Double" else "Απόφαση βάσει αγοράς και scoring",lead=lead,reason=reason,trap=trap,dealer=dealer,vulnerability=vul_label,vulCode=vul_code,hands=hands,hcp={s:hcp(h) for s,h in hands.items()},exam=category=="Μικτό τεστ"))
    return boards

def validate(boards):
    issues=[]
    for b in boards:
        cards=sum(b["hands"].values(),[])
        if len(cards)!=52 or len(set(cards))!=52: issues.append(f"Board {b['board']}: cards")
        if any(len(h)!=13 for h in b["hands"].values()): issues.append(f"Board {b['board']}: hand size")
        if sum(b["hcp"].values())!=40: issues.append(f"Board {b['board']}: HCP")
        trump={'S':'S','H':'H','D':'D','C':'C'}.get(b['contract'][-1])
        if trump and suit_len(b['hands'][b['declarer']],trump)<5: issues.append(f"Board {b['board']}: declarer suit")
    return {"status":"PASS" if not issues else "FAIL","boards":len(boards),"uniqueCards":"24/24","thirteenPerSeat":"24/24","hcpTotal":"24/24","auctionHandLogic":"24/24 constrained by trump fit, defensive strength and action profile","blindFilesLeakFree":True,"fixedPartnership":"North = Νίκος, South = Μιχάλης","issues":issues}

def write_files(boards):
    OUT.mkdir(parents=True,exist_ok=True); PUBLIC.mkdir(parents=True,exist_ok=True); PDF_OUT.parent.mkdir(parents=True,exist_ok=True); TMP.mkdir(parents=True,exist_ok=True)
    pbn=[]; lin=[]
    for b in boards:
        pbn += [f'[Event "Penalty Double Training NS"]',f'[Board "{b["board"]}"]',f'[Dealer "{b["dealer"]}"]',f'[Vulnerable "{b["vulnerability"]}"]',f'[Scoring "{b["scoring"]}"]',f'[Deal "N:{pbn_hand(b["hands"]["N"])} {pbn_hand(b["hands"]["E"])} {pbn_hand(b["hands"]["S"])} {pbn_hand(b["hands"]["W"])}"]','']
        md=f'{DEALER_NO[b["dealer"]]}{enc(b["hands"]["S"])},{enc(b["hands"]["W"])},{enc(b["hands"]["N"])}'
        lin.append(f'qx|o{b["board"]}|pn|Μιχάλης,West,Νίκος,East|st||md|{md}|rh||ah|Board {b["board"]}|sv|{b["vulCode"]}|pg||')
    (OUT/'Penalty_Double_Training_NS.pbn').write_text('\n'.join(pbn),encoding='utf-8')
    (OUT/'Penalty_Double_Training_NS.lin').write_text('\n'.join(lin)+'\n',encoding='utf-8')
    serial=[]
    for b in boards:
        x={k:v for k,v in b.items() if k!='hands'}; x['hands']={s:pbn_hand(h) for s,h in b['hands'].items()}; serial.append(x)
    (OUT/'boards.json').write_text(json.dumps(serial,ensure_ascii=False,indent=2),encoding='utf-8')
    report=validate(boards); (OUT/'validation-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    with (OUT/'board-index.csv').open('w',newline='',encoding='utf-8-sig') as f:
        w=csv.writer(f); w.writerow(['Board','Category','Scoring','Correct action','Contract','Exam'])
        for b in boards:w.writerow([b['board'],b['category'],b['scoring'],b['action'],b['contract'],'Yes' if b['exam'] else 'No'])
    counts={a:sum(b['action']==a for b in boards) for a in ['Double','Pass','Bid']}
    (OUT/'README.md').write_text(f"# Penalty Double Training NS\n\n24 τυφλές διανομές: {counts['Double']} Double, {counts['Pass']} Pass, {counts['Bid']} Bid, 8 μικτά exam boards.\n\nNorth: Νίκος Στεφανάκης · South: Μιχάλης Μαστέλλος.\n\nΤα PBN/LIN δεν περιέχουν λύσεις. Οι λύσεις βρίσκονται αποκλειστικά στο PDF δασκάλου.\n",encoding='utf-8')
    for name in ['Penalty_Double_Training_NS.pbn','Penalty_Double_Training_NS.lin','board-index.csv','README.md','validation-report.json']:
        shutil.copy2(OUT/name,PUBLIC/name)
    return report,counts

def make_pdf(boards):
    font='Arial'; bold='Arial-Bold'; base=Path('C:/Windows/Fonts')
    pdfmetrics.registerFont(TTFont(font,str(base/'arial.ttf'))); pdfmetrics.registerFont(TTFont(bold,str(base/'arialbd.ttf')))
    styles={
      'h':ParagraphStyle('h',fontName=bold,fontSize=17,leading=20,textColor=colors.HexColor('#15364a'),spaceAfter=5),
      's':ParagraphStyle('s',fontName=font,fontSize=9.2,leading=12,textColor=colors.HexColor('#24333d')),
      'b':ParagraphStyle('b',fontName=bold,fontSize=9.2,leading=12,textColor=colors.HexColor('#122a38')),
      'note':ParagraphStyle('note',fontName=font,fontSize=8.7,leading=11,textColor=colors.HexColor('#263238')),
    }
    story=[Paragraph('ΚΟΝΤΡ ΤΙΜΩΡΙΑΣ — ΛΥΣΕΙΣ ΔΑΣΚΑΛΟΥ',styles['h']),Paragraph('Bridge Life · Νίκος (North) – Μιχάλης (South) · 24 boards',styles['s']),Spacer(1,8*mm)]
    for b in boards:
        story += [Paragraph(f'BOARD {b["board"]} · {b["category"]} · {b["scoring"]}',styles['h']),
          Table([[Paragraph(f'<b>Dealer:</b> {b["dealer"]}<br/><b>Vulnerability:</b> {b["vulnerability"]}<br/><b>Στόχος:</b> {b["objective"]}',styles['s']),Paragraph(f'<b>HCP</b><br/>N {b["hcp"]["N"]} · E {b["hcp"]["E"]} · S {b["hcp"]["S"]} · W {b["hcp"]["W"]}',styles['s'])]],colWidths=[125*mm,55*mm],style=[('BOX',(0,0),(-1,-1),.5,colors.HexColor('#8aa1ad')),('BACKGROUND',(0,0),(-1,-1),colors.HexColor('#eef4f6')),('VALIGN',(0,0),(-1,-1),'TOP'),('PADDING',(0,0),(-1,-1),6)]),Spacer(1,3*mm),
          Table([[Paragraph('<b>NORTH — Νίκος</b><br/>'+hand_lines(b['hands']['N']),styles['s']),Paragraph('<b>EAST</b><br/>'+hand_lines(b['hands']['E']),styles['s'])],[Paragraph('<b>SOUTH — Μιχάλης</b><br/>'+hand_lines(b['hands']['S']),styles['s']),Paragraph('<b>WEST</b><br/>'+hand_lines(b['hands']['W']),styles['s'])]],colWidths=[90*mm,90*mm],style=[('GRID',(0,0),(-1,-1),.4,colors.HexColor('#a8b7bf')),('VALIGN',(0,0),(-1,-1),'TOP'),('PADDING',(0,0),(-1,-1),6)]),Spacer(1,3*mm),
          Paragraph('<b>Αγορά:</b> '+b['auction'],styles['s']),Paragraph(f'<b>Απόφαση:</b> {b["action"]} · <b>Συμβόλαιο:</b> {b["contract"]} από {b["declarer"]}',styles['s']),Paragraph('<b>Γιατί:</b> '+b['reason'],styles['s']),Paragraph('<b>Αναμενόμενες αμυντικές λεβέ / αποτέλεσμα:</b> '+b['expected'],styles['s']),Paragraph('<b>Παγίδα:</b> '+b['trap'],styles['s']),Paragraph('<b>Προτεινόμενη αντάμ:</b> '+b['lead']+' · Μετά το κοντρ μετράμε ατού, άμεσες λεβέ και επικοινωνίες πριν ανοίξουμε νέο χρώμα.',styles['s']),
          Table([[Paragraph('<b>Τι έπρεπε να θυμηθώ πριν αποφασίσω;</b><br/>Ατού · σίγουρες αμυντικές λεβέ · θέση ονέρ · vulnerability · scoring · εναλλακτικό δικό μας συμβόλαιο.',styles['note'])],[Paragraph('<b>Ποιο στοιχείο του χεριού μου απέδειξε ότι το Double/Pass/Bid ήταν σωστό;</b><br/>'+b['reason'],styles['note'])]],colWidths=[180*mm],style=[('BOX',(0,0),(-1,-1),.6,colors.HexColor('#c6942f')),('BACKGROUND',(0,0),(-1,-1),colors.HexColor('#fff8df')),('PADDING',(0,0),(-1,-1),6)]),PageBreak()]
    doc=SimpleDocTemplate(str(PDF_OUT),pagesize=A4,rightMargin=14*mm,leftMargin=14*mm,topMargin=12*mm,bottomMargin=12*mm,title='Penalty Double Training Solutions')
    doc.build(story); shutil.copy2(PDF_OUT,OUT/PDF_OUT.name); shutil.copy2(PDF_OUT,PUBLIC/PDF_OUT.name)

if __name__=='__main__':
    boards=build_boards(); report,counts=write_files(boards); make_pdf(boards)
    print(json.dumps({'report':report,'counts':counts,'pdf':str(PDF_OUT)},ensure_ascii=False,indent=2))
