export const questions = [
  {
    id: "ppt_concept_001",
    topicId: "precipitation_reactions",
    type: "concept",
    difficulty: "diagnostic",
    title: "Define a precipitate",
    prompt: "What is a precipitate in a chemical reaction?",
    expectedAnswer:
      "A precipitate is an insoluble solid that forms when ions in aqueous solutions react.",
    rubric: [
      {
        id: "solid",
        skill: "precipitate_concept",
        points: 1,
        criterion: "Mentions that a precipitate is a solid."
      },
      {
        id: "insoluble",
        skill: "precipitate_concept",
        points: 1,
        criterion: "Mentions that it is insoluble or does not dissolve."
      },
      {
        id: "solution",
        skill: "explanation_quality",
        points: 1,
        criterion: "Connects precipitate formation to ions or substances in solution."
      }
    ],
    focusSkills: ["precipitate_concept", "explanation_quality"],
    nextByWeakSkill: {
      precipitate_concept: "ppt_concept_bridge_001",
      explanation_quality: "ppt_concept_bridge_001"
    }
  },
  {
    id: "ppt_concept_bridge_001",
    topicId: "precipitation_reactions",
    type: "bridge",
    difficulty: "basic",
    title: "Spot the precipitate",
    prompt:
      "A student mixes two clear aqueous solutions and sees a cloudy white solid appear. What is the precipitate, and what does the observation tell you?",
    expectedAnswer:
      "The cloudy white solid is the precipitate. It tells us an insoluble product has formed from ions in the solutions.",
    rubric: [
      {
        id: "cloudy_solid",
        skill: "precipitate_concept",
        points: 1,
        criterion: "Identifies the cloudy white solid as the precipitate."
      },
      {
        id: "insoluble_product",
        skill: "solubility_prediction",
        points: 1,
        criterion: "States that an insoluble product formed."
      },
      {
        id: "observation",
        skill: "observation_inference",
        points: 1,
        criterion: "Links the observation to evidence of reaction."
      }
    ],
    focusSkills: ["precipitate_concept", "solubility_prediction", "observation_inference"]
  },
  {
    id: "ppt_agcl_001",
    topicId: "precipitation_reactions",
    type: "worked_practice",
    difficulty: "basic",
    title: "Silver chloride precipitate",
    prompt:
      "Silver nitrate solution is mixed with sodium chloride solution.\n\n1. State the observation.\n2. Write the balanced molecular equation with state symbols.\n3. Write the net ionic equation.",
    expectedAnswer:
      "Observation: A white precipitate forms.\nMolecular: AgNO3(aq) + NaCl(aq) -> AgCl(s) + NaNO3(aq)\nNet ionic: Ag+(aq) + Cl-(aq) -> AgCl(s)",
    rubric: [
      {
        id: "white_precipitate",
        skill: "observation_inference",
        points: 1,
        criterion: "States that a white precipitate forms."
      },
      {
        id: "agcl_precipitate",
        skill: "solubility_prediction",
        points: 1,
        criterion: "Identifies AgCl as the precipitate."
      },
      {
        id: "products",
        skill: "formulae",
        points: 1,
        criterion: "Writes correct products AgCl and NaNO3."
      },
      {
        id: "balanced",
        skill: "balancing",
        points: 1,
        criterion: "Equation is balanced."
      },
      {
        id: "states",
        skill: "state_symbols",
        points: 1,
        criterion: "Uses (aq) for soluble reactants/products and (s) for AgCl."
      },
      {
        id: "spectators_removed",
        skill: "spectator_ions",
        points: 1,
        criterion: "Removes Na+ and NO3- as spectator ions."
      },
      {
        id: "net_ionic",
        skill: "ionic_equation",
        points: 1,
        criterion: "Writes Ag+(aq) + Cl-(aq) -> AgCl(s)."
      },
      {
        id: "clear_layout",
        skill: "explanation_quality",
        points: 1,
        criterion: "Separates observation, molecular equation, and net ionic equation clearly."
      }
    ],
    focusSkills: [
      "observation_inference",
      "solubility_prediction",
      "formulae",
      "balancing",
      "state_symbols",
      "spectator_ions",
      "ionic_equation"
    ],
    nextByWeakSkill: {
      observation_inference: "ppt_observation_001",
      solubility_prediction: "ppt_solubility_001",
      formulae: "ppt_formulae_001",
      balancing: "ppt_balance_001",
      state_symbols: "ppt_states_001",
      spectator_ions: "ppt_spectators_001",
      ionic_equation: "ppt_ionic_001"
    }
  },
  {
    id: "ppt_solubility_001",
    topicId: "precipitation_reactions",
    type: "prediction",
    difficulty: "basic",
    title: "Predict barium sulfate",
    prompt:
      "Barium chloride solution is mixed with sodium sulfate solution.\n\n1. Predict whether a precipitate forms.\n2. Name or write the formula of the precipitate.",
    expectedAnswer:
      "A precipitate forms. The precipitate is barium sulfate, BaSO4(s).",
    rubric: [
      {
        id: "precipitate_forms",
        skill: "solubility_prediction",
        points: 1,
        criterion: "Predicts that a precipitate forms."
      },
      {
        id: "baso4",
        skill: "formulae",
        points: 1,
        criterion: "Identifies BaSO4 as the precipitate."
      },
      {
        id: "state_solid",
        skill: "state_symbols",
        points: 1,
        criterion: "Marks BaSO4 as solid if state symbols are used."
      }
    ],
    focusSkills: ["solubility_prediction", "formulae", "state_symbols"]
  },
  {
    id: "ppt_formulae_001",
    topicId: "precipitation_reactions",
    type: "formulae",
    difficulty: "basic",
    title: "Formula repair",
    prompt:
      "Write the correct formula for the precipitate formed from Pb2+(aq) and I-(aq). Explain briefly why the ratio is needed.",
    expectedAnswer:
      "PbI2(s). One Pb2+ ion needs two I- ions so the charges balance.",
    rubric: [
      {
        id: "pbi2",
        skill: "formulae",
        points: 1,
        criterion: "Writes PbI2, not PbI or Pb2I."
      },
      {
        id: "charge_balance",
        skill: "formulae",
        points: 1,
        criterion: "Explains that the 2+ charge needs two 1- iodide ions."
      },
      {
        id: "solid",
        skill: "state_symbols",
        points: 1,
        criterion: "Identifies PbI2 as a solid precipitate."
      }
    ],
    focusSkills: ["formulae", "state_symbols", "explanation_quality"]
  },
  {
    id: "ppt_balance_001",
    topicId: "precipitation_reactions",
    type: "equation",
    difficulty: "basic",
    title: "Balance lead iodide",
    prompt:
      "Balance this precipitation equation and add state symbols:\n\nPb(NO3)2 + KI -> PbI2 + KNO3",
    expectedAnswer: "Pb(NO3)2(aq) + 2KI(aq) -> PbI2(s) + 2KNO3(aq)",
    rubric: [
      {
        id: "coefficients",
        skill: "balancing",
        points: 1,
        criterion: "Uses coefficients 1, 2, 1, 2."
      },
      {
        id: "formula_unchanged",
        skill: "formulae",
        points: 1,
        criterion: "Does not change chemical formulae while balancing."
      },
      {
        id: "states",
        skill: "state_symbols",
        points: 1,
        criterion: "Uses (aq) for soluble nitrates/iodide and (s) for PbI2."
      }
    ],
    focusSkills: ["balancing", "formulae", "state_symbols"]
  },
  {
    id: "ppt_states_001",
    topicId: "precipitation_reactions",
    type: "state_symbols",
    difficulty: "basic",
    title: "State symbols",
    prompt:
      "Add state symbols to this equation:\n\nCaCl2 + Na2CO3 -> CaCO3 + 2NaCl\n\nCalcium carbonate is insoluble in water.",
    expectedAnswer: "CaCl2(aq) + Na2CO3(aq) -> CaCO3(s) + 2NaCl(aq)",
    rubric: [
      {
        id: "reactants_aq",
        skill: "state_symbols",
        points: 1,
        criterion: "Marks CaCl2 and Na2CO3 as aqueous."
      },
      {
        id: "caco3_s",
        skill: "state_symbols",
        points: 1,
        criterion: "Marks CaCO3 as solid."
      },
      {
        id: "nacl_aq",
        skill: "state_symbols",
        points: 1,
        criterion: "Marks NaCl as aqueous."
      }
    ],
    focusSkills: ["state_symbols"]
  },
  {
    id: "ppt_spectators_001",
    topicId: "precipitation_reactions",
    type: "spectator_ions",
    difficulty: "basic",
    title: "Find spectator ions",
    prompt:
      "For this reaction, identify the spectator ions and write one sentence explaining why they are spectators.\n\nBaCl2(aq) + Na2SO4(aq) -> BaSO4(s) + 2NaCl(aq)",
    expectedAnswer:
      "Na+(aq) and Cl-(aq) are spectator ions because they remain aqueous and unchanged before and after the reaction.",
    rubric: [
      {
        id: "na_spectator",
        skill: "spectator_ions",
        points: 1,
        criterion: "Identifies Na+ as a spectator ion."
      },
      {
        id: "cl_spectator",
        skill: "spectator_ions",
        points: 1,
        criterion: "Identifies Cl- as a spectator ion."
      },
      {
        id: "unchanged",
        skill: "explanation_quality",
        points: 1,
        criterion: "Explains that spectator ions remain unchanged in solution."
      }
    ],
    focusSkills: ["spectator_ions", "explanation_quality"]
  },
  {
    id: "ppt_ionic_001",
    topicId: "precipitation_reactions",
    type: "ionic_equation",
    difficulty: "basic",
    title: "Net ionic equation",
    prompt:
      "Write the net ionic equation for:\n\nBaCl2(aq) + Na2SO4(aq) -> BaSO4(s) + 2NaCl(aq)",
    expectedAnswer: "Ba2+(aq) + SO4^2-(aq) -> BaSO4(s)",
    rubric: [
      {
        id: "ba_ion",
        skill: "ionic_equation",
        points: 1,
        criterion: "Includes Ba2+(aq)."
      },
      {
        id: "sulfate_ion",
        skill: "ionic_equation",
        points: 1,
        criterion: "Includes SO4^2-(aq)."
      },
      {
        id: "baso4_s",
        skill: "ionic_equation",
        points: 1,
        criterion: "Forms BaSO4(s)."
      },
      {
        id: "no_spectators",
        skill: "spectator_ions",
        points: 1,
        criterion: "Does not include Na+ or Cl- in the final net ionic equation."
      }
    ],
    focusSkills: ["ionic_equation", "spectator_ions"]
  },
  {
    id: "ppt_observation_001",
    topicId: "precipitation_reactions",
    type: "lab_reasoning",
    difficulty: "medium",
    title: "Observation to inference",
    prompt:
      "A colourless solution gives a white precipitate when sodium chloride solution is added. The precipitate dissolves in excess aqueous ammonia.\n\nWhat ion is likely present, and what is the white precipitate?",
    expectedAnswer:
      "Ag+ is likely present. The white precipitate is AgCl, which dissolves in excess aqueous ammonia.",
    rubric: [
      {
        id: "ag_ion",
        skill: "observation_inference",
        points: 1,
        criterion: "Infers Ag+ is likely present."
      },
      {
        id: "agcl",
        skill: "solubility_prediction",
        points: 1,
        criterion: "Identifies AgCl as the white precipitate."
      },
      {
        id: "ammonia_detail",
        skill: "explanation_quality",
        points: 1,
        criterion: "Uses the ammonia detail to support the inference."
      }
    ],
    focusSkills: ["observation_inference", "solubility_prediction", "explanation_quality"]
  },
  {
    id: "ppt_mixed_001",
    topicId: "precipitation_reactions",
    type: "mixed_review",
    difficulty: "medium",
    title: "Mixed review",
    prompt:
      "Calcium chloride solution is mixed with sodium carbonate solution.\n\n1. State the observation.\n2. Write the balanced molecular equation with state symbols.\n3. Write the net ionic equation.\n4. Identify the spectator ions.",
    expectedAnswer:
      "Observation: White precipitate forms.\nMolecular: CaCl2(aq) + Na2CO3(aq) -> CaCO3(s) + 2NaCl(aq)\nNet ionic: Ca2+(aq) + CO3^2-(aq) -> CaCO3(s)\nSpectator ions: Na+(aq) and Cl-(aq).",
    rubric: [
      {
        id: "white_precipitate",
        skill: "observation_inference",
        points: 1,
        criterion: "States that a white precipitate forms."
      },
      {
        id: "caco3",
        skill: "solubility_prediction",
        points: 1,
        criterion: "Identifies CaCO3 as the precipitate."
      },
      {
        id: "balanced",
        skill: "balancing",
        points: 1,
        criterion: "Balances the equation correctly."
      },
      {
        id: "states",
        skill: "state_symbols",
        points: 1,
        criterion: "Uses correct state symbols."
      },
      {
        id: "net_ionic",
        skill: "ionic_equation",
        points: 1,
        criterion: "Writes Ca2+(aq) + CO3^2-(aq) -> CaCO3(s)."
      },
      {
        id: "spectators",
        skill: "spectator_ions",
        points: 1,
        criterion: "Identifies Na+ and Cl- as spectator ions."
      }
    ],
    focusSkills: [
      "observation_inference",
      "solubility_prediction",
      "balancing",
      "state_symbols",
      "ionic_equation",
      "spectator_ions"
    ]
  }
];

export function getQuestion(questionId) {
  return questions.find((question) => question.id === questionId) ?? null;
}

export function firstQuestionForTopic(topicId) {
  return questions.find((question) => question.topicId === topicId && question.difficulty === "diagnostic") ?? questions[0];
}

const firstQuestionBySkill = {
  precipitate_concept: "ppt_concept_001",
  solubility_prediction: "ppt_solubility_001",
  formulae: "ppt_formulae_001",
  balancing: "ppt_balance_001",
  state_symbols: "ppt_states_001",
  spectator_ions: "ppt_spectators_001",
  ionic_equation: "ppt_ionic_001",
  observation_inference: "ppt_observation_001",
  explanation_quality: "ppt_concept_bridge_001"
};

export function firstQuestionForSkill(skillId, topicId = "precipitation_reactions") {
  const explicitQuestion = firstQuestionBySkill[skillId] ? getQuestion(firstQuestionBySkill[skillId]) : null;
  if (explicitQuestion && explicitQuestion.topicId === topicId) {
    return explicitQuestion;
  }
  return (
    questions.find((question) => question.topicId === topicId && question.focusSkills.includes(skillId)) ??
    firstQuestionForTopic(topicId)
  );
}

export function nextQuestionForWeakSkills(weakSkills = [], answeredQuestionId = null) {
  const answeredQuestion = answeredQuestionId ? getQuestion(answeredQuestionId) : null;
  for (const skill of weakSkills) {
    const explicitNext = answeredQuestion?.nextByWeakSkill?.[skill];
    if (explicitNext) {
      return getQuestion(explicitNext);
    }
    const focused = questions.find((question) => question.id !== answeredQuestionId && question.focusSkills.includes(skill));
    if (focused) {
      return focused;
    }
  }

  const ordered = [
    "ppt_agcl_001",
    "ppt_solubility_001",
    "ppt_spectators_001",
    "ppt_ionic_001",
    "ppt_mixed_001"
  ];
  const nextId = ordered.find((id) => id !== answeredQuestionId) ?? "ppt_mixed_001";
  return getQuestion(nextId);
}
