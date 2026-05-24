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
    id: "acid_base_reactions",
    label: "Acid-base reactions",
    description: "Writes and explains acid reactions, neutralisation, and salt formation."
  },
  {
    id: "salt_preparation",
    label: "Salt preparation",
    description: "Chooses suitable methods and steps to prepare salts safely and cleanly."
  },
  {
    id: "redox_concepts",
    label: "Redox concepts",
    description: "Recognises oxidation, reduction, oxidising agents, and reducing agents."
  },
  {
    id: "oxidation_states",
    label: "Oxidation states",
    description: "Uses oxidation state changes to identify redox processes."
  },
  {
    id: "volumetric_analysis",
    label: "Volumetric analysis",
    description: "Uses titration apparatus, endpoints, titres, and practical accuracy."
  },
  {
    id: "titration_calculation",
    label: "Titration calculation",
    description: "Calculates concentration or amount from titre and balanced equation data."
  },
  {
    id: "qualitative_analysis",
    label: "Qualitative analysis",
    description: "Uses chemical tests and observations to infer ions or gases present."
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
    id: "sec2_chemistry_ii",
    title: "Sec 2 Chemistry II",
    course: "NUSH CM2131 Foundations in Chemistry II",
    status: "active",
    estimatedMinutes: 40,
    summary:
      "Build the main Sec 2 Chemistry II topics: precipitation, acid-base and salts, redox, volumetric analysis, and qualitative analysis.",
    objectives: [
      "Diagnose whether a reaction is precipitation, acid-base, or redox.",
      "Write balanced molecular and net ionic equations where appropriate.",
      "Use observations and tests to infer ions or gases.",
      "Apply titration apparatus, endpoint, and titre reasoning.",
      "Explain redox using electron transfer or oxidation state changes."
    ],
    sections: [
      {
        title: "Precipitation Reactions",
        skillIds: [
          "precipitate_concept",
          "solubility_prediction",
          "formulae",
          "balancing",
          "state_symbols",
          "spectator_ions",
          "ionic_equation",
          "observation_inference"
        ]
      },
      {
        title: "Acid-base and Salts",
        skillIds: ["acid_base_reactions", "salt_preparation", "formulae", "balancing", "state_symbols"]
      },
      {
        title: "Redox",
        skillIds: ["redox_concepts", "oxidation_states", "balancing", "explanation_quality"]
      },
      {
        title: "Volumetric Analysis",
        skillIds: ["volumetric_analysis", "titration_calculation", "experimental_chemistry"]
      },
      {
        title: "Qualitative Analysis",
        skillIds: ["qualitative_analysis", "observation_inference", "explanation_quality"]
      }
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
      "acid_base_reactions",
      "salt_preparation",
      "redox_concepts",
      "oxidation_states",
      "volumetric_analysis",
      "titration_calculation",
      "qualitative_analysis",
      "experimental_chemistry",
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
  sec2_chemistry_ii: {
    short:
      "Sec 2 Chemistry II connects reaction types to evidence: precipitates show insoluble products, acid-base reactions form salts, redox changes electron ownership, and practical analysis uses careful measurement and observation.",
    example:
      "When AgNO3(aq) and NaCl(aq) are mixed, AgCl(s) forms as a white precipitate. In a titration, hydrochloric acid and sodium hydroxide neutralise to form sodium chloride and water. In redox, zinc displaces copper because zinc is oxidised more readily.",
    steps: [
      "Identify the reaction type: precipitation, acid-base, redox, volumetric analysis, or qualitative analysis.",
      "Write correct formulae and a balanced equation before interpreting the chemistry.",
      "Add state symbols and observations when the question is practical.",
      "For precipitation, remove spectator ions to get the net ionic equation.",
      "For acid-base, redox, titration, or qualitative analysis, explain the evidence and the chemical reasoning."
    ],
    keyReminder:
      "Precipitation is now one part of Sec 2 Chemistry II. If the student struggles, check whether the gap is in formulae, equations, observations, or the specific reaction type."
  }
};

export function defaultMastery() {
  return Object.fromEntries(skills.map((skill) => [skill.id, 35]));
}
