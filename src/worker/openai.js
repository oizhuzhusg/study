import { finalizeRubricGrade, getRuleRubricResults, gradeWithRules } from "./grading.js";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";

const transcribeSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    is_readable: { type: "boolean" },
    recognized_answer: { type: "string" },
    uncertain_parts: {
      type: "array",
      items: { type: "string" }
    },
    needs_retake_reason: { type: "string" }
  },
  required: ["is_readable", "recognized_answer", "uncertain_parts", "needs_retake_reason"]
};

const gradeSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    rubric_results: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string" },
          met: { type: "boolean" },
          evidence: { type: "string" }
        },
        required: ["id", "met", "evidence"]
      }
    },
    misconceptions: {
      type: "array",
      items: { type: "string" }
    },
    feedback_to_student: { type: "string" }
  },
  required: ["rubric_results", "misconceptions", "feedback_to_student"]
};

const generatedQuestionSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    prompt: { type: "string" },
    expected_answer: { type: "string" },
    rubric: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string" },
          skill: { type: "string" },
          points: { type: "integer" },
          criterion: { type: "string" }
        },
        required: ["id", "skill", "points", "criterion"]
      }
    }
  },
  required: ["title", "prompt", "expected_answer", "rubric"]
};

function hasOpenAIKey(env) {
  return typeof env.OPENAI_API_KEY === "string" && env.OPENAI_API_KEY.startsWith("sk-");
}

function extractOutputText(payload) {
  if (typeof payload.output_text === "string") {
    return payload.output_text;
  }

  const chunks = [];
  for (const item of payload.output ?? []) {
    for (const content of item.content ?? []) {
      if (typeof content.text === "string") {
        chunks.push(content.text);
      }
      if (typeof content.output_text === "string") {
        chunks.push(content.output_text);
      }
    }
  }
  return chunks.join("\n").trim();
}

async function callOpenAIJson(env, name, schema, input, maxOutputTokens = 1200, model = null) {
  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: model || env.OPENAI_MODEL || "gpt-4.1-nano",
      input,
      text: {
        format: {
          type: "json_schema",
          name,
          strict: true,
          schema
        }
      },
      max_output_tokens: maxOutputTokens
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error?.message || `OpenAI request failed with ${response.status}`;
    throw new Error(message);
  }

  const text = extractOutputText(payload);
  if (!text) {
    throw new Error("OpenAI returned no text output.");
  }

  return JSON.parse(text);
}

export async function transcribeAnswerPhoto(env, question, imageDataUrl) {
  if (!hasOpenAIKey(env)) {
    return {
      is_readable: true,
      recognized_answer: question.expectedAnswer,
      uncertain_parts: ["Using demo transcription because OPENAI_API_KEY is not configured."],
      needs_retake_reason: "",
      source: "demo"
    };
  }

  const prompt = [
    "You are transcribing a handwritten chemistry answer from a NUSH Year 2 student.",
    "Only transcribe what the student wrote. Preserve chemical formulae, charges, arrows, and state symbols as clearly as possible.",
    "If handwriting is unclear, say exactly which parts are uncertain. Do not grade yet.",
    "",
    `Question: ${question.prompt}`,
    `Expected answer for context, not for copying: ${question.expectedAnswer}`
  ].join("\n");

  const result = await callOpenAIJson(
    env,
    "chemistry_answer_transcription",
    transcribeSchema,
    [
      {
        role: "user",
        content: [
          { type: "input_text", text: prompt },
          { type: "input_image", image_url: imageDataUrl, detail: "high" }
        ]
      }
    ],
    900,
    env.OPENAI_TRANSCRIBE_MODEL || env.OPENAI_VISION_MODEL || env.OPENAI_MODEL || "gpt-4.1-mini"
  );
  return { ...result, source: "openai" };
}

function mergeRubricResults(question, aiResults, localResults) {
  const aiById = new Map((aiResults ?? []).map((result) => [result.id, result]));
  const localById = new Map((localResults ?? []).map((result) => [result.id, result]));
  return question.rubric.map((rule) => {
    const ai = aiById.get(rule.id);
    const local = localById.get(rule.id);
    const met = Boolean(local?.met || ai?.met);
    const evidence = local?.met ? local.evidence : ai?.evidence || "";
    return {
      id: rule.id,
      met,
      evidence,
      source: local?.met ? "local_rules" : "openai"
    };
  });
}

export async function gradeAnswerWithOpenAI(env, question, answerText, options = {}) {
  if (!hasOpenAIKey(env)) {
    return gradeWithRules(question, answerText, options);
  }

  const maxScore = question.rubric.reduce((sum, item) => sum + item.points, 0);
  const prompt = [
    "You are a careful NUSH Year 2 Chemistry tutor.",
    "Judge each rubric item separately. Do not calculate the final score.",
    "Return exactly one rubric_results item for every rubric id.",
    "Mark a rubric item met when the answer gives clear equivalent evidence, even if the wording is different.",
    "Be fair: accept equivalent notation such as -> for arrows, sulfate/sulphate, and reasonable charge notation.",
    "Important examples: 'diffusion speed increases' satisfies a diffusion link; 'fixed 25.0 cm3 marking' satisfies accurate fixed-volume pipette reasoning.",
    "Do not punish minor English grammar if the chemistry is clear.",
    "Return only JSON matching the schema.",
    "",
    `Question ID: ${question.id}`,
    `Question: ${question.prompt}`,
    `Expected answer: ${question.expectedAnswer}`,
    `Max score: ${maxScore}`,
    `Rubric: ${JSON.stringify(question.rubric)}`,
    `Allowed skills: ${JSON.stringify(question.focusSkills)}`,
    "",
    `Student answer: ${answerText}`
  ].join("\n");

  const result = await callOpenAIJson(
    env,
    "chemistry_answer_grade",
    gradeSchema,
    [
      {
        role: "user",
        content: [{ type: "input_text", text: prompt }]
      }
    ],
    1200,
    env.OPENAI_GRADING_MODEL || env.OPENAI_MODEL || "gpt-4.1-nano"
  );

  const localResults = getRuleRubricResults(question, answerText);
  const mergedResults = mergeRubricResults(question, result.rubric_results, localResults);
  const finalGrade = finalizeRubricGrade(question, mergedResults, {
    ...options,
    source: "openai_validated"
  });

  return {
    ...finalGrade,
    max_score: maxScore,
    misconceptions: finalGrade.misconceptions,
    feedback_to_student: finalGrade.feedback_to_student,
    source: "openai_validated"
  };
}

function cleanGeneratedText(value, maxLength) {
  return String(value ?? "")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, maxLength);
}

function uniqueStrings(values) {
  return Array.from(new Set(values.filter((value) => typeof value === "string" && value.trim()).map((value) => value.trim())));
}

function cleanGeneratedRubric(rawRubric, referenceQuestion) {
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
      const fallback = fallbackRubric[index] ?? fallbackRubric[0] ?? {};
      const criterion = cleanGeneratedText(item?.criterion, 180);
      if (!criterion) {
        return null;
      }
      const points = Number.isInteger(item?.points) && item.points > 0 && item.points <= 5 ? item.points : fallback.points || 1;
      const skill = fallbackSkills.includes(item?.skill) ? item.skill : fallback.skill || fallbackSkills[0] || "explanation_quality";
      const id = cleanGeneratedText(item?.id || fallback.id || `generated_${index + 1}`, 48)
        .toLowerCase()
        .replace(/[^a-z0-9_]+/g, "_")
        .replace(/^_+|_+$/g, "");
      return {
        id: id || `generated_${index + 1}`,
        skill,
        points,
        criterion
      };
    })
    .filter(Boolean);
  return rubric.length ? rubric : fallbackRubric;
}

export async function generateQuestionVariant(env, { topic, skill, referenceQuestion, answeredPrompts = [], materialContext = "" }) {
  if (!hasOpenAIKey(env)) {
    throw new Error("OPENAI_API_KEY is required for AI question generation.");
  }
  const allowedRubricSkills = uniqueStrings([
    skill.id,
    ...(referenceQuestion.focusSkills ?? []),
    ...(referenceQuestion.rubric ?? []).map((item) => item.skill)
  ]);

  const prompt = [
    "You are creating one controlled Chemistry practice question for a NUSH Year 1 or Year 2 student.",
    "Generate a fresh variant of the reference question. Keep the same chemistry skill, difficulty, expected answer style, and rubric coverage.",
    "When local OCR-derived exam-style guidance is provided, use it as the main question-pattern blueprint.",
    "The new question should feel like a NUSH worksheet or revision question: precise command words, school-style units, realistic data, and multi-part scaffolding when appropriate.",
    "Do not copy or closely paraphrase school material wording. Create an analogous question by changing chemicals, values, context, labels, or scenario.",
    "Do not introduce syllabus topics outside the given topic and skill.",
    "Do not reveal the answer inside the question prompt.",
    "For calculation questions, include enough given data and make the expected answer show the main working steps and units.",
    "If an equation is provided in the prompt, it must be fully balanced and consistent with the expected answer and rubric.",
    "If balancing is part of the task, ask the student to write the balanced equation instead of showing an unbalanced one as if it were given.",
    "For explanation questions, make the expected answer show the explicit chemistry link, such as structure to property, particle motion to rate, or observation to inference.",
    "Return a rubric that matches the new question exactly. Update chemical names, numbers, mole ratios, observations, and final answers in the rubric criteria.",
    "Do not reuse old rubric criteria if the new question changes the chemistry or calculation.",
    "Keep the rubric total points close to the reference total, and use only the allowed rubric skill ids.",
    "Use plain ASCII text for formulae and units, such as H2SO4, cm3, mol/dm3, and ->. Avoid markdown tables.",
    "Return only JSON matching the schema.",
    "",
    `Topic: ${topic.title}`,
    `Topic summary: ${topic.summary}`,
    `Skill: ${skill.label} - ${skill.description}`,
    `Difficulty: ${referenceQuestion.difficulty}`,
    `Reference title: ${referenceQuestion.title}`,
    `Reference prompt: ${referenceQuestion.prompt}`,
    `Reference expected answer: ${referenceQuestion.expectedAnswer}`,
    `Rubric to preserve: ${JSON.stringify(referenceQuestion.rubric)}`,
    `Allowed rubric skills: ${JSON.stringify(allowedRubricSkills)}`,
    materialContext ? `Relevant NUSH school material context:\n${materialContext}` : "",
    `Recently used prompts to avoid: ${JSON.stringify(answeredPrompts.slice(-8))}`
  ].filter(Boolean).join("\n");

  const result = await callOpenAIJson(
    env,
    "chemistry_question_variant",
    generatedQuestionSchema,
    [
      {
        role: "user",
        content: [{ type: "input_text", text: prompt }]
      }
    ],
    1000,
    env.OPENAI_GENERATION_MODEL || env.OPENAI_GRADING_MODEL || env.OPENAI_MODEL || "gpt-4.1-nano"
  );

  const title = cleanGeneratedText(result.title, 80);
  const questionPrompt = cleanGeneratedText(result.prompt, 1400);
  const expectedAnswer = cleanGeneratedText(result.expected_answer, 1200);
  const rubric = cleanGeneratedRubric(result.rubric, referenceQuestion);
  if (!title || !questionPrompt || !expectedAnswer) {
    throw new Error("OpenAI generated an incomplete question.");
  }

  return {
    title,
    prompt: questionPrompt,
    expectedAnswer,
    rubric
  };
}
