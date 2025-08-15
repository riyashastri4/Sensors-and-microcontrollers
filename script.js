
/* script.js (ES modules) — Firestore-only program sharing */

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBgr4yFrnxNBxxRlsvcg_iocMNrWTQebgc",
  authDomain: "sensors-and-microcontrollers.firebaseapp.com",
  projectId: "sensors-and-microcontrollers",
  storageBucket: "sensors-and-microcontrollers.firebasestorage.app",
  messagingSenderId: "828861970951",
  appId: "1:828861970951:web:d037f5c8883c538ae348a2",
  measurementId: "G-FY2C840CJM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===== DOM refs =====
const searchInput = document.getElementById("searchInput");
const languageFilter = document.getElementById("languageFilter");
const sortSelect = document.getElementById("sortSelect");
const cards = document.getElementById("cards");
const emptyState = document.getElementById("emptyState");

const uploadForm = document.getElementById("uploadForm");
const titleEl = document.getElementById("title");
const descEl = document.getElementById("description");
const langEl = document.getElementById("language");
const tagsEl = document.getElementById("tags");
const codeEl = document.getElementById("code");

const detailModal = document.getElementById("detailModal");
const closeModalBtn = document.getElementById("closeModal");
const modalTitle = document.getElementById("modalTitle");
const modalDesc = document.getElementById("modalDesc");
const modalMeta = document.getElementById("modalMeta");
const modalCode = document.getElementById("modalCode");

let cache = [];

// ===== Create =====
uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = titleEl.value.trim();
  const description = descEl.value.trim();
  const language = langEl.value.trim();
  const tags = tagsEl.value.split(",").map(t => t.trim()).filter(Boolean);
  const code = codeEl.value;

  if (!title || !description || !language || !code) return;

  const docData = {
    title,
    description,
    language,
    tags,
    code,
    createdAt: serverTimestamp(),
  };

  try {
    await addDoc(collection(db, "programs"), docData);
    uploadForm.reset();
    await loadPrograms();
    document.getElementById("listSection").scrollIntoView({ behavior: "smooth" });
  } catch (err) {
    alert("Failed to upload: " + err.message);
  }
});

// ===== Read (fetch & render) =====
async function loadPrograms() {
  const q = query(collection(db, "programs"), orderBy("createdAt", "desc"), limit(200));
  const snap = await getDocs(q);
  cache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  render();
}

// ===== Render list with filters =====
function render() {
  const q = (searchInput.value || "").toLowerCase();
  const lang = (languageFilter.value || "").toLowerCase();
  const sort = sortSelect.value;

  let items = cache.filter(item => {
    const hay = `${item.title} ${item.description} ${(item.tags || []).join(" ")}`.toLowerCase();
    const matchesText = hay.includes(q);
    const matchesLang = !lang || (item.language || "").toLowerCase() === lang;
    return matchesText && matchesLang;
  });

  if (sort === "old") items.sort((a,b) => (a.createdAt?.seconds||0) - (b.createdAt?.seconds||0));
  if (sort === "title") items.sort((a,b) => a.title.localeCompare(b.title));

  cards.innerHTML = "";

  if (!items.length) {
    emptyState.classList.remove("hidden");
    return;
  }
  emptyState.classList.add("hidden");

  for (const item of items) {
    const card = document.createElement("article");
    card.className = "group bg-white/80 border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition";

    const tags = (item.tags || []).map(t => `<span class=\"px-2 py-0.5 text-xs rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100\">${escapeHtml(t)}</span>`).join(" ");

    card.innerHTML = `
      <div class="flex items-start justify-between gap-3">
        <div>
          <h4 class="text-lg font-semibold text-slate-800">${escapeHtml(item.title)}</h4>
          <p class="text-sm text-slate-500">${escapeHtml(item.language)}</p>
        </div>
        <button class="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm">View</button>
      </div>
      <p class="mt-3 text-sm text-slate-600 line-clamp-3">${escapeHtml(item.description)}</p>
      <div class="mt-3 flex flex-wrap gap-2">${tags}</div>
    `;

    const viewBtn = card.querySelector("button");
    viewBtn.addEventListener("click", () => openModal(item));

    cards.appendChild(card);
  }
}

// ===== Modal =====
function openModal(item) {
  modalTitle.textContent = item.title;
  modalDesc.textContent = item.description;
  const meta = [item.language, ...(item.tags||[])].filter(Boolean).join(" • ");
  modalMeta.textContent = meta;

  const langClass = languageToPrism(item.language);
  modalCode.className = langClass;
  modalCode.textContent = item.code;

  if (window.Prism && Prism.highlightElement) {
    Prism.highlightElement(modalCode);
  }

  detailModal.showModal();
}

closeModalBtn.addEventListener("click", () => detailModal.close());

// ===== Helpers =====
function escapeHtml(s = "") {
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function languageToPrism(lang = "") {
  const m = lang.toLowerCase();
  if (m.includes("python")) return "language-python";
  if (m.includes("c++")) return "language-cpp";
  if (m === "c") return "language-c";
  if (m.includes("java")) return "language-java";
  if (m.includes("typescript")) return "language-ts";
  if (m.includes("javascript") || m === "js") return "language-javascript";
  if (m.includes("go")) return "language-go";
  if (m.includes("rust")) return "language-rust";
  if (m.includes("html")) return "language-markup";
  if (m.includes("css")) return "language-css";
  return "language-clike";
}

// ===== Events =====
searchInput.addEventListener("input", render);
languageFilter.addEventListener("change", render);
sortSelect.addEventListener("change", render);

// Init
loadPrograms();
