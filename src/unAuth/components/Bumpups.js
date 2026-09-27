// src/components/Bumpups.js
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowUpFromBracket,
  faComments,
  faVideo,
  faLaptopCode,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons'
import './Bumpups.css'

const cards = [
  {
    title: 'Local Videos',
    icon: faArrowUpFromBracket,
    url: 'https://bumpups.com/local-feature'
  },
  {
    title: 'Video Chat',
    icon: faComments,
    url: 'https://bumpups.com/workspace-feature'
  },
  {
    title: 'AI YouTube',
    icon: faVideo,
    url: 'https://bumpups.com/creator-feature'
  },
  {
    title: 'API',
    icon: faLaptopCode,
    url: 'https://bumpups.com/startup'
  }
]

export default function Bumpups() {
  return (
    <section className="bumpups-section">
      <h2 className="bumpups-header">
        <a
          href="https://bumpups.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Do more with bump
          <span className="bumpups-header-highlight">ups</span>.com
        </a>
      </h2>
      <p className="bumpups-description">
        Process your videos to deliver insights across all industries. Ask questions, request summaries, analyses, and more with Bump-1.0.
      </p>
      <div className="bumpups-grid">
        {cards.map(({ title, icon, url }, i) => (
          <a
            key={i}
            href={url}
            className="card-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className={`card card-${i + 1}`}>
              <div className="card-content">
                <h3 className="card-title">
                  <span>{title}</span>
                </h3>
                <div className="learn-more">
                  <div className="learn-more-icon">
                    <FontAwesomeIcon icon={faArrowRight} />
                  </div>
                  <span>Learn more</span>
                </div>
              </div>
              <div className="card-image">
                <FontAwesomeIcon icon={icon} size="5x" />
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
