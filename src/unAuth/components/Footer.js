// src/components/Footer.js
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLinkedin,
  faXTwitter,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { faBrain } from "@fortawesome/free-solid-svg-icons";
import "./Footer.css";

export default function Footer() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <footer className="footer-container">
      <div className="footer-branding">
        <div className="footer-brand-description">
          <span className="footer-timestamp-highlight">
            #1 AI VIDEO MODEL <br /> <br />
          </span>{" "}
          Bump AI will watch any video and deliver insights across all industries.
          <div className="footer-social-media-icons">
            <a
              href="https://www.linkedin.com/company/bumpups"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-contact-link"
            >
              <FontAwesomeIcon icon={faLinkedin} />
            </a>
            <a
              href="https://twitter.com/bumpups"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-contact-link"
            >
              <FontAwesomeIcon icon={faXTwitter} />
            </a>
            <a
              href="https://www.youtube.com/@bumpupsapp"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-contact-link"
            >
              <FontAwesomeIcon icon={faYoutube} />
            </a>
          </div>
        </div>
      </div>

      {!isMobile && (
        <>
          <div className="footer-section">
            <h4>Product</h4>
            <ul className="footer-links">
              <li>
                <a
                  href="https://bumpups.com/news"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-contact-link"
                >
                  News
                </a>
              </li>
              <li>
                <a
                  href="https://bumpups.com/pricing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-contact-link"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="https://bumpups.canny.io/changelog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-contact-link"
                >
                  Product Changelog
                </a>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Features</h4>
            <ul className="footer-links">
              <li>
                <a
                  href="https://bumpups.com/workspace-feature"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-contact-link"
                >
                  Workspaces
                </a>
              </li>
              <li>
                <a
                  href="https://bumpups.com/creator-feature"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-contact-link"
                >
                  Creator Studio
                </a>
              </li>
              <li>
                <a
                  href="https://bumpups.com/youtube-feature"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-contact-link"
                >
                  YouTube Videos
                </a>
              </li>
              <li>
                <a
                  href="https://bumpups.com/local-feature"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-contact-link"
                >
                  Local Videos
                </a>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>API</h4>
            <ul className="footer-links">
              <li>
                <a
                  href="https://bumpups.com/startup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-contact-link"
                >
                  Startups
                </a>
              </li>
              <li>
                <a
                  href="https://bumpups.com/zapier"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-contact-link"
                >
                  Zapier
                </a>
              </li>
              <li>
                <a
                  href="https://bumpups.com/enterprise"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-contact-link"
                >
                  Enterprise
                </a>
              </li>
              <li>
                <a
                  href="https://docs.bumpups.com/docs/getting-started"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-contact-link"
                >
                  API Documentation
                </a>
              </li>
            </ul>
          </div>
        </>
      )}

      {isMobile && (
        <div className="footer-section footer-mobile">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li>
              <a
                href="https://bumpups.com/pricing"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-contact-link"
              >
                Pricing
              </a>
            </li>
            <li>
              <a
                href="https://bumpups.com/news"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-contact-link"
              >
                News
              </a>
            </li>
            <li>
              <a
                href="https://bumpups.com/workspace-feature"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-contact-link"
              >
                Workspaces
              </a>
            </li>
            <li>
              <a
                href="https://bumpups.com/creator-feature"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-contact-link"
              >
                Creator Studio
              </a>
            </li>
            <li>
              <a
                href="https://bumpups.com/youtube-feature"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-contact-link"
              >
                YouTube Videos
              </a>
            </li>
            <li>
              <a
                href="https://bumpups.com/local-feature"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-contact-link"
              >
                Local Videos
              </a>
            </li>
          </ul>
        </div>
      )}

      <div className="footer-bottom">
        ©2025 Bumpups Inc. – All rights reserved.
        <a
          href="https://bumpups.com/terms-of-service"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-contact-link"
        >
          Terms of Service
        </a>
        <a
          href="https://bumpups.com/privacy-policy"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-contact-link"
        >
          Privacy Policy
        </a>
      </div>
    </footer>
  );
}
