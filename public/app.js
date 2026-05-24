import { APP_VERSION } from "/version.js?v=2026.05.24.4";

const state = {
  profile: null,
  sessionId: null,
  topic: null,
  topics: [],
  selectedSkillId: null,
  lesson: null,
  mastery: null,
  skills: [],
  currentQuestion: null,
  pendingNextQuestion: null,
  log: []
};

const PROFILE_LIST_KEY = "chemCoachProfiles";
const SELECTED_PROFILE_KEY = "chemCoachSelectedProfile";
const LEGACY_STATE_KEY = "chemCoachState";
const UPDATE_CHECK_INTERVAL_MS = 60_000;
const CLIENT_VERSION = new URL(import.meta.url).searchParams.get("v") || APP_VERSION;
const DEFAULT_PROFILES = [
  { id: "student", name: "Student", role: "Actual learner" },
  { id: "tester", name: "Tester", role: "Sandbox for parent testing" }
];

let pendingUpdateVersion = null;

const els = {
  updateBanner: document.querySelector("#updateBanner"),
  updateMessage: document.querySelector("#updateMessage"),
  updateNowBtn: document.querySelector("#updateNowBtn"),
  guideDialog: document.querySelector("#guideDialog"),
  guideBtn: document.querySelector("#guideBtn"),
  guideCloseBtn: document.querySelector("#guideCloseBtn"),
  profileGate: document.querySelector("#profileGate"),
  profileList: document.querySelector("#profileList"),
  profileForm: document.querySelector("#profileForm"),
  profileNameInput: document.querySelector("#profileNameInput"),
  switchProfileBtn: document.querySelector("#switchProfileBtn"),
  profileBadge: document.querySelector("#profileBadge"),
  envBadge: document.querySelector("#envBadge"),
  versionBadge: document.querySelector("#versionBadge"),
  sessionBadge: document.querySelector("#sessionBadge"),
  topicList: document.querySelector("#topicList"),
  lessonBox: document.querySelector("#lessonBox"),
  restartBtn: document.querySelector("#restartBtn"),
  explainBtn: document.querySelector("#explainBtn"),
  sampleBtn: document.querySelector("#sampleBtn"),
  sessionLog: document.querySelector("#sessionLog"),
  questionTitle: document.querySelector("#questionTitle"),
  questionPrompt: document.querySelector("#questionPrompt"),
  difficultyTag: document.querySelector("#difficultyTag"),
  typeModeBtn: document.querySelector("#typeModeBtn"),
  photoModeBtn: document.querySelector("#photoModeBtn"),
  photoArea: document.querySelector("#photoArea"),
  photoInput: document.querySelector("#photoInput"),
  photoPreview: document.querySelector("#photoPreview"),
  transcriptionBox: document.querySelector("#transcriptionBox"),
  answerInput: document.querySelector("#answerInput"),
  gradeBtn: document.querySelector("#gradeBtn"),
  nextBtn: document.querySelector("#nextBtn"),
  feedbackBox: document.querySelector("#feedbackBox"),
  masteryList: document.querySelector("#masteryList")
};

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || payload.detail || `Request failed: ${response.status}`);
  }
  return payload;
}

function normalizeVersion(version) {
  return String(version ?? "").trim();
}

function renderUpdateBanner(version) {
  pendingUpdateVersion = version;
  els.updateMessage.textContent = `New version available (${version}).`;
  els.updateBanner.classList.remove("hidden");
}

function hideUpdateBanner() {
  pendingUpdateVersion = null;
  els.updateBanner.classList.add("hidden");
  els.updateNowBtn.disabled = false;
  els.updateNowBtn.textContent = "Update";
}

function renderAppVersion() {
  els.versionBadge.textContent = `Version ${CLIENT_VERSION}`;
  els.versionBadge.title = `Current app version ${CLIENT_VERSION}`;
}

async function checkForAppUpdate() {
  try {
    const payload = await api(`/api/version?client=${encodeURIComponent(CLIENT_VERSION)}&t=${Date.now()}`, {
      cache: "no-store"
    });
    const serverVersion = normalizeVersion(payload.version);
    els.envBadge.title = `App version ${CLIENT_VERSION}`;
    if (serverVersion && serverVersion !== CLIENT_VERSION) {
      renderUpdateBanner(serverVersion);
      return;
    }
    hideUpdateBanner();
  } catch {
    els.envBadge.title = `App version ${CLIENT_VERSION}`;
  }
}

async function clearBrowserAppCaches() {
  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
  }

  if ("caches" in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  }
}

async function updateToLatestVersion() {
  if (!pendingUpdateVersion) {
    return;
  }

  const version = pendingUpdateVersion;
  els.updateNowBtn.disabled = true;
  els.updateNowBtn.textContent = "Updating";

  try {
    await clearBrowserAppCaches();
  } catch {
    // A normal reload is still useful if cache APIs are unavailable or blocked.
  } finally {
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("v", version);
    nextUrl.searchParams.set("updatedAt", String(Date.now()));
    window.location.replace(nextUrl.toString());
  }
}

function setupUpdateChecks() {
  renderAppVersion();
  els.updateNowBtn.addEventListener("click", updateToLatestVersion);
  checkForAppUpdate();
  window.setInterval(checkForAppUpdate, UPDATE_CHECK_INTERVAL_MS);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      checkForAppUpdate();
    }
  });
}

function openGuide() {
  if (typeof els.guideDialog.showModal === "function") {
    els.guideDialog.showModal();
    return;
  }
  els.guideDialog.setAttribute("open", "");
}

function closeGuide() {
  if (typeof els.guideDialog.close === "function") {
    els.guideDialog.close();
    return;
  }
  els.guideDialog.removeAttribute("open");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function readJsonStorage(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function getProfiles() {
  const profiles = readJsonStorage(PROFILE_LIST_KEY, null);
  if (!Array.isArray(profiles) || profiles.length === 0) {
    localStorage.setItem(PROFILE_LIST_KEY, JSON.stringify(DEFAULT_PROFILES));
    return [...DEFAULT_PROFILES];
  }
  return profiles;
}

function saveProfiles(profiles) {
  localStorage.setItem(PROFILE_LIST_KEY, JSON.stringify(profiles));
}

function profileStateKey(profileId) {
  return `chemCoachState:${profileId}`;
}

function migrateLegacyState(profileId) {
  if (profileId !== "student") {
    return;
  }
  const legacyState = localStorage.getItem(LEGACY_STATE_KEY);
  const studentKey = profileStateKey(profileId);
  if (legacyState && !localStorage.getItem(studentKey)) {
    localStorage.setItem(studentKey, legacyState);
    localStorage.removeItem(LEGACY_STATE_KEY);
  }
}

function renderProfiles() {
  const profiles = getProfiles();
  els.profileList.innerHTML = profiles
    .map((profile) => {
      const savedState = readJsonStorage(profileStateKey(profile.id), {});
      const savedCount = savedState.mastery ? Object.values(savedState.mastery).filter((score) => Number(score) !== 35).length : 0;
      const progressLabel = savedCount ? `${savedCount} skills have progress` : "No saved progress yet";
      const selected = state.profile?.id === profile.id;
      return `
        <button class="profile-option ${selected ? "selected" : ""}" type="button" data-profile-id="${escapeHtml(profile.id)}">
          <span>
            <strong>${escapeHtml(profile.name)}</strong>
            <span>${escapeHtml(profile.role || progressLabel)} · ${escapeHtml(progressLabel)}</span>
          </span>
          <span>${selected ? "Current" : "Open"}</span>
        </button>
      `;
    })
    .join("");

  for (const button of els.profileList.querySelectorAll("[data-profile-id]")) {
    button.addEventListener("click", () => {
      selectProfile(button.dataset.profileId);
    });
  }
}

function slugifyProfileName(name) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 28);
  return base || `profile-${Date.now()}`;
}

function saveLocalState() {
  if (!state.profile) {
    return;
  }
  localStorage.setItem(
    profileStateKey(state.profile.id),
    JSON.stringify({
      mastery: state.mastery,
      selectedTopicId: state.topic?.id ?? null,
      selectedSkillId: state.selectedSkillId,
      log: state.log.slice(0, 12)
    })
  );
}

function loadLocalState() {
  if (!state.profile) {
    return {};
  }
  return readJsonStorage(profileStateKey(state.profile.id), {});
}

function addLog(title, body) {
  state.log.unshift({ title, body, at: new Date().toLocaleTimeString() });
  state.log = state.log.slice(0, 12);
  saveLocalState();
  renderLog();
}

function renderLesson() {
  const lesson = state.lesson;
  if (!lesson) {
    els.lessonBox.innerHTML = "";
    return;
  }

  els.lessonBox.innerHTML = `
    <div class="lesson-block">
      <h3>Concept</h3>
      <p>${escapeHtml(lesson.short)}</p>
    </div>
    <div class="lesson-block">
      <h3>Example</h3>
      <p>${escapeHtml(lesson.example)}</p>
    </div>
    <div class="lesson-block">
      <h3>Problem-Solving Steps</h3>
      <ol>${lesson.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
    </div>
    <div class="lesson-block">
      <h3>Reminder</h3>
      <p>${escapeHtml(lesson.keyReminder)}</p>
    </div>
  `;
}

function masteryLevel(score) {
  if (score >= 85) {
    return { label: "Mastered", className: "mastered" };
  }
  if (score >= 60) {
    return { label: "Practising", className: "practising" };
  }
  return { label: "Needs work", className: "needs-work" };
}

function topicAverage(topic) {
  const mastery = state.mastery ?? {};
  const values = topic.skillIds.map((skillId) => Number(mastery[skillId] ?? 35));
  return Math.round(values.reduce((sum, score) => sum + score, 0) / Math.max(1, values.length));
}

function renderTopicMap() {
  if (!state.topic || !state.skills.length) {
    els.topicList.innerHTML = "";
    return;
  }

  const average = topicAverage(state.topic);
  const topicLevel = masteryLevel(average);
  const skillLookup = new Map(state.skills.map((skill) => [skill.id, skill]));
  const topicButtons = (state.topics.length ? state.topics : [state.topic])
    .map((topic) => {
      const score = topicAverage(topic);
      const level = masteryLevel(score);
      const selected = state.topic?.id === topic.id;
      return `
        <button class="topic-option module-option ${selected ? "selected" : ""}" type="button" data-topic-id="${escapeHtml(topic.id)}">
          <span class="traffic-light ${level.className}" aria-hidden="true"></span>
          <span>
            <strong>${escapeHtml(topic.title)}</strong>
            <span>${escapeHtml(topic.summary)}</span>
          </span>
          <span class="topic-score">${score}%</span>
        </button>
      `;
    })
    .join("");
  const skillButtons = state.topic.skillIds
    .map((skillId) => {
      const skill = skillLookup.get(skillId);
      if (!skill) {
        return "";
      }
      const score = Number(state.mastery?.[skillId] ?? 35);
      const level = masteryLevel(score);
      const selected = state.selectedSkillId === skillId;
      return `
        <button class="topic-option skill-option ${selected ? "selected" : ""}" type="button" data-skill-id="${escapeHtml(skillId)}">
          <span class="traffic-light ${level.className}" aria-hidden="true"></span>
          <span>
            <strong>${escapeHtml(skill.label)}</strong>
            <span>${escapeHtml(skill.description)}</span>
          </span>
          <span class="topic-score">${score}%</span>
        </button>
      `;
    })
    .join("");

  els.topicList.innerHTML = `
    <div class="topic-subtitle">Modules</div>
    ${topicButtons}
    <div class="topic-subtitle">Sub-skills</div>
    <button class="topic-option module-option ${state.selectedSkillId ? "" : "selected"}" type="button" data-current-topic-id="${escapeHtml(state.topic.id)}">
      <span class="traffic-light ${topicLevel.className}" aria-hidden="true"></span>
      <span>
        <strong>All ${escapeHtml(state.topic.title)}</strong>
        <span>Use this to diagnose and practise the whole module.</span>
      </span>
      <span class="topic-score">${average}%</span>
    </button>
    ${skillButtons}
  `;

  for (const button of els.topicList.querySelectorAll("[data-topic-id]")) {
    button.addEventListener("click", () => {
      startSession({ topicId: button.dataset.topicId, selectedSkillId: null, reset: false }).catch((error) => {
        els.lessonBox.textContent = error.message;
      });
    });
  }

  const currentModuleButton = els.topicList.querySelector("[data-current-topic-id]");
  currentModuleButton?.addEventListener("click", () => {
    startSession({ topicId: state.topic.id, selectedSkillId: null, reset: false }).catch((error) => {
      els.lessonBox.textContent = error.message;
    });
  });

  for (const button of els.topicList.querySelectorAll("[data-skill-id]")) {
    button.addEventListener("click", () => {
      startSession({ topicId: state.topic.id, selectedSkillId: button.dataset.skillId, reset: false }).catch((error) => {
        els.lessonBox.textContent = error.message;
      });
    });
  }
}

function renderQuestion() {
  const question = state.currentQuestion;
  if (!question) {
    return;
  }

  els.questionTitle.textContent = question.title;
  els.questionPrompt.textContent = question.prompt;
  els.difficultyTag.textContent = question.difficulty;
  els.answerInput.value = "";
  els.feedbackBox.classList.add("hidden");
  els.transcriptionBox.classList.add("hidden");
  els.photoPreview.classList.add("hidden");
  els.photoInput.value = "";
  els.nextBtn.disabled = true;
  state.pendingNextQuestion = null;
}

function renderMastery() {
  const mastery = state.mastery ?? {};
  const topicSkillIds = new Set(state.topic?.skillIds ?? []);
  const displayedSkills = topicSkillIds.size ? state.skills.filter((skill) => topicSkillIds.has(skill.id)) : state.skills;
  els.masteryList.innerHTML = displayedSkills
    .map((skill) => {
      const score = Number(mastery[skill.id] ?? 35);
      const level = score >= 75 ? "high" : score >= 50 ? "mid" : "low";
      const lamp = masteryLevel(score);
      return `
        <div class="skill-row">
          <div class="skill-top">
            <span class="skill-label"><span class="traffic-light ${lamp.className}" aria-hidden="true"></span>${escapeHtml(skill.label)}</span>
            <span class="skill-score">${score}%</span>
          </div>
          <div class="bar" title="${escapeHtml(skill.description)}">
            <div class="bar-fill ${level}" style="width: ${Math.max(4, Math.min(100, score))}%"></div>
          </div>
        </div>
      `;
    })
    .join("");
  renderTopicMap();
}

function renderLog() {
  els.sessionLog.innerHTML = state.log
    .map(
      (item) => `
        <div class="log-item">
          <strong>${escapeHtml(item.title)} · ${escapeHtml(item.at)}</strong>
          <span>${escapeHtml(item.body)}</span>
        </div>
      `
    )
    .join("");
}

function renderFeedback(payload) {
  const { grade, warning } = payload;
  const correct = grade.correct_points.length
    ? grade.correct_points.map((item) => `<li>${escapeHtml(item)}</li>`).join("")
    : "<li>No clear rubric points were met yet.</li>";
  const missing = grade.missing_points.length
    ? grade.missing_points.map((item) => `<li>${escapeHtml(item)}</li>`).join("")
    : "<li>No obvious missing points.</li>";

  els.feedbackBox.innerHTML = `
    <h3>Grading Result <span class="score">${grade.score}/${grade.max_score}</span></h3>
    <p>${escapeHtml(grade.feedback_to_student)}</p>
    ${warning ? `<p>OpenAI was unavailable, so local grading rules were used: ${escapeHtml(warning)}</p>` : ""}
    <div class="feedback-grid">
      <div>
        <p><strong>What went well</strong></p>
        <ul class="feedback-list">${correct}</ul>
      </div>
      <div>
        <p><strong>Needs strengthening</strong></p>
        <ul class="feedback-list">${missing}</ul>
      </div>
    </div>
    <p><strong>Next step:</strong> ${escapeHtml(grade.next_action)}</p>
  `;
  els.feedbackBox.classList.remove("hidden");
}

function setAnswerMode(mode) {
  const photo = mode === "photo";
  els.photoArea.classList.toggle("hidden", !photo);
  els.photoModeBtn.classList.toggle("active", photo);
  els.typeModeBtn.classList.toggle("active", !photo);
}

async function compressImage(file) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });

  const maxSide = 1600;
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.86);
}

async function startSession(options = {}) {
  const reset = typeof options === "boolean" ? options : Boolean(options.reset);
  if (!state.profile) {
    return;
  }
  const local = reset ? {} : loadLocalState();
  const selectedTopicId =
    typeof options === "object" && "topicId" in options
      ? options.topicId
      : state.topic?.id ?? local.selectedTopicId ?? "sec1_foundations";
  const selectedSkillId = typeof options === "object" && "selectedSkillId" in options ? options.selectedSkillId : state.selectedSkillId;
  const effectiveTopicId = selectedTopicId || "sec1_foundations";
  const effectiveSkillId = reset ? null : selectedSkillId;
  const payload = await api("/api/session/start", {
    method: "POST",
    body: JSON.stringify({
      topicId: effectiveTopicId,
      skillId: effectiveSkillId,
      studentId: state.profile.id,
      studentName: state.profile.name
    })
  });
  const topicsPayload = await api("/api/topics");

  state.sessionId = payload.sessionId;
  state.topic = payload.topic;
  state.topics = topicsPayload.topics;
  state.selectedSkillId = payload.topic.skillIds.includes(effectiveSkillId) ? effectiveSkillId : null;
  state.lesson = payload.lesson;
  state.skills = topicsPayload.skills;
  state.mastery = { ...payload.mastery, ...(local.mastery || {}) };
  state.currentQuestion = payload.question;
  state.log = local.log || [];

  els.envBadge.textContent = "Worker";
  els.profileBadge.textContent = state.profile.name;
  els.sessionBadge.textContent = `Session ${state.sessionId.slice(0, 8)}`;
  renderLesson();
  renderQuestion();
  renderTopicMap();
  renderMastery();
  renderLog();

  if (reset) {
    addLog("Restarted", `Reset to the diagnostic question for ${state.topic.title}.`);
  } else if (!state.log.length) {
    addLog("Session started", "Start with a short diagnostic, then the tutor will teach and practise based on the answer.");
  }
}

async function selectProfile(profileId) {
  const profiles = getProfiles();
  const profile = profiles.find((item) => item.id === profileId) ?? profiles[0];
  if (state.profile?.id === profile.id && state.sessionId) {
    els.profileGate.classList.add("hidden");
    return;
  }
  state.profile = profile;
  localStorage.setItem(SELECTED_PROFILE_KEY, profile.id);
  migrateLegacyState(profile.id);
  els.profileGate.classList.add("hidden");
  const local = loadLocalState();
  await startSession({ topicId: local.selectedTopicId ?? "sec1_foundations", selectedSkillId: local.selectedSkillId ?? null, reset: false });
}

async function addProfile(name) {
  const trimmed = name.trim();
  if (!trimmed) {
    return;
  }
  const profiles = getProfiles();
  const baseId = slugifyProfileName(trimmed);
  let id = baseId;
  let suffix = 2;
  while (profiles.some((profile) => profile.id === id)) {
    id = `${baseId}-${suffix}`;
    suffix += 1;
  }
  const profile = { id, name: trimmed, role: "Custom profile" };
  profiles.push(profile);
  saveProfiles(profiles);
  renderProfiles();
  els.profileNameInput.value = "";
  await selectProfile(profile.id);
}

async function handlePhotoUpload(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  els.transcriptionBox.classList.remove("hidden");
  els.transcriptionBox.textContent = "Compressing and reading the photo...";
  els.gradeBtn.disabled = true;

  try {
    const imageDataUrl = await compressImage(file);
    els.photoPreview.src = imageDataUrl;
    els.photoPreview.classList.remove("hidden");

    const payload = await api("/api/answer/transcribe-photo", {
      method: "POST",
      body: JSON.stringify({
        questionId: state.currentQuestion.id,
        imageDataUrl
      })
    });

    const transcription = payload.transcription;
    els.answerInput.value = transcription.recognized_answer;
    els.transcriptionBox.innerHTML = `
      <strong>The transcription has been filled into the answer box.</strong><br />
      ${escapeHtml(transcription.uncertain_parts.join(" ") || "No clearly uncertain parts.")}
    `;
    addLog("Photo transcription", transcription.source === "demo" ? "Using the demo transcription because no OpenAI key is configured yet." : "The handwritten answer was read. Confirm it before grading.");
  } catch (error) {
    els.transcriptionBox.textContent = error.message;
  } finally {
    els.gradeBtn.disabled = false;
  }
}

async function handleGrade() {
  const answerText = els.answerInput.value.trim();
  if (!answerText) {
    els.answerInput.focus();
    return;
  }

  els.gradeBtn.disabled = true;
  els.gradeBtn.textContent = "Grading";

  try {
    const payload = await api("/api/answer/grade", {
      method: "POST",
      body: JSON.stringify({
        sessionId: state.sessionId,
        questionId: state.currentQuestion.id,
        answerText,
        mastery: state.mastery
      })
    });

    state.mastery = payload.mastery;
    state.pendingNextQuestion = payload.nextQuestion;
    renderFeedback(payload);
    renderMastery();
    renderTopicMap();
    saveLocalState();
    els.nextBtn.disabled = false;
    addLog("Grading complete", `${state.currentQuestion.title}: ${payload.grade.score}/${payload.grade.max_score}`);
  } catch (error) {
    els.feedbackBox.innerHTML = `<p>${escapeHtml(error.message)}</p>`;
    els.feedbackBox.classList.remove("hidden");
  } finally {
    els.gradeBtn.disabled = false;
    els.gradeBtn.textContent = "Submit for Grading";
  }
}

function handleNextQuestion() {
  if (!state.pendingNextQuestion) {
    return;
  }
  state.currentQuestion = state.pendingNextQuestion;
  renderQuestion();
  addLog("Next question", `Moved to ${state.currentQuestion.title}.`);
}

function fillSampleAnswer() {
  const samples = {
    sec1_diag_001:
      "Particles move randomly and move faster when warm, so diffusion is faster. Mg2+ and Cl- form MgCl2 because two Cl- ions balance one Mg2+. This is neutralisation, forming sodium chloride and water.",
    sec1_lab_001:
      "Use a pipette because it measures a fixed 25.0 cm3 volume more accurately than a beaker or measuring cylinder.",
    sec1_particles_001:
      "Smell particles move randomly. In a warm room they have more kinetic energy and move faster, so diffusion is faster.",
    sec1_bonding_001:
      "MgCl2. One Mg2+ ion needs two Cl- ions to make the total charge zero. This is ionic bonding.",
    sec1_equations_001: "2Mg + O2 -> 2MgO",
    sec1_acid_base_001:
      "This is neutralisation. Hydrochloric acid + sodium hydroxide -> sodium chloride + water.",
    sec1_observation_001:
      "Bubbles forming and magnesium disappearing are observations. The gas is hydrogen. A lighted splint gives a squeaky pop.",
    ppt_concept_001: "A precipitate is an insoluble solid formed when ions in aqueous solutions react.",
    ppt_concept_bridge_001:
      "The cloudy white solid is the precipitate. It shows an insoluble product formed.",
    ppt_agcl_001:
      "Observation: white precipitate forms. AgNO3(aq) + NaCl(aq) -> AgCl(s) + NaNO3(aq). Net ionic: Ag+(aq) + Cl-(aq) -> AgCl(s).",
    ppt_solubility_001: "Yes, a precipitate forms. It is BaSO4(s), barium sulfate.",
    ppt_formulae_001: "PbI2(s), because Pb2+ needs two I- ions to balance the charge.",
    ppt_balance_001: "Pb(NO3)2(aq) + 2KI(aq) -> PbI2(s) + 2KNO3(aq)",
    ppt_states_001: "CaCl2(aq) + Na2CO3(aq) -> CaCO3(s) + 2NaCl(aq)",
    ppt_spectators_001: "Na+ and Cl- are spectator ions because they remain aqueous and unchanged.",
    ppt_ionic_001: "Ba2+(aq) + SO4^2-(aq) -> BaSO4(s)",
    ppt_observation_001: "Ag+ is likely present. The precipitate is AgCl, which dissolves in excess ammonia.",
    ppt_mixed_001:
      "White precipitate forms. CaCl2(aq) + Na2CO3(aq) -> CaCO3(s) + 2NaCl(aq). Net ionic: Ca2+(aq) + CO3^2-(aq) -> CaCO3(s). Spectator ions: Na+ and Cl-."
  };
  els.answerInput.value = samples[state.currentQuestion.id] || "";
  els.answerInput.focus();
}

function explainAgain() {
  const message =
    state.topic?.id === "sec1_foundations"
      ? "For Sec 1 foundations, first name the rule: particles explain matter, charges explain formulae, and observations support inferences."
      : "Think of precipitation as ions meeting in water and forming a solid that can no longer stay dissolved.";
  addLog(
    "Explained differently",
    message
  );
}

els.typeModeBtn.addEventListener("click", () => setAnswerMode("type"));
els.photoModeBtn.addEventListener("click", () => setAnswerMode("photo"));
els.photoInput.addEventListener("change", handlePhotoUpload);
els.gradeBtn.addEventListener("click", handleGrade);
els.nextBtn.addEventListener("click", handleNextQuestion);
els.sampleBtn.addEventListener("click", fillSampleAnswer);
els.explainBtn.addEventListener("click", explainAgain);
els.guideBtn.addEventListener("click", openGuide);
els.guideCloseBtn.addEventListener("click", closeGuide);
els.guideDialog.addEventListener("click", (event) => {
  if (event.target === els.guideDialog) {
    closeGuide();
  }
});
els.restartBtn.addEventListener("click", () => {
  if (state.profile) {
    localStorage.removeItem(profileStateKey(state.profile.id));
  }
  startSession({ selectedSkillId: null, reset: true }).catch((error) => {
    els.lessonBox.textContent = error.message;
  });
});
els.switchProfileBtn.addEventListener("click", () => {
  renderProfiles();
  els.profileGate.classList.remove("hidden");
});
els.profileForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addProfile(els.profileNameInput.value).catch((error) => {
    els.profileNameInput.setCustomValidity(error.message);
    els.profileNameInput.reportValidity();
    els.profileNameInput.setCustomValidity("");
  });
});

renderProfiles();
setupUpdateChecks();
const selectedProfileId = localStorage.getItem(SELECTED_PROFILE_KEY);
if (selectedProfileId && getProfiles().some((profile) => profile.id === selectedProfileId)) {
  selectProfile(selectedProfileId).catch((error) => {
    els.lessonBox.textContent = error.message;
  });
} else {
  els.profileGate.classList.remove("hidden");
}
