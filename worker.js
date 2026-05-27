import { defaultMastery, lessons, skills, topics } from "./src/shared/topics.js";
import { firstQuestionForSkill, firstQuestionForTopic, getQuestion, nextQuestionForWeakSkills, normalizeTopicId, questions } from "./src/shared/questions.js";
import { materialContextForSkills, materialIndex } from "./src/shared/materials-index.js";
import { applyMasteryUpdates, gradeAnswerFallback, gradeWithRules } from "./src/worker/grading.js";
import { generateQuestionVariant, gradeAnswerWithOpenAI, transcribeAnswerPhoto } from "./src/worker/openai.js";
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
  const base = {
    id: question.id,
    topicId: question.topicId,
    type: question.type,
    difficulty: question.difficulty,
    title: question.title,
    prompt: question.prompt,
    focusSkills: question.focusSkills,
    rubricCount: question.rubric.length
  };
  if (!question.generated) {
    return base;
  }
  return {
    ...base,
    generated: true,
    referenceQuestionId: question.referenceQuestionId,
    expectedAnswer: question.expectedAnswer,
    rubric: question.rubric
  };
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function uniqueStrings(values) {
  return Array.from(new Set(values.filter((value) => typeof value === "string" && value.trim()).map((value) => value.trim())));
}

function normalizeGeneratedRubric(rawRubric, referenceQuestion) {
  const fallbackRubric = referenceQuestion.rubric ?? [];
  if (!Array.isArray(rawRubric)) {
    return fallbackRubric;
  }
  const fallbackSkills = uniqueStrings([
    ...(referenceQuestion.focusSkills ?? []),
    ...fallbackRubric.map((item) => item.skill)
  ]);
  const rubric = rawRubric
    .slice(0, 8)
    .map((item, index) => {
      if (!isPlainObject(item)) {
        return null;
      }
      const fallback = fallbackRubric[index] ?? fallbackRubric[0] ?? {};
      const criterion = String(item.criterion ?? "").trim().slice(0, 220);
      if (!criterion) {
        return null;
      }
      const rawId = String(item.id || fallback.id || `generated_${index + 1}`)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 48);
      const points = Number.isInteger(item.points) && item.points > 0 && item.points <= 5 ? item.points : fallback.points || 1;
      const skill = fallbackSkills.includes(item.skill) ? item.skill : fallback.skill || fallbackSkills[0] || "explanation_quality";
      return {
        id: rawId || `generated_${index + 1}`,
        skill,
        points,
        criterion
      };
    })
    .filter(Boolean);
  return rubric.length ? rubric : fallbackRubric;
}

function normalizeGeneratedQuestion(raw) {
  if (!isPlainObject(raw) || raw.generated !== true) {
    return null;
  }
  const referenceQuestion = getQuestion(raw.referenceQuestionId);
  if (!referenceQuestion) {
    return null;
  }
  if (typeof raw.id !== "string" || !raw.id.startsWith("gen_")) {
    return null;
  }
  if (raw.topicId !== referenceQuestion.topicId) {
    return null;
  }
  const title = String(raw.title ?? "").trim().slice(0, 80);
  const prompt = String(raw.prompt ?? "").trim().slice(0, 1400);
  const expectedAnswer = String(raw.expectedAnswer ?? "").trim().slice(0, 1200);
  if (!title || !prompt || !expectedAnswer) {
    return null;
  }
  const rubric = normalizeGeneratedRubric(raw.rubric, referenceQuestion);
  const focusSkills = uniqueStrings([...(referenceQuestion.focusSkills ?? []), ...rubric.map((item) => item.skill)]);
  return {
    ...referenceQuestion,
    id: raw.id,
    type: `${referenceQuestion.type}_generated`,
    title,
    prompt,
    expectedAnswer,
    rubric,
    focusSkills,
    generated: true,
    referenceQuestionId: referenceQuestion.id
  };
}

function resolveQuestionFromBody(body) {
  const staticQuestion = getQuestion(body.questionId);
  if (staticQuestion) {
    return staticQuestion;
  }
  const generatedQuestion = normalizeGeneratedQuestion(body.generatedQuestion);
  if (generatedQuestion && generatedQuestion.id === body.questionId) {
    return generatedQuestion;
  }
  return null;
}

function questionMatchesAnySkill(question, skillIds) {
  return skillIds.some((skillId) => question.focusSkills.includes(skillId));
}

function hasUnansweredStaticQuestion(topicId, skillIds, answeredQuestionIds, options = {}) {
  const answeredSet = new Set(answeredQuestionIds.filter(Boolean));
  return questions.some(
    (question) =>
      question.topicId === topicId &&
      !answeredSet.has(question.id) &&
      (options.includeDiagnostic !== false || question.difficulty !== "diagnostic") &&
      (!skillIds.length || questionMatchesAnySkill(question, skillIds))
  );
}

function firstReferenceQuestion(topicId, skillId, fallbackQuestion) {
  return (
    questions.find(
      (question) => question.topicId === topicId && question.difficulty !== "diagnostic" && question.focusSkills.includes(skillId)
    ) ??
    questions.find((question) => question.topicId === topicId && question.focusSkills.includes(skillId)) ??
    questions.find((question) => question.topicId === topicId && question.id === fallbackQuestion.referenceQuestionId) ??
    getQuestion(fallbackQuestion.referenceQuestionId) ??
    fallbackQuestion
  );
}

function generationTarget(question, weakSkills, selectedSkillId, answeredQuestionIds) {
  const topic = topics.find((item) => item.id === question.topicId);
  if (!topic) {
    return null;
  }
  const topicSkillIds = new Set(topic.skillIds);
  const prioritySkills = [...(weakSkills ?? []), selectedSkillId, ...(question.focusSkills ?? [])].filter(
    (skillId, index, all) => skillId && topicSkillIds.has(skillId) && all.indexOf(skillId) === index
  );

  for (const skillId of prioritySkills) {
    if (!hasUnansweredStaticQuestion(question.topicId, [skillId], answeredQuestionIds, { includeDiagnostic: false })) {
      return {
        topic,
        skill: skills.find((item) => item.id === skillId),
        referenceQuestion: firstReferenceQuestion(question.topicId, skillId, question)
      };
    }
  }

  if (!hasUnansweredStaticQuestion(question.topicId, [], answeredQuestionIds)) {
    const skillId = prioritySkills[0] ?? topic.skillIds[0];
    return {
      topic,
      skill: skills.find((item) => item.id === skillId),
      referenceQuestion: firstReferenceQuestion(question.topicId, skillId, question)
    };
  }

  return null;
}

function answeredPromptsFor(topicId, answeredQuestionIds) {
  const answeredSet = new Set(answeredQuestionIds.filter(Boolean));
  return questions.filter((question) => question.topicId === topicId && answeredSet.has(question.id)).map((question) => question.prompt);
}

async function maybeGenerateNextQuestion(env, question, grade, body, answeredQuestionIds) {
  const selectedSkillId = typeof body.selectedSkillId === "string" ? body.selectedSkillId : null;
  const target = generationTarget(question, grade.weak_skills, selectedSkillId, answeredQuestionIds);
  if (!target?.skill || !target.referenceQuestion) {
    return null;
  }

  const variant = await generateQuestionVariant(env, {
    topic: target.topic,
    skill: target.skill,
    referenceQuestion: target.referenceQuestion,
    answeredPrompts: answeredPromptsFor(question.topicId, answeredQuestionIds),
    materialContext: materialContextForSkills([target.skill.id], target.topic.id)
  });

  return {
    ...target.referenceQuestion,
    id: `gen_${target.referenceQuestion.id}_${crypto.randomUUID()}`,
    type: `${target.referenceQuestion.type}_generated`,
    title: variant.title,
    prompt: variant.prompt,
    expectedAnswer: variant.expectedAnswer,
    rubric: variant.rubric,
    focusSkills: uniqueStrings([...(target.referenceQuestion.focusSkills ?? []), ...(variant.rubric ?? []).map((item) => item.skill)]),
    generated: true,
    referenceQuestionId: target.referenceQuestion.id
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
      openaiModel: env.OPENAI_MODEL || "gpt-4.1-nano",
      openaiTranscribeModel: env.OPENAI_TRANSCRIBE_MODEL || env.OPENAI_VISION_MODEL || env.OPENAI_MODEL || "gpt-4.1-mini",
      openaiGradingModel: env.OPENAI_GRADING_MODEL || env.OPENAI_MODEL || "gpt-4.1-nano",
      openaiGenerationModel: env.OPENAI_GENERATION_MODEL || env.OPENAI_GRADING_MODEL || env.OPENAI_MODEL || "gpt-4.1-nano",
      materialDocuments: materialIndex.documents.length,
      materialGeneratedAt: materialIndex.generatedAt
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
    const topicId = normalizeTopicId(body.topicId || "sec1_foundations");
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
    const topicId = normalizeTopicId(body.topicId || "sec1_foundations");
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
    const next = nextQuestionForWeakSkills(
      body.weakSkills ?? [],
      body.answeredQuestionId ?? null,
      body.topicId ?? null,
      body.answeredQuestionIds ?? []
    );
    return json({ question: publicQuestion(next) });
  }

  if (url.pathname === "/api/question/generate" && request.method === "POST") {
    const body = await readJson(request);
    const referenceQuestion = getQuestion(body.referenceQuestionId) ?? getQuestion(body.questionId);
    if (!referenceQuestion) {
      return json({ error: "A valid reference question is required." }, 400);
    }
    const topic = topics.find((item) => item.id === referenceQuestion.topicId);
    const skillId = typeof body.skillId === "string" ? body.skillId : referenceQuestion.focusSkills[0];
    const skill = skills.find((item) => item.id === skillId && topic?.skillIds.includes(item.id));
    if (!topic || !skill) {
      return json({ error: "A valid topic skill is required." }, 400);
    }

    try {
      const variant = await generateQuestionVariant(env, {
        topic,
        skill,
        referenceQuestion,
        answeredPrompts: body.answeredPrompts ?? [],
        materialContext: materialContextForSkills([skill.id], topic.id)
      });
      return json({
        question: publicQuestion({
          ...referenceQuestion,
          id: `gen_${referenceQuestion.id}_${crypto.randomUUID()}`,
          type: `${referenceQuestion.type}_generated`,
          title: variant.title,
          prompt: variant.prompt,
          expectedAnswer: variant.expectedAnswer,
          rubric: variant.rubric,
          focusSkills: uniqueStrings([...(referenceQuestion.focusSkills ?? []), ...(variant.rubric ?? []).map((item) => item.skill)]),
          generated: true,
          referenceQuestionId: referenceQuestion.id
        })
      });
    } catch (error) {
      return json(
        {
          error: "Question generation failed.",
          detail: error instanceof Error ? error.message : String(error)
        },
        502
      );
    }
  }

  if (url.pathname === "/api/answer/transcribe-photo" && request.method === "POST") {
    const body = await readJson(request);
    const question = resolveQuestionFromBody(body);
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
    const question = resolveQuestionFromBody(body);
    if (!question) {
      return json({ error: `Unknown question: ${body.questionId}` }, 400);
    }
    if (typeof body.answerText !== "string" || !body.answerText.trim()) {
      return json({ error: "Answer text is required." }, 400);
    }

    let grade;
    let warning = null;
    const answeredQuestionIds = Array.isArray(body.answeredQuestionIds) ? body.answeredQuestionIds : [question.id];
    const gradeOptions = {
      topicId: question.topicId,
      answeredQuestionIds
    };
    try {
      grade = await gradeAnswerWithOpenAI(env, question, body.answerText, gradeOptions);
    } catch (error) {
      warning = error instanceof Error ? error.message : String(error);
      grade = question.generated
        ? gradeWithRules(question, body.answerText, gradeOptions)
        : gradeAnswerFallback(question.id, body.answerText, gradeOptions);
    }

    const currentMastery = body.mastery && typeof body.mastery === "object" ? body.mastery : defaultMastery();
    const updatedMastery = applyMasteryUpdates(currentMastery, grade.mastery_updates);
    let nextQuestion =
      getQuestion(grade.next_question_id) ??
      nextQuestionForWeakSkills(grade.weak_skills, question.id, question.topicId, answeredQuestionIds);
    try {
      nextQuestion = (await maybeGenerateNextQuestion(env, question, grade, body, answeredQuestionIds)) ?? nextQuestion;
    } catch (error) {
      if (new Set(answeredQuestionIds).has(nextQuestion.id)) {
        warning = warning ?? (error instanceof Error ? error.message : String(error));
      }
    }

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
