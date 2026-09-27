// src/unAuth/components/PlaylistCTA.js
import React from "react";
import "./PlaylistCTA.css";
import tubelogo from "../../assets/mega-thumbie.jpg";

const PlaylistCTA = () => (
  <div className="playlist-cta-container">
    <div className="playlist-cta-text">
      <h2 className="playlist-cta-title">
        Want to build the software you’re currently using with{" "}
        <span className="playlist-cta-highlight">zero coding experience</span>,
        powered by AI?
      </h2>
      <p className="playlist-cta-subtitle">
        Follow this simple 6-part series to learn exactly how!
      </p>
      <a
        href="https://www.youtube.com/playlist?list=PLJrzt4ameiaMxmOwTlxOy3eW37oZgAMIw"
        target="_blank"
        rel="noopener noreferrer"
      >
        <button className="playlist-cta-button">Watch YouTube Series</button>
      </a>
    </div>
    <a
      href="https://www.youtube.com/playlist?list=PLJrzt4ameiaMxmOwTlxOy3eW37oZgAMIw"
      target="_blank"
      rel="noopener noreferrer"
      className="playlist-cta-image-link"
    >
      <img
        src={tubelogo}
        alt="YouTube playlist thumbnail"
        className="playlist-cta-image"
      />
    </a>
  </div>
);

export default PlaylistCTA;
