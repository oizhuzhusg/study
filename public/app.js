const state = {
  sessionId: null,
  topic: null,
  lesson: null,
  mastery: null,
  skills: [],
  currentQuestion: null,
  pendingNextQuestion: null,
  log: []
};

const els = {
  envBadge: document.querySelector("#envBadge"),
  sessionBadge: document.querySelector("#sessionBadge"),
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

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function saveLocalState() {
  localStorage.setItem(
    "chemCoachState",
    JSON.stringify({
      mastery: state.mastery,
      log: state.log.slice(0, 12)
    })
  );
}

function loadLocalState() {
  try {
    return JSON.parse(localStorage.getItem("chemCoachState") || "{}");
  } catch {
    return {};
  }
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
      <h3>概念</h3>
      <p>${escapeHtml(lesson.short)}</p>
    </div>
    <div class="lesson-block">
      <h3>例子</h3>
      <p>${escapeHtml(lesson.example)}</p>
    </div>
    <div class="lesson-block">
      <h3>解题步骤</h3>
      <ol>${lesson.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
    </div>
    <div class="lesson-block">
      <h3>提醒</h3>
      <p>${escapeHtml(lesson.keyReminder)}</p>
    </div>
  `;
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
  els.masteryList.innerHTML = state.skills
    .map((skill) => {
      const score = Number(mastery[skill.id] ?? 35);
      const level = score >= 75 ? "high" : score >= 50 ? "mid" : "low";
      return `
        <div class="skill-row">
          <div class="skill-top">
            <span class="skill-label">${escapeHtml(skill.label)}</span>
            <span class="skill-score">${score}%</span>
          </div>
          <div class="bar" title="${escapeHtml(skill.description)}">
            <div class="bar-fill ${level}" style="width: ${Math.max(4, Math.min(100, score))}%"></div>
          </div>
        </div>
      `;
    })
    .join("");
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
    : "<li>还没有明显命中的评分点。</li>";
  const missing = grade.missing_points.length
    ? grade.missing_points.map((item) => `<li>${escapeHtml(item)}</li>`).join("")
    : "<li>没有明显缺失。</li>";

  els.feedbackBox.innerHTML = `
    <h3>批改结果 <span class="score">${grade.score}/${grade.max_score}</span></h3>
    <p>${escapeHtml(grade.feedback_to_student)}</p>
    ${warning ? `<p>OpenAI 暂不可用，已使用本地规则批改：${escapeHtml(warning)}</p>` : ""}
    <div class="feedback-grid">
      <div>
        <p><strong>做对的部分</strong></p>
        <ul class="feedback-list">${correct}</ul>
      </div>
      <div>
        <p><strong>需要加强</strong></p>
        <ul class="feedback-list">${missing}</ul>
      </div>
    </div>
    <p><strong>下一步：</strong>${escapeHtml(grade.next_action)}</p>
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

async function startSession(reset = false) {
  const local = reset ? {} : loadLocalState();
  const payload = await api("/api/session/start", {
    method: "POST",
    body: JSON.stringify({ topicId: "precipitation_reactions" })
  });
  const topicsPayload = await api("/api/topics");

  state.sessionId = payload.sessionId;
  state.topic = payload.topic;
  state.lesson = payload.lesson;
  state.skills = topicsPayload.skills;
  state.mastery = local.mastery || payload.mastery;
  state.currentQuestion = payload.question;
  state.log = local.log || [];

  els.envBadge.textContent = "Worker";
  els.sessionBadge.textContent = `Session ${state.sessionId.slice(0, 8)}`;
  renderLesson();
  renderQuestion();
  renderMastery();
  renderLog();

  if (reset) {
    addLog("重新开始", "已重置到 Precipitation Reactions 的诊断题。");
  } else if (!state.log.length) {
    addLog("开始学习", "先做一个短诊断，再根据答案补讲和补题。");
  }
}

async function handlePhotoUpload(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  els.transcriptionBox.classList.remove("hidden");
  els.transcriptionBox.textContent = "正在压缩并识别照片...";
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
      <strong>识别结果已填入答案框。</strong><br />
      ${escapeHtml(transcription.uncertain_parts.join(" ") || "没有明显不确定区域。")}
    `;
    addLog("照片识别", transcription.source === "demo" ? "当前使用 demo 识别结果；配置 OpenAI key 后会读取真实手写答案。" : "已读取手写答案，请确认后提交批改。");
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
  els.gradeBtn.textContent = "批改中";

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
    saveLocalState();
    els.nextBtn.disabled = false;
    addLog("完成批改", `${state.currentQuestion.title}: ${payload.grade.score}/${payload.grade.max_score}`);
  } catch (error) {
    els.feedbackBox.innerHTML = `<p>${escapeHtml(error.message)}</p>`;
    els.feedbackBox.classList.remove("hidden");
  } finally {
    els.gradeBtn.disabled = false;
    els.gradeBtn.textContent = "提交批改";
  }
}

function handleNextQuestion() {
  if (!state.pendingNextQuestion) {
    return;
  }
  state.currentQuestion = state.pendingNextQuestion;
  renderQuestion();
  addLog("下一题", `进入 ${state.currentQuestion.title}。`);
}

function fillSampleAnswer() {
  const samples = {
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
  addLog(
    "换一种方式讲",
    "Think of precipitation as ions meeting in water and forming a solid that can no longer stay dissolved."
  );
}

els.typeModeBtn.addEventListener("click", () => setAnswerMode("type"));
els.photoModeBtn.addEventListener("click", () => setAnswerMode("photo"));
els.photoInput.addEventListener("change", handlePhotoUpload);
els.gradeBtn.addEventListener("click", handleGrade);
els.nextBtn.addEventListener("click", handleNextQuestion);
els.sampleBtn.addEventListener("click", fillSampleAnswer);
els.explainBtn.addEventListener("click", explainAgain);
els.restartBtn.addEventListener("click", () => {
  localStorage.removeItem("chemCoachState");
  startSession(true).catch((error) => {
    els.lessonBox.textContent = error.message;
  });
});

startSession().catch((error) => {
  els.lessonBox.textContent = error.message;
});
