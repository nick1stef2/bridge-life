import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { conventionsData, conventionsResources, conventionsSource } from "../data/conventionsData";
import "./Conventions.css";

const normalize = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("el-GR");

function Conventions() {
  const [query, setQuery] = useState("");
  const dontConvention = conventionsResources.additions[0];
  const needle = normalize(query.trim());

  const visibleConventions = useMemo(() => {
    if (!needle) return conventionsData;

    return conventionsData.filter((convention) =>
      normalize([
        convention.name,
        convention.englishName,
        convention.purpose,
        ...convention.details,
        ...convention.bids,
        ...convention.notes,
      ].join(" ")).includes(needle),
    );
  }, [needle]);

  const showDont = !needle || normalize([
    dontConvention.title,
    dontConvention.description,
    ...dontConvention.bids,
  ].join(" ")).includes(needle);

  const indexItems = [
    ...(showDont ? [{ id: dontConvention.id, name: dontConvention.title, supplemental: true }] : []),
    ...visibleConventions
      .map((convention) => ({ id: convention.id, name: convention.name }))
      .sort((a, b) => a.name.localeCompare(b.name, "el", { sensitivity: "base" })),
  ];

  return (
    <main className="conventions-page">
      <nav className="conventions-nav" aria-label="Πλοήγηση εγχειριδίου">
        <Link to="/">← Επιστροφή στην αρχική</Link>
        <Link to="/lessons">Lessons</Link>
      </nav>

      {showDont && (
        <article className="convention-card supplemental-convention featured-dont" id={dontConvention.id}>
          <div className="convention-number">★</div>
          <div className="convention-content">
            <span className="resource-badge resource-badge-extra">ΠΡΩΤΗ ΕΠΙΛΟΓΗ · {dontConvention.label}</span>
            <h2>{dontConvention.title}</h2>
            <p className="featured-dont-description">{dontConvention.description}</p>
            <a
              href={dontConvention.pdf}
              target="_blank"
              rel="noreferrer"
              className="dont-card-button"
            >
              ΑΝΟΙΓΜΑ ΚΑΡΤΑΣ DONT
            </a>
            <div className="featured-dont-bids" aria-label="Βασικές αγορές DONT">
              {dontConvention.bids.map((bid) => <code key={bid}>{bid}</code>)}
            </div>
          </div>
        </article>
      )}

      <header className="conventions-hero">
        <p className="conventions-kicker">BRIDGE LIFE · ΝΙΚΟΣ – ΜΙΧΑΛΗΣ</p>
        <h1>Εγχειρίδιο Συμβάσεων Bridge</h1>
        <p className="conventions-subtitle">Βιβλιοθήκη αναφοράς συμβάσεων Bridge — ανεξάρτητη από τη σειρά μαθημάτων.</p>
        <div className="conventions-actions">
          <button type="button" onClick={() => window.print()} className="print-button">
            🖨️ Εκτύπωση / Αποθήκευση PDF
          </button>
          <a href={conventionsSource.url} target="_blank" rel="noreferrer" className="source-button">
            Επίσημη πηγή ΕΟΜ ↗
          </a>
          <a href={conventionsResources.manual.pdf} target="_blank" rel="noreferrer" className="source-button">
            Άνοιγμα εγχειριδίου PDF ↗
          </a>
        </div>
      </header>

      <section className="conventions-resources" aria-labelledby="resources-title">
        <div className="resource-heading">
          <p className="section-label">ΒΙΒΛΙΟΘΗΚΗ ΑΝΑΦΟΡΑΣ</p>
          <h2 id="resources-title">Έγγραφα Συμβάσεων</h2>
        </div>
        <div className="resource-grid">
          <article className="resource-card resource-card-primary">
            <span className="resource-badge">Κύριο εγχειρίδιο</span>
            <h3>{conventionsResources.manual.title}</h3>
            <p>{conventionsResources.manual.description}</p>
            <a href={conventionsResources.manual.pdf} target="_blank" rel="noreferrer">Άνοιγμα PDF ↗</a>
          </article>
        </div>
      </section>

      <section className="notation-card" aria-labelledby="notation-title">
        <h2 id="notation-title">Bridge notation</h2>
        <div className="notation-grid">
          <span className="suit-black">♠ Spades / Πίκες</span>
          <span className="suit-red">♥ Hearts / Κούπες</span>
          <span className="suit-red">♦ Diamonds / Καρά</span>
          <span className="suit-black">♣ Clubs / Σπαθιά</span>
          <span>NT = Χωρίς Ατού</span>
        </div>
      </section>

      <section className="conventions-index" aria-labelledby="index-title">
        <div className="index-heading-row">
          <div>
            <p className="section-label">ΕΥΡΕΤΗΡΙΟ</p>
            <h2 id="index-title">Ευρετήριο Συμβάσεων</h2>
          </div>
          <label className="conventions-search">
            <span>Αναζήτηση</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="π.χ. Stayman"
            />
          </label>
        </div>

        <p className="search-count" aria-live="polite">
          {visibleConventions.length} από {conventionsData.length} συμβάσεις ΕΟΜ
          {showDont ? " + 1 πρόσθετη" : ""}
        </p>

        <div className="index-links">
          {indexItems.map((convention) => (
            <a key={convention.id} href={`#${convention.id}`} className={convention.supplemental ? "supplemental-index-link" : ""}>
              {convention.name}{convention.supplemental ? " · Πρόσθετο" : ""}
            </a>
          ))}
        </div>
      </section>

      <section className="conventions-list" aria-label="Περιγραφές συμβάσεων">
        {visibleConventions.map((convention, index) => (
          <article className="convention-card" id={convention.id} key={convention.id}>
            <div className="convention-number">{String(index + 1).padStart(2, "0")}</div>
            <div className="convention-content">
              <h2>{convention.name}</h2>
              <dl>
                <div>
                  <dt>Τι είναι / Σκοπός</dt>
                  <dd>{convention.purpose}</dd>
                </div>
                {convention.details.length > 0 && (
                  <div>
                    <dt>Πότε χρησιμοποιείται / Τι δείχνει</dt>
                    <dd>
                      <ul>{convention.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
                    </dd>
                  </div>
                )}
                {convention.bids.length > 0 && (
                  <div>
                    <dt>Βασική αγορά / Απαντήσεις</dt>
                    <dd className="bidding-sequences">
                      {convention.bids.map((bid) => <code key={bid}>{bid}</code>)}
                    </dd>
                  </div>
                )}
                {convention.notes.length > 0 && (
                  <div>
                    <dt>Σημαντικές παρατηρήσεις</dt>
                    <dd>
                      <ul>{convention.notes.map((note) => <li key={note}>{note}</li>)}</ul>
                    </dd>
                  </div>
                )}
              </dl>
              <a href="#index-title" className="back-to-index">↑ Ευρετήριο</a>
            </div>
          </article>
        ))}
      </section>

      {visibleConventions.length === 0 && !showDont && (
        <p className="no-conventions">Δεν βρέθηκε σύμβαση με αυτόν τον όρο.</p>
      )}

      <footer className="conventions-source">
        <strong>Πηγή:</strong>{" "}
        <a href={conventionsSource.url} target="_blank" rel="noreferrer">
          {conventionsSource.label}
        </a>
      </footer>
    </main>
  );
}

export default Conventions;
