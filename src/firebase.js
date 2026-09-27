// src/firebase.js

// Import the Firebase SDK pieces you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
} from "firebase/auth";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey:            process.env.REACT_APP_API_KEY,
  authDomain:        process.env.REACT_APP_AUTH_DOMAIN,
  projectId:         process.env.REACT_APP_PROJECT_ID,
  storageBucket:     process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId:             process.env.REACT_APP_APP_ID,
  measurementId:     process.env.REACT_APP_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize App Check (reCAPTCHA v3)
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider(process.env.REACT_APP_RECAPTCHA_SITE_KEY),
  isTokenAutoRefreshEnabled: true,
});
// console.log("[DEBUG] App Check initialized:", appCheck);

// Set up anonymous auth
const auth = getAuth(app);

// Sign in anonymously on startup
signInAnonymously(auth).catch(() => {
  // anonymous sign-in failed
});

// Listen for auth state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    // user.uid is available here
    // console.log("[DEBUG] Signed in anonymously, UID:", user.uid);
  }
});

// Initialize Cloud Functions
const functions = getFunctions(app);
if (
  window.location.hostname === "localhost" ||
  process.env.REACT_APP_ENV === "local"
) {
  connectFunctionsEmulator(functions, "localhost", 5001);
}

export {
  app,
  analytics,
  auth,
  functions,
};
