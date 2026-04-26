import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AlbumPage from "./pages/AlbumPage";
import AlbumTree from "./pages/AlbumTree";
import RegisterPage from "./pages/RegisterPage";
import PublicAlbumPage from "./pages/PublicAlbumPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route
        path="/"
        element={
          localStorage.getItem("token") ? (
            <Navigate to="/tree" />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/albums/:id" element={<AlbumPage />} />  
        <Route path="/tree" element={<AlbumTree />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/public/:id" element={<PublicAlbumPage />} />
    </Routes>
    </Router>
  );
}

export default App;