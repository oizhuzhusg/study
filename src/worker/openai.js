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
