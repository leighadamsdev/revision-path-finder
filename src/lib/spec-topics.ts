/**
 * Exam-board topic lists, one per GCSE subject, written as tick-box checklists.
 * Each list names the specification it follows (mostly AQA; otherwise the board
 * that offers the subject). These are the "Exam board list" option in plan setup
 * and the default topic list wherever the app needs one.
 * Generated from the RevPlan GCSE topic lists; edit the lists there and regenerate.
 */
import { subjectUnits, type SubjectUnit } from "./gcse-topics";

export type SpecTopicList = { source: string; units: SubjectUnit[] };

export const SPEC_TOPICS: Record<string, SpecTopicList> = {
  "English Language": {
    source:
      "Based on AQA GCSE English Language (8700). Edexcel, OCR and Eduqas cover the same reading and writing skills with different question layouts.",
    units: [
      {
        unit: "Paper 1: Explorations in Creative Reading and Writing: Section A: Reading (literary fiction)",
        elements: [
          {
            label: "Q1: Identifying explicit information",
            detail: "",
          },
          {
            label: "Q2: Analysing language (words, phrases, techniques, sentence forms)",
            detail: "",
          },
          {
            label: "Q3: Analysing structure (openings, shifts in focus, endings)",
            detail: "",
          },
          {
            label: "Q4: Evaluating a statement about the text with evidence",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 1: Explorations in Creative Reading and Writing: Section B: Writing",
        elements: [
          {
            label: "Descriptive writing (from an image or prompt)",
            detail: "",
          },
          {
            label: "Narrative writing (story openings, plot, characterisation)",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 2: Writers' Viewpoints and Perspectives: Section A: Reading (non-fiction, 19th century and modern)",
        elements: [
          {
            label: "Q1: Identifying true statements",
            detail: "",
          },
          {
            label: "Q2: Summarising differences or similarities across two sources",
            detail: "",
          },
          {
            label: "Q3: Analysing language in non-fiction",
            detail: "",
          },
          {
            label: "Q4: Comparing writers' viewpoints and methods",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 2: Writers' Viewpoints and Perspectives: Section B: Writing",
        elements: [
          {
            label: "Writing to argue",
            detail: "",
          },
          {
            label: "Writing to persuade",
            detail: "",
          },
          {
            label: "Writing to explain or advise",
            detail: "",
          },
          {
            label: "Forms: article, letter, speech, essay, leaflet",
            detail: "",
          },
        ],
      },
      {
        unit: "Spoken Language (separate endorsement)",
        elements: [
          {
            label: "Planning and delivering a presentation",
            detail: "",
          },
          {
            label: "Responding to questions and feedback",
            detail: "",
          },
          {
            label: "Using Standard English",
            detail: "",
          },
        ],
      },
      {
        unit: "Core skills",
        elements: [
          {
            label: "Language techniques and terminology",
            detail: "",
          },
          {
            label: "Structural techniques and terminology",
            detail: "",
          },
          {
            label: "Selecting and embedding quotations",
            detail: "",
          },
          {
            label: "Inference and interpretation",
            detail: "",
          },
          {
            label: "Sentence variety and paragraphing",
            detail: "",
          },
          {
            label: "Spelling, punctuation and grammar",
            detail: "",
          },
          {
            label: "Ambitious vocabulary",
            detail: "",
          },
          {
            label: "Planning and timing in the exam",
            detail: "",
          },
        ],
      },
    ],
  },
  "English Literature": {
    source:
      "Based on AQA GCSE English Literature (8702). Tick only the texts your school studies. Other boards use similar texts and the same skills.",
    units: [
      {
        unit: "Paper 1, Section A: Shakespeare (one play)",
        elements: [
          {
            label: "Macbeth",
            detail: "",
          },
          {
            label: "Romeo and Juliet",
            detail: "",
          },
          {
            label: "The Tempest",
            detail: "",
          },
          {
            label: "The Merchant of Venice",
            detail: "",
          },
          {
            label: "Much Ado About Nothing",
            detail: "",
          },
          {
            label: "Julius Caesar",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 1, Section B: 19th-century novel (one text)",
        elements: [
          {
            label: "The Strange Case of Dr Jekyll and Mr Hyde (Stevenson)",
            detail: "",
          },
          {
            label: "A Christmas Carol (Dickens)",
            detail: "",
          },
          {
            label: "Great Expectations (Dickens)",
            detail: "",
          },
          {
            label: "Jane Eyre (Brontë)",
            detail: "",
          },
          {
            label: "Frankenstein (Shelley)",
            detail: "",
          },
          {
            label: "Pride and Prejudice (Austen)",
            detail: "",
          },
          {
            label: "The Sign of Four (Conan Doyle)",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 2, Section A: Modern prose or drama (one text)",
        elements: [
          {
            label: "An Inspector Calls (Priestley)",
            detail: "",
          },
          {
            label: "Blood Brothers (Russell)",
            detail: "",
          },
          {
            label: "The History Boys (Bennett)",
            detail: "",
          },
          {
            label: "DNA (Kelly)",
            detail: "",
          },
          {
            label: "The Curious Incident of the Dog in the Night-Time (play, Stephens)",
            detail: "",
          },
          {
            label: "A Taste of Honey (Delaney)",
            detail: "",
          },
          {
            label: "Lord of the Flies (Golding)",
            detail: "",
          },
          {
            label: "AQA Anthology: Telling Tales",
            detail: "",
          },
          {
            label: "Animal Farm (Orwell)",
            detail: "",
          },
          {
            label: "Never Let Me Go (Ishiguro)",
            detail: "",
          },
          {
            label: "Anita and Me (Syal)",
            detail: "",
          },
          {
            label: "Pigeon English (Kelman)",
            detail: "",
          },
          {
            label: "Leave Taking (Pinnock), newer option",
            detail: "",
          },
          {
            label: "Princess & The Hustler (Mitchell), newer option",
            detail: "",
          },
          {
            label: "Boys Don't Cry (Blackman), newer option",
            detail: "",
          },
          {
            label: "My Name Is Leon (de Waal), newer option",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 2, Section B: Poetry anthology, Power and Conflict cluster",
        elements: [
          {
            label: "Ozymandias (Shelley)",
            detail: "",
          },
          {
            label: "London (Blake)",
            detail: "",
          },
          {
            label: "Extract from The Prelude (Wordsworth)",
            detail: "",
          },
          {
            label: "My Last Duchess (Browning)",
            detail: "",
          },
          {
            label: "The Charge of the Light Brigade (Tennyson)",
            detail: "",
          },
          {
            label: "Exposure (Owen)",
            detail: "",
          },
          {
            label: "Storm on the Island (Heaney)",
            detail: "",
          },
          {
            label: "Bayonet Charge (Hughes)",
            detail: "",
          },
          {
            label: "Remains (Armitage)",
            detail: "",
          },
          {
            label: "Poppies (Weir)",
            detail: "",
          },
          {
            label: "War Photographer (Duffy)",
            detail: "",
          },
          {
            label: "Tissue (Dharker)",
            detail: "",
          },
          {
            label: "The Émigrée (Rumens)",
            detail: "",
          },
          {
            label: "Kamikaze (Garland)",
            detail: "",
          },
          {
            label: "Checking Out Me History (Agard)",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 2, Section B: Poetry anthology, Love and Relationships cluster",
        elements: [
          {
            label: "When We Two Parted (Byron)",
            detail: "",
          },
          {
            label: "Love's Philosophy (Shelley)",
            detail: "",
          },
          {
            label: "Porphyria's Lover (Browning)",
            detail: "",
          },
          {
            label: "Sonnet 29 'I think of thee!' (Barrett Browning)",
            detail: "",
          },
          {
            label: "Neutral Tones (Hardy)",
            detail: "",
          },
          {
            label: "Letters from Yorkshire (Dooley)",
            detail: "",
          },
          {
            label: "The Farmer's Bride (Mew)",
            detail: "",
          },
          {
            label: "Walking Away (Day Lewis)",
            detail: "",
          },
          {
            label: "Eden Rock (Causley)",
            detail: "",
          },
          {
            label: "Follower (Heaney)",
            detail: "",
          },
          {
            label: "Mother, any distance (Armitage)",
            detail: "",
          },
          {
            label: "Before You Were Mine (Duffy)",
            detail: "",
          },
          {
            label: "Winter Swans (Sheers)",
            detail: "",
          },
          {
            label: "Singh Song! (Nagra)",
            detail: "",
          },
          {
            label: "Climbing My Grandfather (Waterhouse)",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 2, Section B: Other anthology clusters",
        elements: [
          {
            label: "Worlds and Lives cluster (newer AQA option; tick if studied)",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 2, Section C: Unseen poetry",
        elements: [
          {
            label: "Analysing a single unseen poem",
            detail: "",
          },
          {
            label: "Comparing two unseen poems",
            detail: "",
          },
        ],
      },
      {
        unit: "Skills for every text",
        elements: [
          {
            label: "Plot and structure",
            detail: "",
          },
          {
            label: "Characters and characterisation",
            detail: "",
          },
          {
            label: "Themes and ideas",
            detail: "",
          },
          {
            label: "Context (social, historical, literary)",
            detail: "",
          },
          {
            label: "Key quotations",
            detail: "",
          },
          {
            label: "Writer's methods: language, form and structure",
            detail: "",
          },
          {
            label: "Essay planning and writing a thesis",
            detail: "",
          },
          {
            label: "Spelling, punctuation and grammar (marks on Shakespeare and modern text)",
            detail: "",
          },
        ],
      },
    ],
  },
  Mathematics: {
    source:
      "Based on the GCSE Mathematics content shared by all boards (AQA 8300, Edexcel 1MA1, OCR J560). (H) marks Higher-tier-only topics.",
    units: [
      {
        unit: "Number",
        elements: [
          {
            label: "Place value and ordering numbers, including negatives",
            detail: "",
          },
          {
            label: "The four operations, including with negatives",
            detail: "",
          },
          {
            label: "Order of operations (BIDMAS)",
            detail: "",
          },
          {
            label: "Factors, multiples and primes",
            detail: "",
          },
          {
            label: "HCF and LCM, including prime factor decomposition",
            detail: "",
          },
          {
            label: "Powers, roots and index laws",
            detail: "",
          },
          {
            label: "Fractions: all four operations",
            detail: "",
          },
          {
            label: "Decimals and converting between fractions, decimals and percentages",
            detail: "",
          },
          {
            label: "Recurring decimals to fractions (H)",
            detail: "",
          },
          {
            label: "Standard form",
            detail: "",
          },
          {
            label: "Surds (H)",
            detail: "",
          },
          {
            label: "Rounding, significant figures and estimation",
            detail: "",
          },
          {
            label: "Error intervals and bounds",
            detail: "",
          },
          {
            label: "Upper and lower bounds in calculations (H)",
            detail: "",
          },
          {
            label: "Product rule for counting",
            detail: "",
          },
        ],
      },
      {
        unit: "Algebra",
        elements: [
          {
            label: "Algebraic notation and vocabulary",
            detail: "",
          },
          {
            label: "Simplifying and collecting like terms",
            detail: "",
          },
          {
            label: "Expanding brackets (single, double, triple (H))",
            detail: "",
          },
          {
            label: "Factorising, including quadratics",
            detail: "",
          },
          {
            label: "Factorising quadratics where a ≠ 1 (H)",
            detail: "",
          },
          {
            label: "Substitution into formulae",
            detail: "",
          },
          {
            label: "Rearranging formulae",
            detail: "",
          },
          {
            label: "Solving linear equations",
            detail: "",
          },
          {
            label: "Solving quadratic equations by factorising",
            detail: "",
          },
          {
            label: "Quadratic formula and completing the square (H)",
            detail: "",
          },
          {
            label: "Simultaneous equations (linear)",
            detail: "",
          },
          {
            label: "Simultaneous equations (linear and quadratic) (H)",
            detail: "",
          },
          {
            label: "Linear inequalities and number lines",
            detail: "",
          },
          {
            label: "Quadratic inequalities (H)",
            detail: "",
          },
          {
            label: "Sequences: nth term of linear sequences",
            detail: "",
          },
          {
            label: "Quadratic and geometric sequences, Fibonacci-type sequences",
            detail: "",
          },
          {
            label: "nth term of quadratic sequences (H)",
            detail: "",
          },
          {
            label: "Coordinates and midpoints",
            detail: "",
          },
          {
            label: "Straight-line graphs: y = mx + c",
            detail: "",
          },
          {
            label: "Parallel and perpendicular lines (H)",
            detail: "",
          },
          {
            label: "Quadratic, cubic and reciprocal graphs",
            detail: "",
          },
          {
            label: "Exponential and trigonometric graphs (H)",
            detail: "",
          },
          {
            label: "Equation of a circle and tangents (H)",
            detail: "",
          },
          {
            label: "Graph transformations (H)",
            detail: "",
          },
          {
            label: "Real-life graphs, including distance-time and velocity-time",
            detail: "",
          },
          {
            label: "Gradients and areas under graphs (H)",
            detail: "",
          },
          {
            label: "Functions: inverse and composite (H)",
            detail: "",
          },
          {
            label: "Iteration (H)",
            detail: "",
          },
          {
            label: "Algebraic proof",
            detail: "",
          },
          {
            label: "Algebraic fractions (H)",
            detail: "",
          },
        ],
      },
      {
        unit: "Ratio, Proportion and Rates of Change",
        elements: [
          {
            label: "Ratio notation, simplifying and sharing in a ratio",
            detail: "",
          },
          {
            label: "Ratio and fractions",
            detail: "",
          },
          {
            label: "Direct and inverse proportion",
            detail: "",
          },
          {
            label: "Proportion with powers and roots (H)",
            detail: "",
          },
          {
            label: "Percentages: of amounts, increase and decrease",
            detail: "",
          },
          {
            label: "Reverse percentages",
            detail: "",
          },
          {
            label: "Simple and compound interest",
            detail: "",
          },
          {
            label: "Growth and decay",
            detail: "",
          },
          {
            label: "Speed, density and pressure",
            detail: "",
          },
          {
            label: "Best buys and unit pricing",
            detail: "",
          },
          {
            label: "Converting units, including area and volume units",
            detail: "",
          },
          {
            label: "Scale drawings and maps",
            detail: "",
          },
          {
            label: "Rates of change and instantaneous gradient (H)",
            detail: "",
          },
        ],
      },
      {
        unit: "Geometry and Measures",
        elements: [
          {
            label: "Angle facts and angles in parallel lines",
            detail: "",
          },
          {
            label: "Angles in polygons",
            detail: "",
          },
          {
            label: "Properties of 2D shapes",
            detail: "",
          },
          {
            label: "Perimeter and area, including circles",
            detail: "",
          },
          {
            label: "Arc length and sector area",
            detail: "",
          },
          {
            label: "3D shapes: nets, plans and elevations",
            detail: "",
          },
          {
            label: "Surface area and volume (prisms, cylinders, cones, spheres, pyramids)",
            detail: "",
          },
          {
            label: "Constructions and loci",
            detail: "",
          },
          {
            label: "Bearings",
            detail: "",
          },
          {
            label: "Transformations: reflection, rotation, translation, enlargement",
            detail: "",
          },
          {
            label: "Negative and fractional scale factors (H)",
            detail: "",
          },
          {
            label: "Congruence",
            detail: "",
          },
          {
            label: "Similarity, including area and volume scale factors",
            detail: "",
          },
          {
            label: "Pythagoras' theorem",
            detail: "",
          },
          {
            label: "Right-angled trigonometry (SOH CAH TOA)",
            detail: "",
          },
          {
            label: "Exact trig values",
            detail: "",
          },
          {
            label: "Sine rule, cosine rule and ½ab sin C (H)",
            detail: "",
          },
          {
            label: "3D Pythagoras and trigonometry (H)",
            detail: "",
          },
          {
            label: "Circle theorems (H)",
            detail: "",
          },
          {
            label: "Vectors",
            detail: "",
          },
          {
            label: "Vector proof (H)",
            detail: "",
          },
        ],
      },
      {
        unit: "Probability",
        elements: [
          {
            label: "Probability scale and basic probability",
            detail: "",
          },
          {
            label: "Relative frequency and expected outcomes",
            detail: "",
          },
          {
            label: "Sample space diagrams",
            detail: "",
          },
          {
            label: "Venn diagrams and set notation",
            detail: "",
          },
          {
            label: "Tree diagrams",
            detail: "",
          },
          {
            label: "Independent and mutually exclusive events",
            detail: "",
          },
          {
            label: "Conditional probability (H)",
            detail: "",
          },
        ],
      },
      {
        unit: "Statistics",
        elements: [
          {
            label: "Types of data and sampling",
            detail: "",
          },
          {
            label: "Averages and range",
            detail: "",
          },
          {
            label: "Averages from frequency tables",
            detail: "",
          },
          {
            label: "Bar charts, pie charts and pictograms",
            detail: "",
          },
          {
            label: "Stem-and-leaf diagrams",
            detail: "",
          },
          {
            label: "Scatter graphs and correlation",
            detail: "",
          },
          {
            label: "Time series",
            detail: "",
          },
          {
            label: "Cumulative frequency and box plots (H)",
            detail: "",
          },
          {
            label: "Histograms (H)",
            detail: "",
          },
          {
            label: "Comparing distributions",
            detail: "",
          },
        ],
      },
    ],
  },
  "Combined Science (Trilogy / Double Award)": {
    source:
      'Based on AQA GCSE Combined Science: Trilogy (8464), a double award covering most of Biology, Chemistry and Physics. Covers the "Science" core subject too. (H) marks Higher-tier-only content.',
    units: [
      {
        unit: "Biology: 1. Cell Biology",
        elements: [
          {
            label: "Animal, plant and bacterial cells",
            detail: "",
          },
          {
            label: "Microscopy and magnification",
            detail: "",
          },
          {
            label: "Cell specialisation and differentiation",
            detail: "",
          },
          {
            label: "Mitosis and the cell cycle",
            detail: "",
          },
          {
            label: "Stem cells",
            detail: "",
          },
          {
            label: "Diffusion, osmosis and active transport",
            detail: "",
          },
        ],
      },
      {
        unit: "Biology: 2. Organisation",
        elements: [
          {
            label: "Digestive system and enzymes",
            detail: "",
          },
          {
            label: "Heart, blood vessels and blood",
            detail: "",
          },
          {
            label: "Coronary heart disease",
            detail: "",
          },
          {
            label: "Non-communicable diseases and cancer",
            detail: "",
          },
          {
            label: "Plant tissues, transpiration and translocation",
            detail: "",
          },
        ],
      },
      {
        unit: "Biology: 3. Infection and Response",
        elements: [
          {
            label: "Pathogens and communicable diseases",
            detail: "",
          },
          {
            label: "Human defence systems",
            detail: "",
          },
          {
            label: "Vaccination",
            detail: "",
          },
          {
            label: "Antibiotics and drug development",
            detail: "",
          },
        ],
      },
      {
        unit: "Biology: 4. Bioenergetics",
        elements: [
          {
            label: "Photosynthesis and limiting factors",
            detail: "",
          },
          {
            label: "Aerobic and anaerobic respiration",
            detail: "",
          },
          {
            label: "Response to exercise and metabolism",
            detail: "",
          },
        ],
      },
      {
        unit: "Biology: 5. Homeostasis and Response",
        elements: [
          {
            label: "Nervous system and reflexes",
            detail: "",
          },
          {
            label: "Hormones and the endocrine system",
            detail: "",
          },
          {
            label: "Blood glucose control and diabetes",
            detail: "",
          },
          {
            label: "Hormones in reproduction and contraception",
            detail: "",
          },
          {
            label: "Negative feedback (adrenaline and thyroxine) (H)",
            detail: "",
          },
        ],
      },
      {
        unit: "Biology: 6. Inheritance, Variation and Evolution",
        elements: [
          {
            label: "Sexual and asexual reproduction, meiosis",
            detail: "",
          },
          {
            label: "DNA and the genome",
            detail: "",
          },
          {
            label: "Genetic inheritance and inherited disorders",
            detail: "",
          },
          {
            label: "Variation and evolution",
            detail: "",
          },
          {
            label: "Selective breeding and genetic engineering",
            detail: "",
          },
          {
            label: "Classification and extinction",
            detail: "",
          },
          {
            label: "Antibiotic resistance",
            detail: "",
          },
        ],
      },
      {
        unit: "Biology: 7. Ecology",
        elements: [
          {
            label: "Communities, adaptations and interdependence",
            detail: "",
          },
          {
            label: "Sampling organisms",
            detail: "",
          },
          {
            label: "Carbon and water cycles",
            detail: "",
          },
          {
            label: "Biodiversity and human impact",
            detail: "",
          },
        ],
      },
      {
        unit: "Chemistry: 8. Atomic Structure and the Periodic Table",
        elements: [
          {
            label: "Atoms, isotopes and electronic structure",
            detail: "",
          },
          {
            label: "Development of the atomic model",
            detail: "",
          },
          {
            label: "Separating mixtures",
            detail: "",
          },
          {
            label: "The periodic table, Group 0, 1 and 7",
            detail: "",
          },
        ],
      },
      {
        unit: "Chemistry: 9. Bonding, Structure and Properties of Matter",
        elements: [
          {
            label: "Ionic, covalent and metallic bonding",
            detail: "",
          },
          {
            label: "Properties of different structures",
            detail: "",
          },
          {
            label: "Diamond, graphite, graphene and fullerenes",
            detail: "",
          },
        ],
      },
      {
        unit: "Chemistry: 10. Quantitative Chemistry",
        elements: [
          {
            label: "Conservation of mass and relative formula mass",
            detail: "",
          },
          {
            label: "Moles and reacting masses (H)",
            detail: "",
          },
          {
            label: "Concentration of solutions",
            detail: "",
          },
        ],
      },
      {
        unit: "Chemistry: 11. Chemical Changes",
        elements: [
          {
            label: "Reactivity series and metal extraction",
            detail: "",
          },
          {
            label: "Acids, alkalis, salts and neutralisation",
            detail: "",
          },
          {
            label: "Electrolysis (11. Chemical Changes)",
            detail: "",
          },
        ],
      },
      {
        unit: "Chemistry: 12. Energy Changes",
        elements: [
          {
            label: "Exothermic and endothermic reactions",
            detail: "",
          },
          {
            label: "Reaction profiles and bond energies (H)",
            detail: "",
          },
        ],
      },
      {
        unit: "Chemistry: 13. The Rate and Extent of Chemical Change",
        elements: [
          {
            label: "Rates of reaction and collision theory",
            detail: "",
          },
          {
            label: "Reversible reactions and equilibrium (H)",
            detail: "",
          },
        ],
      },
      {
        unit: "Chemistry: 14. Organic Chemistry",
        elements: [
          {
            label: "Crude oil, alkanes and fractional distillation",
            detail: "",
          },
          {
            label: "Cracking and alkenes",
            detail: "",
          },
        ],
      },
      {
        unit: "Chemistry: 15. Chemical Analysis",
        elements: [
          {
            label: "Purity, formulations and chromatography",
            detail: "",
          },
          {
            label: "Tests for gases",
            detail: "",
          },
        ],
      },
      {
        unit: "Chemistry: 16. Chemistry of the Atmosphere",
        elements: [
          {
            label: "Evolution of the atmosphere",
            detail: "",
          },
          {
            label: "Greenhouse gases and climate change",
            detail: "",
          },
          {
            label: "Atmospheric pollutants",
            detail: "",
          },
        ],
      },
      {
        unit: "Chemistry: 17. Using Resources",
        elements: [
          {
            label: "Sustainable development and potable water",
            detail: "",
          },
          {
            label: "Waste water treatment",
            detail: "",
          },
          {
            label: "Life cycle assessment and recycling",
            detail: "",
          },
        ],
      },
      {
        unit: "Physics: 18. Energy",
        elements: [
          {
            label: "Energy stores, transfers and calculations",
            detail: "",
          },
          {
            label: "Specific heat capacity (18. Energy)",
            detail: "",
          },
          {
            label: "Power, efficiency and dissipation",
            detail: "",
          },
          {
            label: "Energy resources",
            detail: "",
          },
        ],
      },
      {
        unit: "Physics: 19. Electricity",
        elements: [
          {
            label: "Current, potential difference and resistance",
            detail: "",
          },
          {
            label: "Series and parallel circuits",
            detail: "",
          },
          {
            label: "Domestic electricity and power",
            detail: "",
          },
          {
            label: "The National Grid",
            detail: "",
          },
        ],
      },
      {
        unit: "Physics: 20. Particle Model of Matter",
        elements: [
          {
            label: "Density and states of matter",
            detail: "",
          },
          {
            label: "Internal energy and specific latent heat",
            detail: "",
          },
          {
            label: "Gas pressure",
            detail: "",
          },
        ],
      },
      {
        unit: "Physics: 21. Atomic Structure",
        elements: [
          {
            label: "Atomic model and isotopes",
            detail: "",
          },
          {
            label: "Radioactive decay and half-life",
            detail: "",
          },
          {
            label: "Hazards of radiation",
            detail: "",
          },
        ],
      },
      {
        unit: "Physics: 22. Forces",
        elements: [
          {
            label: "Forces, resultant forces and work done",
            detail: "",
          },
          {
            label: "Elasticity",
            detail: "",
          },
          {
            label: "Motion: speed, velocity and acceleration",
            detail: "",
          },
          {
            label: "Newton's laws",
            detail: "",
          },
          {
            label: "Stopping distances",
            detail: "",
          },
          {
            label: "Momentum (H)",
            detail: "",
          },
        ],
      },
      {
        unit: "Physics: 23. Waves",
        elements: [
          {
            label: "Wave properties and the wave equation",
            detail: "",
          },
          {
            label: "Electromagnetic spectrum, uses and hazards",
            detail: "",
          },
        ],
      },
      {
        unit: "Physics: 24. Magnetism and Electromagnetism",
        elements: [
          {
            label: "Magnets and electromagnets",
            detail: "",
          },
          {
            label: "Motor effect (H)",
            detail: "",
          },
        ],
      },
      {
        unit: "Required practicals",
        elements: [
          {
            label: "Microscopy",
            detail: "",
          },
          {
            label: "Osmosis",
            detail: "",
          },
          {
            label: "Food tests",
            detail: "",
          },
          {
            label: "Enzymes",
            detail: "",
          },
          {
            label: "Photosynthesis",
            detail: "",
          },
          {
            label: "Reaction time",
            detail: "",
          },
          {
            label: "Field investigations",
            detail: "",
          },
          {
            label: "Making salts",
            detail: "",
          },
          {
            label: "Electrolysis (Required practicals)",
            detail: "",
          },
          {
            label: "Temperature changes",
            detail: "",
          },
          {
            label: "Rates of reaction",
            detail: "",
          },
          {
            label: "Chromatography",
            detail: "",
          },
          {
            label: "Water purification",
            detail: "",
          },
          {
            label: "Specific heat capacity (Required practicals)",
            detail: "",
          },
          {
            label: "Resistance",
            detail: "",
          },
          {
            label: "I–V characteristics",
            detail: "",
          },
          {
            label: "Density",
            detail: "",
          },
          {
            label: "Force and extension",
            detail: "",
          },
          {
            label: "Acceleration",
            detail: "",
          },
          {
            label: "Waves",
            detail: "",
          },
          {
            label: "Infrared radiation",
            detail: "",
          },
        ],
      },
    ],
  },
  Biology: {
    source:
      "Based on AQA GCSE Biology (8461). Separate (triple) science. Required practicals are listed at the end.",
    units: [
      {
        unit: "1. Cell Biology",
        elements: [
          {
            label: "Eukaryotic and prokaryotic cells",
            detail: "",
          },
          {
            label: "Animal and plant cell structure",
            detail: "",
          },
          {
            label: "Cell specialisation and differentiation",
            detail: "",
          },
          {
            label: "Microscopy and magnification calculations",
            detail: "",
          },
          {
            label: "Culturing microorganisms",
            detail: "",
          },
          {
            label: "Chromosomes and mitosis (cell cycle)",
            detail: "",
          },
          {
            label: "Stem cells",
            detail: "",
          },
          {
            label: "Diffusion",
            detail: "",
          },
          {
            label: "Osmosis (1. Cell Biology)",
            detail: "",
          },
          {
            label: "Active transport",
            detail: "",
          },
        ],
      },
      {
        unit: "2. Organisation",
        elements: [
          {
            label: "Levels of organisation",
            detail: "",
          },
          {
            label: "The digestive system",
            detail: "",
          },
          {
            label: "Enzymes and factors affecting them",
            detail: "",
          },
          {
            label: "Food tests (2. Organisation)",
            detail: "",
          },
          {
            label: "The heart and blood vessels",
            detail: "",
          },
          {
            label: "Blood",
            detail: "",
          },
          {
            label: "Coronary heart disease and treatments",
            detail: "",
          },
          {
            label: "Health issues and non-communicable disease",
            detail: "",
          },
          {
            label: "Effect of lifestyle on health",
            detail: "",
          },
          {
            label: "Cancer",
            detail: "",
          },
          {
            label: "Plant tissues and organs",
            detail: "",
          },
          {
            label: "Transpiration and translocation",
            detail: "",
          },
        ],
      },
      {
        unit: "3. Infection and Response",
        elements: [
          {
            label: "Communicable diseases and pathogens",
            detail: "",
          },
          {
            label: "Viral diseases (measles, HIV, TMV)",
            detail: "",
          },
          {
            label: "Bacterial diseases (salmonella, gonorrhoea)",
            detail: "",
          },
          {
            label: "Fungal and protist diseases (rose black spot, malaria)",
            detail: "",
          },
          {
            label: "Human defence systems",
            detail: "",
          },
          {
            label: "Vaccination",
            detail: "",
          },
          {
            label: "Antibiotics and painkillers",
            detail: "",
          },
          {
            label: "Discovery and development of drugs",
            detail: "",
          },
          {
            label: "Monoclonal antibodies",
            detail: "",
          },
          {
            label: "Plant disease and defences",
            detail: "",
          },
        ],
      },
      {
        unit: "4. Bioenergetics",
        elements: [
          {
            label: "Photosynthesis",
            detail: "",
          },
          {
            label: "Rate of photosynthesis and limiting factors",
            detail: "",
          },
          {
            label: "Uses of glucose from photosynthesis",
            detail: "",
          },
          {
            label: "Aerobic and anaerobic respiration",
            detail: "",
          },
          {
            label: "Response to exercise",
            detail: "",
          },
          {
            label: "Metabolism",
            detail: "",
          },
        ],
      },
      {
        unit: "5. Homeostasis and Response",
        elements: [
          {
            label: "Homeostasis",
            detail: "",
          },
          {
            label: "The nervous system and reflex arc",
            detail: "",
          },
          {
            label: "The brain",
            detail: "",
          },
          {
            label: "The eye",
            detail: "",
          },
          {
            label: "Control of body temperature",
            detail: "",
          },
          {
            label: "The endocrine system",
            detail: "",
          },
          {
            label: "Control of blood glucose and diabetes",
            detail: "",
          },
          {
            label: "Maintaining water and nitrogen balance (kidneys)",
            detail: "",
          },
          {
            label: "Hormones in human reproduction",
            detail: "",
          },
          {
            label: "Contraception",
            detail: "",
          },
          {
            label: "Using hormones to treat infertility",
            detail: "",
          },
          {
            label: "Negative feedback (adrenaline and thyroxine)",
            detail: "",
          },
          {
            label: "Plant hormones and their uses",
            detail: "",
          },
        ],
      },
      {
        unit: "6. Inheritance, Variation and Evolution",
        elements: [
          {
            label: "Sexual and asexual reproduction",
            detail: "",
          },
          {
            label: "Meiosis",
            detail: "",
          },
          {
            label: "DNA and the genome",
            detail: "",
          },
          {
            label: "Protein synthesis and mutations",
            detail: "",
          },
          {
            label: "Genetic inheritance and Punnett squares",
            detail: "",
          },
          {
            label: "Inherited disorders",
            detail: "",
          },
          {
            label: "Sex determination",
            detail: "",
          },
          {
            label: "Variation",
            detail: "",
          },
          {
            label: "Evolution and natural selection",
            detail: "",
          },
          {
            label: "Selective breeding",
            detail: "",
          },
          {
            label: "Genetic engineering",
            detail: "",
          },
          {
            label: "Cloning",
            detail: "",
          },
          {
            label: "Theory of evolution (Darwin, Wallace)",
            detail: "",
          },
          {
            label: "Speciation",
            detail: "",
          },
          {
            label: "Fossils and extinction",
            detail: "",
          },
          {
            label: "Antibiotic-resistant bacteria",
            detail: "",
          },
          {
            label: "Classification of living organisms",
            detail: "",
          },
        ],
      },
      {
        unit: "7. Ecology",
        elements: [
          {
            label: "Communities and interdependence",
            detail: "",
          },
          {
            label: "Abiotic and biotic factors",
            detail: "",
          },
          {
            label: "Adaptations",
            detail: "",
          },
          {
            label: "Levels of organisation in ecosystems (food chains)",
            detail: "",
          },
          {
            label: "Sampling techniques (quadrats, transects)",
            detail: "",
          },
          {
            label: "Carbon and water cycles",
            detail: "",
          },
          {
            label: "Decomposition",
            detail: "",
          },
          {
            label: "Biodiversity and human impact",
            detail: "",
          },
          {
            label: "Waste management and pollution",
            detail: "",
          },
          {
            label: "Land use and deforestation",
            detail: "",
          },
          {
            label: "Global warming",
            detail: "",
          },
          {
            label: "Maintaining biodiversity",
            detail: "",
          },
          {
            label: "Trophic levels and pyramids of biomass",
            detail: "",
          },
          {
            label: "Food production and food security",
            detail: "",
          },
        ],
      },
      {
        unit: "Required practicals",
        elements: [
          {
            label: "Microscopy",
            detail: "",
          },
          {
            label: "Microbiology (antibiotics/antiseptics)",
            detail: "",
          },
          {
            label: "Osmosis (Required practicals)",
            detail: "",
          },
          {
            label: "Food tests (Required practicals)",
            detail: "",
          },
          {
            label: "Enzymes (effect of pH)",
            detail: "",
          },
          {
            label: "Photosynthesis (light intensity)",
            detail: "",
          },
          {
            label: "Reaction time",
            detail: "",
          },
          {
            label: "Plant responses (light/gravity)",
            detail: "",
          },
          {
            label: "Field investigations",
            detail: "",
          },
          {
            label: "Decay (temperature)",
            detail: "",
          },
        ],
      },
    ],
  },
  Chemistry: {
    source:
      "Based on AQA GCSE Chemistry (8462). Separate (triple) science. (H) marks Higher-tier-only content.",
    units: [
      {
        unit: "1. Atomic Structure and the Periodic Table",
        elements: [
          {
            label: "Atoms, elements and compounds",
            detail: "",
          },
          {
            label: "Mixtures and separation techniques",
            detail: "",
          },
          {
            label: "Development of the model of the atom",
            detail: "",
          },
          {
            label: "Subatomic particles, mass number and isotopes",
            detail: "",
          },
          {
            label: "Electronic structure",
            detail: "",
          },
          {
            label: "The periodic table and its development",
            detail: "",
          },
          {
            label: "Metals and non-metals",
            detail: "",
          },
          {
            label: "Group 0 (noble gases)",
            detail: "",
          },
          {
            label: "Group 1 (alkali metals)",
            detail: "",
          },
          {
            label: "Group 7 (halogens)",
            detail: "",
          },
          {
            label: "Transition metals",
            detail: "",
          },
        ],
      },
      {
        unit: "2. Bonding, Structure and Properties of Matter",
        elements: [
          {
            label: "Ionic bonding and ionic compounds",
            detail: "",
          },
          {
            label: "Covalent bonding and simple molecules",
            detail: "",
          },
          {
            label: "Giant covalent structures (diamond, graphite, silica)",
            detail: "",
          },
          {
            label: "Metallic bonding and alloys",
            detail: "",
          },
          {
            label: "States of matter and state symbols",
            detail: "",
          },
          {
            label: "Graphene and fullerenes",
            detail: "",
          },
          {
            label: "Nanoparticles and their uses",
            detail: "",
          },
        ],
      },
      {
        unit: "3. Quantitative Chemistry",
        elements: [
          {
            label: "Conservation of mass and balanced equations",
            detail: "",
          },
          {
            label: "Relative formula mass",
            detail: "",
          },
          {
            label: "Moles (H)",
            detail: "",
          },
          {
            label: "Reacting masses and limiting reactants (H)",
            detail: "",
          },
          {
            label: "Concentration of solutions",
            detail: "",
          },
          {
            label: "Yield and atom economy",
            detail: "",
          },
          {
            label: "Titration calculations (H)",
            detail: "",
          },
          {
            label: "Volumes of gases (H)",
            detail: "",
          },
        ],
      },
      {
        unit: "4. Chemical Changes",
        elements: [
          {
            label: "Reactivity series",
            detail: "",
          },
          {
            label: "Extraction of metals and reduction",
            detail: "",
          },
          {
            label: "Oxidation and reduction in terms of electrons (H)",
            detail: "",
          },
          {
            label: "Reactions of acids with metals, bases and carbonates",
            detail: "",
          },
          {
            label: "Making soluble salts",
            detail: "",
          },
          {
            label: "pH scale and neutralisation",
            detail: "",
          },
          {
            label: "Strong and weak acids (H)",
            detail: "",
          },
          {
            label: "Electrolysis: principles",
            detail: "",
          },
          {
            label: "Electrolysis of molten compounds and aqueous solutions",
            detail: "",
          },
          {
            label: "Extraction of aluminium",
            detail: "",
          },
          {
            label: "Half equations (H)",
            detail: "",
          },
        ],
      },
      {
        unit: "5. Energy Changes",
        elements: [
          {
            label: "Exothermic and endothermic reactions",
            detail: "",
          },
          {
            label: "Reaction profiles",
            detail: "",
          },
          {
            label: "Bond energy calculations (H)",
            detail: "",
          },
          {
            label: "Chemical cells and batteries",
            detail: "",
          },
          {
            label: "Fuel cells",
            detail: "",
          },
        ],
      },
      {
        unit: "6. The Rate and Extent of Chemical Change",
        elements: [
          {
            label: "Calculating rates of reaction",
            detail: "",
          },
          {
            label: "Factors affecting rate (collision theory)",
            detail: "",
          },
          {
            label: "Catalysts",
            detail: "",
          },
          {
            label: "Reversible reactions",
            detail: "",
          },
          {
            label: "Equilibrium and Le Chatelier's principle (H)",
            detail: "",
          },
        ],
      },
      {
        unit: "7. Organic Chemistry",
        elements: [
          {
            label: "Crude oil, hydrocarbons and alkanes",
            detail: "",
          },
          {
            label: "Fractional distillation",
            detail: "",
          },
          {
            label: "Cracking and alkenes",
            detail: "",
          },
          {
            label: "Reactions of alkenes",
            detail: "",
          },
          {
            label: "Alcohols",
            detail: "",
          },
          {
            label: "Carboxylic acids",
            detail: "",
          },
          {
            label: "Addition polymerisation",
            detail: "",
          },
          {
            label: "Condensation polymerisation (H)",
            detail: "",
          },
          {
            label: "Amino acids, DNA and natural polymers",
            detail: "",
          },
        ],
      },
      {
        unit: "8. Chemical Analysis",
        elements: [
          {
            label: "Pure substances and formulations",
            detail: "",
          },
          {
            label: "Chromatography and Rf values",
            detail: "",
          },
          {
            label: "Tests for gases",
            detail: "",
          },
          {
            label: "Flame tests",
            detail: "",
          },
          {
            label: "Tests for metal hydroxides, carbonates, halides and sulfates",
            detail: "",
          },
          {
            label: "Instrumental methods (flame emission spectroscopy)",
            detail: "",
          },
        ],
      },
      {
        unit: "9. Chemistry of the Atmosphere",
        elements: [
          {
            label: "Evolution of the atmosphere",
            detail: "",
          },
          {
            label: "Greenhouse gases and climate change",
            detail: "",
          },
          {
            label: "Carbon footprint",
            detail: "",
          },
          {
            label: "Atmospheric pollutants",
            detail: "",
          },
        ],
      },
      {
        unit: "10. Using Resources",
        elements: [
          {
            label: "Finite and renewable resources",
            detail: "",
          },
          {
            label: "Potable water",
            detail: "",
          },
          {
            label: "Waste water treatment",
            detail: "",
          },
          {
            label: "Alternative methods of extracting metals (phytomining, bioleaching)",
            detail: "",
          },
          {
            label: "Life cycle assessment",
            detail: "",
          },
          {
            label: "Reducing use of resources and recycling",
            detail: "",
          },
          {
            label: "Corrosion and its prevention",
            detail: "",
          },
          {
            label: "Alloys as useful materials",
            detail: "",
          },
          {
            label: "Ceramics, polymers and composites",
            detail: "",
          },
          {
            label: "The Haber process",
            detail: "",
          },
          {
            label: "NPK fertilisers",
            detail: "",
          },
        ],
      },
      {
        unit: "Required practicals",
        elements: [
          {
            label: "Making salts",
            detail: "",
          },
          {
            label: "Neutralisation (titration)",
            detail: "",
          },
          {
            label: "Electrolysis",
            detail: "",
          },
          {
            label: "Temperature changes",
            detail: "",
          },
          {
            label: "Rates of reaction",
            detail: "",
          },
          {
            label: "Chromatography",
            detail: "",
          },
          {
            label: "Identifying ions",
            detail: "",
          },
          {
            label: "Water purification",
            detail: "",
          },
        ],
      },
    ],
  },
  Physics: {
    source:
      "Based on AQA GCSE Physics (8463). Separate (triple) science. (H) marks Higher-tier-only content.",
    units: [
      {
        unit: "1. Energy",
        elements: [
          {
            label: "Energy stores and systems",
            detail: "",
          },
          {
            label: "Kinetic, gravitational and elastic potential energy calculations",
            detail: "",
          },
          {
            label: "Specific heat capacity (1. Energy)",
            detail: "",
          },
          {
            label: "Power and work done",
            detail: "",
          },
          {
            label: "Conservation and dissipation of energy",
            detail: "",
          },
          {
            label: "Efficiency",
            detail: "",
          },
          {
            label: "Thermal insulation (1. Energy)",
            detail: "",
          },
          {
            label: "National and global energy resources",
            detail: "",
          },
        ],
      },
      {
        unit: "2. Electricity",
        elements: [
          {
            label: "Circuit symbols and diagrams",
            detail: "",
          },
          {
            label: "Charge, current and potential difference",
            detail: "",
          },
          {
            label: "Resistance and Ohm's law",
            detail: "",
          },
          {
            label: "I–V characteristics (resistor, filament lamp, diode)",
            detail: "",
          },
          {
            label: "Thermistors and LDRs",
            detail: "",
          },
          {
            label: "Series and parallel circuits",
            detail: "",
          },
          {
            label: "Mains electricity (ac/dc, plugs, wires)",
            detail: "",
          },
          {
            label: "Electrical power and energy transfers",
            detail: "",
          },
          {
            label: "The National Grid",
            detail: "",
          },
          {
            label: "Static electricity and electric fields",
            detail: "",
          },
        ],
      },
      {
        unit: "3. Particle Model of Matter",
        elements: [
          {
            label: "Density (3. Particle Model of Matter)",
            detail: "",
          },
          {
            label: "Changes of state",
            detail: "",
          },
          {
            label: "Internal energy",
            detail: "",
          },
          {
            label: "Specific latent heat",
            detail: "",
          },
          {
            label: "Particle motion in gases and pressure",
            detail: "",
          },
          {
            label: "Increasing pressure by doing work (H)",
            detail: "",
          },
        ],
      },
      {
        unit: "4. Atomic Structure",
        elements: [
          {
            label: "Structure of the atom and isotopes",
            detail: "",
          },
          {
            label: "Development of the atomic model",
            detail: "",
          },
          {
            label: "Radioactive decay and nuclear radiation (alpha, beta, gamma)",
            detail: "",
          },
          {
            label: "Nuclear equations",
            detail: "",
          },
          {
            label: "Half-life",
            detail: "",
          },
          {
            label: "Contamination and irradiation",
            detail: "",
          },
          {
            label: "Background radiation",
            detail: "",
          },
          {
            label: "Uses of nuclear radiation in medicine",
            detail: "",
          },
          {
            label: "Nuclear fission and fusion",
            detail: "",
          },
        ],
      },
      {
        unit: "5. Forces",
        elements: [
          {
            label: "Scalars and vectors",
            detail: "",
          },
          {
            label: "Contact and non-contact forces",
            detail: "",
          },
          {
            label: "Gravity, mass and weight",
            detail: "",
          },
          {
            label: "Resultant forces and free-body diagrams",
            detail: "",
          },
          {
            label: "Resolving forces (H)",
            detail: "",
          },
          {
            label: "Work done and energy transfer",
            detail: "",
          },
          {
            label: "Forces and elasticity (Hooke's law)",
            detail: "",
          },
          {
            label: "Moments, levers and gears",
            detail: "",
          },
          {
            label: "Pressure in fluids and upthrust",
            detail: "",
          },
          {
            label: "Atmospheric pressure",
            detail: "",
          },
          {
            label: "Distance, displacement, speed and velocity",
            detail: "",
          },
          {
            label: "Acceleration and motion graphs",
            detail: "",
          },
          {
            label: "Equations of motion",
            detail: "",
          },
          {
            label: "Newton's laws of motion",
            detail: "",
          },
          {
            label: "Terminal velocity",
            detail: "",
          },
          {
            label: "Stopping distances",
            detail: "",
          },
          {
            label: "Momentum and conservation of momentum",
            detail: "",
          },
          {
            label: "Changes in momentum and safety features (H)",
            detail: "",
          },
        ],
      },
      {
        unit: "6. Waves",
        elements: [
          {
            label: "Transverse and longitudinal waves",
            detail: "",
          },
          {
            label: "Wave properties and the wave equation",
            detail: "",
          },
          {
            label: "Reflection and refraction",
            detail: "",
          },
          {
            label: "Sound waves and ultrasound",
            detail: "",
          },
          {
            label: "Seismic waves",
            detail: "",
          },
          {
            label: "Electromagnetic spectrum",
            detail: "",
          },
          {
            label: "Uses and dangers of EM waves",
            detail: "",
          },
          {
            label: "Lenses and ray diagrams",
            detail: "",
          },
          {
            label: "Visible light and colour",
            detail: "",
          },
          {
            label: "Black body radiation",
            detail: "",
          },
        ],
      },
      {
        unit: "7. Magnetism and Electromagnetism",
        elements: [
          {
            label: "Magnets and magnetic fields",
            detail: "",
          },
          {
            label: "Electromagnets",
            detail: "",
          },
          {
            label: "The motor effect and Fleming's left-hand rule",
            detail: "",
          },
          {
            label: "Electric motors",
            detail: "",
          },
          {
            label: "Loudspeakers and microphones",
            detail: "",
          },
          {
            label: "Induced potential and generators (H)",
            detail: "",
          },
          {
            label: "Transformers (H)",
            detail: "",
          },
        ],
      },
      {
        unit: "8. Space Physics",
        elements: [
          {
            label: "Our solar system",
            detail: "",
          },
          {
            label: "Life cycle of a star",
            detail: "",
          },
          {
            label: "Orbital motion and satellites",
            detail: "",
          },
          {
            label: "Red-shift and the Big Bang theory",
            detail: "",
          },
        ],
      },
      {
        unit: "Required practicals",
        elements: [
          {
            label: "Specific heat capacity (Required practicals)",
            detail: "",
          },
          {
            label: "Thermal insulation (Required practicals)",
            detail: "",
          },
          {
            label: "Resistance",
            detail: "",
          },
          {
            label: "I–V characteristics",
            detail: "",
          },
          {
            label: "Density (Required practicals)",
            detail: "",
          },
          {
            label: "Force and extension",
            detail: "",
          },
          {
            label: "Acceleration",
            detail: "",
          },
          {
            label: "Waves (ripple tank and string)",
            detail: "",
          },
          {
            label: "Light (reflection and refraction)",
            detail: "",
          },
          {
            label: "Infrared radiation",
            detail: "",
          },
        ],
      },
    ],
  },
  Astronomy: {
    source: "Based on Pearson Edexcel GCSE Astronomy (1AS0), the only board offering this GCSE.",
    units: [
      {
        unit: "Paper 1: Naked-eye Astronomy",
        elements: [
          {
            label: "1. Planet Earth (shape, structure, atmosphere, latitude and longitude)",
            detail: "",
          },
          {
            label: "2. The lunar disc (features, phases, far side)",
            detail: "",
          },
          {
            label: "3. The Earth–Moon–Sun system (tides, eclipses)",
            detail: "",
          },
          {
            label:
              "4. Time and the Earth–Moon–Sun cycles (sidereal and solar day, equation of time)",
            detail: "",
          },
          {
            label: "5. Solar System observation (planets, retrograde motion, comets, meteors)",
            detail: "",
          },
          {
            label: "6. Celestial observation (celestial sphere, constellations, circumpolar stars)",
            detail: "",
          },
          {
            label: "7. Early models of the Solar System (geocentric and heliocentric)",
            detail: "",
          },
          {
            label: "8. Planetary motion and gravity (Kepler's laws, Newton)",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 2: Telescopic Astronomy",
        elements: [
          {
            label: "9. Exploring the Moon (origin, missions)",
            detail: "",
          },
          {
            label: "10. Solar astronomy (structure of the Sun, sunspots, solar wind)",
            detail: "",
          },
          {
            label: "11. Exploring the Solar System (probes, planets, moons, minor bodies)",
            detail: "",
          },
          {
            label: "12. Formation of planetary systems (exoplanets, detection methods)",
            detail: "",
          },
          {
            label: "13. Exploring starlight (magnitude, spectra, Hertzsprung–Russell diagram)",
            detail: "",
          },
          {
            label: "14. Stellar evolution (life cycle of stars)",
            detail: "",
          },
          {
            label: "15. Our place in the Galaxy (Milky Way, galaxy types)",
            detail: "",
          },
          {
            label: "16. Cosmology (Hubble's law, Big Bang, dark matter and dark energy)",
            detail: "",
          },
        ],
      },
      {
        unit: "Observation and skills",
        elements: [
          {
            label: "Unaided observation techniques",
            detail: "",
          },
          {
            label: "Aided observation (telescopes, binoculars, imaging)",
            detail: "",
          },
          {
            label: "Telescope types and their properties",
            detail: "",
          },
          {
            label: "Observing across the EM spectrum",
            detail: "",
          },
          {
            label: "Calculations and data handling",
            detail: "",
          },
        ],
      },
    ],
  },
  History: {
    source:
      "Based on AQA GCSE History (8145). Students study one option in each of the four sections; tick only the options your school takes.",
    units: [
      {
        unit: "Paper 1, Section A: Period study (one option): AA America, 1840–1895: Expansion and consolidation",
        elements: [
          {
            label: "Expansion: opportunities and challenges (the West, the Mormons, the Gold Rush)",
            detail: "",
          },
          {
            label: "Conflict across America (Civil War, Plains Indians)",
            detail: "",
          },
          {
            label: "Consolidation: forging the nation (Reconstruction, the end of the frontier)",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 1, Section A: Period study (one option): AB Germany, 1890–1945: Democracy and dictatorship",
        elements: [
          {
            label: "Germany and the growth of democracy (Kaiser Wilhelm, Weimar Republic)",
            detail: "",
          },
          {
            label: "Germany and the Depression (rise of the Nazis)",
            detail: "",
          },
          {
            label: "The experiences of Germans under the Nazis",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 1, Section A: Period study (one option): AC Russia, 1894–1945: Tsardom and communism",
        elements: [
          {
            label: "The end of Tsardom",
            detail: "",
          },
          {
            label: "Lenin's new society",
            detail: "",
          },
          {
            label: "Stalin's USSR",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 1, Section A: Period study (one option): AD America, 1920–1973: Opportunity and inequality",
        elements: [
          {
            label: "The American people and the 'Boom'",
            detail: "",
          },
          {
            label: "Bust: Americans' experiences of the Depression and New Deal",
            detail: "",
          },
          {
            label: "Post-war America (civil rights, social change)",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 1, Section B: Wider world depth study (one option): BA Conflict and tension, 1894–1918",
        elements: [
          {
            label: "The causes of the First World War",
            detail: "",
          },
          {
            label: "The first part of the war (Schlieffen Plan, trench warfare)",
            detail: "",
          },
          {
            label: "Ending the war",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 1, Section B: Wider world depth study (one option): BB Conflict and tension, 1918–1939",
        elements: [
          {
            label: "Peacemaking (Treaty of Versailles)",
            detail: "",
          },
          {
            label: "The League of Nations and international peace",
            detail: "",
          },
          {
            label: "The origins and outbreak of the Second World War",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 1, Section B: Wider world depth study (one option): BC Conflict and tension between East and West, 1945–1972",
        elements: [
          {
            label: "The origins of the Cold War",
            detail: "",
          },
          {
            label: "The development of the Cold War",
            detail: "",
          },
          {
            label:
              "Transformation of the Cold War (Berlin Wall, Cuban Missile Crisis, Prague Spring)",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 1, Section B: Wider world depth study (one option): BD Conflict and tension in Asia, 1950–1975",
        elements: [
          {
            label: "Conflict in Korea",
            detail: "",
          },
          {
            label: "Escalation of conflict in Vietnam",
            detail: "",
          },
          {
            label: "The ending of conflict in Vietnam",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 1, Section B: Wider world depth study (one option): BE Conflict and tension in the Gulf and Afghanistan, 1990–2009",
        elements: [
          {
            label: "The Gulf War",
            detail: "",
          },
          {
            label: "Afghanistan",
            detail: "",
          },
          {
            label: "Iraq",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 2, Section A: Thematic study (one option): AA Britain: Health and the people, c1000 to the present day",
        elements: [
          {
            label: "Medicine stands still (medieval medicine)",
            detail: "",
          },
          {
            label: "The beginnings of change (Renaissance)",
            detail: "",
          },
          {
            label: "A revolution in medicine (19th century)",
            detail: "",
          },
          {
            label: "Modern medicine (20th century to today)",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 2, Section A: Thematic study (one option): AB Britain: Power and the people, c1170 to the present day",
        elements: [
          {
            label: "Challenging authority and feudalism",
            detail: "",
          },
          {
            label: "Challenging royal authority",
            detail: "",
          },
          {
            label: "Reform and reformers",
            detail: "",
          },
          {
            label: "Equality and rights",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 2, Section A: Thematic study (one option): AC Britain: Migration, empires and the people, c790 to the present day",
        elements: [
          {
            label: "Conquered and conquerors",
            detail: "",
          },
          {
            label: "Looking west",
            detail: "",
          },
          {
            label: "Expansion and empire",
            detail: "",
          },
          {
            label: "Britain in the 20th century",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 2, Section B: British depth study including the historic environment (one option): BA Norman England, c1066–c1100",
        elements: [
          {
            label: "The Normans: conquest and control",
            detail: "",
          },
          {
            label: "Life under the Normans",
            detail: "",
          },
          {
            label: "The Norman Church and monasticism",
            detail: "",
          },
          {
            label: "The historic environment of Norman England (site changes yearly)",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 2, Section B: British depth study including the historic environment (one option): BB Medieval England: the reign of Edward I, 1272–1307",
        elements: [
          {
            label: "Government, the rights of King and people",
            detail: "",
          },
          {
            label: "Life in Edwardian England",
            detail: "",
          },
          {
            label: "Edward I's military campaigns in Wales and Scotland",
            detail: "",
          },
          {
            label: "The historic environment of Edwardian England (site changes yearly)",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 2, Section B: British depth study including the historic environment (one option): BC Elizabethan England, c1568–1603",
        elements: [
          {
            label: "Elizabeth's court and Parliament",
            detail: "",
          },
          {
            label: "Life in Elizabethan times",
            detail: "",
          },
          {
            label: "Troubles at home and abroad",
            detail: "",
          },
          {
            label: "The historic environment of Elizabethan England (site changes yearly)",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 2, Section B: British depth study including the historic environment (one option): BD Restoration England, 1660–1685",
        elements: [
          {
            label: "Crown, Parliament, plots and court life",
            detail: "",
          },
          {
            label: "Life in Restoration England",
            detail: "",
          },
          {
            label: "Land and sea power",
            detail: "",
          },
          {
            label: "The historic environment of Restoration England (site changes yearly)",
            detail: "",
          },
        ],
      },
      {
        unit: "Exam skills",
        elements: [
          {
            label: "Analysing sources: content and provenance",
            detail: "",
          },
          {
            label: "Evaluating interpretations",
            detail: "",
          },
          {
            label: "Explaining causes and consequences",
            detail: "",
          },
          {
            label: "Writing 'how far do you agree' essays",
            detail: "",
          },
          {
            label: "Spelling, punctuation and grammar",
            detail: "",
          },
        ],
      },
    ],
  },
  Geography: {
    source: "Based on AQA GCSE Geography (8035).",
    units: [
      {
        unit: "Paper 1: Living with the Physical Environment: Section A: The challenge of natural hazards",
        elements: [
          {
            label: "Natural hazards and hazard risk",
            detail: "",
          },
          {
            label: "Plate tectonics and plate margins",
            detail: "",
          },
          {
            label: "Effects of and responses to tectonic hazards (case studies in HIC and LIC)",
            detail: "",
          },
          {
            label: "Living with tectonic hazards (monitoring, prediction, protection, planning)",
            detail: "",
          },
          {
            label: "Global atmospheric circulation",
            detail: "",
          },
          {
            label: "Tropical storms: formation, effects and responses",
            detail: "",
          },
          {
            label: "UK weather hazards and extreme weather events",
            detail: "",
          },
          {
            label: "Climate change: evidence and causes",
            detail: "",
          },
          {
            label: "Managing climate change (mitigation and adaptation)",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 1: Living with the Physical Environment: Section B: The living world",
        elements: [
          {
            label: "Ecosystems: a small-scale UK ecosystem",
            detail: "",
          },
          {
            label: "Global ecosystems",
            detail: "",
          },
          {
            label: "Tropical rainforests: characteristics and adaptations",
            detail: "",
          },
          {
            label: "Deforestation and sustainable management of rainforests",
            detail: "",
          },
          {
            label:
              "Hot deserts (option): characteristics, opportunities, challenges and desertification",
            detail: "",
          },
          {
            label:
              "Cold environments (option): characteristics, opportunities, challenges and fragility",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 1: Living with the Physical Environment: Section C: Physical landscapes in the UK (two of three)",
        elements: [
          {
            label: "UK physical landscapes overview",
            detail: "",
          },
          {
            label: "Coastal landscapes: wave types, weathering and erosion processes",
            detail: "",
          },
          {
            label: "Coastal landforms (erosional and depositional)",
            detail: "",
          },
          {
            label: "Coastal management strategies",
            detail: "",
          },
          {
            label: "River landscapes: the long profile and processes",
            detail: "",
          },
          {
            label: "River landforms",
            detail: "",
          },
          {
            label: "Flood hydrographs and flood management",
            detail: "",
          },
          {
            label: "Glacial landscapes: processes and landforms",
            detail: "",
          },
          {
            label: "Land use and management in glaciated upland areas",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 2: Challenges in the Human Environment: Section A: Urban issues and challenges",
        elements: [
          {
            label: "Global pattern of urbanisation",
            detail: "",
          },
          {
            label: "Megacities",
            detail: "",
          },
          {
            label: "A major city in an LIC or NEE (case study)",
            detail: "",
          },
          {
            label: "Urban change in a major UK city (case study)",
            detail: "",
          },
          {
            label: "Urban regeneration",
            detail: "",
          },
          {
            label: "Sustainable urban living",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 2: Challenges in the Human Environment: Section B: The changing economic world",
        elements: [
          {
            label: "Measuring development (indicators, Demographic Transition Model)",
            detail: "",
          },
          {
            label: "Causes of uneven development",
            detail: "",
          },
          {
            label: "Reducing the development gap",
            detail: "",
          },
          {
            label: "Economic development in an LIC or NEE (case study)",
            detail: "",
          },
          {
            label: "Changes in the UK economy",
            detail: "",
          },
          {
            label: "The north–south divide and UK's place in the world",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 2: Challenges in the Human Environment: Section C: The challenge of resource management",
        elements: [
          {
            label: "Resources and their global distribution",
            detail: "",
          },
          {
            label: "Food, water and energy in the UK",
            detail: "",
          },
          {
            label: "Food (option): demand, insecurity and sustainable supplies",
            detail: "",
          },
          {
            label: "Water (option): demand, insecurity and sustainable supplies",
            detail: "",
          },
          {
            label: "Energy (option): demand, insecurity and sustainable supplies",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 3: Geographical Applications",
        elements: [
          {
            label: "Issue evaluation (pre-release booklet, changes yearly)",
            detail: "",
          },
          {
            label: "Fieldwork: human enquiry",
            detail: "",
          },
          {
            label: "Fieldwork: physical enquiry",
            detail: "",
          },
          {
            label:
              "Fieldwork stages: question, data collection, presentation, analysis, conclusion, evaluation",
            detail: "",
          },
        ],
      },
      {
        unit: "Geographical skills",
        elements: [
          {
            label: "Map skills: OS maps, grid references, scale, contour lines",
            detail: "",
          },
          {
            label: "Graphs and charts",
            detail: "",
          },
          {
            label: "Numerical and statistical skills",
            detail: "",
          },
          {
            label: "Interpreting photographs and satellite images",
            detail: "",
          },
        ],
      },
    ],
  },
  "Religious Studies": {
    source:
      "Based on AQA GCSE Religious Studies A (8062). Students take two religions in Component 1 and four themes in Component 2. Tick only those you study.",
    units: [
      {
        unit: "Component 1: Religions (two): Buddhism",
        elements: [
          {
            label: "Beliefs and teachings: the Buddha and the Dhamma",
            detail: "",
          },
          {
            label: "Beliefs and teachings: Four Noble Truths and Eightfold Path",
            detail: "",
          },
          {
            label: "Practices: worship, meditation, festivals and ethics",
            detail: "",
          },
        ],
      },
      {
        unit: "Component 1: Religions (two): Christianity",
        elements: [
          {
            label: "Beliefs and teachings: nature of God, creation, afterlife",
            detail: "",
          },
          {
            label: "Beliefs and teachings: Jesus Christ and salvation",
            detail: "",
          },
          {
            label: "Practices: worship, sacraments, prayer, pilgrimage, festivals",
            detail: "",
          },
          {
            label: "Practices: the role of the Church in the community and worldwide",
            detail: "",
          },
        ],
      },
      {
        unit: "Component 1: Religions (two): Catholic Christianity",
        elements: [
          {
            label: "Beliefs and teachings: Trinity, creation, incarnation, redemption, eschatology",
            detail: "",
          },
          {
            label: "Practices: sacraments, prayer, pilgrimage, mission and evangelism",
            detail: "",
          },
        ],
      },
      {
        unit: "Component 1: Religions (two): Hinduism",
        elements: [
          {
            label: "Beliefs and teachings: Brahman, deities, atman, karma, samsara, moksha",
            detail: "",
          },
          {
            label: "Practices: worship, pilgrimage, festivals, ethics",
            detail: "",
          },
        ],
      },
      {
        unit: "Component 1: Religions (two): Islam",
        elements: [
          {
            label:
              "Beliefs and teachings: Tawhid, prophethood, angels, akhirah, Six Articles of Faith",
            detail: "",
          },
          {
            label: "Practices: Five Pillars, Ten Obligatory Acts, jihad, festivals",
            detail: "",
          },
        ],
      },
      {
        unit: "Component 1: Religions (two): Judaism",
        elements: [
          {
            label: "Beliefs and teachings: nature of God, covenant, Messiah, mitzvot",
            detail: "",
          },
          {
            label: "Practices: synagogue worship, rituals, dietary laws, festivals",
            detail: "",
          },
        ],
      },
      {
        unit: "Component 1: Religions (two): Sikhism",
        elements: [
          {
            label: "Beliefs and teachings: God, Gurus, karma, mukti, sewa",
            detail: "",
          },
          {
            label: "Practices: Gurdwara worship, langar, rites of passage, festivals",
            detail: "",
          },
        ],
      },
      {
        unit: "Component 2: Thematic studies (four)",
        elements: [
          {
            label:
              "Theme A: Relationships and families (sex, marriage, divorce, family, gender equality)",
            detail: "",
          },
          {
            label:
              "Theme B: Religion and life (origins of the universe and life, value of the world, abortion, euthanasia, animal rights)",
            detail: "",
          },
          {
            label:
              "Theme C: The existence of God and revelation (design, first cause, miracles, evil and suffering, revelation)",
            detail: "",
          },
          {
            label:
              "Theme D: Religion, peace and conflict (violence, war, just war, holy war, terrorism, pacifism, nuclear weapons)",
            detail: "",
          },
          {
            label:
              "Theme E: Religion, crime and punishment (causes of crime, aims of punishment, forgiveness, death penalty)",
            detail: "",
          },
          {
            label:
              "Theme F: Religion, human rights and social justice (prejudice and discrimination, wealth, poverty, freedom of religious expression)",
            detail: "",
          },
        ],
      },
      {
        unit: "Textual studies (alternative route)",
        elements: [
          {
            label: "St Mark's Gospel: the life of Jesus",
            detail: "",
          },
          {
            label: "St Mark's Gospel as a source of spiritual truths",
            detail: "",
          },
        ],
      },
      {
        unit: "Exam skills",
        elements: [
          {
            label: "Using sources of wisdom and authority",
            detail: "",
          },
          {
            label: "Contrasting beliefs within and between religions",
            detail: "",
          },
          {
            label: "Evaluating a statement (12-mark questions)",
            detail: "",
          },
          {
            label: "Spelling, punctuation and grammar",
            detail: "",
          },
        ],
      },
    ],
  },
  "Ancient History": {
    source: "Based on OCR GCSE Ancient History (J198), the only board offering this GCSE.",
    units: [
      {
        unit: "Component 1: Greece and Persia: Period study",
        elements: [
          {
            label: "The Persian Empire, 559–465 BC: Cyrus the Great",
            detail: "",
          },
          {
            label: "Cambyses and the conquest of Egypt",
            detail: "",
          },
          {
            label: "Darius I: rise to power and organisation of the empire",
            detail: "",
          },
          {
            label: "Xerxes and the invasion of Greece",
            detail: "",
          },
        ],
      },
      {
        unit: "Component 1: Greece and Persia: Depth study (one option)",
        elements: [
          {
            label: "From Tyranny to Democracy, 546–483 BC",
            detail: "",
          },
          {
            label: "Athens in the Age of Pericles, 462–429 BC",
            detail: "",
          },
          {
            label: "Alexander the Great, 356–323 BC",
            detail: "",
          },
        ],
      },
      {
        unit: "Component 2: Rome: Period study",
        elements: [
          {
            label: "The Foundations of Rome: from kingship to republic, 753–440 BC",
            detail: "",
          },
          {
            label: "The legends of Romulus and the early kings",
            detail: "",
          },
          {
            label: "The overthrow of the monarchy and the early Republic",
            detail: "",
          },
          {
            label: "Conflict between patricians and plebeians",
            detail: "",
          },
        ],
      },
      {
        unit: "Component 2: Rome: Depth study (one option)",
        elements: [
          {
            label: "Hannibal and the Second Punic War, 218–201 BC",
            detail: "",
          },
          {
            label: "Cicero and the end of the Republic, 80–42 BC",
            detail: "",
          },
          {
            label: "The reign of Augustus, 31 BC–AD 14",
            detail: "",
          },
        ],
      },
      {
        unit: "Skills",
        elements: [
          {
            label: "Evaluating ancient sources (Herodotus, Livy, Plutarch and others)",
            detail: "",
          },
          {
            label: "Using archaeological and visual evidence",
            detail: "",
          },
          {
            label: "Explaining significance, cause and consequence",
            detail: "",
          },
          {
            label: "Extended essay writing",
            detail: "",
          },
        ],
      },
    ],
  },
  "Classical Civilisation": {
    source: "Based on OCR GCSE Classical Civilisation (J199), the only board offering this GCSE.",
    units: [
      {
        unit: "Component 1: Thematic study (one option): Myth and Religion",
        elements: [
          {
            label: "The gods: the Olympians and their roles",
            detail: "",
          },
          {
            label: "Religion and the city: temples, festivals and sacrifice",
            detail: "",
          },
          {
            label: "Myth and symbols of power (heroes such as Heracles and Theseus)",
            detail: "",
          },
          {
            label: "Death and burial",
            detail: "",
          },
          {
            label: "Myth in literature and art",
            detail: "",
          },
        ],
      },
      {
        unit: "Component 1: Thematic study (one option): Women in the Ancient World",
        elements: [
          {
            label: "Women of legend and history",
            detail: "",
          },
          {
            label: "Women and religion",
            detail: "",
          },
          {
            label: "Women in the home and public life",
            detail: "",
          },
          {
            label: "Women in literature",
            detail: "",
          },
        ],
      },
      {
        unit: "Component 2: Literature and culture (one option): The Homeric World",
        elements: [
          {
            label: "Mycenaean culture: palaces, Linear B, burial practices",
            detail: "",
          },
          {
            label: "Homer's Odyssey (set books)",
            detail: "",
          },
          {
            label: "Themes: heroism, hospitality (xenia), the gods, family",
            detail: "",
          },
        ],
      },
      {
        unit: "Component 2: Literature and culture (one option): Roman City Life",
        elements: [
          {
            label: "Roman housing, the home and family life",
            detail: "",
          },
          {
            label: "Roman society: patrons, clients and slaves",
            detail: "",
          },
          {
            label: "Entertainment: the theatre, chariot racing and gladiators",
            detail: "",
          },
          {
            label: "Roman literature on city life (set texts)",
            detail: "",
          },
        ],
      },
      {
        unit: "Component 2: Literature and culture (one option): War and Warfare",
        elements: [
          {
            label: "Spartan and Athenian warfare",
            detail: "",
          },
          {
            label: "Roman army: organisation and life of a soldier",
            detail: "",
          },
          {
            label: "Warfare in literature (set texts)",
            detail: "",
          },
        ],
      },
      {
        unit: "Skills",
        elements: [
          {
            label: "Analysing visual and material sources",
            detail: "",
          },
          {
            label: "Analysing literary sources",
            detail: "",
          },
          {
            label: "Comparing Greek and Roman ideas",
            detail: "",
          },
          {
            label: "Extended responses",
            detail: "",
          },
        ],
      },
    ],
  },
  "Citizenship Studies": {
    source: "Based on AQA GCSE Citizenship Studies (8100).",
    units: [
      {
        unit: "Theme 1: Active citizenship",
        elements: [
          {
            label: "How citizens can bring about change",
            detail: "",
          },
          {
            label: "Planning a citizenship action (your own campaign)",
            detail: "",
          },
          {
            label: "Evaluating your citizenship action",
            detail: "",
          },
          {
            label: "Case studies of citizen campaigns",
            detail: "",
          },
        ],
      },
      {
        unit: "Theme 2: Politics and participation",
        elements: [
          {
            label: "Power and democracy",
            detail: "",
          },
          {
            label: "How Parliament works (legislation, the executive, the monarchy)",
            detail: "",
          },
          {
            label: "Elections and voting systems",
            detail: "",
          },
          {
            label: "Political parties and pressure groups",
            detail: "",
          },
          {
            label: "Devolution and local government",
            detail: "",
          },
          {
            label: "Government spending and the budget",
            detail: "",
          },
          {
            label: "Political systems around the world",
            detail: "",
          },
        ],
      },
      {
        unit: "Theme 3: Rights and responsibilities",
        elements: [
          {
            label: "Universal Declaration of Human Rights and the Human Rights Act",
            detail: "",
          },
          {
            label: "The rule of law and principles of justice",
            detail: "",
          },
          {
            label: "How laws are made",
            detail: "",
          },
          {
            label: "The criminal and civil justice systems",
            detail: "",
          },
          {
            label: "Courts, juries and tribunals",
            detail: "",
          },
          {
            label: "Rights in the workplace and consumer rights",
            detail: "",
          },
          {
            label: "Britain's role in the world (UN, NATO, Commonwealth, international law)",
            detail: "",
          },
        ],
      },
      {
        unit: "Theme 4: Life in modern Britain",
        elements: [
          {
            label: "Identity and diversity in UK society",
            detail: "",
          },
          {
            label: "Migration",
            detail: "",
          },
          {
            label: "The role of the media and a free press",
            detail: "",
          },
          {
            label: "Britain's role in international organisations",
            detail: "",
          },
          {
            label: "Challenging prejudice and discrimination",
            detail: "",
          },
        ],
      },
      {
        unit: "Exam skills",
        elements: [
          {
            label: "Using case studies and evidence",
            detail: "",
          },
          {
            label: "Evaluating arguments",
            detail: "",
          },
          {
            label: "Applying citizenship terminology",
            detail: "",
          },
        ],
      },
    ],
  },
  Sociology: {
    source: "Based on AQA GCSE Sociology (8192).",
    units: [
      {
        unit: "Paper 1: The Sociology of Families and Education: Families",
        elements: [
          {
            label: "Functions of families",
            detail: "",
          },
          {
            label: "Family forms (nuclear, extended, lone-parent, reconstituted, same-sex)",
            detail: "",
          },
          {
            label: "Conjugal role relationships",
            detail: "",
          },
          {
            label: "Changing relationships within families",
            detail: "",
          },
          {
            label: "Criticisms of families",
            detail: "",
          },
          {
            label: "Divorce and changes in marriage",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 1: The Sociology of Families and Education: Education",
        elements: [
          {
            label: "Roles and functions of education",
            detail: "",
          },
          {
            label: "Relationship between education and capitalism",
            detail: "",
          },
          {
            label: "Educational achievement: class, gender and ethnicity",
            detail: "",
          },
          {
            label: "Processes within schools (labelling, streaming, subcultures)",
            detail: "",
          },
          {
            label: "Education policies",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 2: The Sociology of Crime and Deviance and Social Stratification: Crime and deviance",
        elements: [
          {
            label: "Social construction of crime and deviance",
            detail: "",
          },
          {
            label: "Social control (formal and informal)",
            detail: "",
          },
          {
            label: "Criminal and deviant behaviour: explanations",
            detail: "",
          },
          {
            label: "Data on crime (official statistics, victim and self-report studies)",
            detail: "",
          },
          {
            label: "Patterns of crime: class, gender, ethnicity, age",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 2: The Sociology of Crime and Deviance and Social Stratification: Social stratification",
        elements: [
          {
            label: "Functionalist theory of stratification",
            detail: "",
          },
          {
            label: "Socio-economic class",
            detail: "",
          },
          {
            label: "Life chances",
            detail: "",
          },
          {
            label: "Poverty as a social issue",
            detail: "",
          },
          {
            label: "Power and authority",
            detail: "",
          },
          {
            label: "Power relationships (gender, ethnicity, age, disability)",
            detail: "",
          },
        ],
      },
      {
        unit: "Research methods (both papers)",
        elements: [
          {
            label: "Research process: aims, hypotheses, sampling, pilot studies",
            detail: "",
          },
          {
            label: "Primary and secondary data",
            detail: "",
          },
          {
            label: "Quantitative and qualitative data",
            detail: "",
          },
          {
            label: "Questionnaires and interviews",
            detail: "",
          },
          {
            label: "Observation (participant and non-participant)",
            detail: "",
          },
          {
            label: "Ethical issues",
            detail: "",
          },
          {
            label: "Reliability, validity and representativeness",
            detail: "",
          },
        ],
      },
      {
        unit: "Sociological approaches and key thinkers",
        elements: [
          {
            label: "Functionalism (Durkheim, Parsons, Murdock)",
            detail: "",
          },
          {
            label: "Marxism (Marx, Zaretsky, Bowles and Gintis)",
            detail: "",
          },
          {
            label: "Feminism (Delphy and Leonard, Oakley)",
            detail: "",
          },
          {
            label: "Interactionism (Becker)",
            detail: "",
          },
        ],
      },
    ],
  },
  Psychology: {
    source: "Based on AQA GCSE Psychology (8182).",
    units: [
      {
        unit: "Paper 1: Cognition and Behaviour: Memory",
        elements: [
          {
            label: "Processes of memory: encoding, storage and retrieval",
            detail: "",
          },
          {
            label: "Types of memory: episodic, semantic, procedural",
            detail: "",
          },
          {
            label: "The multi-store model of memory",
            detail: "",
          },
          {
            label: "Primacy and recency effects",
            detail: "",
          },
          {
            label: "Factors affecting accuracy: interference, context, false memories",
            detail: "",
          },
          {
            label: "Reconstructive memory (Bartlett)",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 1: Cognition and Behaviour: Perception",
        elements: [
          {
            label: "Sensation and perception",
            detail: "",
          },
          {
            label: "Visual illusions",
            detail: "",
          },
          {
            label: "Gibson's direct theory of perception",
            detail: "",
          },
          {
            label: "Gregory's constructivist theory",
            detail: "",
          },
          {
            label: "Factors affecting perception: perceptual set, culture, motivation, emotion",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 1: Cognition and Behaviour: Development",
        elements: [
          {
            label: "Early brain development",
            detail: "",
          },
          {
            label: "Piaget's stage theory of cognitive development",
            detail: "",
          },
          {
            label: "Effects of learning on development (Dweck's mindset theory, Willingham)",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 1: Cognition and Behaviour: Research methods",
        elements: [
          {
            label: "Formulating hypotheses and variables",
            detail: "",
          },
          {
            label: "Experimental designs and types of experiment",
            detail: "",
          },
          {
            label: "Sampling methods",
            detail: "",
          },
          {
            label: "Ethical considerations",
            detail: "",
          },
          {
            label: "Interviews, questionnaires, case studies, observations, correlations",
            detail: "",
          },
          {
            label: "Quantitative and qualitative data, primary and secondary data",
            detail: "",
          },
          {
            label: "Descriptive statistics and graphs",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 2: Social Context and Behaviour: Social influence",
        elements: [
          {
            label: "Conformity (Asch)",
            detail: "",
          },
          {
            label: "Obedience (Milgram) and agency theory",
            detail: "",
          },
          {
            label: "Prosocial behaviour and bystander intervention (Piliavin)",
            detail: "",
          },
          {
            label: "Crowd and collective behaviour",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 2: Social Context and Behaviour: Language, thought and communication",
        elements: [
          {
            label: "Relationship between language and thought (Piaget, Sapir-Whorf)",
            detail: "",
          },
          {
            label: "Differences between human and animal communication (von Frisch)",
            detail: "",
          },
          {
            label: "Non-verbal communication",
            detail: "",
          },
          {
            label: "Explanations of non-verbal behaviour (Darwin, Yuki)",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 2: Social Context and Behaviour: Brain and neuropsychology",
        elements: [
          {
            label: "Structure and function of the nervous system",
            detail: "",
          },
          {
            label: "Neuron structure and synaptic transmission",
            detail: "",
          },
          {
            label: "Structure and function of the brain (localisation)",
            detail: "",
          },
          {
            label: "Introduction to neuropsychology (Tulving, scanning techniques)",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 2: Social Context and Behaviour: Psychological problems",
        elements: [
          {
            label: "Introduction to mental health",
            detail: "",
          },
          {
            label: "Depression: characteristics, explanations and treatments",
            detail: "",
          },
          {
            label: "Addiction: characteristics, explanations and treatments",
            detail: "",
          },
        ],
      },
    ],
  },
  Business: {
    source: "Based on AQA GCSE Business (8132).",
    units: [
      {
        unit: "1. Business in the real world",
        elements: [
          {
            label: "The purpose and nature of businesses",
            detail: "",
          },
          {
            label: "Business enterprise and entrepreneurship",
            detail: "",
          },
          {
            label:
              "Business ownership (sole trader, partnership, Ltd, PLC, franchise, not-for-profit)",
            detail: "",
          },
          {
            label: "Setting business aims and objectives",
            detail: "",
          },
          {
            label: "Stakeholders",
            detail: "",
          },
          {
            label: "Business location",
            detail: "",
          },
          {
            label: "Business planning",
            detail: "",
          },
          {
            label: "Expanding a business (organic and external growth)",
            detail: "",
          },
        ],
      },
      {
        unit: "2. Influences on business",
        elements: [
          {
            label: "Technology",
            detail: "",
          },
          {
            label: "Ethical and environmental considerations",
            detail: "",
          },
          {
            label: "The economic climate (interest rates, unemployment, consumer income)",
            detail: "",
          },
          {
            label: "Globalisation and exchange rates",
            detail: "",
          },
          {
            label: "Legislation (employment and consumer law)",
            detail: "",
          },
          {
            label: "Competitive environment",
            detail: "",
          },
        ],
      },
      {
        unit: "3. Business operations",
        elements: [
          {
            label: "Production processes (job, batch, flow)",
            detail: "",
          },
          {
            label: "The role of procurement and supply chains",
            detail: "",
          },
          {
            label: "The concept of quality (quality control and assurance)",
            detail: "",
          },
          {
            label: "Good customer service",
            detail: "",
          },
        ],
      },
      {
        unit: "4. Human resources",
        elements: [
          {
            label: "Organisational structures",
            detail: "",
          },
          {
            label: "Recruitment and selection",
            detail: "",
          },
          {
            label: "Motivating employees (financial and non-financial)",
            detail: "",
          },
          {
            label: "Training",
            detail: "",
          },
        ],
      },
      {
        unit: "5. Marketing",
        elements: [
          {
            label: "Identifying and understanding customers",
            detail: "",
          },
          {
            label: "Segmentation",
            detail: "",
          },
          {
            label: "Market research",
            detail: "",
          },
          {
            label: "The marketing mix: product (life cycle, Boston Matrix)",
            detail: "",
          },
          {
            label: "The marketing mix: price",
            detail: "",
          },
          {
            label: "The marketing mix: promotion",
            detail: "",
          },
          {
            label: "The marketing mix: place",
            detail: "",
          },
        ],
      },
      {
        unit: "6. Finance",
        elements: [
          {
            label: "Sources of finance",
            detail: "",
          },
          {
            label: "Cash flow and cash-flow forecasts",
            detail: "",
          },
          {
            label: "Financial terms and calculations (revenue, costs, profit)",
            detail: "",
          },
          {
            label: "Break-even analysis",
            detail: "",
          },
          {
            label: "Average rate of return",
            detail: "",
          },
          {
            label: "Income statements and statements of financial position",
            detail: "",
          },
          {
            label: "Analysing financial performance (profitability ratios)",
            detail: "",
          },
        ],
      },
    ],
  },
  Economics: {
    source: "Based on AQA GCSE Economics (8136).",
    units: [
      {
        unit: "Paper 1: How Markets Work",
        elements: [
          {
            label: "Economic foundations: the economic problem, scarcity and choice",
            detail: "",
          },
          {
            label: "Factors of production and opportunity cost",
            detail: "",
          },
          {
            label: "Resource allocation and economic systems",
            detail: "",
          },
          {
            label: "Demand and price elasticity of demand",
            detail: "",
          },
          {
            label: "Supply and price elasticity of supply",
            detail: "",
          },
          {
            label: "Market equilibrium and price determination",
            detail: "",
          },
          {
            label: "Competitive and concentrated markets (monopoly, oligopoly)",
            detail: "",
          },
          {
            label: "Production, costs, revenue and profit",
            detail: "",
          },
          {
            label: "Productivity and economies of scale",
            detail: "",
          },
          {
            label: "The labour market: wages, trade unions, minimum wage",
            detail: "",
          },
          {
            label: "The role of money and financial markets",
            detail: "",
          },
          {
            label: "Interest rates, saving and borrowing",
            detail: "",
          },
          {
            label: "Market failure: externalities, public goods, information gaps",
            detail: "",
          },
          {
            label: "Government intervention to correct market failure",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 2: How the Economy Works",
        elements: [
          {
            label: "Introduction to the national economy: GDP and economic growth",
            detail: "",
          },
          {
            label: "Measuring economic growth",
            detail: "",
          },
          {
            label: "Low unemployment: causes and consequences",
            detail: "",
          },
          {
            label: "Fair distribution of income and wealth",
            detail: "",
          },
          {
            label: "Price stability: inflation and the CPI",
            detail: "",
          },
          {
            label: "Fiscal policy: taxation and government spending",
            detail: "",
          },
          {
            label: "Monetary policy: the Bank of England and interest rates",
            detail: "",
          },
          {
            label: "Supply-side policies",
            detail: "",
          },
          {
            label: "Limitations of markets",
            detail: "",
          },
          {
            label: "International trade and specialisation",
            detail: "",
          },
          {
            label: "Free trade and protectionism",
            detail: "",
          },
          {
            label: "Balance of payments",
            detail: "",
          },
          {
            label: "Exchange rates",
            detail: "",
          },
          {
            label: "Globalisation",
            detail: "",
          },
        ],
      },
      {
        unit: "Skills",
        elements: [
          {
            label: "Economic calculations (percentages, averages, indices)",
            detail: "",
          },
          {
            label: "Drawing and interpreting diagrams",
            detail: "",
          },
          {
            label: "Evaluating economic policies",
            detail: "",
          },
        ],
      },
    ],
  },
  "Computer Science": {
    source: "Based on AQA GCSE Computer Science (8525).",
    units: [
      {
        unit: "3.1 Fundamentals of algorithms",
        elements: [
          {
            label: "Representing algorithms: pseudo-code, flowcharts",
            detail: "",
          },
          {
            label: "Decomposition and abstraction",
            detail: "",
          },
          {
            label: "Tracing algorithms and trace tables",
            detail: "",
          },
          {
            label: "Linear and binary search",
            detail: "",
          },
          {
            label: "Bubble sort and merge sort",
            detail: "",
          },
          {
            label: "Efficiency of algorithms",
            detail: "",
          },
        ],
      },
      {
        unit: "3.2 Programming",
        elements: [
          {
            label: "Data types and variables",
            detail: "",
          },
          {
            label: "Programming concepts: sequence, selection, iteration",
            detail: "",
          },
          {
            label: "Arithmetic, relational and Boolean operations",
            detail: "",
          },
          {
            label: "Data structures: arrays (1D and 2D) and records",
            detail: "",
          },
          {
            label: "Input/output and file handling",
            detail: "",
          },
          {
            label: "String handling",
            detail: "",
          },
          {
            label: "Random number generation",
            detail: "",
          },
          {
            label: "Subroutines, parameters and return values",
            detail: "",
          },
          {
            label: "Local and global variables",
            detail: "",
          },
          {
            label: "Structured programming",
            detail: "",
          },
          {
            label: "Robust and secure programming (validation, authentication)",
            detail: "",
          },
          {
            label: "Testing and test data (normal, boundary, erroneous)",
            detail: "",
          },
          {
            label: "Classification of programming languages and translators",
            detail: "",
          },
        ],
      },
      {
        unit: "3.3 Fundamentals of data representation",
        elements: [
          {
            label: "Number bases: binary, decimal, hexadecimal",
            detail: "",
          },
          {
            label: "Converting between number bases",
            detail: "",
          },
          {
            label: "Units of information (bits, bytes, kibibytes and so on)",
            detail: "",
          },
          {
            label: "Binary arithmetic and binary shifts",
            detail: "",
          },
          {
            label: "Character encoding (ASCII, Unicode)",
            detail: "",
          },
          {
            label: "Representing images (pixels, colour depth, resolution)",
            detail: "",
          },
          {
            label: "Representing sound (sample rate, bit depth)",
            detail: "",
          },
          {
            label: "Data compression (Huffman coding, run-length encoding)",
            detail: "",
          },
        ],
      },
      {
        unit: "3.4 Computer systems",
        elements: [
          {
            label: "Hardware and software",
            detail: "",
          },
          {
            label: "Boolean logic: logic gates and truth tables",
            detail: "",
          },
          {
            label: "Logic circuits and Boolean expressions",
            detail: "",
          },
          {
            label: "System software and the operating system",
            detail: "",
          },
          {
            label: "Systems architecture: the CPU and the fetch-execute cycle",
            detail: "",
          },
          {
            label: "Von Neumann architecture",
            detail: "",
          },
          {
            label: "Factors affecting CPU performance",
            detail: "",
          },
          {
            label: "Main memory (RAM, ROM) and cache",
            detail: "",
          },
          {
            label: "Secondary storage (magnetic, optical, solid state, cloud)",
            detail: "",
          },
          {
            label: "Embedded systems",
            detail: "",
          },
        ],
      },
      {
        unit: "3.5 Fundamentals of computer networks",
        elements: [
          {
            label: "Types of network (LAN, PAN, WAN) and topologies",
            detail: "",
          },
          {
            label: "Wired and wireless networks",
            detail: "",
          },
          {
            label: "Network protocols (TCP/IP, HTTP, HTTPS, SMTP, IMAP, FTP)",
            detail: "",
          },
          {
            label: "The TCP/IP model and layers",
            detail: "",
          },
          {
            label: "Network security (authentication, encryption, firewall, MAC filtering)",
            detail: "",
          },
        ],
      },
      {
        unit: "3.6 Cyber security",
        elements: [
          {
            label: "Cyber security threats (malware, social engineering, weak passwords)",
            detail: "",
          },
          {
            label: "Social engineering (phishing, blagging, shouldering)",
            detail: "",
          },
          {
            label: "Malicious code (viruses, trojans, spyware)",
            detail: "",
          },
          {
            label:
              "Methods to detect and prevent threats (penetration testing, CAPTCHA, biometrics)",
            detail: "",
          },
        ],
      },
      {
        unit: "3.7 Relational databases and SQL",
        elements: [
          {
            label: "Relational database concepts (tables, records, fields, keys)",
            detail: "",
          },
          {
            label: "Reducing data redundancy",
            detail: "",
          },
          {
            label: "SQL: SELECT, FROM, WHERE, ORDER BY",
            detail: "",
          },
          {
            label: "SQL: INSERT, UPDATE, DELETE",
            detail: "",
          },
        ],
      },
      {
        unit: "3.8 Ethical, legal and environmental impacts",
        elements: [
          {
            label: "Ethical issues of digital technology",
            detail: "",
          },
          {
            label: "Legal issues (Data Protection Act, Computer Misuse Act, Copyright)",
            detail: "",
          },
          {
            label: "Environmental impacts",
            detail: "",
          },
          {
            label: "Privacy and surveillance",
            detail: "",
          },
        ],
      },
    ],
  },
  "Design & Technology": {
    source: "Based on AQA GCSE Design and Technology (8552).",
    units: [
      {
        unit: "Core technical principles",
        elements: [
          {
            label: "New and emerging technologies (industry, enterprise, sustainability)",
            detail: "",
          },
          {
            label: "Energy generation and storage",
            detail: "",
          },
          {
            label: "Developments in new materials (smart, composite, technical textiles)",
            detail: "",
          },
          {
            label: "Systems approach to designing",
            detail: "",
          },
          {
            label: "Mechanical devices (motion, levers, linkages, gears, cams)",
            detail: "",
          },
          {
            label:
              "Materials and their working properties (papers and boards, timbers, metals, polymers, textiles)",
            detail: "",
          },
        ],
      },
      {
        unit: "Specialist technical principles",
        elements: [
          {
            label: "Selection of materials or components",
            detail: "",
          },
          {
            label: "Forces and stresses",
            detail: "",
          },
          {
            label: "Ecological and social footprint",
            detail: "",
          },
          {
            label: "Sources and origins of materials",
            detail: "",
          },
          {
            label: "Using and working with materials",
            detail: "",
          },
          {
            label: "Stock forms, types and sizes",
            detail: "",
          },
          {
            label: "Scales of production",
            detail: "",
          },
          {
            label: "Specialist techniques and processes",
            detail: "",
          },
          {
            label: "Surface treatments and finishes",
            detail: "",
          },
        ],
      },
      {
        unit: "Designing and making principles",
        elements: [
          {
            label: "Investigation, primary and secondary data",
            detail: "",
          },
          {
            label: "Environmental, social and economic challenges",
            detail: "",
          },
          {
            label: "The work of other designers",
            detail: "",
          },
          {
            label: "Design strategies",
            detail: "",
          },
          {
            label: "Communication of design ideas (sketching, CAD, models)",
            detail: "",
          },
          {
            label: "Prototype development",
            detail: "",
          },
          {
            label: "Selection of materials and components",
            detail: "",
          },
          {
            label: "Tolerances",
            detail: "",
          },
          {
            label: "Material management (marking out, cutting, waste)",
            detail: "",
          },
          {
            label: "Specialist tools and equipment",
            detail: "",
          },
          {
            label: "Health and safety",
            detail: "",
          },
        ],
      },
      {
        unit: "Non-exam assessment (NEA)",
        elements: [
          {
            label: "Identifying and investigating design possibilities",
            detail: "",
          },
          {
            label: "Producing a design brief and specification",
            detail: "",
          },
          {
            label: "Generating design ideas",
            detail: "",
          },
          {
            label: "Developing design ideas",
            detail: "",
          },
          {
            label: "Realising design ideas",
            detail: "",
          },
          {
            label: "Analysing and evaluating",
            detail: "",
          },
        ],
      },
      {
        unit: "Maths and science skills",
        elements: [
          {
            label: "Calculations: area, percentages, ratios",
            detail: "",
          },
          {
            label: "Interpreting charts and graphs",
            detail: "",
          },
          {
            label: "Scientific properties of materials",
            detail: "",
          },
        ],
      },
    ],
  },
  Electronics: {
    source: "Based on WJEC Eduqas GCSE Electronics, the main board offering this GCSE.",
    units: [
      {
        unit: "Component 1: Discovering Electronics",
        elements: [
          {
            label: "Electronic systems and sub-systems (input, process, output)",
            detail: "",
          },
          {
            label: "Circuit concepts: current, voltage, resistance, power",
            detail: "",
          },
          {
            label: "Ohm's law and resistor networks",
            detail: "",
          },
          {
            label: "Series and parallel circuits",
            detail: "",
          },
          {
            label: "Potential dividers",
            detail: "",
          },
          {
            label: "Resistive input sensors (LDRs, thermistors)",
            detail: "",
          },
          {
            label: "Switches and switching circuits",
            detail: "",
          },
          {
            label: "Diodes, LEDs and their applications",
            detail: "",
          },
          {
            label: "Transistors (bipolar and MOSFET) as switches",
            detail: "",
          },
          {
            label: "Logic gates and truth tables",
            detail: "",
          },
          {
            label: "Combinational logic systems",
            detail: "",
          },
          {
            label: "Boolean algebra and simplifying logic",
            detail: "",
          },
          {
            label: "Analogue and digital signals",
            detail: "",
          },
        ],
      },
      {
        unit: "Component 2: Application of Electronics",
        elements: [
          {
            label: "Capacitors and charging/discharging",
            detail: "",
          },
          {
            label: "Timing circuits and monostables",
            detail: "",
          },
          {
            label: "Astables and clock pulses",
            detail: "",
          },
          {
            label: "Sequential systems: counters and flip-flops",
            detail: "",
          },
          {
            label: "Interfacing and drivers (relays, motors)",
            detail: "",
          },
          {
            label: "Operational amplifiers: comparators and amplifiers",
            detail: "",
          },
          {
            label: "Microcontrollers and programming flowcharts",
            detail: "",
          },
          {
            label: "Signal conditioning",
            detail: "",
          },
        ],
      },
      {
        unit: "Non-exam assessment",
        elements: [
          {
            label: "Designing and building a circuit to a brief",
            detail: "",
          },
          {
            label: "Testing and fault-finding",
            detail: "",
          },
          {
            label: "Evaluating a system",
            detail: "",
          },
        ],
      },
      {
        unit: "Practical skills",
        elements: [
          {
            label: "Circuit diagrams and symbols",
            detail: "",
          },
          {
            label: "Using multimeters and oscilloscopes",
            detail: "",
          },
          {
            label: "Breadboard prototyping and soldering",
            detail: "",
          },
        ],
      },
    ],
  },
  Engineering: {
    source: "Based on AQA GCSE Engineering (8852).",
    units: [
      {
        unit: "Engineering materials",
        elements: [
          {
            label: "Material categories (metals, polymers, composites, timbers, ceramics)",
            detail: "",
          },
          {
            label: "Properties of materials (mechanical and physical)",
            detail: "",
          },
          {
            label: "Material selection",
            detail: "",
          },
          {
            label: "Modification of materials (heat treatments)",
            detail: "",
          },
          {
            label: "Smart materials",
            detail: "",
          },
        ],
      },
      {
        unit: "Engineering manufacturing processes",
        elements: [
          {
            label: "Material removal (machining, cutting)",
            detail: "",
          },
          {
            label: "Shaping and forming (casting, moulding, forging)",
            detail: "",
          },
          {
            label: "Joining (welding, brazing, adhesives, mechanical fixings)",
            detail: "",
          },
          {
            label: "Surface finishing",
            detail: "",
          },
          {
            label: "Scales of production",
            detail: "",
          },
          {
            label: "Computer-aided manufacture (CNC, 3D printing)",
            detail: "",
          },
        ],
      },
      {
        unit: "Systems",
        elements: [
          {
            label: "Mechanical systems (levers, gears, pulleys, linkages)",
            detail: "",
          },
          {
            label: "Electrical and electronic systems",
            detail: "",
          },
          {
            label: "Structural systems",
            detail: "",
          },
          {
            label: "Pneumatic and hydraulic systems",
            detail: "",
          },
          {
            label: "Systems diagrams and inputs, processes, outputs",
            detail: "",
          },
        ],
      },
      {
        unit: "Testing and investigation",
        elements: [
          {
            label: "Modelling and calculations",
            detail: "",
          },
          {
            label: "Testing materials (tensile, hardness, impact)",
            detail: "",
          },
          {
            label: "Analysing and evaluating test data",
            detail: "",
          },
        ],
      },
      {
        unit: "The impact of modern technologies",
        elements: [
          {
            label: "Environmental and sustainability issues",
            detail: "",
          },
          {
            label: "Lifecycle analysis and the 6 Rs",
            detail: "",
          },
          {
            label: "Developments in technology and engineering",
            detail: "",
          },
        ],
      },
      {
        unit: "Practical engineering skills",
        elements: [
          {
            label: "Engineering drawings (orthographic, isometric, sectional)",
            detail: "",
          },
          {
            label: "Using tools and equipment safely",
            detail: "",
          },
          {
            label: "Tolerances and measurement",
            detail: "",
          },
        ],
      },
      {
        unit: "Non-exam assessment",
        elements: [
          {
            label: "Analysing a brief and producing a specification",
            detail: "",
          },
          {
            label: "Design and development of a solution",
            detail: "",
          },
          {
            label: "Making a prototype",
            detail: "",
          },
          {
            label: "Testing and evaluation",
            detail: "",
          },
        ],
      },
    ],
  },
  "Food Preparation and Nutrition": {
    source: "Based on AQA GCSE Food Preparation and Nutrition (8585).",
    units: [
      {
        unit: "1. Food, nutrition and health",
        elements: [
          {
            label: "Macronutrients: protein, fat, carbohydrate",
            detail: "",
          },
          {
            label: "Micronutrients: vitamins and minerals",
            detail: "",
          },
          {
            label: "Water and fibre",
            detail: "",
          },
          {
            label: "Energy requirements of individuals",
            detail: "",
          },
          {
            label: "Plan balanced diets (Eatwell Guide, life stages)",
            detail: "",
          },
          {
            label: "Calculating energy and nutritional values",
            detail: "",
          },
          {
            label: "Diet, nutrition and health (obesity, diabetes, CHD, bone health)",
            detail: "",
          },
        ],
      },
      {
        unit: "2. Food science",
        elements: [
          {
            label: "Why food is cooked and heat transfer",
            detail: "",
          },
          {
            label: "Selecting cooking methods",
            detail: "",
          },
          {
            label:
              "Functional and chemical properties: protein (denaturation, coagulation, gluten formation)",
            detail: "",
          },
          {
            label:
              "Functional and chemical properties: carbohydrate (gelatinisation, dextrinisation, caramelisation)",
            detail: "",
          },
          {
            label:
              "Functional and chemical properties: fats and oils (shortening, aeration, emulsification)",
            detail: "",
          },
          {
            label: "Raising agents (mechanical, chemical, biological)",
            detail: "",
          },
        ],
      },
      {
        unit: "3. Food safety",
        elements: [
          {
            label: "Food spoilage and contamination (microorganisms, enzymes, mould, yeast)",
            detail: "",
          },
          {
            label: "Bacterial food poisoning",
            detail: "",
          },
          {
            label: "Buying, storing, preparing and cooking food safely",
            detail: "",
          },
          {
            label: "Temperature control (danger zone, chilling, freezing, reheating)",
            detail: "",
          },
        ],
      },
      {
        unit: "4. Food choice",
        elements: [
          {
            label: "Factors affecting food choice",
            detail: "",
          },
          {
            label: "Food choices for religion, culture, ethics and medical conditions",
            detail: "",
          },
          {
            label: "Food labelling and marketing",
            detail: "",
          },
          {
            label: "British and international cuisines",
            detail: "",
          },
          {
            label: "Sensory evaluation",
            detail: "",
          },
        ],
      },
      {
        unit: "5. Food provenance",
        elements: [
          {
            label: "Environmental impact and sustainability of food",
            detail: "",
          },
          {
            label: "Food miles, packaging and waste",
            detail: "",
          },
          {
            label: "Food production: primary and secondary processing",
            detail: "",
          },
          {
            label: "Technological developments in food production",
            detail: "",
          },
        ],
      },
      {
        unit: "Non-exam assessment",
        elements: [
          {
            label: "NEA 1: Food investigation (scientific investigation of ingredients)",
            detail: "",
          },
          {
            label:
              "NEA 2: Food preparation assessment (plan, prepare, cook and present a three-hour menu)",
            detail: "",
          },
        ],
      },
      {
        unit: "Practical skills",
        elements: [
          {
            label: "Knife skills",
            detail: "",
          },
          {
            label: "Preparing fruit and vegetables",
            detail: "",
          },
          {
            label: "Use of the cooker and equipment",
            detail: "",
          },
          {
            label: "Cooking methods",
            detail: "",
          },
          {
            label: "Preparing, combining and shaping",
            detail: "",
          },
          {
            label: "Sauce making",
            detail: "",
          },
          {
            label: "Tenderising and marinating",
            detail: "",
          },
          {
            label: "Dough making",
            detail: "",
          },
          {
            label: "Setting mixtures",
            detail: "",
          },
          {
            label: "Testing for readiness and judging presentation",
            detail: "",
          },
        ],
      },
    ],
  },
  "Art and Design": {
    source:
      "Based on AQA GCSE Art and Design (8201–8206). Each title is a separate GCSE; tick the title you take and the skills under it. All titles share the same assessment objectives and components.",
    units: [
      {
        unit: "Components (all titles)",
        elements: [
          {
            label: "Component 1: Portfolio (60%)",
            detail: "",
          },
          {
            label:
              "Component 2: Externally set assignment (40%), including the 10-hour supervised period",
            detail: "",
          },
        ],
      },
      {
        unit: "Assessment objectives (all titles)",
        elements: [
          {
            label: "AO1 Develop: developing ideas through investigation and contextual sources",
            detail: "",
          },
          {
            label: "AO2 Refine: experimenting with media, materials, techniques and processes",
            detail: "",
          },
          {
            label:
              "AO3 Record: recording ideas and observations through drawing, annotation and other means",
            detail: "",
          },
          {
            label: "AO4 Present: realising intentions in a personal and meaningful final response",
            detail: "",
          },
        ],
      },
      {
        unit: "Core skills (all titles)",
        elements: [
          {
            label: "Observational drawing",
            detail: "",
          },
          {
            label: "Researching and analysing artists, designers and craftspeople",
            detail: "",
          },
          {
            label: "Annotation and use of specialist vocabulary",
            detail: "",
          },
          {
            label: "Visual elements: line, tone, colour, texture, shape, form, pattern",
            detail: "",
          },
          {
            label: "Composition and layout",
            detail: "",
          },
          {
            label: "Developing and refining ideas into a final outcome",
            detail: "",
          },
          {
            label: "Sketchbook and portfolio presentation",
            detail: "",
          },
          {
            label: "Time management for the externally set assignment",
            detail: "",
          },
        ],
      },
      {
        unit: "Art, Craft and Design (8201)",
        elements: [
          {
            label:
              "Working across two or more disciplines from fine art, graphics, textiles, 3D and photography",
            detail: "",
          },
          {
            label: "Combining and experimenting with mixed media",
            detail: "",
          },
        ],
      },
      {
        unit: "Fine Art (8202)",
        elements: [
          {
            label: "Drawing and painting",
            detail: "",
          },
          {
            label: "Mixed media and collage",
            detail: "",
          },
          {
            label: "Printmaking (lino, etching, screen printing, monoprint)",
            detail: "",
          },
          {
            label: "Sculpture",
            detail: "",
          },
          {
            label: "Installation, land art and lens-based media",
            detail: "",
          },
        ],
      },
      {
        unit: "Graphic Communication (8203)",
        elements: [
          {
            label: "Typography",
            detail: "",
          },
          {
            label: "Illustration",
            detail: "",
          },
          {
            label: "Communication graphics and branding",
            detail: "",
          },
          {
            label: "Advertising and packaging design",
            detail: "",
          },
          {
            label: "Digital design and software",
            detail: "",
          },
          {
            label: "Design for print and screen",
            detail: "",
          },
        ],
      },
      {
        unit: "Textile Design (8204)",
        elements: [
          {
            label: "Fabric construction (weaving, knitting, felting)",
            detail: "",
          },
          {
            label: "Surface decoration (printing, dyeing, embroidery)",
            detail: "",
          },
          {
            label: "Fashion and costume design",
            detail: "",
          },
          {
            label: "Constructed and digital textiles",
            detail: "",
          },
          {
            label: "Soft furnishings and textile art",
            detail: "",
          },
        ],
      },
      {
        unit: "Three-Dimensional Design (8205)",
        elements: [
          {
            label: "Sculpture and modelling",
            detail: "",
          },
          {
            label: "Ceramics",
            detail: "",
          },
          {
            label: "Product design and jewellery",
            detail: "",
          },
          {
            label: "Architectural design and environmental design",
            detail: "",
          },
          {
            label: "Working with materials (clay, wood, metal, plastics, card)",
            detail: "",
          },
        ],
      },
      {
        unit: "Photography (8206)",
        elements: [
          {
            label: "Camera controls: aperture, shutter speed, ISO",
            detail: "",
          },
          {
            label: "Composition and viewpoint",
            detail: "",
          },
          {
            label: "Lighting (natural and studio)",
            detail: "",
          },
          {
            label: "Digital editing and manipulation",
            detail: "",
          },
          {
            label: "Darkroom and alternative processes",
            detail: "",
          },
          {
            label: "Documentary, portraiture, still life, landscape and experimental photography",
            detail: "",
          },
          {
            label: "Moving image and animation",
            detail: "",
          },
        ],
      },
    ],
  },
  Dance: {
    source: "Based on AQA GCSE Dance (8236).",
    units: [
      {
        unit: "Component 1: Performance and choreography (practical)",
        elements: [
          {
            label: "Set phrases (solo performance)",
            detail: "",
          },
          {
            label: "Duet or trio performance",
            detail: "",
          },
          {
            label: "Choreography (solo or group)",
            detail: "",
          },
          {
            label:
              "Physical skills (posture, alignment, balance, coordination, control, flexibility, mobility, strength, stamina, extension, isolation)",
            detail: "",
          },
          {
            label:
              "Technical skills (actions, space, dynamics, relationships, timing, rhythmic content, moving in a stylistically accurate way)",
            detail: "",
          },
          {
            label:
              "Expressive skills (projection, focus, spatial awareness, facial expression, phrasing, musicality, sensitivity to other dancers, communication of choreographic intent)",
            detail: "",
          },
          {
            label: "Mental skills (rehearsal, performance, commitment, confidence)",
            detail: "",
          },
          {
            label: "Safe working practices (warm-up, cool-down, nutrition, hydration)",
            detail: "",
          },
        ],
      },
      {
        unit: "Component 2: Dance appreciation (written)",
        elements: [
          {
            label:
              "Knowledge of choreographic processes (researching, improvising, generating, selecting, developing, structuring, refining)",
            detail: "",
          },
          {
            label:
              "Choreographic devices (motif, repetition, contrast, highlights, climax, manipulation of number, unison and canon)",
            detail: "",
          },
          {
            label:
              "Structuring devices (binary, ternary, rondo, narrative, episodic, beginning-middle-end)",
            detail: "",
          },
          {
            label: "Critical appreciation of your own work",
            detail: "",
          },
        ],
      },
      {
        unit: "Professional works anthology",
        elements: [
          {
            label: "Artificial Things (Lucy Bennett, StopGap Dance Company)",
            detail: "",
          },
          {
            label: "A Linha Curva (Itzik Galili, Rambert)",
            detail: "",
          },
          {
            label: "Infra (Wayne McGregor, The Royal Ballet)",
            detail: "",
          },
          {
            label: "Shadows (Christopher Bruce, Phoenix Dance Theatre)",
            detail: "",
          },
          {
            label: "Within Her Eyes (James Cousins Company)",
            detail: "",
          },
          {
            label: "Emancipation of Expressionism (Kenrick 'H2O' Sandy, Boy Blue Entertainment)",
            detail: "",
          },
        ],
      },
      {
        unit: "For each anthology work",
        elements: [
          {
            label: "Choreographic intent and stimulus",
            detail: "",
          },
          {
            label:
              "Features of production: staging, set, lighting, properties, costume, dancers, aural setting",
            detail: "",
          },
          {
            label: "Choreographic approach and action content",
            detail: "",
          },
          {
            label: "Style and structure",
            detail: "",
          },
        ],
      },
    ],
  },
  Drama: {
    source: "Based on AQA GCSE Drama (8261).",
    units: [
      {
        unit: "Component 1: Understanding drama (written exam): Knowledge and understanding",
        elements: [
          {
            label: "Theatre roles and responsibilities",
            detail: "",
          },
          {
            label: "Theatre terminology and staging configurations",
            detail: "",
          },
          {
            label: "Characteristics of genres, styles and conventions",
            detail: "",
          },
          {
            label: "Social, cultural and historical context",
            detail: "",
          },
        ],
      },
      {
        unit: "Component 1: Understanding drama (written exam): Set texts (one studied)",
        elements: [
          {
            label: "The Crucible (Miller)",
            detail: "",
          },
          {
            label: "Blood Brothers (Russell)",
            detail: "",
          },
          {
            label: "Things I Know To Be True (Bovell)",
            detail: "",
          },
          {
            label: "The 39 Steps (Barlow, adapted)",
            detail: "",
          },
          {
            label: "Noughts & Crosses (Blackman, adapted by Cooke)",
            detail: "",
          },
          {
            label: "Romeo and Juliet (Shakespeare)",
            detail: "",
          },
        ],
      },
      {
        unit: "Component 1: Understanding drama (written exam): Interpreting the set text",
        elements: [
          {
            label: "Performance: voice, physicality, movement, interaction",
            detail: "",
          },
          {
            label: "Design: set, costume, lighting, sound",
            detail: "",
          },
        ],
      },
      {
        unit: "Component 1: Understanding drama (written exam): Live theatre production",
        elements: [
          {
            label: "Analysing and evaluating a live production",
            detail: "",
          },
          {
            label: "Performance and design choices in the live production",
            detail: "",
          },
        ],
      },
      {
        unit: "Component 2: Devising drama (practical)",
        elements: [
          {
            label: "Responding to a stimulus",
            detail: "",
          },
          {
            label: "Devising techniques and rehearsal strategies",
            detail: "",
          },
          {
            label: "Developing and refining ideas",
            detail: "",
          },
          {
            label: "Performing or designing for the devised piece",
            detail: "",
          },
          {
            label: "Devising log: response to stimulus, development, analysis and evaluation",
            detail: "",
          },
        ],
      },
      {
        unit: "Component 3: Texts in practice (practical)",
        elements: [
          {
            label: "Performance or design of Extract 1",
            detail: "",
          },
          {
            label: "Performance or design of Extract 2",
            detail: "",
          },
        ],
      },
      {
        unit: "Practitioners and styles",
        elements: [
          {
            label: "Naturalism (Stanislavski)",
            detail: "",
          },
          {
            label: "Epic theatre (Brecht)",
            detail: "",
          },
          {
            label: "Physical theatre (Frantic Assembly, Berkoff)",
            detail: "",
          },
          {
            label: "Theatre in education and verbatim theatre",
            detail: "",
          },
        ],
      },
    ],
  },
  "Film Studies": {
    source:
      "Based on WJEC Eduqas GCSE Film Studies, the main board offering this GCSE. Set films vary; tick the topics your course covers.",
    units: [
      {
        unit: "Core study areas (all films)",
        elements: [
          {
            label: "Cinematography: camerawork and lighting",
            detail: "",
          },
          {
            label: "Mise-en-scène",
            detail: "",
          },
          {
            label: "Editing",
            detail: "",
          },
          {
            label: "Sound",
            detail: "",
          },
          {
            label: "Film form and genre conventions",
            detail: "",
          },
          {
            label:
              "Contexts: social, cultural, historical, political, technological, institutional",
            detail: "",
          },
        ],
      },
      {
        unit: "Component 1: Key developments in US film",
        elements: [
          {
            label: "Hollywood 1930–1990: comparative study of two genre films",
            detail: "",
          },
          {
            label: "Key developments in film and film technology",
            detail: "",
          },
          {
            label: "US independent film: specialist writing on film",
            detail: "",
          },
        ],
      },
      {
        unit: "Component 2: Global film: narrative, representation and film style",
        elements: [
          {
            label: "Global English-language film (narrative)",
            detail: "",
          },
          {
            label: "Global non-English-language film (film style and representation)",
            detail: "",
          },
          {
            label: "Contemporary UK film (representation and aesthetics)",
            detail: "",
          },
        ],
      },
      {
        unit: "Specialist areas",
        elements: [
          {
            label: "Narrative (structure, characters, narrative devices)",
            detail: "",
          },
          {
            label: "Representation (gender, ethnicity, age)",
            detail: "",
          },
          {
            label: "Aesthetics and film style",
            detail: "",
          },
          {
            label: "Critical approaches and film criticism",
            detail: "",
          },
        ],
      },
      {
        unit: "Component 3: Production (non-exam assessment)",
        elements: [
          {
            label: "Film extract (2–3 minutes) or screenplay (800–1000 words) with shooting script",
            detail: "",
          },
          {
            label: "Evaluative analysis of your production",
            detail: "",
          },
        ],
      },
    ],
  },
  "Media Studies": {
    source:
      "Based on AQA GCSE Media Studies (8572). Close Study Products (CSPs) are updated by AQA, so check your current list.",
    units: [
      {
        unit: "Theoretical framework",
        elements: [
          {
            label: "Media language: codes and conventions, narrative, genre, semiotics",
            detail: "",
          },
          {
            label: "Media representations: stereotypes, gender, ethnicity, age, social groups",
            detail: "",
          },
          {
            label: "Media industries: ownership, funding, regulation, technology",
            detail: "",
          },
          {
            label: "Media audiences: targeting, categorising, audience theories and responses",
            detail: "",
          },
          {
            label: "Media contexts: social, cultural, historical, political, economic",
            detail: "",
          },
        ],
      },
      {
        unit: "Media forms",
        elements: [
          {
            label: "Television",
            detail: "",
          },
          {
            label: "Film (industries only)",
            detail: "",
          },
          {
            label: "Radio",
            detail: "",
          },
          {
            label: "Newspapers",
            detail: "",
          },
          {
            label: "Magazines",
            detail: "",
          },
          {
            label: "Advertising and marketing",
            detail: "",
          },
          {
            label: "Online, social and participatory media",
            detail: "",
          },
          {
            label: "Video games",
            detail: "",
          },
          {
            label: "Music video",
            detail: "",
          },
        ],
      },
      {
        unit: "Theories and theorists",
        elements: [
          {
            label: "Semiotics (Barthes)",
            detail: "",
          },
          {
            label: "Narratology (Todorov, Propp)",
            detail: "",
          },
          {
            label: "Genre theory (Neale)",
            detail: "",
          },
          {
            label: "Representation (Hall)",
            detail: "",
          },
          {
            label: "Uses and gratifications (Blumler and Katz)",
            detail: "",
          },
          {
            label: "Reception theory (Hall)",
            detail: "",
          },
          {
            label: "Cultivation theory (Gerbner)",
            detail: "",
          },
          {
            label: "Feminist theory (van Zoonen, hooks)",
            detail: "",
          },
        ],
      },
      {
        unit: "Close Study Products",
        elements: [
          {
            label: "CSPs for each form studied (tick as you revise each one)",
            detail: "",
          },
        ],
      },
      {
        unit: "Non-exam assessment",
        elements: [
          {
            label: "Creating a cross-media production to an AQA brief",
            detail: "",
          },
          {
            label: "Statement of intent",
            detail: "",
          },
        ],
      },
    ],
  },
  Music: {
    source:
      "Based on AQA GCSE Music (8271). Study pieces are set by the board and change periodically; check your current set works.",
    units: [
      {
        unit: "Elements of music",
        elements: [
          {
            label: "Melody",
            detail: "",
          },
          {
            label: "Harmony and tonality",
            detail: "",
          },
          {
            label: "Rhythm, metre and tempo",
            detail: "",
          },
          {
            label: "Texture",
            detail: "",
          },
          {
            label: "Timbre and instrumentation",
            detail: "",
          },
          {
            label: "Dynamics and articulation",
            detail: "",
          },
          {
            label: "Structure and form",
            detail: "",
          },
          {
            label: "Notation (staff notation, chord symbols)",
            detail: "",
          },
        ],
      },
      {
        unit: "Areas of study",
        elements: [
          {
            label: "AoS1: Western classical tradition 1650–1910 (Baroque, Classical, Romantic)",
            detail: "",
          },
          {
            label: "AoS2: Popular music (blues, rock, pop, film and musical theatre)",
            detail: "",
          },
          {
            label: "AoS3: Traditional music (blues, world music, fusions)",
            detail: "",
          },
          {
            label:
              "AoS4: Western classical tradition since 1910 (minimalism, impressionism, nationalism)",
            detail: "",
          },
        ],
      },
      {
        unit: "Study pieces",
        elements: [
          {
            label: "AoS1 study piece (set work)",
            detail: "",
          },
          {
            label: "AoS2 study pieces (set work)",
            detail: "",
          },
          {
            label: "AoS3 study pieces (set work)",
            detail: "",
          },
          {
            label: "AoS4 study piece (set work)",
            detail: "",
          },
        ],
      },
      {
        unit: "Component 1: Understanding music",
        elements: [
          {
            label: "Listening to unfamiliar music",
            detail: "",
          },
          {
            label: "Dictation (melody and rhythm)",
            detail: "",
          },
          {
            label: "Analysing study pieces",
            detail: "",
          },
        ],
      },
      {
        unit: "Component 2: Performing music",
        elements: [
          {
            label: "Solo performance",
            detail: "",
          },
          {
            label: "Ensemble performance",
            detail: "",
          },
        ],
      },
      {
        unit: "Component 3: Composing music",
        elements: [
          {
            label: "Composition to a brief",
            detail: "",
          },
          {
            label: "Free composition",
            detail: "",
          },
          {
            label: "Composing techniques: chords, melody writing, structure, texture",
            detail: "",
          },
        ],
      },
    ],
  },
  "Physical Education (Full Course)": {
    source: "Based on AQA GCSE Physical Education (8582).",
    units: [
      {
        unit: "Paper 1: The human body and movement in physical activity and sport: Applied anatomy and physiology",
        elements: [
          {
            label: "The structure and functions of the musculoskeletal system",
            detail: "",
          },
          {
            label: "Joints, movements and muscle groups",
            detail: "",
          },
          {
            label: "The cardio-respiratory system (heart, blood vessels, lungs)",
            detail: "",
          },
          {
            label: "Aerobic and anaerobic exercise",
            detail: "",
          },
          {
            label: "Short- and long-term effects of exercise",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 1: The human body and movement in physical activity and sport: Movement analysis",
        elements: [
          {
            label: "Lever systems",
            detail: "",
          },
          {
            label: "Planes and axes of movement",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 1: The human body and movement in physical activity and sport: Physical training",
        elements: [
          {
            label: "Health and fitness",
            detail: "",
          },
          {
            label: "Components of fitness",
            detail: "",
          },
          {
            label: "Fitness testing",
            detail: "",
          },
          {
            label: "Principles of training (SPORT, FITT)",
            detail: "",
          },
          {
            label: "Types of training (continuous, interval, circuit, weight, fartlek, plyometric)",
            detail: "",
          },
          {
            label: "Calculating training intensities",
            detail: "",
          },
          {
            label: "Preventing injury",
            detail: "",
          },
          {
            label: "Training seasons, warm-up and cool-down",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 1: The human body and movement in physical activity and sport: Use of data",
        elements: [
          {
            label: "Collecting, presenting and analysing data",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 2: Socio-cultural influences and well-being in physical activity and sport: Sports psychology",
        elements: [
          {
            label: "Classification of skills",
            detail: "",
          },
          {
            label: "Goal setting (SMART targets)",
            detail: "",
          },
          {
            label: "Mental preparation",
            detail: "",
          },
          {
            label: "Types of guidance and feedback",
            detail: "",
          },
          {
            label: "Information processing model",
            detail: "",
          },
          {
            label: "Arousal and the inverted-U theory",
            detail: "",
          },
          {
            label: "Aggression, personality and motivation",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 2: Socio-cultural influences and well-being in physical activity and sport: Socio-cultural influences",
        elements: [
          {
            label: "Engagement patterns of social groups",
            detail: "",
          },
          {
            label: "Commercialisation of sport and the media",
            detail: "",
          },
          {
            label: "Ethical and socio-cultural issues: sportsmanship, gamesmanship, deviance",
            detail: "",
          },
          {
            label: "Drugs in sport (PEDs)",
            detail: "",
          },
          {
            label: "Spectator behaviour and hooliganism",
            detail: "",
          },
        ],
      },
      {
        unit: "Paper 2: Socio-cultural influences and well-being in physical activity and sport: Health, fitness and well-being",
        elements: [
          {
            label: "Physical, emotional and social health",
            detail: "",
          },
          {
            label: "Consequences of a sedentary lifestyle",
            detail: "",
          },
          {
            label: "Energy use, diet, nutrition and hydration",
            detail: "",
          },
          {
            label: "Somatotypes",
            detail: "",
          },
        ],
      },
      {
        unit: "Non-exam assessment",
        elements: [
          {
            label: "Practical performance in three activities",
            detail: "",
          },
          {
            label: "Analysis and evaluation of performance",
            detail: "",
          },
        ],
      },
    ],
  },
  Statistics: {
    source:
      "Based on AQA GCSE Statistics (8382). Edexcel (1ST0) covers very similar content. (H) marks Higher-tier-only topics.",
    units: [
      {
        unit: "1. The collection of data",
        elements: [
          {
            label: "The statistical enquiry cycle",
            detail: "",
          },
          {
            label: "Types of data: qualitative, quantitative, discrete, continuous",
            detail: "",
          },
          {
            label: "Primary and secondary data",
            detail: "",
          },
          {
            label: "Populations and samples",
            detail: "",
          },
          {
            label: "Sampling methods: random, systematic, stratified, quota, cluster, convenience",
            detail: "",
          },
          {
            label: "Questionnaires and questionnaire design",
            detail: "",
          },
          {
            label: "Interviews and observation",
            detail: "",
          },
          {
            label: "Controlled experiments and variables",
            detail: "",
          },
          {
            label: "Bias and how to reduce it",
            detail: "",
          },
          {
            label: "Pilot surveys",
            detail: "",
          },
          {
            label: "Capture-recapture (H)",
            detail: "",
          },
        ],
      },
      {
        unit: "2. Processing, representing and analysing data",
        elements: [
          {
            label: "Tabulation and frequency tables",
            detail: "",
          },
          {
            label: "Bar charts, pie charts and pictograms",
            detail: "",
          },
          {
            label: "Stem-and-leaf diagrams",
            detail: "",
          },
          {
            label: "Population pyramids and choropleth maps",
            detail: "",
          },
          {
            label: "Histograms (equal and unequal class widths)",
            detail: "",
          },
          {
            label: "Cumulative frequency diagrams",
            detail: "",
          },
          {
            label: "Box plots",
            detail: "",
          },
          {
            label: "Measures of central tendency: mean, median, mode",
            detail: "",
          },
          {
            label: "Weighted mean",
            detail: "",
          },
          {
            label: "Measures of spread: range, interquartile range",
            detail: "",
          },
          {
            label: "Standard deviation (H)",
            detail: "",
          },
          {
            label: "Outliers",
            detail: "",
          },
          {
            label: "Skewness",
            detail: "",
          },
          {
            label: "Scatter diagrams and correlation",
            detail: "",
          },
          {
            label: "Lines of best fit and regression (y = a + bx)",
            detail: "",
          },
          {
            label: "Spearman's rank correlation (H)",
            detail: "",
          },
          {
            label: "Time series and moving averages",
            detail: "",
          },
          {
            label: "Index numbers and chain base index numbers",
            detail: "",
          },
          {
            label: "Rates of change and crude and standardised rates",
            detail: "",
          },
          {
            label: "Quality assurance and control charts",
            detail: "",
          },
          {
            label: "Estimating population characteristics",
            detail: "",
          },
        ],
      },
      {
        unit: "3. Probability",
        elements: [
          {
            label: "Basic probability and the probability scale",
            detail: "",
          },
          {
            label: "Relative frequency and risk",
            detail: "",
          },
          {
            label: "Expected frequency",
            detail: "",
          },
          {
            label: "Sample space diagrams",
            detail: "",
          },
          {
            label: "Venn diagrams",
            detail: "",
          },
          {
            label: "Tree diagrams",
            detail: "",
          },
          {
            label: "Mutually exclusive and independent events",
            detail: "",
          },
          {
            label: "Conditional probability (H)",
            detail: "",
          },
          {
            label: "Binomial distribution (H)",
            detail: "",
          },
          {
            label: "Normal distribution (H)",
            detail: "",
          },
        ],
      },
    ],
  },
  French: {
    source:
      "Based on AQA GCSE French (8652), first taught 2024 with first exams in 2026. Foundation and Higher tiers.",
    units: [
      {
        unit: "Theme 1: People and lifestyle",
        elements: [
          {
            label: "Identity and relationships with others",
            detail: "",
          },
          {
            label: "Healthy living and lifestyle",
            detail: "",
          },
          {
            label: "Education and work",
            detail: "",
          },
        ],
      },
      {
        unit: "Theme 2: Popular culture",
        elements: [
          {
            label: "Free-time activities",
            detail: "",
          },
          {
            label: "Customs, festivals and celebrations",
            detail: "",
          },
          {
            label: "Celebrity culture",
            detail: "",
          },
        ],
      },
      {
        unit: "Theme 3: Communication and the world around us",
        elements: [
          {
            label: "Travel and tourism, including places of interest",
            detail: "",
          },
          {
            label: "Media and technology",
            detail: "",
          },
          {
            label: "The environment and where people live",
            detail: "",
          },
        ],
      },
      {
        unit: "Skills: Listening",
        elements: [
          {
            label: "Understanding spoken French",
            detail: "",
          },
          {
            label: "Dictation",
            detail: "",
          },
        ],
      },
      {
        unit: "Skills: Speaking",
        elements: [
          {
            label: "Role play",
            detail: "",
          },
          {
            label: "Reading aloud and follow-up conversation",
            detail: "",
          },
          {
            label: "Photo card discussion",
            detail: "",
          },
        ],
      },
      {
        unit: "Skills: Reading",
        elements: [
          {
            label: "Understanding written French",
            detail: "",
          },
          {
            label: "Translation into English",
            detail: "",
          },
        ],
      },
      {
        unit: "Skills: Writing",
        elements: [
          {
            label: "Short descriptive writing",
            detail: "",
          },
          {
            label: "Extended writing on a theme",
            detail: "",
          },
          {
            label: "Translation into French",
            detail: "",
          },
        ],
      },
      {
        unit: "Grammar",
        elements: [
          {
            label: "Nouns, gender and articles (definite, indefinite, partitive)",
            detail: "",
          },
          {
            label: "Adjectives: agreement and position",
            detail: "",
          },
          {
            label: "Possessive and demonstrative adjectives",
            detail: "",
          },
          {
            label: "Comparatives and superlatives",
            detail: "",
          },
          {
            label: "Adverbs",
            detail: "",
          },
          {
            label: "Subject and object pronouns, y and en",
            detail: "",
          },
          {
            label: "Present tense (regular and irregular verbs)",
            detail: "",
          },
          {
            label: "Reflexive verbs",
            detail: "",
          },
          {
            label: "Perfect tense (avoir and être)",
            detail: "",
          },
          {
            label: "Imperfect tense",
            detail: "",
          },
          {
            label: "Near future (aller + infinitive) and future tense",
            detail: "",
          },
          {
            label: "Conditional tense",
            detail: "",
          },
          {
            label: "Pluperfect tense (H)",
            detail: "",
          },
          {
            label: "Imperative",
            detail: "",
          },
          {
            label: "Negatives (ne… pas, ne… jamais, ne… rien, ne… personne)",
            detail: "",
          },
          {
            label: "Questions and question words",
            detail: "",
          },
          {
            label: "Modal verbs (pouvoir, vouloir, devoir)",
            detail: "",
          },
          {
            label: "Infinitive constructions and venir de",
            detail: "",
          },
          {
            label: "Present participle and après avoir/être (H)",
            detail: "",
          },
          {
            label: "Subjunctive in set phrases (H)",
            detail: "",
          },
          {
            label: "Passive voice (H)",
            detail: "",
          },
          {
            label: "Prepositions and conjunctions",
            detail: "",
          },
          {
            label: "Numbers, dates and time",
            detail: "",
          },
        ],
      },
      {
        unit: "Vocabulary",
        elements: [
          {
            label: "High-frequency words from the AQA vocabulary list",
            detail: "",
          },
        ],
      },
    ],
  },
  German: {
    source:
      "Based on AQA GCSE German (8662), first taught 2024 with first exams in 2026. Foundation and Higher tiers.",
    units: [
      {
        unit: "Theme 1: People and lifestyle",
        elements: [
          {
            label: "Identity and relationships with others",
            detail: "",
          },
          {
            label: "Healthy living and lifestyle",
            detail: "",
          },
          {
            label: "Education and work",
            detail: "",
          },
        ],
      },
      {
        unit: "Theme 2: Popular culture",
        elements: [
          {
            label: "Free-time activities",
            detail: "",
          },
          {
            label: "Customs, festivals and celebrations",
            detail: "",
          },
          {
            label: "Celebrity culture",
            detail: "",
          },
        ],
      },
      {
        unit: "Theme 3: Communication and the world around us",
        elements: [
          {
            label: "Travel and tourism, including places of interest",
            detail: "",
          },
          {
            label: "Media and technology",
            detail: "",
          },
          {
            label: "The environment and where people live",
            detail: "",
          },
        ],
      },
      {
        unit: "Skills: Listening",
        elements: [
          {
            label: "Understanding spoken German",
            detail: "",
          },
          {
            label: "Dictation",
            detail: "",
          },
        ],
      },
      {
        unit: "Skills: Speaking",
        elements: [
          {
            label: "Role play",
            detail: "",
          },
          {
            label: "Reading aloud and follow-up conversation",
            detail: "",
          },
          {
            label: "Photo card discussion",
            detail: "",
          },
        ],
      },
      {
        unit: "Skills: Reading",
        elements: [
          {
            label: "Understanding written German",
            detail: "",
          },
          {
            label: "Translation into English",
            detail: "",
          },
        ],
      },
      {
        unit: "Skills: Writing",
        elements: [
          {
            label: "Short descriptive writing",
            detail: "",
          },
          {
            label: "Extended writing on a theme",
            detail: "",
          },
          {
            label: "Translation into German",
            detail: "",
          },
        ],
      },
      {
        unit: "Grammar",
        elements: [
          {
            label: "Nouns, gender and plurals",
            detail: "",
          },
          {
            label: "The case system: nominative, accusative, dative, genitive (H)",
            detail: "",
          },
          {
            label: "Definite and indefinite articles in all cases",
            detail: "",
          },
          {
            label: "Prepositions with accusative, dative and both",
            detail: "",
          },
          {
            label: "Adjective endings",
            detail: "",
          },
          {
            label: "Comparatives and superlatives",
            detail: "",
          },
          {
            label: "Personal pronouns in all cases",
            detail: "",
          },
          {
            label: "Present tense (regular, irregular and separable verbs)",
            detail: "",
          },
          {
            label: "Reflexive verbs",
            detail: "",
          },
          {
            label: "Perfect tense (haben and sein)",
            detail: "",
          },
          {
            label: "Imperfect tense (common verbs and modals)",
            detail: "",
          },
          {
            label: "Future tense (werden)",
            detail: "",
          },
          {
            label: "Conditional (würde and möchte)",
            detail: "",
          },
          {
            label: "Pluperfect tense (H)",
            detail: "",
          },
          {
            label: "Imperative",
            detail: "",
          },
          {
            label: "Modal verbs",
            detail: "",
          },
          {
            label: "Word order: verb second, time–manner–place",
            detail: "",
          },
          {
            label: "Subordinate clauses and verb-final word order",
            detail: "",
          },
          {
            label: "Infinitive constructions (um… zu)",
            detail: "",
          },
          {
            label: "Negatives (nicht, kein)",
            detail: "",
          },
          {
            label: "Questions and question words",
            detail: "",
          },
          {
            label: "Relative clauses (H)",
            detail: "",
          },
          {
            label: "Passive voice (H)",
            detail: "",
          },
          {
            label: "Numbers, dates and time",
            detail: "",
          },
        ],
      },
      {
        unit: "Vocabulary",
        elements: [
          {
            label: "High-frequency words from the AQA vocabulary list",
            detail: "",
          },
        ],
      },
    ],
  },
  Spanish: {
    source:
      "Based on AQA GCSE Spanish (8692), first taught 2024 with first exams in 2026. Foundation and Higher tiers.",
    units: [
      {
        unit: "Theme 1: People and lifestyle",
        elements: [
          {
            label: "Identity and relationships with others",
            detail: "",
          },
          {
            label: "Healthy living and lifestyle",
            detail: "",
          },
          {
            label: "Education and work",
            detail: "",
          },
        ],
      },
      {
        unit: "Theme 2: Popular culture",
        elements: [
          {
            label: "Free-time activities",
            detail: "",
          },
          {
            label: "Customs, festivals and celebrations",
            detail: "",
          },
          {
            label: "Celebrity culture",
            detail: "",
          },
        ],
      },
      {
        unit: "Theme 3: Communication and the world around us",
        elements: [
          {
            label: "Travel and tourism, including places of interest",
            detail: "",
          },
          {
            label: "Media and technology",
            detail: "",
          },
          {
            label: "The environment and where people live",
            detail: "",
          },
        ],
      },
      {
        unit: "Skills: Listening",
        elements: [
          {
            label: "Understanding spoken Spanish",
            detail: "",
          },
          {
            label: "Dictation",
            detail: "",
          },
        ],
      },
      {
        unit: "Skills: Speaking",
        elements: [
          {
            label: "Role play",
            detail: "",
          },
          {
            label: "Reading aloud and follow-up conversation",
            detail: "",
          },
          {
            label: "Photo card discussion",
            detail: "",
          },
        ],
      },
      {
        unit: "Skills: Reading",
        elements: [
          {
            label: "Understanding written Spanish",
            detail: "",
          },
          {
            label: "Translation into English",
            detail: "",
          },
        ],
      },
      {
        unit: "Skills: Writing",
        elements: [
          {
            label: "Short descriptive writing",
            detail: "",
          },
          {
            label: "Extended writing on a theme",
            detail: "",
          },
          {
            label: "Translation into Spanish",
            detail: "",
          },
        ],
      },
      {
        unit: "Grammar",
        elements: [
          {
            label: "Nouns, gender and articles",
            detail: "",
          },
          {
            label: "Adjectives: agreement and position",
            detail: "",
          },
          {
            label: "Possessive and demonstrative adjectives",
            detail: "",
          },
          {
            label: "Comparatives and superlatives",
            detail: "",
          },
          {
            label: "Adverbs",
            detail: "",
          },
          {
            label: "Subject, direct and indirect object pronouns",
            detail: "",
          },
          {
            label: "Ser and estar",
            detail: "",
          },
          {
            label: "Present tense (regular, irregular and stem-changing verbs)",
            detail: "",
          },
          {
            label: "Reflexive verbs",
            detail: "",
          },
          {
            label: "Present continuous",
            detail: "",
          },
          {
            label: "Preterite tense",
            detail: "",
          },
          {
            label: "Imperfect tense",
            detail: "",
          },
          {
            label: "Preterite vs imperfect",
            detail: "",
          },
          {
            label: "Near future (ir a + infinitive) and future tense",
            detail: "",
          },
          {
            label: "Conditional tense",
            detail: "",
          },
          {
            label: "Perfect and pluperfect tenses (H)",
            detail: "",
          },
          {
            label: "Imperative",
            detail: "",
          },
          {
            label: "Present subjunctive in common structures (H)",
            detail: "",
          },
          {
            label: "Negatives",
            detail: "",
          },
          {
            label: "Questions and question words",
            detail: "",
          },
          {
            label: "Gustar and similar verbs",
            detail: "",
          },
          {
            label: "Por and para",
            detail: "",
          },
          {
            label: "Prepositions and conjunctions",
            detail: "",
          },
          {
            label: "Numbers, dates and time",
            detail: "",
          },
        ],
      },
      {
        unit: "Vocabulary",
        elements: [
          {
            label: "High-frequency words from the AQA vocabulary list",
            detail: "",
          },
        ],
      },
    ],
  },
  Italian: {
    source:
      "Based on Pearson Edexcel GCSE Italian (1IN0), first taught 2024 with first exams in 2026. AQA does not offer Italian.",
    units: [
      {
        unit: "Themes",
        elements: [
          {
            label: "My personal world (family, friends, relationships, equality)",
            detail: "",
          },
          {
            label:
              "Lifestyle and wellbeing (physical and mental wellbeing, food and drink, sports, illness)",
            detail: "",
          },
          {
            label:
              "My neighbourhood (home, local area, places in town, shopping, weather, transport)",
            detail: "",
          },
          {
            label:
              "Media and technology (life online, advantages and disadvantages of technology, music, TV, film)",
            detail: "",
          },
          {
            label: "Studying and my future (school, future opportunities, jobs and careers)",
            detail: "",
          },
          {
            label:
              "Travel and tourism (holidays, accommodation, tourist attractions, countries and cultures)",
            detail: "",
          },
        ],
      },
      {
        unit: "Skills: Listening",
        elements: [
          {
            label: "Understanding spoken Italian",
            detail: "",
          },
          {
            label: "Dictation",
            detail: "",
          },
        ],
      },
      {
        unit: "Skills: Speaking",
        elements: [
          {
            label: "Read-aloud task",
            detail: "",
          },
          {
            label: "Role play",
            detail: "",
          },
          {
            label: "Picture task",
            detail: "",
          },
          {
            label: "Conversation",
            detail: "",
          },
        ],
      },
      {
        unit: "Skills: Reading",
        elements: [
          {
            label: "Understanding written Italian",
            detail: "",
          },
          {
            label: "Translation into English",
            detail: "",
          },
        ],
      },
      {
        unit: "Skills: Writing",
        elements: [
          {
            label: "Extended writing",
            detail: "",
          },
          {
            label: "Translation into Italian",
            detail: "",
          },
        ],
      },
      {
        unit: "Grammar",
        elements: [
          {
            label: "Nouns, gender, plurals and articles",
            detail: "",
          },
          {
            label: "Articulated prepositions (del, nella and so on)",
            detail: "",
          },
          {
            label: "Adjectives: agreement and position",
            detail: "",
          },
          {
            label: "Possessive adjectives and pronouns",
            detail: "",
          },
          {
            label: "Comparatives and superlatives",
            detail: "",
          },
          {
            label: "Subject, direct and indirect object pronouns, ci and ne",
            detail: "",
          },
          {
            label: "Present tense (regular and irregular verbs)",
            detail: "",
          },
          {
            label: "Reflexive verbs",
            detail: "",
          },
          {
            label: "Passato prossimo (avere and essere)",
            detail: "",
          },
          {
            label: "Imperfect tense",
            detail: "",
          },
          {
            label: "Future tense",
            detail: "",
          },
          {
            label: "Conditional tense",
            detail: "",
          },
          {
            label: "Pluperfect tense (H)",
            detail: "",
          },
          {
            label: "Imperative",
            detail: "",
          },
          {
            label: "Present subjunctive in common structures (H)",
            detail: "",
          },
          {
            label: "Modal verbs (potere, volere, dovere)",
            detail: "",
          },
          {
            label: "Piacere and similar verbs",
            detail: "",
          },
          {
            label: "Negatives",
            detail: "",
          },
          {
            label: "Questions and question words",
            detail: "",
          },
          {
            label: "Numbers, dates and time",
            detail: "",
          },
        ],
      },
      {
        unit: "Vocabulary",
        elements: [
          {
            label: "High-frequency words from the Edexcel vocabulary list",
            detail: "",
          },
        ],
      },
    ],
  },
  Latin: {
    source:
      "Based on OCR GCSE Latin (J282). Students take Language plus two literature components (or one literature plus Literature and Culture). Set texts change; tick those you study.",
    units: [
      {
        unit: "Component 1: Latin Language (compulsory): Accidence (word forms)",
        elements: [
          {
            label: "Nouns: 1st–5th declensions, all cases",
            detail: "",
          },
          {
            label: "Adjectives: 1st/2nd and 3rd declension, agreement",
            detail: "",
          },
          {
            label: "Comparative and superlative adjectives and adverbs",
            detail: "",
          },
          {
            label: "Pronouns (personal, demonstrative, relative, reflexive, interrogative)",
            detail: "",
          },
          {
            label: "Verbs: present, imperfect, future, perfect, pluperfect (active)",
            detail: "",
          },
          {
            label: "Verbs: passive voice in all tenses",
            detail: "",
          },
          {
            label: "Deponent verbs",
            detail: "",
          },
          {
            label: "Irregular verbs (sum, possum, eo, volo, nolo, fero)",
            detail: "",
          },
          {
            label: "Imperatives",
            detail: "",
          },
          {
            label: "Subjunctive: present, imperfect, perfect, pluperfect",
            detail: "",
          },
          {
            label: "Participles (present, perfect, future)",
            detail: "",
          },
          {
            label: "Infinitives (present, perfect, future)",
            detail: "",
          },
          {
            label: "Numerals",
            detail: "",
          },
        ],
      },
      {
        unit: "Component 1: Latin Language (compulsory): Syntax (sentence structure)",
        elements: [
          {
            label: "Uses of cases (ablative absolute, time, place)",
            detail: "",
          },
          {
            label: "Relative clauses",
            detail: "",
          },
          {
            label: "Purpose clauses",
            detail: "",
          },
          {
            label: "Result clauses",
            detail: "",
          },
          {
            label: "Indirect commands",
            detail: "",
          },
          {
            label: "Indirect questions",
            detail: "",
          },
          {
            label: "Indirect statements",
            detail: "",
          },
          {
            label: "Cum clauses",
            detail: "",
          },
          {
            label: "Conditional clauses",
            detail: "",
          },
          {
            label: "Gerunds and gerundives",
            detail: "",
          },
        ],
      },
      {
        unit: "Component 1: Latin Language (compulsory): Vocabulary",
        elements: [
          {
            label: "OCR Defined Vocabulary List",
            detail: "",
          },
        ],
      },
      {
        unit: "Component 1: Latin Language (compulsory): Exam skills",
        elements: [
          {
            label: "Comprehension questions",
            detail: "",
          },
          {
            label: "Translation from Latin into English",
            detail: "",
          },
          {
            label: "Derivations and grammar questions",
            detail: "",
          },
          {
            label: "English to Latin sentences (optional)",
            detail: "",
          },
        ],
      },
      {
        unit: "Component 2: Latin Prose Literature",
        elements: [
          {
            label: "Set prose text (tick your set text)",
            detail: "",
          },
          {
            label: "Translation and understanding (Component 2: Latin Prose Literature)",
            detail: "",
          },
          {
            label: "Literary style and techniques (Component 2: Latin Prose Literature)",
            detail: "",
          },
          {
            label: "Context and themes (Component 2: Latin Prose Literature)",
            detail: "",
          },
        ],
      },
      {
        unit: "Component 3: Latin Verse Literature",
        elements: [
          {
            label: "Set verse text (tick your set text)",
            detail: "",
          },
          {
            label: "Translation and understanding (Component 3: Latin Verse Literature)",
            detail: "",
          },
          {
            label: "Literary style and techniques (Component 3: Latin Verse Literature)",
            detail: "",
          },
          {
            label: "Scansion of dactylic hexameter",
            detail: "",
          },
          {
            label: "Context and themes (Component 3: Latin Verse Literature)",
            detail: "",
          },
        ],
      },
      {
        unit: "Component 4: Literature and Culture (alternative)",
        elements: [
          {
            label: "Culture topic 1 (set by OCR)",
            detail: "",
          },
          {
            label: "Culture topic 2 (set by OCR)",
            detail: "",
          },
          {
            label: "Prescribed literature in translation and Latin",
            detail: "",
          },
        ],
      },
    ],
  },
  "Classical Greek": {
    source:
      "Based on OCR GCSE Classical Greek (J292). Students take Language plus two literature components (or one literature plus Literature and Culture). Set texts change; tick those you study.",
    units: [
      {
        unit: "Component 1: Greek Language (compulsory): Alphabet and basics",
        elements: [
          {
            label: "The Greek alphabet, breathings and accents",
            detail: "",
          },
          {
            label: "Transliteration",
            detail: "",
          },
        ],
      },
      {
        unit: "Component 1: Greek Language (compulsory): Accidence (word forms)",
        elements: [
          {
            label: "Nouns: 1st, 2nd and 3rd declensions",
            detail: "",
          },
          {
            label: "The definite article",
            detail: "",
          },
          {
            label: "Adjectives and agreement",
            detail: "",
          },
          {
            label: "Comparative and superlative adjectives and adverbs",
            detail: "",
          },
          {
            label: "Pronouns (personal, demonstrative, relative, reflexive, interrogative)",
            detail: "",
          },
          {
            label: "Verbs: present, imperfect, future, aorist (active)",
            detail: "",
          },
          {
            label: "Verbs: perfect and pluperfect",
            detail: "",
          },
          {
            label: "Middle and passive voices",
            detail: "",
          },
          {
            label: "Contracted verbs",
            detail: "",
          },
          {
            label: "Irregular verbs (εἰμί, εἶμι, οἶδα and others)",
            detail: "",
          },
          {
            label: "Participles",
            detail: "",
          },
          {
            label: "Infinitives",
            detail: "",
          },
          {
            label: "Subjunctive and optative moods",
            detail: "",
          },
          {
            label: "Imperatives",
            detail: "",
          },
          {
            label: "Numerals",
            detail: "",
          },
        ],
      },
      {
        unit: "Component 1: Greek Language (compulsory): Syntax (sentence structure)",
        elements: [
          {
            label: "Uses of cases",
            detail: "",
          },
          {
            label: "Particles",
            detail: "",
          },
          {
            label: "Relative clauses",
            detail: "",
          },
          {
            label: "Purpose clauses",
            detail: "",
          },
          {
            label: "Result clauses",
            detail: "",
          },
          {
            label: "Indirect statements",
            detail: "",
          },
          {
            label: "Indirect questions",
            detail: "",
          },
          {
            label: "Conditional clauses",
            detail: "",
          },
          {
            label: "Genitive absolute",
            detail: "",
          },
          {
            label: "Temporal clauses",
            detail: "",
          },
        ],
      },
      {
        unit: "Component 1: Greek Language (compulsory): Vocabulary",
        elements: [
          {
            label: "OCR Defined Vocabulary List",
            detail: "",
          },
        ],
      },
      {
        unit: "Component 1: Greek Language (compulsory): Exam skills",
        elements: [
          {
            label: "Comprehension questions",
            detail: "",
          },
          {
            label: "Translation from Greek into English",
            detail: "",
          },
          {
            label: "Derivations and grammar questions",
            detail: "",
          },
          {
            label: "English to Greek sentences (optional)",
            detail: "",
          },
        ],
      },
      {
        unit: "Component 2: Greek Prose Literature",
        elements: [
          {
            label: "Set prose text (tick your set text)",
            detail: "",
          },
          {
            label: "Translation and understanding (Component 2: Greek Prose Literature)",
            detail: "",
          },
          {
            label: "Literary style and techniques (Component 2: Greek Prose Literature)",
            detail: "",
          },
          {
            label: "Context and themes (Component 2: Greek Prose Literature)",
            detail: "",
          },
        ],
      },
      {
        unit: "Component 3: Greek Verse Literature",
        elements: [
          {
            label: "Set verse text (tick your set text)",
            detail: "",
          },
          {
            label: "Translation and understanding (Component 3: Greek Verse Literature)",
            detail: "",
          },
          {
            label: "Literary style and techniques (Component 3: Greek Verse Literature)",
            detail: "",
          },
          {
            label: "Context and themes (Component 3: Greek Verse Literature)",
            detail: "",
          },
        ],
      },
      {
        unit: "Component 4: Literature and Culture (alternative)",
        elements: [
          {
            label: "Culture topic 1 (set by OCR)",
            detail: "",
          },
          {
            label: "Culture topic 2 (set by OCR)",
            detail: "",
          },
          {
            label: "Prescribed literature in translation and Greek",
            detail: "",
          },
        ],
      },
    ],
  },
};

function find(subjectName: string): SpecTopicList | undefined {
  const key = subjectName.trim().toLowerCase();
  const match = Object.keys(SPEC_TOPICS).find((name) => name.toLowerCase() === key);
  return match ? SPEC_TOPICS[match] : undefined;
}

/** The exam-board topic list for a subject, or [] when there isn't one. */
export function specUnits(subjectName: string): SubjectUnit[] {
  return find(subjectName)?.units ?? [];
}

/** Which specification the subject's list follows, e.g. "Based on AQA GCSE Biology (8461)…". */
export function specSource(subjectName: string): string {
  return find(subjectName)?.source ?? "";
}

/** The ready-made list for a subject: the exam-board list if there is one, else the DfE list. */
export function readyListFor(subjectName: string): {
  kind: "spec" | "dfe";
  source: string;
  units: SubjectUnit[];
} {
  const spec = specUnits(subjectName);
  if (spec.length) return { kind: "spec", source: specSource(subjectName), units: spec };
  return {
    kind: "dfe",
    source: "Based on the DfE GCSE subject content.",
    units: subjectUnits(subjectName),
  };
}
