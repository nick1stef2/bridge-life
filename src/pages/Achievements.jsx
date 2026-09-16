import { Link } from "react-router-dom";
import { achievementsData } from "../data/achievementsData";
import "./Achievements.css";

function formatDate(date) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

function Achievements() {
  const achievements = [...achievementsData].sort((a, b) =>
    b.date.localeCompare(a.date) || b.id.localeCompare(a.id),
  );

  return (
    <main className="achievements-page">
      <Link to="/" className="achievements-back">Επιστροφή στην αρχική</Link>

      <header className="achievements-hero">
        <span>Bridge Life</span>
        <h1>🏆 Διακρίσεις</h1>
        <p>Τεκμηριωμένες θέσεις και σημαντικές επιτυχίες από επίσημα αποτελέσματα της ΕΟΜ.</p>
      </header>

      <section className="achievements-grid">
        {achievements.map((achievement) => (
          <article className="achievement-card" key={achievement.id}>
            <span>{formatDate(achievement.date)} · {achievement.organization}</span>
            <h2>{achievement.title}</h2>
            <strong>{achievement.result}</strong>
            <p>Συμπαίκτης: {achievement.partner}</p>
            <p>{achievement.note}</p>
            <div className="achievement-actions">
              <Link to={`/tournament/${achievement.tournamentId}`}>Tournament Detail</Link>
              <a href={achievement.officialUrl} target="_blank" rel="noreferrer">Επίσημα αποτελέσματα ΕΟΜ ↗</a>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

export default Achievements;
