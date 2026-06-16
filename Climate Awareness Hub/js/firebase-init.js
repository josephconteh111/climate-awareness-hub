// Initialize Firebase and expose initialized objects on window.FIREBASE for other modules to use.
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

const cfg = window.FIREBASE_CONFIG || null;
if (!cfg) {
  console.warn('firebase-init: window.FIREBASE_CONFIG not found — skipping initialization.');
} else {
  try {
    const app = initializeApp(cfg);
    let analytics = null;
    try { analytics = getAnalytics(app); } catch (e) { /* analytics may fail in local env */ }
    const db = getFirestore(app);
    const storage = getStorage(app);
    window.FIREBASE = { app, analytics, db, storage };
    window.FIREBASE_READY = true;
    console.info('Firebase initialized (firebase-init.js)');
  } catch (err) {
    console.error('firebase-init error', err);
  }
}