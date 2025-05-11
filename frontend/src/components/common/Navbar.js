// Navbar.js
import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { FaShoppingCart } from "react-icons/fa";
import "./Navbar.css";

const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (["/login", "/signup"].includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <FaShoppingCart className="icon" />
        <span><h4>User Management</h4></span>
      </Link>
    </nav>
  );
};

export default Navbar;