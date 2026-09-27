// src/unAuth/components/VideoList.js
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSync,
  faChevronLeft,
  faChevronRight
} from "@fortawesome/free-solid-svg-icons";
import StampPop from "../timestampcomp/StampPop";
import "./VideoList.css";

const ITEMS_PER_PAGE = 5;
const MAX_TITLE_LENGTH = 80;

function truncateTitle(title) {
  return title.length > MAX_TITLE_LENGTH
    ? title.slice(0, MAX_TITLE_LENGTH) + "…"
    : title;
}

export default function VideoList() {
  const [videos, setVideos] = useState([]);
  const [popData, setPopData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const json = localStorage.getItem("userGeneratedVideos");
    if (json) {
      try {
        setVideos(JSON.parse(json));
      } catch (e) {
        // ignore parse errors
      }
    }
  }, []);

  const pageCount = Math.ceil(videos.length / ITEMS_PER_PAGE);
  const safePage = Math.min(Math.max(currentPage, 1), pageCount || 1);
  const startIdx = (safePage - 1) * ITEMS_PER_PAGE;
  const pageVideos = videos.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const handleView = video => setPopData(video);
  const handleClose = () => setPopData(null);
  const handleReload = () => window.location.reload();
  const prevPage = () => setCurrentPage(p => Math.max(p - 1, 1));
  const nextPage = () => setCurrentPage(p => Math.min(p + 1, pageCount));

  return (
    <div className="video-list-container">
      <div className="video-list-header">
        <button
          className="reload-button"
          onClick={handleReload}
          aria-label="Reload history"
        >
          <FontAwesomeIcon icon={faSync} />
        </button>
        <span>History</span>
      </div>

      {videos.length === 0 ? (
        <p className="video-list-empty">No videos generated yet.</p>
      ) : (
        pageVideos.map((video, i) => {
          const formattedDate = new Date(video.generatedAt).toLocaleDateString(
            "en-US",
            { month: "long", day: "numeric", year: "numeric" }
          );
          return (
            <div key={i} className="video-list-item">
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="video-list-thumb-link"
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="video-list-thumb"
                />
              </a>
              <div className="video-list-info">
                <div className="video-list-title">
                  {truncateTitle(video.title)}
                </div>
                <div className="video-list-date">{formattedDate}</div>
              </div>
              <button
                className="video-list-button"
                onClick={() => handleView(video)}
              >
                View Timestamps
              </button>
            </div>
          );
        })
      )}

      {pageCount > 1 && (
        <div className="pagination">
          <button
            onClick={prevPage}
            disabled={safePage === 1}
            aria-label="Previous"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <span>
            Page {safePage} of {pageCount}
          </span>
          <button
            onClick={nextPage}
            disabled={safePage === pageCount}
            aria-label="Next"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      )}

      {popData && <StampPop data={popData} onClose={handleClose} />}
    </div>
  );
}
