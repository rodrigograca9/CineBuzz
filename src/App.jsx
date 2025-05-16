import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import MovieDetails from "./pages/Moviedetails";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import MoviePage from "./pages/MoviePage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Perfil from "./pages/Perfil";
import UserLists from "./pages/UserList";
import UserLikes from "./pages/UserLikes";
import UserWatchList from "./pages/UserWatchList";
import AdminPanel from "./pages/AdminPanel";
import AdminWrapper from "./pages/Wrapper";
import ListDetail from "./pages/ListDetails";
import SearchResultsPage from './components/SearchResultsPage';
import PublicProfilePage from "./pages/PublicProfilePage";

export default function App() {
  return (
    <Router>
      <div className="bg-gray-900 min-h-screen text-white">
        <Navbar />
        <div className="p-6">
            
          <Routes>
            <Route 
              path="/admin" 
              element={
                <AdminWrapper>
                  <AdminPanel />
                </AdminWrapper>
              } 
            />
            <Route path="/list/:listId" element={<ListDetail />} />
            <Route path="/profile/likes/:userId" element={<UserLikes />} />
            <Route path="/profile/lists/:userId" element={<UserLists />} />
            <Route path="/profile/watchlist/:userId" element={<UserWatchList />} />
            <Route path="/profile" element={<Perfil />} />
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/movies" element={<MoviePage />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/profile/:uid" element={<PublicProfilePage />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}