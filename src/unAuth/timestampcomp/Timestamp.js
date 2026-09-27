// src/unAuth/components/Timestamp.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLink,
  faSpinner,
  faExclamationCircle,
  faTimes,
  faClock
} from "@fortawesome/free-solid-svg-icons";
import { faYoutube } from "@fortawesome/free-brands-svg-icons";
import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebase";

import "./Timestamp.css";
import StampPop from "./StampPop";
import VideoList from "./VideoList";

const YOUTUBE_URL_REGEX =
  /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|youtube\.com\/live\/)([^#&?]*).*/;
const BUMPUPS_URL = "https://bumpups.com/";

const RATE_LIMIT_MSG =
  "Usage is currently high—please try again in a couple minutes.";
const PRIVACY_MSG =
  "YouTube video is not publicly visible; we can’t process private or unlisted videos.";
const PROCESSING_MSG = "YouTube is still processing the video.";
const AUTH_MSG =
  "Tubestamp does not work in Incognito or private-browsing modes. Additionally, if you switch browsers (for example, from Chrome to Safari), Tubestamp may not function correctly. Please ensure you are using a regular window in your original browser.";
const FETCH_ERROR_MSG =
  "YouTube video is not publicly visible; we can’t process private or unlisted videos.";

const MAX_URL_LENGTH = 70;

// ----------------------------------------------------------------------------
// RATE LIMIT WINDOW (in minutes; change this if you want a different window)
const RATE_LIMIT_WINDOW_MINUTES = 60;
const RATE_LIMIT_WINDOW_MS = RATE_LIMIT_WINDOW_MINUTES * 60 * 1000;
// ----------------------------------------------------------------------------

// debounce constants
const DEBOUNCE_WINDOW_MS = 15 * 1000;
const DEBOUNCE_STORAGE_KEY = "timestampDebounce";

// ----------------------------------------------------------------------------
// DURATION LIMIT: max 2 hours
const MAX_DURATION_SECONDS = 2 * 60 * 60; // 2 hours
const DURATION_MSG =
  "Tubestamp allows for max of 2 hours per video, if you wish to do videos 2+ hours, check out";

// supported languages
const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "es", label: "Español" },
  { code: "pt", label: "Português" },
  { code: "ru", label: "Русский" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "ar", label: "العربية" },
];

// parse ISO8601 duration (e.g. "PT1H23M45S") → total seconds
function parseDuration(iso) {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  const hours = parseInt(m[1] || "0", 10);
  const mins = parseInt(m[2] || "0", 10);
  const secs = parseInt(m[3] || "0", 10);
  return hours * 3600 + mins * 60 + secs;
}

export default function Timestamp() {
  const [url, setUrl] = useState("");
  const [videoId, setVideoId] = useState(null);
  const [error, setError] = useState("");
  const [isPublic, setIsPublic] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [popData, setPopData] = useState(null);
  const [recentCount, setRecentCount] = useState(0);
  const [existingRecord, setExistingRecord] = useState(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  // new: duration-exceeded flag
  const [durationExceeded, setDurationExceeded] = useState(false);

  // debounce state
  const [debouncing, setDebouncing] = useState(false);

  // selected language
  const [language, setLanguage] = useState("en");

  // cooldown timer state
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  // On mount, check localStorage for an active debounce
  useEffect(() => {
    const ts = localStorage.getItem(DEBOUNCE_STORAGE_KEY);
    if (ts) {
      const start = parseInt(ts, 10);
      const elapsed = Date.now() - start;
      if (elapsed < DEBOUNCE_WINDOW_MS) {
        setDebouncing(true);
        const remaining = DEBOUNCE_WINDOW_MS - elapsed;
        const t = setTimeout(() => {
          setDebouncing(false);
          localStorage.removeItem(DEBOUNCE_STORAGE_KEY);
        }, remaining);
        return () => clearTimeout(t);
      } else {
        localStorage.removeItem(DEBOUNCE_STORAGE_KEY);
      }
    }
  }, []);

  const computeRecent = useCallback(() => {
    const history =
      JSON.parse(localStorage.getItem("userGeneratedVideos")) || [];
    const windowStart = Date.now() - RATE_LIMIT_WINDOW_MS;
    const recent = history.filter((r) => r.generatedAt > windowStart);
    setRecentCount(recent.length);

    if (recent.length >= 5) {
      const oldest = recent.reduce((a, b) =>
        a.generatedAt < b.generatedAt ? a : b
      );
      const nextAllowed = oldest.generatedAt + RATE_LIMIT_WINDOW_MS;
      setTimeLeft(nextAllowed - Date.now());
    } else {
      setTimeLeft(0);
    }
  }, []);

  useEffect(() => {
    computeRecent();
    window.addEventListener("timestampHistoryUpdated", computeRecent);
    return () => {
      window.removeEventListener("timestampHistoryUpdated", computeRecent);
      clearInterval(timerRef.current);
    };
  }, [computeRecent]);

  // countdown effect
  useEffect(() => {
    if (timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1000) {
            clearInterval(timerRef.current);
            computeRecent();
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timeLeft, computeRecent]);

  useEffect(() => {
    // reset on URL change
    setDurationExceeded(false);
    const m = url.match(YOUTUBE_URL_REGEX);
    const id = m ? m[1] : null;
    setVideoId(id);
    setQuotaExceeded(false);

    // reset other state defaults
    setError("");
    setIsPublic(null);
    setIsProcessing(false);
    setPopData(null);

    // check for pending generate state in localStorage
    if (id) {
      const pending = localStorage.getItem(`pending_${id}`) === "true";
      setGenerating(pending);
      if (pending) {
        const stored = localStorage.getItem(`pending_video_${id}`);
        if (stored) {
          const pendingVideo = JSON.parse(stored);
          setVideo(pendingVideo);
          setIsPublic(true);
        }
      }
    } else {
      setVideo(null);
      setGenerating(false);
      setExistingRecord(null);
      return;
    }

    // find existing completed record
    const history =
      JSON.parse(localStorage.getItem("userGeneratedVideos")) || [];
    setExistingRecord(
      history.find((r) => (r.url.match(YOUTUBE_URL_REGEX) || [])[1] === id) ||
        null
    );

    // if there was no pending call, fetch video metadata
    if (!localStorage.getItem(`pending_${id}`)) {
      setLoading(true);
      (async () => {
        try {
          const apiKey = process.env.REACT_APP_YOUTUBE_API_KEY;
          const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,status,contentDetails&id=${id}&key=${apiKey}`;
          const res = await fetch(apiUrl);
          const json = await res.json();

          // check API quota
          if (
            json.error?.errors?.some((e) => e.reason === "quotaExceeded")
          ) {
            setQuotaExceeded(true);
            setIsPublic(true);
            setVideo(null);
            return;
          }

          if (json.items?.length) {
            const { snippet, status, contentDetails } = json.items[0];

            // new: enforce 2-hour max duration
            const seconds = parseDuration(contentDetails.duration);
            if (seconds > MAX_DURATION_SECONDS) {
              setDurationExceeded(true);
              setError(DURATION_MSG);
              setIsPublic(false);
              setVideo(null);
              setLoading(false);
              return;
            }

            if (status.privacyStatus !== "public") {
              setError(PRIVACY_MSG);
              setIsPublic(false);
              setVideo(null);
              return;
            }

            let captionsFound = true;
            try {
              const capRes = await axios.get(
                "https://www.googleapis.com/youtube/v3/captions",
                { params: { videoId: id, key: apiKey } }
              );
              captionsFound = capRes.data.items.length > 0;
            } catch {
              // ignore
            }

            if (!captionsFound) {
              setError(PROCESSING_MSG);
              setIsProcessing(true);
              setVideo(null);
              return;
            }

            setIsPublic(true);
            setVideo({
              title: snippet.title,
              thumbnail:
                snippet.thumbnails.maxres?.url ||
                snippet.thumbnails.high?.url ||
                snippet.thumbnails.default?.url,
            });
          } else {
            setError(FETCH_ERROR_MSG);
            setIsPublic(false);
            setVideo(null);
          }
        } catch (e) {
          // console.error("YouTube fetch failed:", e);
          setError(FETCH_ERROR_MSG);
          setIsPublic(false);
          setVideo(null);
        } finally {
          setLoading(false);
        }
      })();
    } else {
      setLoading(false);
    }
  }, [url, computeRecent]);

  const handleGenerateTimestamps = async () => {
    // 1) persistent debounce
    if (debouncing) return;

    setDebouncing(true);
    const now = Date.now();
    localStorage.setItem(DEBOUNCE_STORAGE_KEY, now.toString());
    const clear = () => {
      setDebouncing(false);
      localStorage.removeItem(DEBOUNCE_STORAGE_KEY);
    };
    setTimeout(clear, DEBOUNCE_WINDOW_MS);

    // 2) original generate logic
    if (generating) return;
    if (existingRecord) {
      setPopData(existingRecord);
      return;
    }
    if (isPublic === false || isProcessing) return;

    localStorage.setItem(`pending_${videoId}`, "true");
    localStorage.setItem(
      `pending_video_${videoId}`,
      JSON.stringify(video)
    );

    setGenerating(true);
    setError("");

    try {
      const fn = httpsCallable(functions, "generate_timestamps");
      const { data } = await fn({ url, language });
      if (data.error) throw new Error(data.error);

      setPopData(data);

      if (video) {
        const record = {
          url,
          title: video.title,
          thumbnail: video.thumbnail,
          timestamps_list: data.timestamps_list,
          timestamps_string: data.timestamps_string,
          generatedAt: Date.now(),
        };
        const existing =
          JSON.parse(localStorage.getItem("userGeneratedVideos")) || [];
        localStorage.setItem(
          "userGeneratedVideos",
          JSON.stringify([record, ...existing])
        );
      }

      window.dispatchEvent(new Event("timestampHistoryUpdated"));
    } catch (err) {
      // console.error("generate_timestamps error:", err);
      if (err.message === "Authentication required.") {
        setError(AUTH_MSG);
      } else {
        setError(RATE_LIMIT_MSG);
      }
    } finally {
      localStorage.removeItem(`pending_${videoId}`);
      localStorage.removeItem(`pending_video_${videoId}`);
      setGenerating(false);
    }
  };

  const hasValidId = Boolean(videoId);
  const atLimit = recentCount >= 5;

  // —— here’s the reordered button logic —— 
  let buttonContent;
  let buttonDisabled = generating;
  let buttonClass = "timestamp-submit";

  if (isProcessing) {
    buttonContent = "Video is still processing";
    buttonDisabled = true;
  } else if (durationExceeded) {
    buttonContent = "Max 2H";
    buttonDisabled = true;
  } else if (isPublic === false) {
    buttonContent = "Video isn’t publicly visible";
    buttonDisabled = true;
  } else if (generating) {
    buttonContent = (
      <>
        <FontAwesomeIcon
          icon={faSpinner}
          spin
          className="spinner-icon"
        />{" "}
        Generating…
      </>
    );
  } else if (atLimit) {
    buttonContent = "Rate limit reached";
    buttonDisabled = true;
  } else if (!url || !hasValidId) {
    buttonContent = "Generate Timestamps";
    if (url && !hasValidId) {
      buttonContent = "Invalid YouTube URL";
      buttonClass += " invalid";
      buttonDisabled = true;
    }
  } else if (existingRecord) {
    buttonContent = "View Timestamps";
  } else {
    buttonContent = "Generate Timestamps";
  }

  const formatTime = (ms) => {
    const totalSec = Math.max(0, Math.ceil(ms / 1000));
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="timestamp-container">
      <h2 className="timestamp-header">AI YouTube Timestamps</h2>
      <p className="timestamp-description">
        Generates timestamps for a given YouTube video using the bump-1.0
        model—for uninterrupted, priority service{" "}
        <a href={BUMPUPS_URL} target="_blank" rel="noopener noreferrer">
          bumpups.com
        </a>
        .
      </p>

      <div className="timestamp-form">
        <div className="input-wrapper">
          <FontAwesomeIcon icon={faLink} className="url-icon" />

          <input
            type="text"
            className="timestamp-input"
            placeholder="Enter YouTube video URL"
            maxLength={MAX_URL_LENGTH}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <select
            className="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {LANGUAGES.map(({ code, label }) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>

          {atLimit ? (
            <button
              className="timestamp-submit limit"
              onClick={() => window.open(BUMPUPS_URL, "_blank")}
            >
              Generate More
            </button>
          ) : (
            <button
              className={`${buttonClass} ${debouncing ? "debouncing" : ""}`}
              onClick={handleGenerateTimestamps}
              disabled={buttonDisabled}
            >
              {buttonContent}
            </button>
          )}
        </div>

        {/* DURATION ERROR */}
        {durationExceeded && (
          <div className="timestamp-error">
            <FontAwesomeIcon
              icon={faExclamationCircle}
              className="error-icon"
            />
            <span>
              {DURATION_MSG.split(";")[0]}{" "}
              <a
                href={BUMPUPS_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                bumpups.com
              </a>
            </span>
          </div>
        )}

        {/* OTHER ERRORS */}
        {!durationExceeded && error && (
          <div className="timestamp-error">
            <FontAwesomeIcon
              icon={faExclamationCircle}
              className="error-icon"
            />
            <span>
              {error} For uninterrupted, priority service{" "}
              <a
                href={BUMPUPS_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                bumpups.com
              </a>.
            </span>
          </div>
        )}

        {atLimit && timeLeft > 0 && (
          <div className="timestamp-error">
            <FontAwesomeIcon icon={faClock} className="timer-icon" />
            <span>
              You can use again in <strong>{formatTime(timeLeft)}</strong>. For
              uninterrupted, priority service{" "}
              <a
                href={BUMPUPS_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                bumpups.com
              </a>.
            </span>
          </div>
        )}
      </div>

      <div className="timestamp-output">
        {quotaExceeded && hasValidId && !video && !loading && (
          <div className="loading-container">
            <div className="skeleton-thumbnail">
              <FontAwesomeIcon
                icon={faYoutube}
                className="loader-icon youtube-icon"
              />
            </div>
          </div>
        )}

        {error && !video && (
          <div className="loading-container">
            <div className="skeleton-thumbnail">
              <FontAwesomeIcon
                icon={faTimes}
                className="loader-icon youtube-icon"
              />
            </div>
          </div>
        )}

        {!error && !video && !hasValidId && (
          <div className="loading-container">
            <div className="skeleton-thumbnail">
              <FontAwesomeIcon
                icon={faYoutube}
                className="loader-icon youtube-icon"
              />
            </div>
          </div>
        )}

        {!video && hasValidId && loading && (
          <div className="loading-container">
            <div className="skeleton-thumbnail shimmer">
              <FontAwesomeIcon
                icon={faSpinner}
                spin
                className="loader-icon"
              />
            </div>
          </div>
        )}

        {video && !loading && (
          <div className="video-preview">
            <img
              src={video.thumbnail}
              alt="YouTube thumbnail"
              className="video-thumbnail"
            />
            <div className="video-title">{video.title}</div>
          </div>
        )}

        {popData && (
          <StampPop
            data={popData}
            onClose={() => {
              setPopData(null);
              setUrl("");
              window.dispatchEvent(new Event("timestampHistoryUpdated"));
            }}
          />
        )}

        <VideoList />
      </div>
    </div>
  );
}
