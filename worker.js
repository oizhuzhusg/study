import { defaultMastery, lessons, skills, topics } from "./src/shared/topics.js";
import { firstQuestionForSkill, firstQuestionForTopic, getQuestion, nextQuestionForWeakSkills, questions } from "./src/shared/questions.js";
import { applyMasteryUpdates, gradeAnswerFallback } from "./src/worker/grading.js";
import { gradeAnswerWithOpenAI, transcribeAnswerPhoto } from "./src/worker/openai.js";
import { APP_VERSION } from "./public/version.js";

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: JSON_HEADERS
  });
}

function notFound() {
  return json({ error: "Not found" }, 404);
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function publicQuestion(question) {
  if (!question) {
    return null;
  }
  return {
    id: question.id,
    topicId: question.topicId,
    type: question.type,
    difficulty: question.difficulty,
    title: question.title,
    prompt: question.prompt,
    focusSkills: question.focusSkills,
    rubricCount: question.rubric.length
  };
}

function validateImageDataUrl(imageDataUrl) {
  if (typeof imageDataUrl !== "string" || !imageDataUrl.startsWith("data:image/")) {
    return "Please upload a PNG, JPEG, WEBP, or GIF image.";
  }
  if (imageDataUrl.length > 7_000_000) {
    return "The image is too large. Please crop or compress it and try again.";
  }
  return null;
}

async function maybeSaveAttempt(env, attempt) {
  if (!env.DB) {
    return;
  }

  await env.DB.prepare(
    "INSERT INTO attempts (id, session_id, question_id, answer_text, score, max_score, weak_skills) VALUES (?, ?, ?, ?, ?, ?, ?)"
  )
    .bind(
      attempt.id,
      attempt.sessionId,
      attempt.questionId,
      attempt.answerText,
      attempt.score,
      attempt.maxScore,
      JSON.stringify(attempt.weakSkills)
    )
    .run();
}

async function routeApi(request, env, ctx) {
  const url = new URL(request.url);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  if (url.pathname === "/api/health") {
    return json({
      ok: true,
      app: "chem-coach",
      version: APP_VERSION,
      env: env.APP_ENV || "local",
      openaiConfigured: Boolean(env.OPENAI_API_KEY),
      openaiModel: env.OPENAI_MODEL || "gpt-4.1-nano"
    });
  }

  if (url.pathname === "/api/version" && request.method === "GET") {
    return json({
      version: APP_VERSION,
      checkedAt: new Date().toISOString()
    });
  }

  if (url.pathname === "/api/topics" && request.method === "GET") {
    return json({ topics, skills, lessons });
  }

  if (url.pathname === "/api/session/start" && request.method === "POST") {
    const body = await readJson(request);
    const topicId = body.topicId || "precipitation_reactions";
    const topic = topics.find((item) => item.id === topicId);
    if (!topic) {
      return json({ error: `Unknown topic: ${topicId}` }, 400);
    }

    const firstQuestion = body.skillId ? firstQuestionForSkill(body.skillId, topicId) : firstQuestionForTopic(topicId);
    return json({
      sessionId: crypto.randomUUID(),
      topic,
      lesson: lessons[topicId],
      mastery: defaultMastery(),
      question: publicQuestion(firstQuestion)
    });
  }

  if (url.pathname === "/api/tutor/explain" && request.method === "POST") {
    const body = await readJson(request);
    const topicId = body.topicId || "precipitation_reactions";
    const lesson = lessons[topicId];
    if (!lesson) {
      return json({ error: `Unknown lesson: ${topicId}` }, 400);
    }

    return json({
      explanation: lesson.short,
      example: lesson.example,
      steps: lesson.steps,
      keyReminder: lesson.keyReminder
    });
  }

  if (url.pathname === "/api/question/next" && request.method === "POST") {
    const body = await readJson(request);
    const next = nextQuestionForWeakSkills(body.weakSkills ?? [], body.answeredQuestionId ?? null);
    return json({ question: publicQuestion(next) });
  }

  if (url.pathname === "/api/answer/transcribe-photo" && request.method === "POST") {
    const body = await readJson(request);
    const question = getQuestion(body.questionId);
    if (!question) {
      return json({ error: `Unknown question: ${body.questionId}` }, 400);
    }

    const imageError = validateImageDataUrl(body.imageDataUrl);
    if (imageError) {
      return json({ error: imageError }, 400);
    }

    try {
      const transcription = await transcribeAnswerPhoto(env, question, body.imageDataUrl);
      return json({ transcription });
    } catch (error) {
      return json(
        {
          error: "Photo analysis failed.",
          detail: error instanceof Error ? error.message : String(error)
        },
        502
      );
    }
  }

  if (url.pathname === "/api/answer/grade" && request.method === "POST") {
    const body = await readJson(request);
    const question = getQuestion(body.questionId);
    if (!question) {
      return json({ error: `Unknown question: ${body.questionId}` }, 400);
    }
    if (typeof body.answerText !== "string" || !body.answerText.trim()) {
      return json({ error: "Answer text is required." }, 400);
    }

    let grade;
    let warning = null;
    try {
      grade = await gradeAnswerWithOpenAI(env, question, body.answerText);
    } catch (error) {
      warning = error instanceof Error ? error.message : String(error);
      grade = gradeAnswerFallback(question.id, body.answerText);
    }

    const currentMastery = body.mastery && typeof body.mastery === "object" ? body.mastery : defaultMastery();
    const updatedMastery = applyMasteryUpdates(currentMastery, grade.mastery_updates);
    const nextQuestion = getQuestion(grade.next_question_id) ?? nextQuestionForWeakSkills(grade.weak_skills, question.id);

    ctx.waitUntil(
      maybeSaveAttempt(env, {
        id: crypto.randomUUID(),
        sessionId: body.sessionId || "local-session",
        questionId: question.id,
        answerText: body.answerText,
        score: grade.score,
        maxScore: grade.max_score,
        weakSkills: grade.weak_skills
      })
    );

    return json({
      grade,
      warning,
      mastery: updatedMastery,
      nextQuestion: publicQuestion(nextQuestion)
    });
  }

  if (url.pathname === "/api/mastery" && request.method === "GET") {
    return json({ mastery: defaultMastery(), skills });
  }

  if (url.pathname === "/api/questions" && request.method === "GET") {
    return json({ questions: questions.map(publicQuestion) });
  }

  return notFound();
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      return routeApi(request, env, ctx);
    }
    return env.ASSETS.fetch(request);
  }
};
