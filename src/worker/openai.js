import { gradeWithRules } from "./grading.js";

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
    score: { type: "integer" },
    max_score: { type: "integer" },
    correct_points: {
      type: "array",
      items: { type: "string" }
    },
    missing_points: {
      type: "array",
      items: { type: "string" }
    },
    misconceptions: {
      type: "array",
      items: { type: "string" }
    },
    weak_skills: {
      type: "array",
      items: { type: "string" }
    },
    mastery_updates: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          skill_id: { type: "string" },
          delta: { type: "integer" },
          reason: { type: "string" }
        },
        required: ["skill_id", "delta", "reason"]
      }
    },
    next_action: { type: "string" },
    feedback_to_student: { type: "string" }
  },
  required: [
    "score",
    "max_score",
    "correct_points",
    "missing_points",
    "misconceptions",
    "weak_skills",
    "mastery_updates",
    "next_action",
    "feedback_to_student"
  ]
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

async function callOpenAIJson(env, name, schema, input, maxOutputTokens = 1200) {
  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL || "gpt-4.1-mini",
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
    900
  );
  return { ...result, source: "openai" };
}

export async function gradeAnswerWithOpenAI(env, question, answerText) {
  if (!hasOpenAIKey(env)) {
    return gradeWithRules(question, answerText);
  }

  const maxScore = question.rubric.reduce((sum, item) => sum + item.points, 0);
  const prompt = [
    "You are a careful NUSH Year 2 Chemistry tutor.",
    "Grade the student's answer using the provided rubric. Focus on diagnosing the underlying chemistry skill gap.",
    "Be fair: accept equivalent notation such as -> for arrows, sulfate/sulphate, and reasonable charge notation.",
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
    1400
  );

  const cappedScore = Math.max(0, Math.min(maxScore, Number(result.score ?? 0)));
  const allowedSkills = new Set(question.focusSkills);
  const weakSkills = (result.weak_skills ?? []).filter((skill) => allowedSkills.has(skill));
  const masteryUpdates = (result.mastery_updates ?? []).filter((update) => allowedSkills.has(update.skill_id));
  return {
    ...result,
    score: cappedScore,
    max_score: maxScore,
    weak_skills: weakSkills,
    mastery_updates: masteryUpdates,
    source: "openai"
  };
}
