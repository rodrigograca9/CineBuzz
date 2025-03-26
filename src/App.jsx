import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import MovieDetails from "./pages/Moviedetails";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import MoviePage from "./pages/MoviePage";

export default function App() {
  return (
    <Router>
      <div className="bg-gray-900 min-h-screen text-white">
        <Navbar />
        <div className="p-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<MoviePage />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}
