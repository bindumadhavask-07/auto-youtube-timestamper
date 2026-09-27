// src/unAuth/components/StampPop.js
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faCopy } from "@fortawesome/free-solid-svg-icons";
import "./StampPop.css";

const BUMPUPS_URL = "https://bumpups.com/";

export default function StampPop({ data = {}, onClose }) {
  const [copied, setCopied] = useState(false);
  const {
    timestamps_list = [],
    timestamps_string = "",
    url = ""
  } = data;

  const handleCopy = () => {
    if (!timestamps_string) return;
    navigator.clipboard
      .writeText(timestamps_string)
      .then(() => setCopied(true))
      .catch(() => setCopied(false));
  };

  // helper to parse "MM:SS" or "H:MM:SS" into seconds
  const toSeconds = (timeStr) => {
    const parts = timeStr.split(":").map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
  };

  // build a link for a given timestamp
  const makeLink = (timeStr) => {
    if (!url) return null;
    const seconds = toSeconds(timeStr);
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}t=${seconds}`;
  };

  return (
    <div className="stamppop-overlay" onClick={onClose}>
      <div
        className="stamppop-container"
        onClick={e => e.stopPropagation()}
      >
        <div className="stamppop-header">
          <h3 className="stamppop-title">Timestamps</h3>
          <button
            className="stamppop-close"
            onClick={onClose}
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="stamppop-content">
          {timestamps_list.length > 0 ? (
            <ul className="stamppop-list">
              {timestamps_list.map((ts, i) => {
                // split off the time prefix
                const match = ts.match(/^(\d{1,2}(?::\d{2}){1,2})\s*(.*)$/);
                let timeStr = null, rest = ts;
                if (match) {
                  timeStr = match[1];
                  rest = match[2];
                }
                const href = timeStr ? makeLink(timeStr) : null;
                return (
                  <li key={i} className="stamppop-item">
                    {timeStr && href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="timestamp-link"
                      >
                        <strong>{timeStr}</strong>
                      </a>
                    ) : timeStr ? (
                      <strong style={{ color: "#1a73e8" }}>{timeStr}</strong>
                    ) : null}
                    {rest && <span className="timestamp-desc"> {rest}</span>}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="stamppop-empty">No timestamps available.</p>
          )}
        <button
          className={`copy-button${copied ? " copied" : ""}`}
          onClick={handleCopy}
        >
          <FontAwesomeIcon icon={faCopy} />{" "}
          {copied ? "Copied!" : "Copy"}
        </button>

          <div className="stamppop-footer">
            <small className="stamppop-footer-text">
              Get uninterrupted, priority service — AI Creator Studio, local video uploads, and more at&nbsp;
              <a
                href={BUMPUPS_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                bumpups.com
              </a>.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
