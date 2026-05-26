import { getQuestion, nextQuestionForWeakSkills } from "../shared/questions.js";

const MIN_MASTERY = 0;
const MAX_MASTERY = 100;

function normalizeAnswer(answer) {
  return String(answer ?? "")
    .toLowerCase()
    .replaceAll("→", "->")
    .replace(/\s+/g, " ")
    .trim();
}

function includesAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

function hasIon(text, variants) {
  const compact = text.replace(/\s+/g, "");
  return variants.some((variant) => compact.includes(variant.toLowerCase().replace(/\s+/g, "")));
}

function ruleMatches(ruleId, text) {
  switch (ruleId) {
    case "apparatus_pipette":
      return includesAny(text, ["pipette"]);
    case "accuracy_reason":
      return includesAny(text, ["accurate", "accuracy", "fixed volume", "25.0", "calibrated", "marking", "graduation"]);
    case "clear_comparison":
      return includesAny(text, ["beaker", "measuring cylinder", "less accurate", "more accurate", "most accurate"]);
    case "particle_motion":
      return includesAny(text, ["particle", "particles"]) && includesAny(text, ["move", "random", "kinetic"]);
    case "temperature_effect":
      return (
        includesAny(text, ["warm", "temperature", "heat", "higher"]) &&
        includesAny(text, ["faster", "kinetic energy", "more energy"])
      ) || (
        includesAny(text, ["cold", "lower", "less"]) &&
        includesAny(text, ["slower", "less kinetic energy", "less energy"])
      );
    case "diffusion":
      return includesAny(text, ["diffusion", "diffuse", "spread"]);
    case "mgcl2":
      return includesAny(text, ["mgcl2", "magnesium chloride"]);
    case "ionic_charge_balance":
      return includesAny(text, ["charge", "2+", "two", "balance", "neutral", "zero"]) && includesAny(text, ["cl", "chloride"]);
    case "ionic_bond":
      return includesAny(text, ["ionic"]);
    case "formula_mgo":
      return includesAny(text, ["mgo", "magnesium oxide"]);
    case "balanced_mgo":
      return includesAny(text, ["2mg"]) && includesAny(text, ["o2"]) && includesAny(text, ["2mgo"]);
    case "neutralisation":
      return includesAny(text, ["neutralisation", "neutralization", "neutralise", "neutralize"]);
    case "acid_alkali":
      return includesAny(text, ["acid"]) && includesAny(text, ["alkali", "base", "hydroxide"]);
    case "salt_water":
      return includesAny(text, ["salt", "sodium chloride", "nacl", "potassium chloride", "kcl"]) && includesAny(text, ["water", "h2o"]);
    case "bubbles_observation":
      return includesAny(text, ["bubble", "effervescence", "fizz", "magnesium disappears", "mg disappears"]);
    case "hydrogen":
      return includesAny(text, ["hydrogen", "h2"]);
    case "hydrogen_test":
      return includesAny(text, ["lighted splint", "burning splint", "squeaky pop", "pop sound"]);
    case "classify_precipitation":
      return includesAny(text, ["precipitation", "precipitate", "insoluble solid", "white solid"]);
    case "classify_titration":
      return includesAny(text, ["titration", "volumetric", "burette", "titre", "endpoint"]);
    case "classify_redox":
      return includesAny(text, ["redox", "displacement", "oxidised", "oxidized", "reduced"]);
    case "observation_evidence":
      return includesAny(text, ["white solid", "brown solid", "blue", "colour", "color", "indicator", "endpoint", "precipitate"]);
    case "potassium_sulfate":
      return includesAny(text, ["potassium sulfate", "potassium sulphate", "k2so4"]);
    case "balanced_acid_base":
      return includesAny(text, ["h2so4"]) && includesAny(text, ["2koh", "2 koh"]) && includesAny(text, ["k2so4"]) && includesAny(text, ["2h2o", "2 h2o"]);
    case "salt_prep_order":
      return includesAny(text, ["warm", "heat"]) && includesAny(text, ["filter"]) && includesAny(text, ["evaporate", "crystallise", "crystallize"]);
    case "excess_solid":
      return includesAny(text, ["excess"]) && includesAny(text, ["acid", "reacted", "neutralised", "neutralized"]);
    case "filter_crystallise":
      return includesAny(text, ["filter"]) && includesAny(text, ["crystal", "evaporate"]);
    case "copper_solid":
      return includesAny(text, ["copper", "cu"]) && includesAny(text, ["brown", "solid", "metal"]);
    case "zinc_oxidised":
      return includesAny(text, ["zinc", "zn"]) && includesAny(text, ["oxidised", "oxidized", "loses electron", "zn2+"]);
    case "copper_reduced":
      return includesAny(text, ["copper", "cu2+", "cu"]) && includesAny(text, ["reduced", "gains electron"]);
    case "iron_reduced":
      return includesAny(text, ["iron", "fe"]) && includesAny(text, ["+3", "3+", "0", "reduced"]);
    case "carbon_oxidised":
      return includesAny(text, ["carbon", "co"]) && includesAny(text, ["+2", "+4", "oxidised", "oxidized"]);
    case "redox_terms":
      return includesAny(text, ["oxidised", "oxidized", "oxidation"]) && includesAny(text, ["reduced", "reduction"]);
    case "burette_reason":
      return includesAny(text, ["burette"]) && includesAny(text, ["accurate", "variable", "volume", "titre"]);
    case "endpoint":
      return includesAny(text, ["endpoint", "end point", "colour change", "color change"]);
    case "swirl_mix":
      return includesAny(text, ["swirl", "mix", "evenly"]);
    case "moles_naoh":
      return includesAny(text, ["0.0025", "2.5 x 10", "2.50"]);
    case "mole_ratio":
      return includesAny(text, ["1:1", "one to one", "same moles", "ratio"]);
    case "hcl_concentration":
      return includesAny(text, ["0.125"]);
    case "cu2_ion":
      return hasIon(text, ["Cu2+", "Cu^2+"]) || includesAny(text, ["copper(ii)", "copper 2"]);
    case "blue_precipitate":
      return includesAny(text, ["blue precipitate", "blue ppt", "blue solid"]);
    case "cuoh2":
      return includesAny(text, ["cu(oh)2", "copper(ii) hydroxide", "copper hydroxide"]);
    case "solid":
      return includesAny(text, ["solid", "ppt", "precipitate"]);
    case "insoluble":
      return includesAny(text, ["insoluble", "does not dissolve", "not dissolve"]);
    case "solution":
      return includesAny(text, ["solution", "aqueous", "ions", "react"]);
    case "cloudy_solid":
      return includesAny(text, ["cloudy", "white solid", "precipitate", "ppt"]);
    case "insoluble_product":
      return includesAny(text, ["insoluble", "solid", "precipitate"]);
    case "observation":
      return includesAny(text, ["observe", "see", "appear", "forms", "formed"]);
    case "white_precipitate":
      return includesAny(text, ["white precipitate", "white ppt", "white solid", "cloudy white"]);
    case "agcl_precipitate":
      return includesAny(text, ["agcl", "silver chloride"]);
    case "products":
      return includesAny(text, ["agcl"]) && includesAny(text, ["nano3", "sodium nitrate"]);
    case "balanced":
      return !includesAny(text, ["unbalanced"]) && includesAny(text, ["->"]);
    case "states":
      return text.includes("(aq)") && text.includes("(s)");
    case "spectators_removed":
      return hasIon(text, ["Ag+", "Cl-"]) && !hasIon(text, ["Na+ + NO3-", "NO3- + Na+"]);
    case "net_ionic":
      return hasIon(text, ["Ag+"]) && hasIon(text, ["Cl-"]) && includesAny(text, ["agcl"]);
    case "clear_layout":
      return includesAny(text, ["observation", "molecular", "ionic", "net"]);
    case "precipitate_forms":
      return includesAny(text, ["precipitate forms", "ppt forms", "solid forms", "yes"]);
    case "baso4":
      return includesAny(text, ["baso4", "barium sulfate", "barium sulphate"]);
    case "state_solid":
      return includesAny(text, ["baso4(s)", "solid", "(s)"]);
    case "pbi2":
      return includesAny(text, ["pbi2", "lead iodide"]);
    case "charge_balance":
      return includesAny(text, ["charge", "2+", "two", "balance", "ratio"]);
    case "coefficients":
      return includesAny(text, ["2ki", "2 ki"]) && includesAny(text, ["2kno3", "2 kno3"]);
    case "formula_unchanged":
      return !includesAny(text, ["pb2i", "pbi", "k2no3"]);
    case "reactants_aq":
      return includesAny(text, ["cacl2(aq)"]) && includesAny(text, ["na2co3(aq)"]);
    case "caco3_s":
      return includesAny(text, ["caco3(s)"]);
    case "nacl_aq":
      return includesAny(text, ["nacl(aq)"]);
    case "na_spectator":
      return hasIon(text, ["Na+"]);
    case "cl_spectator":
      return hasIon(text, ["Cl-"]);
    case "unchanged":
      return includesAny(text, ["unchanged", "remain", "same", "spectator"]);
    case "ba_ion":
      return hasIon(text, ["Ba2+", "Ba^2+"]);
    case "sulfate_ion":
      return hasIon(text, ["SO4^2-", "SO42-", "SO4 2-"]);
    case "baso4_s":
      return includesAny(text, ["baso4(s)", "baso4"]);
    case "no_spectators":
      return !hasIon(text, ["Na+"]) && !hasIon(text, ["Cl-"]);
    case "ag_ion":
      return hasIon(text, ["Ag+"]) || includesAny(text, ["silver ion"]);
    case "agcl":
      return includesAny(text, ["agcl", "silver chloride"]);
    case "ammonia_detail":
      return includesAny(text, ["ammonia", "nh3", "dissolves", "excess"]);
    case "caco3":
      return includesAny(text, ["caco3", "calcium carbonate"]);
    case "spectators":
      return hasIon(text, ["Na+"]) && hasIon(text, ["Cl-"]);
    default:
      return false;
  }
}

function buildStudentFeedback(score, maxScore, weakSkills, question, missingPoints = []) {
  if (score === maxScore) {
    return "Strong work. Your answer covers the key chemistry points, so the next question will move you slightly forward.";
  }

  const weakText = weakSkills.length ? weakSkills.join(", ") : "the missing rubric points";
  const missingText = missingPoints[0] ? ` Next, add this clearly: ${missingPoints[0]}` : "";
  return `Good attempt. The next best move is to strengthen ${weakText}.${missingText}`;
}

export function getRuleRubricResults(question, answerText) {
  const normalized = normalizeAnswer(answerText);
  return question.rubric.map((rule) => {
    const met = ruleMatches(rule.id, normalized);
    return {
      id: rule.id,
      met,
      evidence: met ? "Matched rubric evidence in the answer." : "",
      source: "local_rules"
    };
  });
}

export function finalizeRubricGrade(question, rubricResults, options = {}) {
  const resultById = new Map();
  for (const result of rubricResults ?? []) {
    if (!result || typeof result.id !== "string") {
      continue;
    }
    resultById.set(result.id, {
      id: result.id,
      met: Boolean(result.met),
      evidence: String(result.evidence ?? ""),
      source: result.source ?? options.source ?? "rubric"
    });
  }

  const correct = [];
  const missing = [];
  const weakSkillSet = new Set();
  let score = 0;
  const maxScore = question.rubric.reduce((sum, rule) => sum + rule.points, 0);
  const normalizedResults = [];

  for (const rule of question.rubric) {
    const result = resultById.get(rule.id) ?? {
      id: rule.id,
      met: false,
      evidence: "",
      source: options.source ?? "rubric"
    };
    normalizedResults.push(result);
    if (result.met) {
      correct.push(rule.criterion);
      score += rule.points;
    } else {
      missing.push(rule.criterion);
      weakSkillSet.add(rule.skill);
    }
  }

  const weakSkills = Array.from(weakSkillSet);
  const masteryUpdates = question.focusSkills.map((skillId) => {
    const isWeak = weakSkillSet.has(skillId);
    return {
      skill_id: skillId,
      delta: isWeak ? -4 : 6,
      reason: isWeak ? "Missed one or more rubric points for this skill." : "Met rubric evidence for this skill."
    };
  });

  const nextQuestion = nextQuestionForWeakSkills(
    weakSkills,
    question.id,
    options.topicId ?? question.topicId,
    options.answeredQuestionIds ?? []
  );
  return {
    score,
    max_score: maxScore,
    correct_points: correct,
    missing_points: missing,
    misconceptions: weakSkills.length ? ["This may be a skill gap rather than a simple careless error."] : [],
    weak_skills: weakSkills,
    mastery_updates: masteryUpdates,
    next_action: weakSkills.length ? `practice_${weakSkills[0]}` : "increase_difficulty",
    feedback_to_student: buildStudentFeedback(score, maxScore, weakSkills, question, missing),
    next_question_id: nextQuestion.id,
    rubric_results: normalizedResults,
    source: options.source ?? "local_rules"
  };
}

export function gradeWithRules(question, answerText, options = {}) {
  return finalizeRubricGrade(question, getRuleRubricResults(question, answerText), {
    ...options,
    source: "local_rules"
  });
}

export function applyMasteryUpdates(currentMastery, updates) {
  const next = { ...currentMastery };
  for (const update of updates ?? []) {
    const skillId = update.skill_id;
    const previous = Number(next[skillId] ?? 35);
    const delta = Number(update.delta ?? 0);
    next[skillId] = Math.max(MIN_MASTERY, Math.min(MAX_MASTERY, previous + delta));
  }
  return next;
}

export function gradeAnswerFallback(questionId, answerText, options = {}) {
  const question = getQuestion(questionId);
  if (!question) {
    throw new Error(`Unknown question: ${questionId}`);
  }
  return gradeWithRules(question, answerText, options);
}
