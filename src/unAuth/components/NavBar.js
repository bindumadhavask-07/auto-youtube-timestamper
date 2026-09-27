// src/components/NavBar.js
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBrain, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import "./NavBar.css";
import tubelogo from "../../assets/tubelogo.png";

const NavBar = () => (
  <nav className="navbar-container">
    <div className="navbar-left">
      <img src={tubelogo} alt="Tubestamp Logo" className="navbar-logo-img" />
      <span className="navbar-brand">
        <span className="brand-highlight">tube</span>stamp
      </span>
    </div>
    <div className="navbar-right">
      <ul className="navbar-menu"></ul>
      <a
        href="https://bumpups.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="navbar-cta"
      >
        AI Video Chatbot
        <FontAwesomeIcon icon={faArrowRight} className="cta-icon" />
      </a>
    </div>
  </nav>
);

export default NavBar;
