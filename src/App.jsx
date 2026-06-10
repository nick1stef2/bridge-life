import "./index.css";
import { Routes, Route, Link } from "react-router-dom";

import Lessons from "./pages/Lessons";
import LessonDetail from "./pages/LessonDetail";

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

        <div className="card">
          <h2>🏆 Results</h2>
          <p>Αποτελέσματα αγώνων</p>
        </div>

        <div className="card">
          <h2>📸 Gallery</h2>
          <p>Φωτογραφίες bridge</p>
        </div>

        <div className="card">
          <h2>🎥 Videos</h2>
          <p>Βίντεο και μαθήματα</p>
        </div>
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
      </Routes>
    </div>
  );
}

export default App;