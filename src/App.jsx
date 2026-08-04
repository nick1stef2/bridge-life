import "./index.css";
import { Routes, Route, Link } from "react-router-dom";

import Lessons from "./pages/Lessons";
import LessonDetail from "./pages/LessonDetail";
import Results from "./pages/Results";
import Gallery from "./pages/Gallery";
import TournamentDetail from "./pages/TournamentDetail";
import Videos from "./pages/Videos";
import Categories from "./pages/Categories";

function HomePage() {
  return (
    <>
      <header className="header">
        <h1>Bridge Life ♠️</h1>
        <p>Το προσωπικό μου bridge app 😄</p>
      </header>

      <main className="main-grid">
        <Link to="/lessons" className="card-link">
          <div className="card">
            <h2>📚 Lessons</h2>
            <p>Μαθήματα και συστήματα bridge</p>
          </div>
        </Link>

        <div className="card">
          <h2>🃏 Boards</h2>
          <p>Διανομές και αναλύσεις</p>
        </div>

        <Link to="/results" className="card-link">
          <div className="card">
            <h2>🏆 Results</h2>
            <p>Αποτελέσματα αγώνων</p>
          </div>
        </Link>

        <Link to="/gallery" className="card-link">
          <div className="card">
            <h2>📸 Gallery</h2>
            <p>Φωτογραφίες bridge</p>
          </div>
        </Link>

        <Link to="/videos" className="card card-link">
          <h2>🎥 Videos</h2>
          <p>Βίντεο και μαθήματα</p>
        </Link>
        <Link to="/categories" className="card card-link">
          <h2>Categories</h2>
          <p>Player category and points progress</p>
        </Link>
      </main>
    </>
  );
}

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/lessons" element={<Lessons />} />
        <Route path="/lesson/:lessonId" element={<LessonDetail />} />
        <Route path="/results" element={<Results />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/tournament/:tournamentId" element={<TournamentDetail />} />
      </Routes>
    </div>
  );
}

export default App;
