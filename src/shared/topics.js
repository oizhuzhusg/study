export const skills = [
  {
    id: "experimental_chemistry",
    label: "Experimental chemistry",
    description: "Uses apparatus, measurements, variables, and observations correctly."
  },
  {
    id: "kinetic_theory",
    label: "Kinetic theory",
    description: "Explains states, diffusion, and temperature using particle movement."
  },
  {
    id: "ions_charges",
    label: "Ions and charges",
    description: "Connects ion charges to stable compound ratios."
  },
  {
    id: "chemical_bonding",
    label: "Chemical bonding",
    description: "Distinguishes ionic and covalent bonding using particles and electron transfer/sharing."
  },
  {
    id: "acid_base_basics",
    label: "Acid-base basics",
    description: "Understands acids, alkalis, indicators, pH, and neutralisation."
  },
  {
    id: "precipitate_concept",
    label: "Precipitate concept",
    description: "Understands that a precipitate is an insoluble solid formed from solutions."
  },
  {
    id: "solubility_prediction",
    label: "Solubility prediction",
    description: "Predicts whether an ionic product is soluble or insoluble."
  },
  {
    id: "formulae",
    label: "Formulae",
    description: "Writes correct chemical formulae for ionic compounds."
  },
  {
    id: "balancing",
    label: "Balancing",
    description: "Balances molecular equations without changing formulae."
  },
  {
    id: "state_symbols",
    label: "State symbols",
    description: "Uses (aq), (s), (l), and (g) correctly."
  },
  {
    id: "spectator_ions",
    label: "Spectator ions",
    description: "Identifies ions that remain unchanged in solution."
  },
  {
    id: "ionic_equation",
    label: "Net ionic equations",
    description: "Writes net ionic equations by removing spectator ions."
  },
  {
    id: "observation_inference",
    label: "Observation and inference",
    description: "Connects lab observations to chemical species present."
  },
  {
    id: "explanation_quality",
    label: "Explanation quality",
    description: "Explains reasoning using precise chemistry language."
  },
  {
    id: "sec1_gap_diagnosis",
    label: "Sec 1 gap diagnosis",
    description: "Spots whether a Sec 2 mistake is caused by an earlier foundation gap."
  }
];

export const topics = [
  {
    id: "sec1_foundations",
    title: "Sec 1 Chemistry Foundations",
    course: "NUSH CM1141 Foundations in Chemistry I",
    status: "active",
    estimatedMinutes: 25,
    summary:
      "Review the Sec 1 ideas that support Sec 2 Chemistry: lab skills, particle theory, bonding, formulae, equations, and acid-base basics.",
    objectives: [
      "Use apparatus, observations, and measurements accurately.",
      "Explain states and diffusion using kinetic theory of matter.",
      "Use ion charges to write simple ionic formulae.",
      "Balance simple chemical equations without changing formulae.",
      "Recognise acids, alkalis, neutralisation, and basic gas tests."
    ],
    skillIds: [
      "experimental_chemistry",
      "kinetic_theory",
      "ions_charges",
      "chemical_bonding",
      "formulae",
      "balancing",
      "acid_base_basics",
      "observation_inference",
      "explanation_quality",
      "sec1_gap_diagnosis"
    ]
  },
  {
    id: "precipitation_reactions",
    title: "Precipitation Reactions",
    course: "NUSH CM2131 Foundations in Chemistry II",
    status: "active",
    estimatedMinutes: 20,
    summary:
      "Learn how aqueous ionic solutions form insoluble solids, then write observations, molecular equations, and net ionic equations.",
    objectives: [
      "Define precipitate as an insoluble solid formed from solution.",
      "Predict common precipitates using simple solubility rules.",
      "Write balanced molecular equations with state symbols.",
      "Remove spectator ions to form net ionic equations.",
      "Use observations to infer ions in qualitative analysis."
    ],
    skillIds: [
      "precipitate_concept",
      "solubility_prediction",
      "formulae",
      "balancing",
      "state_symbols",
      "spectator_ions",
      "ionic_equation",
      "observation_inference",
      "explanation_quality"
    ]
  }
];

export const lessons = {
  sec1_foundations: {
    short:
      "Sec 2 Chemistry becomes much easier when the Sec 1 foundations are secure: particles explain matter, ion charges explain formulae, and careful observations support chemical reasoning.",
    example:
      "If a student writes MgCl instead of MgCl2, the real gap is usually not precipitation. It is the Sec 1 idea that Mg2+ needs two Cl- ions to make a neutral compound.",
    steps: [
      "Identify whether the question is about particles, bonding, formulae, equations, acids, or lab observations.",
      "State the foundation rule before trying to answer the Sec 2 question.",
      "Use charges or particles to justify the answer, not memorised words only.",
      "Check formulae first, then balance equations using coefficients.",
      "Separate observation from inference when describing practical work."
    ],
    keyReminder:
      "A weak Sec 1 foundation often appears as a Sec 2 reaction mistake. Repair the foundation first, then practise the reaction."
  },
  precipitation_reactions: {
    short:
      "A precipitation reaction happens when two aqueous ionic solutions are mixed and one product is insoluble. The insoluble solid is the precipitate.",
    example:
      "When AgNO3(aq) and NaCl(aq) are mixed, Ag+ and Cl- form AgCl(s), a white precipitate. Na+ and NO3- stay dissolved, so they are spectator ions.",
    steps: [
      "Swap ions to predict possible products.",
      "Use solubility rules to decide if a product is insoluble.",
      "Write the full balanced equation with state symbols.",
      "Split aqueous ionic compounds into ions.",
      "Cancel spectator ions to get the net ionic equation."
    ],
    keyReminder:
      "A net ionic equation shows only the particles that actually change. Spectator ions are removed."
  }
};

export function defaultMastery() {
  return Object.fromEntries(skills.map((skill) => [skill.id, 35]));
}
