import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { conventionsData, conventionsSource } from "../data/conventionsData";
import "./Conventions.css";

const normalize = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("el-GR");

function Conventions() {
  const [query, setQuery] = useState("");

  const visibleConventions = useMemo(() => {
    const needle = normalize(query.trim());
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
  }, [query]);

  return (
    <main className="conventions-page">
      <nav className="conventions-nav" aria-label="Πλοήγηση εγχειριδίου">
        <Link to="/">← Επιστροφή στην αρχική</Link>
        <Link to="/lessons">Lessons</Link>
      </nav>

      <header className="conventions-hero">
        <p className="conventions-kicker">BRIDGE LIFE · ΝΙΚΟΣ – ΜΙΧΑΛΗΣ</p>
        <h1>Εγχειρίδιο Συμβάσεων Bridge</h1>
        <p className="conventions-subtitle">Συμβάσεις Bridge — Υλικό αναφοράς από την ΕΟΜ</p>
        <div className="conventions-actions">
          <button type="button" onClick={() => window.print()} className="print-button">
            🖨️ Εκτύπωση / Αποθήκευση PDF
          </button>
          <a href={conventionsSource.url} target="_blank" rel="noreferrer" className="source-button">
            Επίσημη πηγή ΕΟΜ ↗
          </a>
        </div>
      </header>

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
          {visibleConventions.length} από {conventionsData.length} συμβάσεις
        </p>

        <div className="index-links">
          {visibleConventions.map((convention) => (
            <a key={convention.id} href={`#${convention.id}`}>
              {convention.name}
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

      {visibleConventions.length === 0 && (
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
