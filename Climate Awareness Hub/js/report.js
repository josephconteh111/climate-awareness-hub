/*
  Firebase-enabled report handler.
  - Uses ES module imports from Firebase CDN (works when report.html loads this script with type="module").
  - If window.FIREBASE_CONFIG is set (e.g. in a separate firebase-config.js or inline <script>), the app will initialize
    and reports (and optional photos) will be uploaded to Firestore/Storage in addition to the localStorage fallback.
  - If no FIREBASE_CONFIG is present the page continues to work offline using localStorage only.
*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-analytics.js";
import {
  getFirestore, collection, addDoc, deleteDoc, doc, serverTimestamp, updateDoc
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import {
  getStorage, ref, uploadString, getDownloadURL, deleteObject
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

let firebaseApp = null;
let analytics = null;
let db = null;
let storage = null;

try {
  if (window.FIREBASE && window.FIREBASE.db) {
    // firebase-init.js already ran
    firebaseApp = window.FIREBASE.app;
    analytics = window.FIREBASE.analytics || null;
    db = window.FIREBASE.db;
    storage = window.FIREBASE.storage;
    console.info('Using pre-initialized Firebase (window.FIREBASE)');
  } else {
    const FIREBASE_CONFIG = window.FIREBASE_CONFIG || null;
    if (FIREBASE_CONFIG) {
      firebaseApp = initializeApp(FIREBASE_CONFIG);
      try { analytics = getAnalytics(firebaseApp); } catch (e) { /* ignore analytics errors */ }
      db = getFirestore(firebaseApp);
      storage = getStorage(firebaseApp);
      console.info('Firebase initialized (report.js fallback)');
    } else {
      console.info('No FIREBASE_CONFIG found — running in local mode (localStorage only)');
    }
  }
} catch (err) {
  console.error('Firebase init error', err);
}

// Report page logic with image preview, saved list and delete/clear support
(function () {
  const form = document.getElementById('report-form');
  if (!form) return;

  const msg = document.getElementById('report-msg');
  const photoInput = document.getElementById('r-photo');
  const photoPreviewImg = document.getElementById('photo-preview-img');
  const photoPlaceholder = document.getElementById('photo-placeholder');
  const savedContainer = document.getElementById('saved-reports');
  const clearBtn = document.getElementById('clear-reports');

  const STORAGE_KEY = 'reports';

  function showMessage(text, ok = true) {
    if (!msg) return;
    msg.textContent = text;
    msg.style.color = ok ? 'var(--accent)' : '#ff6b6b';
    setTimeout(() => { if (msg) msg.textContent = ''; }, 5000);
  }

  function readImageFile(file) {
    return new Promise((resolve, reject) => {
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read image'));
      reader.readAsDataURL(file);
    });
  }

  // Upload image (dataURL) to Firebase Storage, return public URL
  async function uploadPhotoToFirebase(id, dataUrl) {
    if (!storage || !dataUrl) return null;
    try {
      const storageRef = ref(storage, `reports/${id}.jpg`);
      // uploadString with 'data_url' since we read file as dataURL
      await uploadString(storageRef, dataUrl, 'data_url');
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (err) {
      console.warn('Photo upload failed', err);
      return null;
    }
  }

  // Push report to Firestore and return doc id
  async function pushToFirebase(item) {
    if (!db) {
      console.info('pushToFirebase: no Firestore (db not initialized)');
      return null;
    }
    try {
      console.info('pushToFirebase: uploading item', item);
      let photoUrl = null;
      if (item.photo) {
        photoUrl = await uploadPhotoToFirebase(item.id, item.photo);
        console.info('pushToFirebase: photoUrl', photoUrl);
      }
      const payload = {
        name: item.name,
        email: item.email,
        location: item.location,
        type: item.type,
        description: item.description,
        photo: photoUrl || null,
        createdAt: serverTimestamp(),
        clientId: item.id
      };
      const docRef = await addDoc(collection(db, 'reports'), payload);
      console.info('pushToFirebase: success, docId=', docRef.id);
      return docRef.id;
    } catch (err) {
      console.error('pushToFirebase error', err);
      // surface error in UI
      showMessage('Firebase upload failed: ' + (err.message || err), false);
      return null;
    }
  }

  // If a report had a firebaseDocId saved, remove both Firestore doc and storage object
  async function deleteFromFirebase(firebaseDocId, clientId) {
    if (!db) return;
    try {
      if (firebaseDocId) {
        // delete firestore document
        await deleteDoc(doc(db, 'reports', firebaseDocId));
      }
      if (storage && clientId) {
        // attempt to delete storage object by path reports/{clientId}.jpg
        const sRef = ref(storage, `reports/${clientId}.jpg`);
        try { await deleteObject(sRef); } catch (e) { /* ignore missing file */ }
      }
    } catch (err) {
      console.warn('deleteFromFirebase error', err);
    }
  }

  async function renderSaved() {
    const reports = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]').slice().reverse();
    if (!savedContainer) return;
    savedContainer.innerHTML = '';
    if (!reports.length) {
      savedContainer.innerHTML = '<div class="small">No saved reports</div>';
      return;
    }
    reports.forEach(r => {
      const el = document.createElement('div');
      el.className = 'card';
      el.style.display = 'flex';
      el.style.gap = '10px';
      el.style.alignItems = 'flex-start';

      const left = document.createElement('div');
      left.style.flex = '1';

      const title = document.createElement('div');
      title.innerHTML = `<strong>${escapeHtml(r.type)}</strong> — <span class="small">${escapeHtml(r.location)}</span>`;
      const meta = document.createElement('div');
      meta.className = 'small';
      meta.textContent = `${new Date(r.createdAt).toLocaleString()} • Reported by ${escapeHtml(r.name)}`;

      const desc = document.createElement('div');
      desc.className = 'small';
      desc.style.marginTop = '6px';
      desc.textContent = r.description;

      left.appendChild(title);
      left.appendChild(meta);
      left.appendChild(desc);

      el.appendChild(left);

      if (r.photo) {
        const imgWrap = document.createElement('div');
        imgWrap.style.width = '80px';
        imgWrap.style.flex = '0 0 80px';
        const im = document.createElement('img');
        im.src = r.photo;
        im.alt = 'report photo';
        im.style.width = '80px';
        im.style.height = '60px';
        im.style.objectFit = 'cover';
        im.style.borderRadius = '6px';
        imgWrap.appendChild(im);
        el.appendChild(imgWrap);
      }

      const del = document.createElement('button');
      del.className = 'cta muted';
      del.textContent = 'Delete';
      del.style.marginLeft = '8px';
      del.addEventListener('click', async () => {
        await deleteReport(r.id);
      });

      const right = document.createElement('div');
      right.style.display = 'flex';
      right.style.flexDirection = 'column';
      right.style.gap = '8px';
      right.appendChild(del);
      el.appendChild(right);

      savedContainer.appendChild(el);
    });
  }

  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  async function deleteReport(id) {
    const arr = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const item = arr.find(r => r.id === id);
    const filtered = arr.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    renderSaved();
    showMessage('Report deleted.', true);

    // remove from firebase if present
    if (item && item.firebaseDocId) {
      await deleteFromFirebase(item.firebaseDocId, item.id);
    }
  }

  clearBtn?.addEventListener('click', async () => {
    if (!confirm('Clear all saved reports from this browser?')) return;
    // If firebase used, attempt to delete those docs/objects (best-effort)
    const arr = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (db) {
      for (const it of arr) {
        if (it.firebaseDocId) {
          await deleteFromFirebase(it.firebaseDocId, it.id);
        }
      }
    }
    localStorage.removeItem(STORAGE_KEY);
    renderSaved();
    showMessage('All saved reports cleared.', true);
  });

  photoInput?.addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      if (photoPreviewImg) photoPreviewImg.style.display = 'none';
      if (photoPlaceholder) photoPlaceholder.style.display = '';
      return;
    }
    try {
      const data = await readImageFile(file);
      if (photoPreviewImg) {
        photoPreviewImg.src = data;
        photoPreviewImg.style.display = 'block';
      }
      if (photoPlaceholder) photoPlaceholder.style.display = 'none';
    } catch {
      if (photoPreviewImg) photoPreviewImg.style.display = 'none';
      if (photoPlaceholder) photoPlaceholder.style.display = '';
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('r-name').value.trim();
    const email = document.getElementById('r-email').value.trim();
    const location = document.getElementById('r-location').value.trim();
    const type = document.getElementById('r-type').value.trim();
    const desc = document.getElementById('r-desc').value.trim();
    const photoFile = photoInput.files && photoInput.files[0];

    if (!name || !email || !location || !type || !desc) {
      showMessage('Please complete all required fields.', false);
      return;
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      showMessage('Enter a valid email address.', false);
      return;
    }

    let photoData = null;
    if (photoFile) {
      try { photoData = await readImageFile(photoFile); }
      catch { photoData = null; }
    }

    const reports = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const item = {
      id: Date.now(),
      name, email, location, type, description: desc,
      photo: photoData,
      createdAt: new Date().toISOString(),
      firebaseDocId: null
    };
    reports.push(item);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));

    // Attempt to push to firebase, if initialized
    if (db) {
      try {
        const docId = await pushToFirebase(item);
        if (docId) {
          // persist firebase doc id to local storage record
          const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
          const idx = current.findIndex(r => r.id === item.id);
          if (idx > -1) {
            current[idx].firebaseDocId = docId;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
          }
        }
      } catch (err) {
        console.warn('Firebase push failed, continuing with local save', err);
      }
    }

    form.reset();
    if (photoPreviewImg) photoPreviewImg.style.display = 'none';
    if (photoPlaceholder) photoPlaceholder.style.display = '';

    renderSaved();
    showMessage('Report saved locally. Thank you!', true);
  });

  // Reset button clears form, preview and message
  const resetBtn = document.getElementById('report-reset');
  resetBtn?.addEventListener('click', () => {
    form.reset();
    if (photoPreviewImg) photoPreviewImg.style.display = 'none';
    if (photoPlaceholder) photoPlaceholder.style.display = '';
    if (msg) msg.textContent = '';
    const first = form.querySelector('input, textarea, select, button');
    if (first) first.focus();
  });

  // initial render
  renderSaved();
})();