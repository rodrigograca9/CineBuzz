import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import MovieDetails from "./pages/Moviedetails";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import MoviePage from "./pages/MoviePage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import profile from "./pages/profile";
import Profile from "./pages/profile";

export default function App() {
  return (
    <Router>
      <div className="bg-gray-900 min-h-screen text-white">
        <Navbar />
        <div className="p-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/movies" element={<MoviePage />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}