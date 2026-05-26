export const questions = [
  {
    id: "sec1_diag_001",
    topicId: "sec1_foundations",
    type: "diagnostic",
    difficulty: "diagnostic",
    title: "Sec 1 foundation check",
    prompt:
      "Answer briefly.\n\n1. Why does a smell spread across a room faster when the room is warm?\n2. What is the formula of the compound made from Mg2+ and Cl- ions?\n3. Hydrochloric acid reacts with sodium hydroxide. What type of reaction is this, and what are the products?",
    expectedAnswer:
      "Warm particles have more kinetic energy and move faster, so diffusion is faster. Mg2+ and Cl- form MgCl2 because two chloride ions are needed to balance one magnesium ion. Hydrochloric acid and sodium hydroxide undergo neutralisation to form sodium chloride and water.",
    rubric: [
      {
        id: "particle_motion",
        skill: "kinetic_theory",
        points: 1,
        criterion: "Explains that particles move randomly and faster at higher temperature."
      },
      {
        id: "mgcl2",
        skill: "ions_charges",
        points: 1,
        criterion: "Writes MgCl2, not MgCl or Mg2Cl."
      },
      {
        id: "ionic_charge_balance",
        skill: "formulae",
        points: 1,
        criterion: "Explains the formula by balancing Mg2+ with two Cl- ions."
      },
      {
        id: "neutralisation",
        skill: "acid_base_basics",
        points: 1,
        criterion: "Identifies the acid-alkali reaction as neutralisation."
      },
      {
        id: "salt_water",
        skill: "acid_base_basics",
        points: 1,
        criterion: "States that salt and water are formed."
      }
    ],
    focusSkills: ["kinetic_theory", "ions_charges", "formulae", "acid_base_basics", "sec1_gap_diagnosis"],
    nextByWeakSkill: {
      kinetic_theory: "sec1_particles_001",
      ions_charges: "sec1_bonding_001",
      formulae: "sec1_bonding_001",
      acid_base_basics: "sec1_acid_base_001",
      sec1_gap_diagnosis: "sec1_lab_001"
    }
  },
  {
    id: "sec1_lab_001",
    topicId: "sec1_foundations",
    type: "practical_skills",
    difficulty: "basic",
    title: "Choose apparatus",
    prompt:
      "A student needs to measure exactly 25.0 cm3 of sodium hydroxide solution for a titration practice.\n\nWhich apparatus is most suitable: beaker, measuring cylinder, or pipette? Explain why.",
    expectedAnswer:
      "A pipette is most suitable because it measures a fixed volume accurately. A beaker is not accurate, and a measuring cylinder is less accurate than a pipette.",
    rubric: [
      {
        id: "apparatus_pipette",
        skill: "experimental_chemistry",
        points: 1,
        criterion: "Chooses a pipette."
      },
      {
        id: "accuracy_reason",
        skill: "experimental_chemistry",
        points: 1,
        criterion: "Explains that a pipette measures a fixed volume more accurately."
      },
      {
        id: "clear_comparison",
        skill: "explanation_quality",
        points: 1,
        criterion: "Compares it clearly with less accurate apparatus."
      }
    ],
    focusSkills: ["experimental_chemistry", "explanation_quality"]
  },
  {
    id: "sec1_lab_002",
    topicId: "sec1_foundations",
    type: "practical_skills",
    difficulty: "basic",
    title: "Accurate fixed volume",
    prompt:
      "A student must transfer exactly 25.0 cm3 of hydrochloric acid into a conical flask.\n\nChoose the best apparatus from pipette, beaker, or measuring cylinder. Explain your choice.",
    expectedAnswer:
      "Use a pipette because it is calibrated to deliver a fixed 25.0 cm3 volume accurately. A beaker or measuring cylinder is less accurate for this exact volume.",
    rubric: [
      {
        id: "apparatus_pipette",
        skill: "experimental_chemistry",
        points: 1,
        criterion: "Chooses a pipette."
      },
      {
        id: "accuracy_reason",
        skill: "experimental_chemistry",
        points: 1,
        criterion: "Explains that a pipette measures a fixed volume more accurately."
      },
      {
        id: "clear_comparison",
        skill: "explanation_quality",
        points: 1,
        criterion: "Compares it clearly with less accurate apparatus."
      }
    ],
    focusSkills: ["experimental_chemistry", "explanation_quality"]
  },
  {
    id: "sec1_particles_001",
    topicId: "sec1_foundations",
    type: "particle_model",
    difficulty: "basic",
    title: "Diffusion and temperature",
    prompt:
      "Use kinetic theory to explain why food smells spread faster in a warm room than in a cold room.",
    expectedAnswer:
      "Gas particles move randomly. In a warm room, the particles have more kinetic energy and move faster, so they diffuse through the air faster.",
    rubric: [
      {
        id: "particle_motion",
        skill: "kinetic_theory",
        points: 1,
        criterion: "States that particles move randomly."
      },
      {
        id: "temperature_effect",
        skill: "kinetic_theory",
        points: 1,
        criterion: "Explains that higher temperature gives particles more kinetic energy or faster movement."
      },
      {
        id: "diffusion",
        skill: "kinetic_theory",
        points: 1,
        criterion: "Connects faster particle movement to faster diffusion."
      }
    ],
    focusSkills: ["kinetic_theory", "explanation_quality"]
  },
  {
    id: "sec1_particles_002",
    topicId: "sec1_foundations",
    type: "particle_model",
    difficulty: "basic",
    title: "Perfume in a warm classroom",
    prompt:
      "A bottle of perfume is opened in a classroom. The smell reaches the back of the room faster when the classroom is warm.\n\nUse kinetic theory to explain why.",
    expectedAnswer:
      "Perfume particles move randomly through the air. At a higher temperature they have more kinetic energy and move faster, so they diffuse faster.",
    rubric: [
      {
        id: "particle_motion",
        skill: "kinetic_theory",
        points: 1,
        criterion: "States that particles move randomly."
      },
      {
        id: "temperature_effect",
        skill: "kinetic_theory",
        points: 1,
        criterion: "Explains that higher temperature gives particles more kinetic energy or faster movement."
      },
      {
        id: "diffusion",
        skill: "kinetic_theory",
        points: 1,
        criterion: "Connects faster particle movement to faster diffusion."
      }
    ],
    focusSkills: ["kinetic_theory", "explanation_quality"]
  },
  {
    id: "sec1_particles_003",
    topicId: "sec1_foundations",
    type: "particle_model",
    difficulty: "basic",
    title: "Diffusion in a cold room",
    prompt:
      "A smell spreads more slowly in a cold room than in a warm room.\n\nUse kinetic theory to explain the difference.",
    expectedAnswer:
      "In a cold room, gas particles have less kinetic energy and move more slowly. Since the particles move around more slowly, diffusion is slower.",
    rubric: [
      {
        id: "particle_motion",
        skill: "kinetic_theory",
        points: 1,
        criterion: "States that particles move randomly."
      },
      {
        id: "temperature_effect",
        skill: "kinetic_theory",
        points: 1,
        criterion: "Explains that higher temperature gives particles more kinetic energy or faster movement."
      },
      {
        id: "diffusion",
        skill: "kinetic_theory",
        points: 1,
        criterion: "Connects faster particle movement to faster diffusion."
      }
    ],
    focusSkills: ["kinetic_theory", "explanation_quality"]
  },
  {
    id: "sec1_bonding_001",
    topicId: "sec1_foundations",
    type: "bonding_formulae",
    difficulty: "basic",
    title: "Ionic formula from charges",
    prompt:
      "Magnesium forms Mg2+ ions and chloride forms Cl- ions.\n\n1. Write the formula of magnesium chloride.\n2. Explain the ratio using charges.\n3. State whether this is mainly ionic or covalent bonding.",
    expectedAnswer:
      "The formula is MgCl2. One Mg2+ ion needs two Cl- ions so the total charge is zero. This is ionic bonding.",
    rubric: [
      {
        id: "mgcl2",
        skill: "formulae",
        points: 1,
        criterion: "Writes MgCl2."
      },
      {
        id: "ionic_charge_balance",
        skill: "ions_charges",
        points: 1,
        criterion: "Explains that two Cl- ions balance one Mg2+ ion."
      },
      {
        id: "ionic_bond",
        skill: "chemical_bonding",
        points: 1,
        criterion: "Identifies the bonding as ionic."
      }
    ],
    focusSkills: ["formulae", "ions_charges", "chemical_bonding"]
  },
  {
    id: "sec1_equations_001",
    topicId: "sec1_foundations",
    type: "equations",
    difficulty: "basic",
    title: "Balance magnesium oxide",
    prompt:
      "Magnesium burns in oxygen to form magnesium oxide.\n\nWrite the balanced symbol equation.",
    expectedAnswer: "2Mg + O2 -> 2MgO",
    rubric: [
      {
        id: "formula_mgo",
        skill: "formulae",
        points: 1,
        criterion: "Uses MgO as the formula of magnesium oxide."
      },
      {
        id: "balanced_mgo",
        skill: "balancing",
        points: 1,
        criterion: "Balances the equation as 2Mg + O2 -> 2MgO."
      },
      {
        id: "formula_unchanged",
        skill: "balancing",
        points: 1,
        criterion: "Balances using coefficients without changing formulae."
      }
    ],
    focusSkills: ["formulae", "balancing"]
  },
  {
    id: "sec1_acid_base_001",
    topicId: "sec1_foundations",
    type: "acid_base",
    difficulty: "basic",
    title: "Neutralisation basics",
    prompt:
      "Hydrochloric acid reacts with sodium hydroxide.\n\n1. What type of reaction is this?\n2. Name the products.\n3. Write a word equation.",
    expectedAnswer:
      "This is neutralisation. The products are sodium chloride and water. Hydrochloric acid + sodium hydroxide -> sodium chloride + water.",
    rubric: [
      {
        id: "neutralisation",
        skill: "acid_base_basics",
        points: 1,
        criterion: "Identifies the reaction as neutralisation."
      },
      {
        id: "acid_alkali",
        skill: "acid_base_basics",
        points: 1,
        criterion: "Recognises hydrochloric acid as the acid and sodium hydroxide as the alkali/base."
      },
      {
        id: "salt_water",
        skill: "acid_base_basics",
        points: 1,
        criterion: "Names sodium chloride and water as products."
      }
    ],
    focusSkills: ["acid_base_basics", "explanation_quality"]
  },
  {
    id: "sec1_acid_base_002",
    topicId: "sec1_foundations",
    type: "acid_base",
    difficulty: "basic",
    title: "Another neutralisation",
    prompt:
      "Hydrochloric acid reacts with potassium hydroxide.\n\n1. What type of reaction is this?\n2. Name the products.",
    expectedAnswer:
      "This is neutralisation. Hydrochloric acid reacts with potassium hydroxide to form potassium chloride and water.",
    rubric: [
      {
        id: "neutralisation",
        skill: "acid_base_basics",
        points: 1,
        criterion: "Identifies the reaction as neutralisation."
      },
      {
        id: "acid_alkali",
        skill: "acid_base_basics",
        points: 1,
        criterion: "Recognises hydrochloric acid as the acid and potassium hydroxide as the alkali/base."
      },
      {
        id: "salt_water",
        skill: "acid_base_basics",
        points: 1,
        criterion: "Names potassium chloride and water as products."
      }
    ],
    focusSkills: ["acid_base_basics", "explanation_quality"]
  },
  {
    id: "sec1_observation_001",
    topicId: "sec1_foundations",
    type: "lab_reasoning",
    difficulty: "basic",
    title: "Observation or inference",
    prompt:
      "Magnesium ribbon is added to dilute hydrochloric acid. The student sees bubbles and the magnesium slowly disappears.\n\n1. Which part is an observation?\n2. What gas is likely produced?\n3. How can the gas be tested?",
    expectedAnswer:
      "Bubbles forming and magnesium disappearing are observations. The gas is likely hydrogen. Test it with a lighted splint; hydrogen gives a squeaky pop.",
    rubric: [
      {
        id: "bubbles_observation",
        skill: "observation_inference",
        points: 1,
        criterion: "Identifies bubbles or magnesium disappearing as observations."
      },
      {
        id: "hydrogen",
        skill: "acid_base_basics",
        points: 1,
        criterion: "Identifies hydrogen gas."
      },
      {
        id: "hydrogen_test",
        skill: "experimental_chemistry",
        points: 1,
        criterion: "States the lighted splint squeaky pop test."
      }
    ],
    focusSkills: ["observation_inference", "acid_base_basics", "experimental_chemistry"]
  },
  {
    id: "sec2_diag_001",
    topicId: "sec2_chemistry_ii",
    type: "diagnostic",
    difficulty: "diagnostic",
    title: "Sec 2 reaction map",
    prompt:
      "Classify each situation and give the key evidence.\n\n1. Mixing two clear solutions gives a white solid.\n2. Hydrochloric acid is titrated with sodium hydroxide using an indicator.\n3. Zinc is placed in copper(II) sulfate solution and a brown solid forms.",
    expectedAnswer:
      "1. Precipitation: an insoluble white solid forms. 2. Acid-base neutralisation / volumetric analysis: acid and alkali react, and the indicator endpoint shows the neutralisation point. 3. Redox displacement: zinc displaces copper; zinc is oxidised and copper(II) ions are reduced to copper metal.",
    rubric: [
      {
        id: "classify_precipitation",
        skill: "precipitate_concept",
        points: 1,
        criterion: "Classifies the white solid situation as precipitation."
      },
      {
        id: "classify_titration",
        skill: "volumetric_analysis",
        points: 1,
        criterion: "Classifies the acid-alkali indicator situation as titration or volumetric analysis."
      },
      {
        id: "neutralisation",
        skill: "acid_base_reactions",
        points: 1,
        criterion: "Identifies acid + alkali as neutralisation."
      },
      {
        id: "classify_redox",
        skill: "redox_concepts",
        points: 1,
        criterion: "Classifies the zinc/copper(II) sulfate reaction as redox or displacement."
      },
      {
        id: "observation_evidence",
        skill: "observation_inference",
        points: 1,
        criterion: "Uses observations as evidence rather than only naming topics."
      }
    ],
    focusSkills: [
      "precipitate_concept",
      "volumetric_analysis",
      "acid_base_reactions",
      "redox_concepts",
      "observation_inference"
    ],
    nextByWeakSkill: {
      precipitate_concept: "ppt_concept_001",
      volumetric_analysis: "sec2_titration_001",
      acid_base_reactions: "sec2_acid_base_001",
      redox_concepts: "sec2_redox_001",
      observation_inference: "sec2_qa_001"
    }
  },
  {
    id: "sec2_acid_base_001",
    topicId: "sec2_chemistry_ii",
    type: "acid_base",
    difficulty: "basic",
    title: "Acid-base reaction",
    prompt:
      "Dilute sulfuric acid reacts with potassium hydroxide solution.\n\n1. Name the type of reaction.\n2. Write the word equation.\n3. Write the balanced symbol equation.",
    expectedAnswer:
      "This is neutralisation. Sulfuric acid + potassium hydroxide -> potassium sulfate + water. H2SO4 + 2KOH -> K2SO4 + 2H2O.",
    rubric: [
      {
        id: "neutralisation",
        skill: "acid_base_reactions",
        points: 1,
        criterion: "Identifies the reaction as neutralisation."
      },
      {
        id: "potassium_sulfate",
        skill: "salt_preparation",
        points: 1,
        criterion: "Names potassium sulfate as the salt formed."
      },
      {
        id: "balanced_acid_base",
        skill: "balancing",
        points: 1,
        criterion: "Writes H2SO4 + 2KOH -> K2SO4 + 2H2O or an equivalent balanced equation."
      }
    ],
    focusSkills: ["acid_base_reactions", "salt_preparation", "balancing"]
  },
  {
    id: "sec2_salt_prep_001",
    topicId: "sec2_chemistry_ii",
    type: "salt_preparation",
    difficulty: "basic",
    title: "Prepare a soluble salt",
    prompt:
      "A student wants to prepare dry crystals of copper(II) sulfate from dilute sulfuric acid and excess copper(II) oxide.\n\nPut these ideas in a sensible order and explain why excess solid is used: warm acid, add copper(II) oxide until no more reacts, filter, evaporate, crystallise, dry.",
    expectedAnswer:
      "Warm the acid, add excess copper(II) oxide until no more reacts, filter off the excess solid, evaporate the filtrate to concentrate it, allow crystals to form, then dry the crystals. Excess solid ensures all the acid has reacted and can be removed by filtration.",
    rubric: [
      {
        id: "salt_prep_order",
        skill: "salt_preparation",
        points: 1,
        criterion: "Gives a sensible sequence for preparing soluble salt crystals."
      },
      {
        id: "excess_solid",
        skill: "salt_preparation",
        points: 1,
        criterion: "Explains that excess insoluble base ensures acid is fully reacted."
      },
      {
        id: "filter_crystallise",
        skill: "experimental_chemistry",
        points: 1,
        criterion: "Includes filtration and crystallisation/evaporation."
      }
    ],
    focusSkills: ["salt_preparation", "experimental_chemistry", "explanation_quality"]
  },
  {
    id: "sec2_redox_001",
    topicId: "sec2_chemistry_ii",
    type: "redox",
    difficulty: "basic",
    title: "Zinc displacement",
    prompt:
      "Zinc powder is added to copper(II) sulfate solution. The blue colour fades and a brown solid forms.\n\n1. What is the brown solid?\n2. Explain why this is a redox reaction.",
    expectedAnswer:
      "The brown solid is copper. Zinc is oxidised to Zn2+ and Cu2+ is reduced to copper metal, so electron transfer occurs.",
    rubric: [
      {
        id: "copper_solid",
        skill: "observation_inference",
        points: 1,
        criterion: "Identifies the brown solid as copper."
      },
      {
        id: "zinc_oxidised",
        skill: "redox_concepts",
        points: 1,
        criterion: "States that zinc is oxidised to Zn2+."
      },
      {
        id: "copper_reduced",
        skill: "redox_concepts",
        points: 1,
        criterion: "States that Cu2+ is reduced to copper."
      }
    ],
    focusSkills: ["redox_concepts", "observation_inference", "explanation_quality"]
  },
  {
    id: "sec2_redox_002",
    topicId: "sec2_chemistry_ii",
    type: "redox",
    difficulty: "basic",
    title: "Displacement evidence",
    prompt:
      "A strip of zinc is placed in copper(II) sulfate solution. After some time, a brown coating appears on the zinc and the blue colour becomes paler.\n\nExplain the redox change.",
    expectedAnswer:
      "The brown coating is copper. Zinc is oxidised to Zn2+ and copper(II) ions are reduced to copper metal.",
    rubric: [
      {
        id: "copper_solid",
        skill: "observation_inference",
        points: 1,
        criterion: "Identifies the brown solid as copper."
      },
      {
        id: "zinc_oxidised",
        skill: "redox_concepts",
        points: 1,
        criterion: "States that zinc is oxidised to Zn2+."
      },
      {
        id: "copper_reduced",
        skill: "redox_concepts",
        points: 1,
        criterion: "States that Cu2+ is reduced to copper."
      }
    ],
    focusSkills: ["redox_concepts", "observation_inference", "explanation_quality"]
  },
  {
    id: "sec2_oxidation_states_001",
    topicId: "sec2_chemistry_ii",
    type: "oxidation_states",
    difficulty: "medium",
    title: "Oxidation state changes",
    prompt:
      "In this reaction, identify what is oxidised and what is reduced using oxidation states:\n\nFe2O3 + 3CO -> 2Fe + 3CO2",
    expectedAnswer:
      "Iron in Fe2O3 is reduced from +3 to 0. Carbon in CO is oxidised from +2 to +4 in CO2.",
    rubric: [
      {
        id: "iron_reduced",
        skill: "oxidation_states",
        points: 1,
        criterion: "States that iron is reduced from +3 to 0."
      },
      {
        id: "carbon_oxidised",
        skill: "oxidation_states",
        points: 1,
        criterion: "States that carbon is oxidised from +2 to +4."
      },
      {
        id: "redox_terms",
        skill: "redox_concepts",
        points: 1,
        criterion: "Uses oxidation/reduction terms correctly."
      }
    ],
    focusSkills: ["oxidation_states", "redox_concepts"]
  },
  {
    id: "sec2_titration_001",
    topicId: "sec2_chemistry_ii",
    type: "volumetric_analysis",
    difficulty: "basic",
    title: "Titration apparatus and endpoint",
    prompt:
      "In a titration, 25.0 cm3 of sodium hydroxide is placed in a conical flask and hydrochloric acid is added from a burette using an indicator.\n\n1. Why is a burette used for the acid?\n2. What is the endpoint?\n3. Why should the flask be swirled?",
    expectedAnswer:
      "A burette is used because it delivers variable volumes accurately and lets the titre be read. The endpoint is the indicator colour change showing enough acid has been added to neutralise the alkali. Swirling helps the solutions mix evenly.",
    rubric: [
      {
        id: "burette_reason",
        skill: "volumetric_analysis",
        points: 1,
        criterion: "Explains that a burette accurately delivers/measures variable volume."
      },
      {
        id: "endpoint",
        skill: "volumetric_analysis",
        points: 1,
        criterion: "Defines endpoint as the indicator colour change."
      },
      {
        id: "swirl_mix",
        skill: "experimental_chemistry",
        points: 1,
        criterion: "Explains that swirling mixes the solutions evenly."
      }
    ],
    focusSkills: ["volumetric_analysis", "experimental_chemistry"]
  },
  {
    id: "sec2_titration_002",
    topicId: "sec2_chemistry_ii",
    type: "volumetric_analysis",
    difficulty: "basic",
    title: "Titration apparatus choices",
    prompt:
      "In a titration, a student measures 25.0 cm3 of sodium hydroxide and places it in a conical flask. Acid is then added until the indicator changes colour.\n\n1. Which apparatus should measure the 25.0 cm3 sodium hydroxide?\n2. Why is a burette used for the acid?",
    expectedAnswer:
      "A pipette should measure the fixed 25.0 cm3 sodium hydroxide accurately. A burette is used for the acid because it accurately delivers variable volumes and lets the titre be read.",
    rubric: [
      {
        id: "apparatus_pipette",
        skill: "experimental_chemistry",
        points: 1,
        criterion: "Chooses a pipette."
      },
      {
        id: "accuracy_reason",
        skill: "experimental_chemistry",
        points: 1,
        criterion: "Explains that a pipette measures a fixed volume more accurately."
      },
      {
        id: "burette_reason",
        skill: "volumetric_analysis",
        points: 1,
        criterion: "Explains that a burette accurately delivers/measures variable volume."
      }
    ],
    focusSkills: ["volumetric_analysis", "experimental_chemistry"]
  },
  {
    id: "sec2_titre_calc_001",
    topicId: "sec2_chemistry_ii",
    type: "titration_calculation",
    difficulty: "medium",
    title: "Titration calculation",
    prompt:
      "25.0 cm3 of 0.100 mol/dm3 NaOH is neutralised by 20.0 cm3 of HCl.\n\nNaOH + HCl -> NaCl + H2O\n\nCalculate the concentration of HCl.",
    expectedAnswer:
      "Moles of NaOH = 0.100 x 25.0/1000 = 0.00250 mol. The ratio is 1:1, so moles of HCl = 0.00250 mol. Concentration of HCl = 0.00250 / 0.0200 = 0.125 mol/dm3.",
    rubric: [
      {
        id: "moles_naoh",
        skill: "titration_calculation",
        points: 1,
        criterion: "Calculates moles of NaOH as 0.00250 mol."
      },
      {
        id: "mole_ratio",
        skill: "titration_calculation",
        points: 1,
        criterion: "Uses the 1:1 mole ratio."
      },
      {
        id: "hcl_concentration",
        skill: "titration_calculation",
        points: 1,
        criterion: "Calculates HCl concentration as 0.125 mol/dm3."
      }
    ],
    focusSkills: ["titration_calculation", "balancing"]
  },
  {
    id: "sec2_qa_001",
    topicId: "sec2_chemistry_ii",
    type: "qualitative_analysis",
    difficulty: "medium",
    title: "Qualitative analysis inference",
    prompt:
      "A blue solution gives a blue precipitate when sodium hydroxide solution is added. The precipitate is insoluble in excess sodium hydroxide.\n\nWhat ion is likely present? What is the precipitate?",
    expectedAnswer:
      "Cu2+ is likely present. The blue precipitate is copper(II) hydroxide, Cu(OH)2.",
    rubric: [
      {
        id: "cu2_ion",
        skill: "qualitative_analysis",
        points: 1,
        criterion: "Infers Cu2+ is likely present."
      },
      {
        id: "blue_precipitate",
        skill: "observation_inference",
        points: 1,
        criterion: "Uses the blue precipitate observation as evidence."
      },
      {
        id: "cuoh2",
        skill: "formulae",
        points: 1,
        criterion: "Identifies the precipitate as Cu(OH)2."
      }
    ],
    focusSkills: ["qualitative_analysis", "observation_inference", "formulae"]
  },
  {
    id: "ppt_concept_001",
    topicId: "sec2_chemistry_ii",
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
    topicId: "sec2_chemistry_ii",
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
    topicId: "sec2_chemistry_ii",
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
    id: "ppt_agcl_002",
    topicId: "sec2_chemistry_ii",
    type: "worked_practice",
    difficulty: "basic",
    title: "Silver chloride variation",
    prompt:
      "Silver nitrate solution is mixed with potassium chloride solution.\n\n1. State the observation.\n2. Identify the precipitate.\n3. Write the net ionic equation.",
    expectedAnswer:
      "A white precipitate forms. The precipitate is silver chloride, AgCl(s). Net ionic equation: Ag+(aq) + Cl-(aq) -> AgCl(s).",
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
        id: "net_ionic",
        skill: "ionic_equation",
        points: 1,
        criterion: "Writes Ag+(aq) + Cl-(aq) -> AgCl(s)."
      }
    ],
    focusSkills: ["observation_inference", "solubility_prediction", "ionic_equation"]
  },
  {
    id: "ppt_solubility_001",
    topicId: "sec2_chemistry_ii",
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
    id: "ppt_solubility_002",
    topicId: "sec2_chemistry_ii",
    type: "prediction",
    difficulty: "basic",
    title: "Another sulfate precipitate",
    prompt:
      "Barium nitrate solution is mixed with magnesium sulfate solution.\n\nPredict whether a precipitate forms and name or write its formula.",
    expectedAnswer:
      "A precipitate forms because barium sulfate is insoluble. The precipitate is BaSO4(s).",
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
    topicId: "sec2_chemistry_ii",
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
    topicId: "sec2_chemistry_ii",
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
    topicId: "sec2_chemistry_ii",
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
    topicId: "sec2_chemistry_ii",
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
    topicId: "sec2_chemistry_ii",
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
    topicId: "sec2_chemistry_ii",
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
    topicId: "sec2_chemistry_ii",
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

export function normalizeTopicId(topicId) {
  return topicId === "precipitation_reactions" ? "sec2_chemistry_ii" : topicId;
}

export function firstQuestionForTopic(topicId) {
  const normalizedTopicId = normalizeTopicId(topicId);
  return questions.find((question) => question.topicId === normalizedTopicId && question.difficulty === "diagnostic") ?? questions[0];
}

const firstQuestionBySkill = {
  experimental_chemistry: "sec1_lab_001",
  kinetic_theory: "sec1_particles_001",
  ions_charges: "sec1_bonding_001",
  chemical_bonding: "sec1_bonding_001",
  acid_base_basics: "sec1_acid_base_001",
  sec1_gap_diagnosis: "sec1_diag_001",
  acid_base_reactions: "sec2_acid_base_001",
  salt_preparation: "sec2_salt_prep_001",
  redox_concepts: "sec2_redox_001",
  oxidation_states: "sec2_oxidation_states_001",
  volumetric_analysis: "sec2_titration_001",
  titration_calculation: "sec2_titre_calc_001",
  qualitative_analysis: "sec2_qa_001",
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

export function firstQuestionForSkill(skillId, topicId = "sec2_chemistry_ii") {
  const normalizedTopicId = normalizeTopicId(topicId);
  const explicitQuestion = firstQuestionBySkill[skillId] ? getQuestion(firstQuestionBySkill[skillId]) : null;
  if (explicitQuestion && explicitQuestion.topicId === normalizedTopicId) {
    return explicitQuestion;
  }
  return (
    questions.find((question) => question.topicId === normalizedTopicId && question.focusSkills.includes(skillId)) ??
    firstQuestionForTopic(normalizedTopicId)
  );
}

function orderedQuestionIdsForTopic(targetTopicId, topicQuestions) {
  const orderedByTopic = {
    sec1_foundations: [
      "sec1_lab_001",
      "sec1_lab_002",
      "sec1_particles_001",
      "sec1_particles_002",
      "sec1_particles_003",
      "sec1_bonding_001",
      "sec1_equations_001",
      "sec1_acid_base_001",
      "sec1_acid_base_002",
      "sec1_observation_001"
    ],
    sec2_chemistry_ii: [
      "sec2_acid_base_001",
      "sec2_redox_001",
      "sec2_redox_002",
      "sec2_titration_001",
      "sec2_titration_002",
      "sec2_qa_001",
      "ppt_agcl_001",
      "ppt_agcl_002",
      "ppt_solubility_001",
      "ppt_solubility_002",
      "ppt_spectators_001",
      "ppt_ionic_001",
      "ppt_mixed_001",
      "sec2_salt_prep_001",
      "sec2_oxidation_states_001",
      "sec2_titre_calc_001"
    ]
  };
  const preferred = orderedByTopic[targetTopicId] ?? [];
  const knownIds = new Set(preferred);
  const remainingIds = topicQuestions.map((question) => question.id).filter((id) => !knownIds.has(id));
  return [...preferred, ...remainingIds].filter((id) => topicQuestions.some((question) => question.id === id));
}

function firstAvailableQuestion(questionIds, answeredSet, answeredQuestionId) {
  return questionIds.find((id) => !answeredSet.has(id)) ?? questionIds.find((id) => id !== answeredQuestionId) ?? questionIds[0];
}

export function nextQuestionForWeakSkills(weakSkills = [], answeredQuestionId = null, topicId = null, answeredQuestionIds = []) {
  const answeredQuestion = answeredQuestionId ? getQuestion(answeredQuestionId) : null;
  const targetTopicId = normalizeTopicId(topicId ?? answeredQuestion?.topicId ?? "sec2_chemistry_ii");
  const topicQuestions = questions.filter((question) => question.topicId === targetTopicId);
  const answeredSet = new Set(answeredQuestionIds.filter(Boolean));
  if (answeredQuestionId) {
    answeredSet.add(answeredQuestionId);
  }

  for (const skill of weakSkills) {
    const explicitNext = answeredQuestion?.nextByWeakSkill?.[skill];
    if (explicitNext && getQuestion(explicitNext)?.topicId === targetTopicId && !answeredSet.has(explicitNext)) {
      return getQuestion(explicitNext);
    }
    const focused = topicQuestions.find((question) => !answeredSet.has(question.id) && question.focusSkills.includes(skill));
    if (focused) {
      return focused;
    }
  }

  const ordered = orderedQuestionIdsForTopic(targetTopicId, topicQuestions);
  const nextId = firstAvailableQuestion(ordered, answeredSet, answeredQuestionId) ?? firstQuestionForTopic(targetTopicId).id;
  return getQuestion(nextId) ?? firstQuestionForTopic(targetTopicId);
}
