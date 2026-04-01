import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "../pages/login";
import Signup from "../pages/Signup";
import Home from "../pages/Home";
import Profile from "../pages/Profile";
import Admin from "../pages/Admin";
import PrivateRoute from "./privateroutes";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/home" element={<Home />} />
      <Route path="*" element={<Home />} />
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
};

export default AppRoutes;