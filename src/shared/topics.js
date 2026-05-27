export const skills = [
  {
    id: "scientific_inquiry",
    label: "Scientific inquiry",
    description: "Asks testable questions, identifies variables, and supports conclusions with evidence."
  },
  {
    id: "lab_safety",
    label: "Lab safety",
    description: "Chooses safe actions for smelling, heating, handling spills, and using chemicals."
  },
  {
    id: "measurement_apparatus",
    label: "Measurement apparatus",
    description: "Chooses pipettes, burettes, measuring cylinders, and other apparatus by purpose and accuracy."
  },
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
    id: "elements_periodic_table",
    label: "Elements and periodic table",
    description: "Uses element symbols, metal/non-metal ideas, and periodic table position."
  },
  {
    id: "substances_mixtures",
    label: "Substances and mixtures",
    description: "Distinguishes elements, compounds, mixtures, and physical versus chemical changes."
  },
  {
    id: "separation_methods",
    label: "Separation methods",
    description: "Chooses filtration, evaporation, crystallisation, distillation, or chromatography from mixture properties."
  },
  {
    id: "atomic_structure",
    label: "Atomic structure",
    description: "Uses protons, neutrons, electrons, isotopes, and electronic structure correctly."
  },
  {
    id: "ions_charges",
    label: "Ions and charges",
    description: "Connects ion charges to stable compound ratios."
  },
  {
    id: "ionic_bonding",
    label: "Ionic bonding",
    description: "Explains ionic bonding by electron transfer and attraction between oppositely charged ions."
  },
  {
    id: "covalent_bonding",
    label: "Covalent bonding",
    description: "Explains covalent bonding by electron sharing in simple molecular substances."
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
    id: "mole_concept",
    label: "Mole concept",
    description: "Converts between particles, moles, molar mass, and mass."
  },
  {
    id: "chemical_calculation",
    label: "Chemical calculation",
    description: "Uses balanced equations and mole ratios for reacting mass, gas volume, limiting, and excess calculations."
  },
  {
    id: "concentration_calculation",
    label: "Concentration calculation",
    description: "Calculates concentration in mol/dm3 or g/dm3 and converts cm3 to dm3 correctly."
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
    id: "metallic_bonding",
    label: "Metallic bonding",
    description: "Explains metallic structure, delocalised electrons, conductivity, malleability, and alloys."
  },
  {
    id: "giant_covalent",
    label: "Giant covalent structures",
    description: "Explains diamond, graphite, graphene, silicon dioxide, and fullerenes using giant covalent bonding."
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
      "Review NUSH Year 1 Chemistry foundations from the school materials: inquiry, lab work, particles, elements, mixtures, separation, atomic structure, bonding, formulae, equations, and acid-base basics.",
    objectives: [
      "Use inquiry skills, safety rules, apparatus, observations, and measurements accurately.",
      "Explain states and diffusion using kinetic theory of matter.",
      "Classify elements, compounds, mixtures, and separation methods.",
      "Use atomic structure, ion charges, and bonding to write formulae.",
      "Recognise acids, alkalis, neutralisation, and simple equations."
    ],
    sections: [
      {
        title: "Inquiry and Laboratory",
        skillIds: ["scientific_inquiry", "lab_safety", "measurement_apparatus", "experimental_chemistry", "observation_inference"]
      },
      {
        title: "Particles and Substances",
        skillIds: ["kinetic_theory", "elements_periodic_table", "substances_mixtures", "separation_methods"]
      },
      {
        title: "Atomic Structure and Bonding",
        skillIds: ["atomic_structure", "ions_charges", "ionic_bonding", "covalent_bonding", "chemical_bonding"]
      },
      {
        title: "Formulae, Equations, and Acids",
        skillIds: ["formulae", "balancing", "acid_base_basics", "explanation_quality", "sec1_gap_diagnosis"]
      }
    ],
    skillIds: [
      "scientific_inquiry",
      "lab_safety",
      "measurement_apparatus",
      "experimental_chemistry",
      "observation_inference",
      "kinetic_theory",
      "elements_periodic_table",
      "substances_mixtures",
      "separation_methods",
      "atomic_structure",
      "ions_charges",
      "ionic_bonding",
      "covalent_bonding",
      "chemical_bonding",
      "formulae",
      "balancing",
      "acid_base_basics",
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
      "Build NUSH Year 2 Chemistry from the school materials: acids and bases II, mole concept, chemical calculations, concentration, volumetric analysis, salt preparation, and extended bonding, while retaining precipitation and reaction analysis practice.",
    objectives: [
      "Write balanced equations, ionic equations, and state symbols for acid-base and salt reactions.",
      "Convert between particles, moles, mass, volume, and concentration.",
      "Apply titration apparatus, endpoint, titre, and mole-ratio reasoning.",
      "Choose salt preparation methods from solubility and reactant properties.",
      "Explain metallic and giant covalent properties using bonding and structure."
    ],
    sections: [
      {
        title: "Acid-base and Salts",
        skillIds: ["acid_base_reactions", "salt_preparation", "formulae", "balancing", "state_symbols", "ionic_equation"]
      },
      {
        title: "Mole and Calculations",
        skillIds: ["mole_concept", "chemical_calculation", "concentration_calculation", "titration_calculation"]
      },
      {
        title: "Volumetric Analysis",
        skillIds: ["volumetric_analysis", "measurement_apparatus", "experimental_chemistry"]
      },
      {
        title: "Structure and Bonding",
        skillIds: ["metallic_bonding", "giant_covalent", "chemical_bonding", "explanation_quality"]
      },
      {
        title: "Precipitation and Reaction Analysis",
        skillIds: [
          "precipitate_concept",
          "solubility_prediction",
          "spectator_ions",
          "ionic_equation",
          "observation_inference",
          "redox_concepts",
          "oxidation_states",
          "qualitative_analysis"
        ]
      }
    ],
    skillIds: [
      "formulae",
      "balancing",
      "state_symbols",
      "ionic_equation",
      "acid_base_reactions",
      "salt_preparation",
      "mole_concept",
      "chemical_calculation",
      "concentration_calculation",
      "volumetric_analysis",
      "titration_calculation",
      "measurement_apparatus",
      "experimental_chemistry",
      "metallic_bonding",
      "giant_covalent",
      "chemical_bonding",
      "precipitate_concept",
      "solubility_prediction",
      "spectator_ions",
      "observation_inference",
      "redox_concepts",
      "oxidation_states",
      "qualitative_analysis",
      "explanation_quality"
    ]
  }
];

export const lessons = {
  sec1_foundations: {
    short:
      "NUSH Year 1 Chemistry builds the grammar for later topics: inquiry and laboratory habits, particles, substances, separation, atoms, bonding, formulae, and acids.",
    example:
      "If a student writes MgCl instead of MgCl2, the real gap is usually not precipitation. It is the Sec 1 idea that Mg2+ needs two Cl- ions to make a neutral compound.",
    steps: [
      "Identify whether the question is about inquiry, lab work, particles, substances, separation, atoms, bonding, formulae, equations, or acids.",
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
      "NUSH Year 2 Chemistry II connects reactions, calculations, and structure: acids and salts, moles, concentration, titration, salt preparation, metallic bonding, and giant covalent structures.",
    example:
      "In a titration, a pipette measures 25.0 cm3 accurately, a burette gives the titre, and the calculation only works after converting cm3 to dm3 and using the balanced equation mole ratio.",
    steps: [
      "Identify whether the question is reaction, calculation, practical, or structure-and-bonding.",
      "Write correct formulae and a balanced equation before calculating.",
      "Convert units carefully, especially cm3 to dm3.",
      "For titration and salts, connect apparatus or method choice to accuracy, endpoint, solubility, or excess reactant.",
      "For bonding, link the property to particles, lattice structure, and mobile or shared electrons."
    ],
    keyReminder:
      "Most Year 2 mistakes are not random: they usually come from one missing link in formulae, balancing, units, mole ratio, apparatus choice, or bonding structure."
  }
};

export function defaultMastery() {
  return Object.fromEntries(skills.map((skill) => [skill.id, 35]));
}
