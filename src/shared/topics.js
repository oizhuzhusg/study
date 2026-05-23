export const skills = [
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
  }
];

export const topics = [
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
    skillIds: skills.map((skill) => skill.id)
  }
];

export const lessons = {
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
