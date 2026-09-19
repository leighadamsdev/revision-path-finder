/**
 * Topic checklists per GCSE subject, taken from the GCSE Master Subject
 * Content Revision Checklists. Each subject has units; each unit has
 * elements a student can tick individually or all at once.
 */
export type TopicElement = { label: string; detail: string };
export type SubjectUnit = { unit: string; elements: TopicElement[] };

export const SUBJECT_TOPICS: Record<string, SubjectUnit[]> = {
  "Ancient History": [
    {
      unit: "Shorter Period Study (Min. 50 Years)",
      elements: [
        { label: "Narrative & Chronology", detail: "Key events, leaders, battles, political reforms, and turning points across the era." },
        { label: "Causes & Consequences", detail: "Short- and long-term causes of structural change in the state/society." },
        { label: "Source Evaluation", detail: "Analysis of contemporary literary accounts and material remains for the period." },
      ],
    },
    {
      unit: "Longer Period Study (Min. 150 Years)",
      elements: [
        { label: "Broad Historical Arc", detail: "Major cultural, military, political, and religious developments across 150+ years." },
        { label: "Comparative Analysis", detail: "Contrasting political systems, military practices, or societal shifts between different sub-periods." },
        { label: "Primary Evidence Base", detail: "Tracking historical continuity and change using scarce ancient evidence." },
      ],
    },
    {
      unit: "Two Depth Studies",
      elements: [
        { label: "Depth Study 1 (Complex Event/Crisis)", detail: "Key personalities, motives, ideological clashes, and day-to-day political maneuvers." },
        { label: "Depth Study 2 (Complex Event/Crisis)", detail: "Military, religious, and socio-economic dynamics of the selected event." },
        { label: "Source Critique & Bias", detail: "Evaluating ancient writers (e.g., Herodotus, Thucydides, Plutarch, Tacitus, Suetonius) regarding propaganda, reliability, and social context." },
      ],
    },
  ],
  "Ancient Languages": [
    {
      unit: "Linguistic Competence (Language)",
      elements: [
        { label: "Defined Vocabulary", detail: "Recalling and applying the minimum 400-word prescribed vocabulary list and regular compounds." },
        { label: "Accidence & Morphology", detail: "" },
        { label: "Latin / Greek", detail: "Noun declensions (all regular cases), adjective agreements, comparison of adjectives/adverbs, pronoun forms, and regular/deponent verb conjugations across moods, tenses, and voices." },
        { label: "Biblical Hebrew", detail: "Noun/adjective/pronoun formation, verb conjugations across all aspects, tenses, voices, and prefixed/suffixed morphemes." },
        { label: "Syntax & Sentence Structures", detail: "" },
        { label: "Common case usages (e.g., time expressions, motion, prepositions)", detail: "" },
        { label: "Direct and indirect statements, questions, and commands", detail: "" },
        { label: "Dependent clauses", detail: "relative clauses, purpose, result, temporal, causal, conditional, and participial constructions." },
        { label: "Translation & Comprehension", detail: "Translating unseen narrative passages into clear English, alongside English comprehension and grammar analysis (or translating sentences from English into the ancient language)." },
      ],
    },
    {
      unit: "Literature & Cultural Context",
      elements: [
        { label: "Prescribed Texts (Prose & Verse)", detail: "Reading and translating set texts in the original language; explaining content, key vocabulary, and stylistic nuances." },
        { label: "Literary Evaluation", detail: "Analysing literary devices, meter/verse effects, stylistic features, and their impact on ancient readers." },
        { label: "Historical & Social Context", detail: "Understanding the cultural values, social practices, and historical background of the literature (and drawing modern comparisons, where applicable)." },
      ],
    },
  ],
  "Art and Design": [
    {
      unit: "Assessment Objectives & Creative Journey",
      elements: [
        { label: "AO1 (Develop)", detail: "Investigating sources, researching historical and contemporary artists/designers, and showing analytical context." },
        { label: "AO2 (Refine)", detail: "Experimenting with media, materials, techniques, and processes; reviewing and refining practical work as it progresses." },
        { label: "AO3 (Record)", detail: "Recording observations, sketches, ideas, insights, and critical written annotations using subject-specific vocabulary." },
        { label: "AO4 (Present)", detail: "Realising personal intentions and presenting a meaningful, sustained final personal outcome/prototype." },
      ],
    },
    {
      unit: "Formal Elements & Technical Media",
      elements: [
        { label: "Visual Language", detail: "Practical command of colour, line, form, tone, and texture." },
        { label: "Drawing for Purpose", detail: "Using drawing in diverse ways (perceptual, analytical, preparatory, expressive) across the development process." },
        { label: "Title-Specific Specialist Techniques", detail: "" },
        { label: "Fine Art", detail: "Painting media, printmaking (etching, relief), sculpture, mixed media, or lens-based work." },
        { label: "Graphic Communication", detail: "Typography, branding, illustration, package design, and CAD/digital suites." },
        { label: "Textile Design", detail: "Constructed, printed, dyed, or stitched fabrics, fashion design, and pattern cutting." },
        { label: "Three-Dimensional Design", detail: "Model-making, ceramics, spatial/product design, and form-function analysis." },
        { label: "Photography", detail: "Film/chemical methods, digital shooting, darkroom/digital post-production, and lighting setups." },
      ],
    },
  ],
  "Astronomy": [
    {
      unit: "Earth, Moon & Sun Interactions",
      elements: [
        { label: "Internal Structures & Features", detail: "Layers of Earth and Moon; solar interior (core, radiative/convection zones) and atmosphere (photosphere, chromosphere, corona)." },
        { label: "Solar Phenomena", detail: "Solar cycle, sunspots, solar wind, aurorae, and safe solar observation methods (H-alpha filters, pinhole projection)." },
        { label: "Lunar Phenomena", detail: "Synchronous rotation, phases, libration, tidal forces (spring and neap tides), solar and lunar eclipses." },
        { label: "Timekeeping & Sundials", detail: "Sidereal vs. synodic day/month, Apparent Solar Time (AST), Mean Solar Time, and the Equation of Time (EoT = AST - LMT)." },
      ],
    },
    {
      unit: "Planetary Systems & Our Solar System",
      elements: [
        { label: "Orbits & Gravity", detail: "Kepler's three laws of planetary motion, Newton's law of universal gravitation, and Roche limits." },
        { label: "Solar System Bodies", detail: "Terrestrial planets, gas giants, dwarf planets, asteroids, Kuiper belt, Oort cloud, and comets." },
        { label: "Historical Astronomy", detail: "Geocentric vs. heliocentric models; contributions of Brahe, Galileo, Copernicus, Kepler, and Halley." },
        { label: "Exoplanets & Astrobiology", detail: "Detection methods (radial velocity, transit method), habitable Goldilocks zones, and the Drake Equation." },
      ],
    },
    {
      unit: "Stars & The Celestial Sphere",
      elements: [
        { label: "Celestial Navigation", detail: "Celestial sphere, right ascension (RA), declination (Dec), altitude, azimuth, zenith, and circumpolar stars." },
        { label: "Stellar Properties", detail: "Apparent and absolute magnitude, distance-modulus formula [m - M = 5 log10(d) - 5], parallax, and the parsec." },
        { label: "Hertzsprung-Russell (H-R) Diagram", detail: "Spectral classes (O, B, A, F, G, K, M), main sequence, red giants, supergiants, and white dwarfs." },
        { label: "Stellar Evolution", detail: "Balance between radiation pressure and gravity, planetary nebulae, supernovae, neutron stars, black holes, and the Chandrasekhar limit." },
      ],
    },
    {
      unit: "Cosmology, Galaxies & Telescopes",
      elements: [
        { label: "Galaxies & Expanding Universe", detail: "Milky Way structure (21cm hydrogen line detection), Hubble's classification, red-shift, and Hubble's Law (v = H0 × d)." },
        { label: "Big Bang Evidence", detail: "Cosmic Microwave Background Radiation (CMBR), dark energy, and dark matter." },
        { label: "Observational Technology", detail: "Refracting vs. reflecting telescopes, magnification (M = fo / fe), light grasp, space telescopes, and observational logs." },
      ],
    },
  ],
  "Business": [
    {
      unit: "Business Activity & Enterprise",
      elements: [
        { label: "Enterprise & Objectives", detail: "Dynamic nature of business, entrepreneurship, risk vs. reward, business plans, and changing aims/objectives." },
        { label: "Ownership & Growth", detail: "Sole traders, partnerships, private limited companies (Ltd), public limited companies (Plc); organic vs. external growth (mergers/takeovers)." },
        { label: "Stakeholders & Location", detail: "Stakeholder conflicts; location factors (proximity to market, labour, raw materials)." },
      ],
    },
    {
      unit: "Influences on Business",
      elements: [
        { label: "External Drivers", detail: "E-commerce, digital technology, ethical trade, sustainability, consumer law, and employment legislation." },
        { label: "Economic Climate", detail: "Effects of inflation, unemployment, interest rates, exchange rates, and globalisation on business decisions." },
      ],
    },
    {
      unit: "Business Operations",
      elements: [
        { label: "Production Methods", detail: "Job, batch, and flow production; lean production and efficiency." },
        { label: "Procurement & Quality", detail: "Supply chain management, Just-in-Time (JIT), Just-in-Case (JIC), quality control, and quality assurance." },
        { label: "Customer Service", detail: "Customer engagement, product knowledge, and after-sales care." },
      ],
    },
    {
      unit: "Marketing",
      elements: [
        { label: "Market Research & Segmentation", detail: "Primary vs. secondary research, quantitative vs. qualitative data, and demographic/geographic segmentation." },
        { label: "The Marketing Mix (4 Ps)", detail: "Product lifecycle, pricing strategies (skimming, penetration, cost-plus), promotional mix, and channels of distribution." },
      ],
    },
    {
      unit: "Finance & Quantitative Skills",
      elements: [
        { label: "Sources of Finance", detail: "Internal (retained profit) vs. external (bank loans, overdrafts, venture capital, share issue)." },
        { label: "Financial Calculations", detail: "" },
        { label: "Total Revenue = Price × Quantity", detail: "" },
        { label: "Fixed, Variable, and Total Costs", detail: "" },
        { label: "Break-Even Output = Fixed Costs / (Selling Price - Variable Cost per unit)", detail: "" },
        { label: "Gross Profit Margin = (Gross Profit / Revenue) × 100", detail: "" },
        { label: "Net Profit Margin = (Net Profit / Revenue) × 100", detail: "" },
        { label: "Average Rate of Return (ARR)", detail: "" },
        { label: "Cash-Flow Forecasts", detail: "Net cash flow, opening balance, and closing balance." },
      ],
    },
    {
      unit: "Human Resources",
      elements: [
        { label: "Organisational Structure", detail: "Tall vs. flat structures, span of control, chain of command, and delegation." },
        { label: "Recruitment, Retention & Motivation", detail: "Internal vs. external recruitment; financial motivators (bonus, commission) vs. non-financial motivators (job rotation, enrichment)." },
        { label: "Training & Development", detail: "Induction, on-the-job, and off-the-job training." },
      ],
    },
  ],
  "Citizenship Studies": [
    {
      unit: "Democracy and Government",
      elements: [
        { label: "Parliament & Constitution", detail: "Separation of powers (executive, legislature, judiciary, monarchy), House of Commons vs. House of Lords, scrutiny, and the uncodified UK constitution." },
        { label: "Elections & Voting", detail: "First-past-the-post vs. proportional systems, political party manifestos, and voting rights." },
        { label: "Devolved & Local Government", detail: "Powers of devolved administrations in Scotland, Wales, and Northern Ireland; local council roles and tax spending." },
        { label: "Media & Free Press", detail: "Investigative journalism, holding power to account, press regulation, censorship, and digital bias." },
        { label: "International Politics", detail: "Comparing the UK system to non-UK democratic and non-democratic political regimes." },
      ],
    },
    {
      unit: "Law, Justice & The Rights of Citizens",
      elements: [
        { label: "Principles of Justice", detail: "Presumption of innocence, equality before the law, common law vs. legislation, and criminal vs. civil law." },
        { label: "The Justice System (England & Wales)", detail: "Roles of police, CPS, magistrates' courts, Crown Court, juries, and youth justice." },
        { label: "Rights Frameworks", detail: "Magna Carta, Human Rights Act 1998, UN Universal Declaration of Human Rights, and UNCRC." },
        { label: "Sentencing & Crime Prevention", detail: "Aims of sentencing (retribution, deterrence, rehabilitation) and factors influencing crime rates." },
      ],
    },
    {
      unit: "Society, Economy & Global Relations",
      elements: [
        { label: "Identities & Communities", detail: "Diversity, migration, multiculturalism, and mutual respect in contemporary Britain." },
        { label: "Public Finance", detail: "Taxation, government budgets, public borrowing, and state welfare/healthcare funding." },
        { label: "International Institutions", detail: "UK's role in the UN, NATO, Commonwealth, WTO, and international conflict resolution (mediation, sanctions, humanitarian law)." },
      ],
    },
    {
      unit: "Taking Citizenship Action (Exam Preparation)",
      elements: [
        { label: "Investigation & Planning", detail: "Designing an active enquiry, gathering primary and secondary evidence, and planning an action." },
        { label: "Execution & Advocacy", detail: "Petitions, campaigning, lobbying, or community projects." },
        { label: "Critical Evaluation", detail: "Evaluating the success, methods, impact, and limitations of the practical citizenship action." },
      ],
    },
  ],
  "Classical Civilisation": [
    {
      unit: "Ancient Literature (In Translation)",
      elements: [
        { label: "Literary Forms & Genres", detail: "Conventions of epic poetry, drama (tragedy and comedy), verse, prose, novel, oratory, and letters." },
        { label: "Plot & Characterisation", detail: "Narrative development, character motives, cause and effect, and dramatic techniques." },
        { label: "Themes & Authorial Intent", detail: "Explaining why authors select specific themes and how they reflect political/social contexts." },
        { label: "Performance & Reception", detail: "Ancient audience contexts, recitation/theatrical staging, and modern interpretations of classical texts." },
      ],
    },
    {
      unit: "Visual & Material Culture",
      elements: [
        { label: "Architecture", detail: "Examining set architectural examples (temples, theatres, amphitheatres, fora, or domestic houses) for form, purpose, and construction style." },
        { label: "Artefacts & Artworks", detail: "Sculpture, vase painting, frescoes, and mosaics; decorative techniques and subject symbolism." },
        { label: "Material Limitations", detail: "Working with fragmentary, damaged, or relocated archaeological remains." },
        { label: "Civic & Religious Context", detail: "How and why monuments or artworks were commissioned and the significance of where they were displayed." },
      ],
    },
    {
      unit: "Thematic Comparative Study (Chosen Theme)",
      elements: [
        { label: "Theme Focus (Myth/Religion, Gender, Slavery, Authority, or Citizenship): Comparing how the theme is treated across two distinct societies (e.g., Greece vs. Rome or across contrasting time periods)", detail: "" },
        { label: "Comparative Analysis", detail: "Contrasting attitudes, social hierarchies, civic laws, and beliefs using both literary extracts and material culture side-by-side." },
      ],
    },
  ],
  "Combined Science (Trilogy / Double Award)": [
    {
      unit: "Biology Component",
      elements: [
        { label: "Cell Biology & Transport", detail: "Prokaryotic/eukaryotic cells, microscopy, cell cycle, mitosis, stem cells, diffusion, osmosis, and active transport." },
        { label: "Organ Systems", detail: "Human digestive enzymes, heart structure, circulatory vessels, and plant transport (xylem, phloem, transpiration)." },
        { label: "Infection & Non-Communicable Diseases", detail: "Pathogens, viral/bacterial/fungal diseases, immune defence, vaccination, lifestyle disease risk, and CVD treatments." },
        { label: "Bioenergetics", detail: "Photosynthesis equation/limiting factors and cellular respiration (aerobic and anaerobic)." },
        { label: "Homeostasis", detail: "Nervous reflex arcs, endocrine principles, insulin/glucagon, and human reproduction hormones." },
        { label: "Genetics & Ecology", detail: "DNA structure, inheritance crosses, selective breeding, genetic engineering, biotic/abiotic factors, and carbon/water cycles." },
      ],
    },
    {
      unit: "Chemistry Component",
      elements: [
        { label: "Atomic Structure & Bonding", detail: "Periodic trends, ionic/covalent/metallic bonding, and allotropes of carbon (diamond, graphite, graphene, fullerenes)." },
        { label: "Quantitative Chemistry", detail: "Balancing equations, calculating relative formula mass (Mr), the mole concept, reacting masses, and concentration (g/dm3)." },
        { label: "Chemical & Energy Changes", detail: "Metal reactivity series, acids, alkalis, neutralisation, electrolysis, and exothermic/endothermic reaction profiles." },
        { label: "Reaction Rates & Earth Science", detail: "Collision theory, catalysts, Le Chatelier's principle, fractional distillation of crude oil, cracking, atmospheric evolution, and potable water." },
      ],
    },
    {
      unit: "Physics Component",
      elements: [
        { label: "Energy & Electricity", detail: "Energy stores, power, efficiency, Ohm's law (V = I × R), series and parallel circuits, domestic UK mains supply, and power transmission via the National Grid." },
        { label: "Forces & Motion", detail: "Vectors, Newton's laws, stopping distances, kinetic energy, and gravitational potential energy." },
        { label: "Waves & Electromagnetism", detail: "Transverse/longitudinal waves, wave speed (v = frequency × wavelength), EM spectrum uses and hazards, magnetic fields, and the motor effect." },
        { label: "Matter & Nuclear Physics", detail: "Density, changes of state, specific heat capacity, latent heat, alpha/beta/gamma decay, and radioactive half-life." },
      ],
    },
  ],
  "Dance": [
    {
      unit: "Performance Skills",
      elements: [
        { label: "Physical Attributes", detail: "Posture, alignment, balance, coordination, control, flexibility, strength, and stamina." },
        { label: "Technical Prowess", detail: "Accuracy of action, dynamic control, rhythmic timing, spatial accuracy, and stylistic fidelity." },
        { label: "Mental & Expressive Skills", detail: "Movement memory, focus, projection, musicality, dynamic phrasing, facial expression, and spatial sensitivity." },
        { label: "Safe Dance Practice", detail: "Warm-up/cool-down, appropriate clothing, hydration, and injury avoidance." },
      ],
    },
    {
      unit: "Choreography",
      elements: [
        { label: "Choreographic Processes", detail: "Responding to stimuli, researching, improvising, selecting, structuring, and refining material." },
        { label: "Elements of Dance", detail: "Action, space, dynamics, and relationships." },
        { label: "Choreographic Devices", detail: "Motif development, repetition, contrast, transitions, highlights, climax, unison, canon, and number manipulation." },
        { label: "Form & Structure", detail: "Binary, ternary, rondo, episodic, narrative, and dance for camera / alternative performance spaces." },
      ],
    },
    {
      unit: "Dance Appreciation",
      elements: [
        { label: "Set Professional Works", detail: "Deep study of at least 2 contrasting professional dance works by different choreographers." },
        { label: "Production Features", detail: "Staging, set design, lighting, props, costume, dance for camera, and aural accompaniment." },
        { label: "Critical Appraisal", detail: "Describing, analysing, interpreting, and evaluating professional works as well as own practical choreography and performance." },
      ],
    },
  ],
  "Design & Technology": [
    {
      unit: "Core Technical Principles",
      elements: [
        { label: "New & Emerging Technologies", detail: "Industry impact, automation, enterprise, sustainability, and ethical/environmental design choices." },
        { label: "Energy Generation & Storage", detail: "Renewable vs. non-renewable, battery types, and modern cells." },
        { label: "Modern & Smart Materials", detail: "Shape memory alloys, photochromic/thermochromic pigments, nanomaterials, composite materials, and technical textiles." },
        { label: "Systems, Electronics & Control", detail: "Inputs (sensors/switches), process devices (microcontrollers/timers), and outputs (buzzers, motors, LEDs)." },
        { label: "Mechanical Devices", detail: "Movement types (linear, rotary, reciprocating, oscillating), levers (classes 1, 2, 3), linkages, gear trains, and pulleys." },
        { label: "Materials Categorisation & Working Properties", detail: "Papers and boards, natural/manufactured timber, ferrous/non-ferrous metals, thermoforming/thermosetting polymers, and textiles." },
      ],
    },
    {
      unit: "Specialist Technical Principles (Chosen Material Area)",
      elements: [
        { label: "Forces & Stresses", detail: "Tension, compression, torsion, bending, shear; reinforcing and stiffening methods." },
        { label: "Ecological Footprint", detail: "Life-cycle assessment (LCA), extraction, transportation, recycling, and carbon offsetting." },
        { label: "Stock Forms & Sizing", detail: "Selecting commercial sizes and stock forms to minimise waste." },
        { label: "Scales of Production", detail: "One-off, batch, mass, and continuous production." },
        { label: "Specialist Manufacturing Techniques", detail: "Wastage, addition, deforming, reforming, and rapid prototyping (CNC/3D printing)." },
        { label: "Finishes & Treatments", detail: "Surface treatments for protection and aesthetic enhancement." },
      ],
    },
    {
      unit: "Designing & Making Principles",
      elements: [
        { label: "User-Centred Design", detail: "Writing design briefs and specifications based on primary/secondary client research." },
        { label: "Design Fixation & Ideation", detail: "Strategies to overcome fixation (collaboration, SCAMPER, systems thinking)." },
        { label: "Technical Drawing & Communication", detail: "2D/3D sketching, orthographic projection, isometric drawing, exploded views, and schematic diagrams." },
        { label: "Tolerances & Accuracy", detail: "Marking out, templates, jigs, patterns, working within tolerances, and quality control." },
        { label: "Evaluation & Iteration", detail: "Prototype testing, client feedback analysis, and identifying design modifications." },
      ],
    },
  ],
  "Drama": [
    {
      unit: "Understanding Performance Texts & Context",
      elements: [
        { label: "Textual Analysis", detail: "Studying one complete play and key extracts from a contrasting text; examining genre, structure, characterisation, dialogue, and stage directions." },
        { label: "Social & Theatrical Context", detail: "Theatrical conventions, historical eras, staging traditions, and original performance environments." },
      ],
    },
    {
      unit: "Practical Making & Performance (Actor / Designer)",
      elements: [
        { label: "Vocal & Physical Interpretation (Acting)", detail: "Tone, pitch, pace, volume, posture, gesture, gait, facial expression, and spatial relationships (proxemics)." },
        { label: "Design Disciplines", detail: "Set, lighting, sound, costume, hair/make-up, or puppet design to realise artistic intentions." },
        { label: "Devising Performance", detail: "Researching stimuli, improvising, structuring, rehearsing, refining, and presenting an original devised performance." },
        { label: "Scripted Performance", detail: "Realising a character/design from a scripted extract for an audience." },
      ],
    },
    {
      unit: "Evaluation of Live Theatre",
      elements: [
        { label: "Live Theatre Review", detail: "Analysing lighting, set, sound, acting techniques, and overall directorial choices in a live (or streamed) theatrical production." },
        { label: "Self-Evaluation", detail: "Documenting and critically reflecting on your own creative processes, rehearsal developments, and final performance." },
      ],
    },
  ],
  "Economics": [
    {
      unit: "Introduction to Economics",
      elements: [
        { label: "The Basic Economic Problem", detail: "Scarce resources, unlimited wants, and opportunity cost." },
        { label: "Factors of Production", detail: "Land, labour, capital, and enterprise (rewards: rent, wages, interest, profit)." },
        { label: "Economic Sectors", detail: "Primary, secondary, and tertiary sectors; factor markets vs. product markets." },
      ],
    },
    {
      unit: "The Role of Markets & Market Failure",
      elements: [
        { label: "Demand & Supply", detail: "Law of demand/supply, curves, shifts vs. movements, and equilibrium price." },
        { label: "Elasticities", detail: "Price elasticity of demand (PED) and price elasticity of supply (PES)." },
        { label: "Production & Costs", detail: "Fixed/variable costs, revenue, profit, and economies/diseconomies of scale." },
        { label: "Market Structures", detail: "Competitive markets, monopolies, and oligopolies." },
        { label: "Labour Markets", detail: "Wage determination through labour demand and supply; labour mobility." },
        { label: "Market Failure", detail: "Positive and negative externalities; government interventions (taxes, subsidies, regulation)." },
      ],
    },
    {
      unit: "The Role of Money & Financial Markets",
      elements: [
        { label: "Money & Banking", detail: "Functions of money; commercial banks vs. central bank." },
        { label: "Interest Rates", detail: "Impact of rates on saving, borrowing, and business investment." },
      ],
    },
    {
      unit: "The Role of Government & Macroeconomic Objectives",
      elements: [
        { label: "Economic Growth", detail: "Measuring GDP, real vs. nominal GDP, and costs/benefits of economic growth." },
        { label: "Employment & Unemployment", detail: "Types (structural, frictional, cyclical, seasonal) and economic consequences." },
        { label: "Price Stability & Inflation", detail: "Measuring inflation (CPI/RPI); demand-pull vs. cost-push inflation." },
        { label: "Income Distribution", detail: "Inequality causes, progressive taxation, and welfare support." },
        { label: "Macroeconomic Policies", detail: "Fiscal policy, monetary policy, and supply-side policies." },
      ],
    },
    {
      unit: "International Trade & The Global Economy",
      elements: [
        { label: "International Trade", detail: "Current account balance of payments (deficits vs. surpluses)." },
        { label: "Exchange Rates", detail: "Supply and demand determination; effects of appreciation/depreciation." },
        { label: "Globalisation & Trade Agreements", detail: "Benefits and drawbacks; free trade agreements, tariffs, and quotas." },
      ],
    },
  ],
  "Electronics": [
    {
      unit: "System Concepts & Basic DC Circuits",
      elements: [
        { label: "System Architecture", detail: "Input sensors, process sub-systems, driver stages, and output transducers." },
        { label: "Core Circuit Laws", detail: "Ohm's law (V = I × R), electrical power [P = V × I = I^2 × R = V^2 / R], and energy transfer (E = P × t)." },
        { label: "Resistor Networks", detail: "Resistors in series (R = R1 + R2) and parallel [R = (R1 × R2) / (R1 + R2)]." },
        { label: "Potential Dividers", detail: "Formula V_out = [R2 / (R1 + R2)] × V_in, LDRs, and thermistors." },
        { label: "Diodes & Transistors", detail: "Silicon diodes, zener diodes, and NPN bipolar transistors (Ic = hFE × Ib)." },
        { label: "MOSFETs & Comparators", detail: "MOSFET switching behavior and operational comparators." },
      ],
    },
    {
      unit: "Digital Circuits & Logic Systems",
      elements: [
        { label: "Combinational Logic", detail: "NOT, AND, OR, NAND, and NOR logic gates; truth tables and symbols." },
        { label: "Boolean Simplification", detail: "De Morgan's laws." },
        { label: "Pull-Up & Pull-Down Resistors", detail: "Maintaining input logic levels." },
      ],
    },
    {
      unit: "Timing & Sequential Circuits",
      elements: [
        { label: "RC Timing Circuits", detail: "Charging/discharging curves through resistors." },
        { label: "555 Timer Configurations", detail: "" },
        { label: "Monostable mode", detail: "Time delay T = 1.1 × R × C" },
        { label: "Astable mode", detail: "Frequency f = 1.44 / [(R1 + 2R2) × C]" },
        { label: "Mark-space ratio", detail: "T_on / T_off = (R1 + R2) / R2" },
        { label: "Sequential Logic", detail: "D-type flip-flops, 1-bit/2-bit up-counters, BCD counters, and decade counters." },
        { label: "Timing Diagrams", detail: "Clock pulses and state transitions." },
      ],
    },
    {
      unit: "Interfacing, Amplifiers & Microcontrollers",
      elements: [
        { label: "Interfacing", detail: "Schmitt inverters for switch debouncing and analogue interfacing." },
        { label: "Operational Amplifiers (Op-Amps)", detail: "" },
        { label: "Voltage gain", detail: "Gain = V_out / V_in and bandwidth trade-off" },
        { label: "Non-inverting amplifier", detail: "Gain = 1 + (Rf / R1)" },
        { label: "Inverting amplifier", detail: "Gain = - (Rf / Rin)" },
        { label: "Summing amplifier", detail: "V_out = - Rf × [(V1 / R1) + (V2 / R2) + ...]" },
        { label: "Output clipping distortion limits", detail: "" },
        { label: "Microcontrollers", detail: "Flowcharts, programming logic, and hardware interfacing." },
        { label: "Practical Test Equipment", detail: "Multimeters, logic probes, and oscilloscopes." },
      ],
    },
  ],
  "Engineering": [
    {
      unit: "Engineering Materials & Properties",
      elements: [
        { label: "Material Classifications", detail: "Ferrous/non-ferrous metals, polymers, composites, timbers, and ceramics." },
        { label: "Mechanical & Physical Properties", detail: "Strength, hardness, toughness, malleability, ductility, brittleness, and stiffness." },
        { label: "Modifying Properties", detail: "Heat treatments (quenching, tempering, annealing), alloying, and cold working." },
        { label: "Commercial Factors", detail: "Raw material costs, supply chains, stock forms, planned obsolescence, and recycling." },
      ],
    },
    {
      unit: "Manufacturing Processes",
      elements: [
        { label: "Material Removal", detail: "Turning, milling, drilling, sawing, and chemical etching." },
        { label: "Forming & Shaping", detail: "Bending, folding, press forming, stamping, punching, and composite layup." },
        { label: "Casting & Moulding", detail: "Sand casting, pressure die-casting, and injection moulding." },
        { label: "Additive Manufacturing", detail: "3D printing (FDM) and selective metal sintering." },
        { label: "Joining & Finishing", detail: "Fasteners, rivets, welding, brazing, soldering; galvanising, electroplating, and painting." },
      ],
    },
    {
      unit: "Systems & Control",
      elements: [
        { label: "Mechanical Systems", detail: "Linkages, gear trains, pulley systems, and cams." },
        { label: "Structural Systems", detail: "Imposed, live, and dead loads; monocoque structures, space frames, and torsion." },
        { label: "Pneumatic & Hydraulic Systems", detail: "Compressed air vs. fluid circuits and industrial valves." },
        { label: "Electrical & Programmable Systems", detail: "Microcontroller inputs, processes, and outputs; flowcharts." },
        { label: "Aerodynamics", detail: "Principles of lift, drag, and thrust." },
      ],
    },
    {
      unit: "Testing, Investigation & Engineering Calculations",
      elements: [
        { label: "Testing Methods", detail: "Destructive vs. non-destructive testing (NDT)." },
        { label: "Engineering Formulae", detail: "" },
        { label: "Density", detail: "Density = Mass / Volume" },
        { label: "Stress", detail: "Stress = Force / Area" },
        { label: "Strain", detail: "Strain = Change in length / Original length" },
        { label: "Young's Modulus = Stress / Strain", detail: "" },
        { label: "Pressure = Force / Area", detail: "" },
        { label: "Factor of Safety (FoS) = Material Strength / Working Stress", detail: "" },
        { label: "Ohm's Law", detail: "V = I × R" },
        { label: "Quality Control & Precision", detail: "Tolerances, micrometers, Vernier calipers, and depth gauges." },
        { label: "Technical Drawing Conventions", detail: "Orthographic projection (3rd angle), isometric views, and section views." },
      ],
    },
  ],
  "English Language": [
    {
      unit: "Critical Reading & Comprehension (50% Weighting)",
      elements: [
        { label: "Explicit & Implicit Meanings (AO1)", detail: "Identifying facts, interpreting inferred meanings, and synthesising information from across single or multiple unseen texts (19th, 20th, and 21st centuries)." },
        { label: "Language Analysis (AO2)", detail: "Analysing writers' choices of vocabulary, grammatical structures, and literary/rhetorical devices using precise subject terminology." },
        { label: "Structural Analysis (AO2)", detail: "Evaluating narrative perspectives, sentence pacing, focus shifts, chronological developments, and structural cohesion." },
        { label: "Comparative Analysis (AO3)", detail: "Comparing perspectives, ideas, and thematic conveyance across two contrasting texts." },
        { label: "Critical Evaluation (AO4)", detail: "Formulating evaluative judgements on a text's effectiveness and impact, supported by embedded textual evidence." },
      ],
    },
    {
      unit: "Writing (50% Weighting)",
      elements: [
        { label: "Audience, Purpose & Register (AO5)", detail: "Adapting tone and form for transactional tasks (letters, articles, speeches, essays) and creative tasks (descriptive or narrative writing)." },
        { label: "Structural Organization (AO5)", detail: "Crafting paragraphs, cohesive discourse markers, transitions, and structural progression across an entire text." },
        { label: "Technical Accuracy (AO6 - 20% of qualification)", detail: "Using accurate punctuation (colons, semi-colons, dashes, brackets), varied sentence structures, spelling, and standard English vocabulary." },
      ],
    },
    {
      unit: "Spoken Language Endorsement (Unweighted / Graded Separately)",
      elements: [
        { label: "Presentation & Delivery (AO7/AO9)", detail: "Delivering a formal spoken presentation using Standard English and persuasive rhetoric." },
        { label: "Listening & Discussion (AO8)", detail: "Responding appropriately to questions, feedback, and challenges from an audience." },
      ],
    },
  ],
  "Film Studies": [
    {
      unit: "Film Form & Aesthetics",
      elements: [
        { label: "Cinematography", detail: "Camera shots, angles, movement (pan, tilt, tracking, steadicam), framing, and lighting key/ratios." },
        { label: "Mise-en-Scene", detail: "Settings, props, costume, hair/make-up, and staging/acting choices." },
        { label: "Editing", detail: "Cuts, fades, dissolves, cross-cutting, pace, and continuity editing (180-degree rule, shot-reverse shot)." },
        { label: "Sound", detail: "Diegetic vs. non-diegetic sound, soundtrack motifs, ambient sound, sound mixing, and Foley effects." },
        { label: "Aesthetics", detail: "Visual style, colour palette, and non-narrative artistic choices." },
      ],
    },
    {
      unit: "Narrative & Genre",
      elements: [
        { label: "Narrative Structure", detail: "Story vs. plot, three-act structure, plot points, inciting incidents, climaxes, and narrative ellipsis." },
        { label: "Genre Analysis", detail: "Genre conventions, iconography, stock characters, thematic tropes, and audience expectations." },
        { label: "Representation", detail: "Depiction of gender, ethnicity, age, and culture in set films." },
      ],
    },
    {
      unit: "Contexts & Film History",
      elements: [
        { label: "Historical & Technological Contexts", detail: "Silent cinema, the Hollywood studio system, sound, colour, widescreen, 3D, and CGI." },
        { label: "Institutional Contexts", detail: "Studio production vs. independent cinema, film budgeting, funding sources, and distribution." },
        { label: "Social & Political Contexts", detail: "How the 6 studied films reflect the time and culture in which they were produced." },
        { label: "Critical Writing", detail: "Analysing film reviews and specialist criticism written about your set films." },
      ],
    },
    {
      unit: "Set Films & Practical Screenwriting/Production",
      elements: [
        { label: "Set Films Comparative Study", detail: "Deep comparison between your two selected focus films (narrative, contexts, aesthetic choices)." },
        { label: "Remaining Set Films", detail: "Analysis of the other 4 set films covering US mainstream, US indie, British, and global cinema." },
        { label: "Practical Production / Screenplay (NEA)", detail: "Written screenplay with shooting script (or 80+ second film extract) following genre conventions, accompanied by an evaluative analysis." },
      ],
    },
  ],
  "Food Preparation and Nutrition": [
    {
      unit: "Nutrition & Health",
      elements: [
        { label: "Dietary Guidelines & Energy", detail: "Healthy eating guidelines, BMR (Basal Metabolic Rate), PAL (Physical Activity Level), and life-stage nutrition." },
        { label: "Macronutrients & Micronutrients", detail: "Sources, functions, excess, and deficiency of carbohydrates, proteins, fats, vitamins, and minerals." },
        { label: "Diet-Related Health Conditions", detail: "Obesity, cardiovascular disease, type 2 diabetes, osteoporosis, anaemia, and dental caries." },
      ],
    },
    {
      unit: "Food Science & Chemical Working Characteristics",
      elements: [
        { label: "Carbohydrates", detail: "Starch gelatinisation and dextrinisation." },
        { label: "Fats & Oils", detail: "Shortening, aeration, plasticity, and emulsification." },
        { label: "Proteins", detail: "Denaturation, coagulation, gluten formation, foam formation, and marinades." },
        { label: "Fruit & Vegetables", detail: "Enzymic browning and oxidation." },
        { label: "Raising Agents", detail: "Mechanical (whisking egg whites), chemical (baking powder), and biological (yeast fermentation)." },
        { label: "Heat Transfer", detail: "Conduction, convection, radiation, and selection of appropriate cooking methods." },
      ],
    },
    {
      unit: "Food Safety & Spoilage",
      elements: [
        { label: "Bacterial Growth & Spoilage", detail: "Optimum growth conditions, high-risk foods, and cross-contamination." },
        { label: "Food Storage & Hygiene", detail: "Fridge/freezer temperature zones, danger zone (5°C - 63°C), core cooking temperatures (75°C), use-by vs. best-before dates." },
      ],
    },
    {
      unit: "Food Provenance, Choice & Practical Techniques",
      elements: [
        { label: "Provenance & Sustainability", detail: "Food miles, carbon footprint, intensive vs. organic farming, and food security." },
        { label: "Factors Influencing Choice", detail: "Cost, religion, culture, ethics (veganism, vegetarianism), medical needs, and sensory testing panels." },
        { label: "Culinary Traditions", detail: "Features, ingredients, and cooking styles of British cuisine and 2 international cuisines." },
        { label: "Culinary Execution (NEA Practical Skills)", detail: "Knife skills, sauce making (roux, veloute, reductions, emulsions), and dough making (kneading, proving, shaping)." },
      ],
    },
  ],
  "Geography": [
    {
      unit: "Physical Geography: Processes and Change",
      elements: [
        { label: "Geomorphic Landscapes (2 UK Landscapes)", detail: "River and coastal processes (weathering, erosion, transportation, deposition), and landform development." },
        { label: "Weather Hazards & Climate Change", detail: "Global atmospheric circulation, tropical storms, UK extreme weather events, and Quaternary climate change (natural vs. human causes)." },
      ],
    },
    {
      unit: "People & Environment: Interactions",
      elements: [
        { label: "Global Ecosystems", detail: "Biome distribution, nutrient cycles, and biodiversity threats across 2 selected ecosystems (e.g., tropical rainforests, cold environments, deserts)." },
        { label: "Resource Management", detail: "Supply, demand, and security issues across food, energy, or water (with 1 selected for detailed study)." },
      ],
    },
    {
      unit: "Human Geography: Processes and Change",
      elements: [
        { label: "Urban Issues & Challenges", detail: "Urbanisation trends, challenges and opportunities in 1 major city in an advanced economy and 1 major city in an emerging/developing economy." },
        { label: "Global Economic Development", detail: "Causes/consequences of uneven global development, development indicators, trade, foreign aid, and TNC investment in a chosen LIC/NEE." },
        { label: "Geography of the UK", detail: "UK economic transitions, regional disparities, population distribution, and geopolitical links." },
      ],
    },
    {
      unit: "Fieldwork, Cartography & Data Skills",
      elements: [
        { label: "Fieldwork Enquiries", detail: "Methodologies, data collection, sampling, analysis, and critical evaluation across 2 contrasting environments (physical and human)." },
        { label: "Cartographic & Statistical Skills", detail: "OS map grid references, scale, contours, cross-sections, choropleth maps, GIS layers, dispersion graphs, and measures of spread." },
      ],
    },
  ],
  "Geology": [
    {
      unit: "Minerals & The Rock Cycle",
      elements: [
        { label: "Mineralogy", detail: "Physical testing (Mohs hardness, streak, cleavage, lustre, density, acid reaction) and scanning electron microscopy/microprobes." },
        { label: "Uses of Minerals", detail: "Specific uses of at least 3 minerals (construction, industry, energy generation)." },
        { label: "The Rock Cycle", detail: "Catastrophism vs. gradualism, weathering, erosion, and energy transfers." },
      ],
    },
    {
      unit: "Igneous, Sedimentary & Metamorphic Petrology",
      elements: [
        { label: "Igneous Rocks", detail: "Silicic, intermediate, mafic, and ultramafic rocks; cooling rates vs. crystal size; magma viscosity and eruption styles." },
        { label: "Igneous Structures", detail: "Sills, dykes, plutons, lava flows, columnar jointing, and pillow structures." },
        { label: "Sedimentary Rocks", detail: "Clastic, chemical, and organic rocks; grain shape, size, sorting, porosity, and permeability." },
        { label: "Sedimentary Structures", detail: "Lamination, cross-bedding, graded bedding, ripple marks, and desiccation cracks." },
        { label: "Metamorphic Rocks", detail: "Regional vs. contact metamorphism; metamorphic aureoles, recrystallisation, slaty cleavage, and schistosity." },
      ],
    },
    {
      unit: "Structural Geology & Geochronology",
      elements: [
        { label: "Rock Deformation", detail: "Strike and dip measurements (compass clinometer), fold anatomy (antiform, synform, axial planes)." },
        { label: "Faults & Unconformities", detail: "Normal, reverse, thrust, and strike-slip faults; unconformities as breaks in the rock record." },
        { label: "Stratigraphic Principles", detail: "Superposition, original horizontality, lateral continuity, cross-cutting relationships, and included fragments." },
        { label: "Dating & Deep Time", detail: "Radiometric dating, half-lives, and historical views of deep time (Hutton, Kelvin, Holmes)." },
      ],
    },
    {
      unit: "Fossils, Evolution & Earth History",
      elements: [
        { label: "Palaeontology", detail: "Morphology of 3 fossil groups (including corals and plants); trace fossils and the incomplete fossil record." },
        { label: "Key Evolutionary Milestones", detail: "Origin of life (~3500 Ma, hydrothermal vents), Burgess Shale, Archaeopteryx, and early hominids ('Lucy')." },
        { label: "Mass Extinctions", detail: "The Cretaceous-Palaeogene (K-T) boundary event and cladograms." },
        { label: "Past Climates", detail: "Icehouse vs. greenhouse climates, sedimentary evidence (tillites, limestone), and carbon sequestration." },
      ],
    },
    {
      unit: "Plate Tectonics & Planetary Geology",
      elements: [
        { label: "Earth Structure", detail: "Crust, mantle, core, lithosphere, and asthenosphere." },
        { label: "Plate Boundaries", detail: "Divergent, convergent, and transform margins (associated seismicity, volcanism, and landforms)." },
        { label: "Planetary Geology", detail: "Comparing Earth to Mars/Moon; meteorites as analogues for Earth's interior." },
      ],
    },
    {
      unit: "Geological Resources, Hazards & Field Skills",
      elements: [
        { label: "Resources & Engineering", detail: "Porosity/permeability of aquifers and oil/gas traps (anticlines, fault traps, unconformities, salt domes); engineering hazards (dams, tunnels, waste disposal)." },
        { label: "Hazards & Mitigation", detail: "Earthquakes, volcanoes, landslides, tsunamis, and prediction tools (e.g., COSPEC)." },
        { label: "Fieldwork & Map Skills", detail: "Graphic logs, strike/dip mapping, field sketches, and completing at least 2 days of field enquiry." },
      ],
    },
  ],
  "History": [
    {
      unit: "Thematic Study (Across Medieval, Early Modern, and Modern Eras)",
      elements: [
        { label: "Long-Term Chronology", detail: "Tracking change and continuity over at least 500–1000 years within a single theme (e.g., Crime & Punishment, Medicine Through Time, Migration, or Power & People)." },
        { label: "Factors Driving Change", detail: "Evaluating the role of religion, government/war, science/technology, economics, and individual figures across centuries." },
      ],
    },
    {
      unit: "Period Study (Medium Time Span - Min. 50 Years)",
      elements: [
        { label: "Historical Narrative", detail: "Cause, course, and consequence of substantial political, social, or military shifts (e.g., Superpower Relations/Cold War, Germany 1890–1945, American West)." },
        { label: "Historical Terminology", detail: "Understanding concepts of empire, communism, fascism, imperialism, or international relations in context." },
      ],
    },
    {
      unit: "Depth Studies (British & Wider World)",
      elements: [
        { label: "British Depth Study", detail: "Detailed political, religious, social, and economic tensions during a specific crisis era (e.g., Elizabethan England, Norman Conquest, Anglo-Saxons)." },
        { label: "Wider World Depth Study", detail: "In-depth inquiry into a complex international conflict or state transformation (e.g., Conflict in the Middle East, America 1920–1973, Conflict in Asia)." },
        { label: "The Historic Environment", detail: "Detailed investigation of a specific historical site, analyzing its design, contemporary function, and link to national events." },
      ],
    },
    {
      unit: "Historical Methods & Source Skills",
      elements: [
        { label: "Primary Source Utility", detail: "Analyzing contemporary sources for content, provenance, nature, origin, and purpose." },
        { label: "Historical Interpretations", detail: "Explaining why and how subsequent historians construct differing interpretations of events and personalities." },
      ],
    },
  ],
  "Mathematics": [
    {
      unit: "Number",
      elements: [
        { label: "Calculations & Operations", detail: "Four operations with integers, decimals, fractions, and mixed numbers; order of operations (BIDMAS/BODMAS) and inverse operations." },
        { label: "Number Properties", detail: "Factors, multiples, primes, prime factorisation, HCF, and LCM." },
        { label: "Listing & Counting", detail: "Systematic listing strategies and the product rule for counting." },
        { label: "Powers & Indices", detail: "Positive integer powers, roots, estimating powers/roots, and laws of indices." },
        { label: "Fractional/Negative Indices & Surds", detail: "Calculate with fractional indices, simplify surds, and rationalise denominators [Higher Tier Only]." },
        { label: "Standard Form", detail: "Calculating with and converting to/from A × 10^n." },
        { label: "Fractions, Decimals & Percentages (FDP)", detail: "Converting terminating and recurring decimals to/from fractions; fractions and percentages as operators." },
        { label: "Rounding & Limits of Accuracy", detail: "Significant figures, decimal places, error intervals due to rounding/truncation, and upper/lower bounds [Higher Tier Only]." },
      ],
    },
    {
      unit: "Algebra",
      elements: [
        { label: "Notation & Manipulation", detail: "Expanding brackets, factorising common factors, simplifying expressions, and algebraic substitution." },
        { label: "Quadratics", detail: "Factorising x^2 + bx + c and ax^2 + bx + c [Higher Tier Only]." },
        { label: "Algebraic Fractions & Surd Manipulation", detail: "Simplifying complex algebraic expressions [Higher Tier Only]." },
        { label: "Rearranging Formulae & Proof", detail: "Changing the subject of a formula; showing equivalence and writing formal algebraic proofs." },
        { label: "Functions", detail: "Composite and inverse functions [Higher Tier Only]." },
        { label: "Solving Equations", detail: "Linear equations with unknowns on both sides, quadratic equations (factorising, quadratic formula, completing the square), and numerical iteration [Higher Tier Only]." },
        { label: "Simultaneous Equations", detail: "Linear/linear systems, and linear/quadratic systems [Higher Tier Only]." },
        { label: "Inequalities", detail: "Solving linear inequalities, quadratic inequalities [Higher Tier Only], and representing solutions on number lines or graphs." },
        { label: "Linear Graphs", detail: "Plotting lines, using y = mx + c, finding midpoints/gradients, and working with parallel/perpendicular lines." },
        { label: "Non-Linear Graphs", detail: "Sketching/interpreting quadratics, cubics, reciprocals (y = 1/x), and exponential graphs (y = k^x)." },
        { label: "Trigonometric Graphs & Transformations", detail: "Graphs of sin(x), cos(x), tan(x), and sketch function translations/reflections f(x) [Higher Tier Only]." },
        { label: "Circle Equations & Tangents", detail: "Equation of a circle (x^2 + y^2 = r^2) and equation of a tangent [Higher Tier Only]." },
        { label: "Gradients & Areas Under Curves", detail: "Distance-time/velocity-time graphs, estimating instantaneous rates of change, and area under graphs [Higher Tier Only]." },
        { label: "Sequences", detail: "Arithmetic/linear sequences (finding the nth term), Fibonacci, geometric progressions, and quadratic sequences (nth term) [Higher Tier Only]." },
      ],
    },
    {
      unit: "Ratio, Proportion & Rates of Change",
      elements: [
        { label: "Units & Conversions", detail: "Converting standard and compound units (speed, density, pressure, rates of pay)." },
        { label: "Scale Diagrams & Bearings", detail: "Map scales and scale drawings." },
        { label: "Ratios", detail: "Simplifying ratios, sharing in a given ratio, and connecting ratios to fractions." },
        { label: "Percentages", detail: "Percentage increase/decrease, reverse percentages (original value), and simple interest." },
        { label: "Growth & Decay", detail: "Compound interest and general exponential decay/growth problems." },
        { label: "Direct & Inverse Proportion", detail: "Solving algebraic proportion problems (y proportional to x, y proportional to 1/x) and graphical representations." },
        { label: "Rates of Change", detail: "Interpreting straight-line and curve gradients as average or instantaneous rates of change [Higher Tier Only]." },
      ],
    },
    {
      unit: "Geometry & Measures",
      elements: [
        { label: "Angles & Polygons", detail: "Angle facts (parallel lines, straight lines, vertically opposite) and interior/exterior angles of polygons." },
        { label: "Ruler & Compass Constructions", detail: "Perpendicular bisectors, angle bisectors, loci, and plans/elevations of 3D shapes." },
        { label: "Transformations", detail: "Reflection, rotation, translation (using 2D column vectors), and enlargements (including fractional and negative scale factors)." },
        { label: "Congruence & Similarity", detail: "SSS, SAS, ASA, RHS proofs; length, area, and volume scale factors in similar figures [Higher Tier Only]." },
        { label: "2D & 3D Shapes (Mensuration)", detail: "Area/perimeter of trapezia, parallelograms, circles, and compound shapes; surface area and volume of prisms, cylinders, pyramids, cones, and spheres." },
        { label: "Circle Geometry", detail: "Arc length, sector area, and Circle Theorems [Higher Tier Only]." },
        { label: "Right-Angled Trigonometry & Pythagoras", detail: "Pythagoras' theorem, sin/cos/tan ratios, and exact trigonometric values (0°, 30°, 45°, 60°, 90°)." },
        { label: "Advanced Trigonometry", detail: "Sine rule, cosine rule, and Area = 0.5 × a × b × sin(C) for non-right-angled/3D triangles [Higher Tier Only]." },
        { label: "Vector Geometry", detail: "Vector arithmetic, column vectors, and geometric vector proofs [Higher Tier Only]." },
      ],
    },
    {
      unit: "Probability",
      elements: [
        { label: "Basic Probability & Expected Outcomes", detail: "Probability scale (0 to 1), mutually exclusive and exhaustive events, and calculating expected frequency." },
        { label: "Sample Spaces & Representations", detail: "Two-way tables, sample space grids, frequency trees, and Venn diagrams." },
        { label: "Combined Events", detail: "Independent and dependent events using tree diagrams (with and without replacement)." },
        { label: "Conditional Probability", detail: "Calculating conditional probabilities from Venn diagrams, two-way tables, and tree diagrams [Higher Tier Only]." },
      ],
    },
    {
      unit: "Statistics",
      elements: [
        { label: "Sampling & Data Representation", detail: "Populations, sample bias, bar charts, pie charts, pictograms, vertical line charts, and time series." },
        { label: "Averages & Spread", detail: "Mean, median, mode, modal class, range, and identifying outliers." },
        { label: "Bivariate Data", detail: "Scatter graphs, lines of best fit, interpolation, extrapolation, and correlation vs. causation." },
        { label: "Cumulative Frequency & Box Plots", detail: "Cumulative frequency curves, medians, quartiles, and interquartile range (IQR) [Higher Tier Only]." },
        { label: "Histograms", detail: "Drawing and interpreting histograms with unequal class widths (frequency density) [Higher Tier Only]." },
      ],
    },
  ],
  "Media Studies": [
    {
      unit: "Media Language",
      elements: [
        { label: "Visual Codes & Semiotics", detail: "Denotation and connotation, mise-en-scene, and semiotic analysis." },
        { label: "Genre Theory", detail: "Codes and conventions, Steve Neale's theory of repetition and variation, and sub-genres/hybridity." },
        { label: "Narrative Analysis", detail: "Vladimir Propp's character types, Todorov's narrative structure, and narrative techniques (cliffhangers, ellipsis)." },
        { label: "Technological Influence", detail: "Digital convergence, production software, and evolving cross-media techniques." },
      ],
    },
    {
      unit: "Media Representations",
      elements: [
        { label: "Construction & Mediation", detail: "How media products re-present reality through selection, filtering, and framing." },
        { label: "Social Groups & Stereotypes", detail: "Representation of gender, age, ethnicity, sexuality, and national identity; reasons for under- or mis-representation." },
        { label: "Theories of Representation", detail: "Feminist perspectives on gender roles, male gaze, and tokenism." },
        { label: "Contexts", detail: "Analysing how representations reflect historical, social, and political contexts at the time of production." },
      ],
    },
    {
      unit: "Media Industries",
      elements: [
        { label: "Ownership & Models", detail: "Conglomerates, independent producers, public service broadcasting (e.g., BBC) vs. commercial models." },
        { label: "Industry Strategies", detail: "Horizontal and vertical integration, diversification, and media synergy." },
        { label: "Regulation", detail: "The role of regulators (e.g., ASA, Ofcom, BBFC) and challenges posed by online/digital platforms." },
        { label: "Distribution & Production", detail: "Digital distribution, global streaming platforms, and marketing campaigns." },
      ],
    },
    {
      unit: "Media Audiences",
      elements: [
        { label: "Audience Categorisation", detail: "Demographics, psychographics, and niche vs. mainstream audiences." },
        { label: "Audience Theories", detail: "Active vs. passive models, Blumler & Katz's Uses and Gratifications theory, and reception/interpretation." },
        { label: "Interactivity & Prosumers", detail: "How audiences interact, create user-generated content, and participate on digital platforms." },
      ],
    },
    {
      unit: "Media Forms & Coursework",
      elements: [
        { label: "Core Forms Studied", detail: "Television, film (industry/cross-media context), radio, newspapers, magazines, advertising/marketing, social/participatory media, video games, and music videos." },
        { label: "In-Depth Study Forms", detail: "The set products for your 1 audio/visual, 1 print, and 1 online media form." },
        { label: "Individual Media Production (NEA)", detail: "Planning, constructing, and evaluating your set brief using media language and representation." },
      ],
    },
  ],
  "Modern Foreign Languages (MFL)": [
    {
      unit: "Core Themes & Vocabulary",
      elements: [
        { label: "Theme 1 (Identity & Culture)", detail: "Family, relationships, technology in everyday life, free-time activities, customs, and festivals." },
        { label: "Theme 2 (Local, National & Global Areas of Interest)", detail: "Home and local area, social problems, charity work, healthy living, environment, and travel/tourism." },
        { label: "Theme 3 (Current & Future Study/Employment)", detail: "School life, higher education, career choices, jobs, and future ambitions." },
      ],
    },
    {
      unit: "Tiered Grammar Focus",
      elements: [
        { label: "Foundational Grammar (All Tiers)", detail: "Noun genders, adjectival agreements, high-frequency regular/irregular present tense, immediate future, and simple past/preterite/perfect tenses." },
        { label: "Higher Tier Grammar Extensions", detail: "" },
        { label: "French", detail: "Full conditional, imperfect, pluperfect, future tense, passive voice, subjunctive expressions, and direct/indirect object pronoun order." },
        { label: "German", detail: "Four-case declensions, weak nouns, reflexive dative, modal imperfect subjunctives, genitive prepositions, and complex subordinating word order." },
        { label: "Spanish", detail: "Present subjunctive (triggers for doubt, command, wishing), imperfect continuous, pluperfect, conditional, and passive constructions." },
      ],
    },
    {
      unit: "Examination Skill Practice",
      elements: [
        { label: "Listening", detail: "Extracting details, identifying nuances/opinions, and recognizing spoken time frames." },
        { label: "Speaking", detail: "Role-play responses, picture description, and sustained general conversation with spontaneous reactions." },
        { label: "Reading", detail: "Skimming, scanning, inferring meaning from authentic extracts, and translating into English." },
        { label: "Writing", detail: "Structured short responses, extended opinion essays across 3 time frames, and translating English sentences into the target language." },
      ],
    },
  ],
  "Music": [
    {
      unit: "Musical Elements & Language",
      elements: [
        { label: "Melody & Harmony", detail: "Melodic devices (sequence, imitation), cadences (perfect, imperfect, plagal, interrupted), and chord notation." },
        { label: "Tonality & Structure", detail: "Major, minor, tonal modulation (to dominant or relative major/minor); binary (AB), ternary (ABA), rondo, and verse-chorus forms." },
        { label: "Sonority & Texture", detail: "Vocal and instrumental timbres, playing techniques (arco, pizzicato, tremolo); monophonic, homophonic, polyphonic, and contrapuntal textures." },
        { label: "Rhythm, Metre & Dynamics", detail: "Pulse, simple vs. compound time signatures, syncopation, triplets, and dynamic changes." },
        { label: "Notation Reading", detail: "Treble and bass clef notes, key signatures up to 4 sharps/flats, and rhythmic score reading." },
      ],
    },
    {
      unit: "Areas of Study & Contexts",
      elements: [
        { label: "Western Classical Tradition (1650–1910)", detail: "Set works or stylistic features from Baroque, Classical, or Romantic eras." },
        { label: "Non-Western / Contemporary Traditions", detail: "World music styles, popular music, film/theatre music, or modern classical developments." },
        { label: "Aural Perception & Appraisal", detail: "Critical listening to identify stylistic traits and elements in unfamiliar audio tracks." },
      ],
    },
    {
      unit: "Performance & Composition Coursework (NEA)",
      elements: [
        { label: "Solo & Ensemble Performance", detail: "Technical accuracy, interpretation, and expression on your chosen instrument/voice." },
        { label: "Composition 1 & 2", detail: "Developing musical ideas, harmonisation, and arranging for a free brief and an exam board commission." },
      ],
    },
  ],
  "Physical Education (Full Course)": [
    {
      unit: "Theoretical Knowledge & Body Systems",
      elements: [
        { label: "Applied Anatomy & Physiology", detail: "Bones, joint types, muscular pairs, cardiac cycle, respiratory volumes, aerobic vs. anaerobic systems, and exercise effects." },
        { label: "Movement Analysis", detail: "First, second, and third class levers, mechanical advantage, planes (sagittal, frontal, transverse) and axes (sagittal, frontal, vertical)." },
        { label: "Physical Training", detail: "Components of fitness, principles of training (SPORT/FITT), training methods (continuous, HIIT, fartlek, plyometrics), injury prevention, and periodisation." },
      ],
    },
    {
      unit: "Sport Psychology & Socio-Cultural Influences",
      elements: [
        { label: "Sport Psychology", detail: "Skill classifications (open/closed, basic/complex), SMART goal setting, types of guidance (visual, verbal, manual, mechanical), and feedback types." },
        { label: "Mental Preparation", detail: "Arousal control (inverted-U theory), stress management techniques, mental rehearsal, and imagery." },
        { label: "Socio-Cultural Influences", detail: "Participation factors (gender, race, age, disability), commercialisation and media impact, sponsorship, and ethical issues (doping, deviance, sportsmanship)." },
      ],
    },
    {
      unit: "Health, Wellbeing & Assessment",
      elements: [
        { label: "Health & Nutrition", detail: "Physical, mental, and social health; consequences of sedentary living; balanced nutrition and hydration balance." },
        { label: "Data Interpretation", detail: "Analysing sporting tables, heart rate charts, spirometer traces, and fitness component graphs." },
        { label: "Practical Performance", detail: "Core practical assessments in 3 distinct sporting activities (1 team, 1 individual, 1 either)." },
      ],
    },
  ],
  "Physical Education (Short Course)": [
    {
      unit: "Applied Anatomy and Physiology",
      elements: [
        { label: "The Musculo-Skeletal System", detail: "Major bones, synovial joint structures, and muscle pairs (agonists, antagonists, fixators)." },
        { label: "The Cardio-Respiratory System", detail: "Structure and pathway of blood through the heart, blood vessels, alveoli, and mechanics of breathing (inspiration and expiration)." },
        { label: "Aerobic and Anaerobic Exercise", detail: "Energy pathways, equations for aerobic vs. anaerobic respiration, and lactic acid accumulation." },
        { label: "Effects of Exercise", detail: "Short-term responses (heart rate, stroke volume, breathing rate, body temperature) and long-term adaptations (hypertrophy, bradycardia, increased vital capacity)." },
      ],
    },
    {
      unit: "Movement Analysis",
      elements: [
        { label: "Lever Systems", detail: "1st, 2nd, and 3rd class levers (fulcrum, load, effort positions)." },
        { label: "Mechanical Advantage", detail: "Calculating and explaining mechanical advantage and range of motion in sporting movements." },
        { label: "Planes and Axes", detail: "Movement along the sagittal, frontal, and transverse planes around the frontal, sagittal, and vertical axes." },
      ],
    },
    {
      unit: "Health, Fitness and Wellbeing",
      elements: [
        { label: "Health & Fitness Dimensions", detail: "Physical, emotional, and social health; consequences of a sedentary lifestyle (obesity, CHD, type 2 diabetes)." },
        { label: "Diet & Nutrition", detail: "Balanced diet components (carbohydrates, fats, proteins, vitamins, minerals, water, fibre) and energy balance equations." },
        { label: "Hydration", detail: "Effects of dehydration on performance and thermoregulation." },
      ],
    },
    {
      unit: "Data Analysis & Practical Requirements",
      elements: [
        { label: "Use of Data", detail: "Interpreting fitness/physiological tables, pie charts, bar charts, and line graphs." },
        { label: "Practical Performance", detail: "Assessment evidence and tactical understanding for 1 individual sport and 1 team sport." },
      ],
    },
  ],
  "Psychology": [
    {
      unit: "Compulsory Topic: Development",
      elements: [
        { label: "Brain & Early Development", detail: "Stages of development and early brain growth." },
        { label: "Piaget's Theory of Cognitive Development", detail: "Assimilation, accommodation, and the four stages (sensorimotor, pre-operational, concrete operational, formal operational)." },
        { label: "Learning Theories", detail: "Dweck's mindset theory (fixed vs. growth) and Willingham's learning theory (critique of learning styles, importance of practice/meaning)." },
        { label: "Required Studies", detail: "Two core development studies specified by your exam board." },
      ],
    },
    {
      unit: "Compulsory Topic: Memory",
      elements: [
        { label: "Models of Memory", detail: "Atkinson and Shiffrin's Multi-Store Model (sensory register, STM, LTM; duration, capacity, encoding)." },
        { label: "Reconstructive Memory", detail: "Bartlett's theory of reconstructive memory and schemas." },
        { label: "Memory Processing", detail: "Types of LTM (episodic, semantic, procedural), encoding, storage, and retrieval." },
        { label: "Required Studies", detail: "Two core memory studies specified by your exam board." },
      ],
    },
    {
      unit: "Compulsory Topic: Psychological Problems",
      elements: [
        { label: "Introduction to Mental Health", detail: "Changing prevalence of mental health over time and the social/individual impact of mental health issues." },
        { label: "Disorders (Revise the 2 selected by your school)", detail: "Clinical depression, schizophrenia, addiction, or autism spectrum disorder (ASD)." },
        { label: "Disorder Breakdown", detail: "ICD diagnostic characteristics, one biological explanation, one psychological explanation, and associated interventions/therapies for each." },
        { label: "Required Studies", detail: "Two core studies on mental health specified by your exam board." },
      ],
    },
    {
      unit: "Compulsory Topic: Social Influence",
      elements: [
        { label: "Conformity & Crowd Behaviour", detail: "Majority influence, informational and normative social influence, collective crowd behaviour, and pro-social vs. anti-social actions." },
        { label: "Obedience", detail: "Milgram's concepts, authority figures, situational factors, and dispositional factors affecting obedience." },
        { label: "Required Studies", detail: "Two core social influence studies specified by your exam board." },
      ],
    },
    {
      unit: "Compulsory Topic: The Brain and Neuropsychology",
      elements: [
        { label: "Nervous System & Neurons", detail: "Structure and function of neurons, neurotransmitters, and synaptic transmission." },
        { label: "Brain Structure", detail: "Hemispheres, lobes (frontal, temporal, parietal, occipital), cerebellum, and lateralisation." },
        { label: "Neuropsychology", detail: "Localisation of function, cognitive links, and the behavioural impacts of neurological damage." },
        { label: "Required Studies", detail: "Two core neuropsychology studies specified by your exam board." },
      ],
    },
    {
      unit: "Optional Topics (Revise the 2 chosen by your school)",
      elements: [
        { label: "Criminal Psychology", detail: "Social learning theory of criminality, Eysenck's personality theory, prison effects, and rehabilitation." },
        { label: "Language, Thought & Communication", detail: "Piaget's view of thought/language, animal vs. human communication, and non-verbal communication (evolutionary theory)." },
        { label: "Perception", detail: "Gibson's direct theory vs. Gregory's constructivist theory; depth cues, visual illusions, and perceptual set (emotion, culture, motivation, expectation)." },
        { label: "Sleep and Dreaming", detail: "Functions of sleep, sleep disorders, Freud's psychoanalytic dream theory, and activation-synthesis theory." },
        { label: "The Self", detail: "Humanistic theory of self-concept/self-esteem, trait theory of personality, free will, and personality measurement." },
      ],
    },
    {
      unit: "Research Methods & Core Debates",
      elements: [
        { label: "Hypotheses & Variables", detail: "Directional, non-directional, and null hypotheses; IV, DV, and controlling extraneous variables." },
        { label: "Methodologies", detail: "Laboratory, field, natural experiments; observations, interviews, questionnaires, correlations, and case studies." },
        { label: "Experimental Designs", detail: "Independent groups, repeated measures, and matched pairs." },
        { label: "Sampling & Ethics", detail: "Target populations, random/opportunity/stratified sampling; BPS ethical guidelines (consent, deception, debrief, right to withdraw)." },
        { label: "Data Handling & Debates", detail: "Central tendency (mean, median, mode), range, normal distribution curves, reductionism vs. holism, and nature vs. nurture." },
      ],
    },
  ],
  "Religious Studies": [
    {
      unit: "Part One: Study of Religions (2 Religions Chosen)",
      elements: [
        { label: "Beliefs & Teachings (Religion 1)", detail: "Nature of God/Ultimate reality, creation, human destiny, problem of evil, and moral codes." },
        { label: "Practices (Religion 1)", detail: "Forms of worship, prayer, pilgrimage, festivals, rites of passage, and social action/charity." },
        { label: "Beliefs & Teachings (Religion 2)", detail: "Core doctrines, afterlife, divinity, scriptures, and ethical principles." },
        { label: "Practices (Religion 2)", detail: "Communal/private worship, rituals, sacred locations, celebrations, and community initiatives." },
        { label: "Internal Diversity", detail: "Divergent viewpoints between orthodox/traditional and progressive/modern denominations." },
      ],
    },
    {
      unit: "Part Two: Thematic Studies (4 Themes Chosen)",
      elements: [
        { label: "Relationships & Families", detail: "Marriage, cohabitation, divorce, gender roles, and sexuality." },
        { label: "Religion & Life", detail: "Origins of universe/human life, environmental stewardship, animal rights, abortion, and euthanasia." },
        { label: "Existence of God & Revelation", detail: "Arguments for/against God's existence (Design, Cosmological), miracles, and revelation." },
        { label: "Peace & Conflict", detail: "Just War Theory, Holy War, pacifism, forgiveness, reconciliation, and modern warfare/weapons of mass destruction." },
        { label: "Crime & Punishment", detail: "Causes of crime, aims of punishment (retribution, deterrence, reformation), forgiveness, and the death penalty." },
        { label: "Human Rights & Social Justice", detail: "Freedom of religion, prejudice, discrimination, wealth, and poverty." },
      ],
    },
  ],
  "Single Science (Biology, Chemistry, Physics)": [
    {
      unit: "Biology",
      elements: [
        { label: "Cell Biology & Transport", detail: "Eukaryotes, prokaryotes, microscopy, mitosis, stem cells, diffusion, osmosis, and active transport." },
        { label: "Organ Systems", detail: "Digestive enzymes, circulatory system (heart, blood vessels), and plant transport (xylem, phloem, transpiration)." },
        { label: "Infection & Response", detail: "Pathogens, human immune defences, monoclonal antibodies [Single Science Only], and plant disease defences [Single Science Only]." },
        { label: "Bioenergetics", detail: "Photosynthesis (limiting factors, inverse square law) and cellular respiration (aerobic and anaerobic)." },
        { label: "Homeostasis & Response", detail: "Nervous system, the eye [Single Science Only], the brain [Single Science Only], hormonal control, menstrual cycle, and kidney function/ADH [Single Science Only]." },
        { label: "Genetics & Evolution", detail: "DNA structure, protein synthesis [Single Science Only], inheritance, mutations, genetic engineering, and natural selection." },
        { label: "Ecology", detail: "Trophic levels, biomass pyramids, decay [Single Science Only], nutrient cycling, and biodiversity measures." },
      ],
    },
    {
      unit: "Chemistry",
      elements: [
        { label: "Atomic Structure & Bonding", detail: "Periodic trends, isotopes, ionic, covalent, and metallic bonding; structure of diamond, graphite, and graphene." },
        { label: "Quantitative Chemistry", detail: "Balancing equations, moles, reacting masses, limiting reactants, gas volumes (24 dm3) [Single Science Only], percentage yield, and atom economy [Single Science Only]." },
        { label: "Chemical Changes & Energy", detail: "Reactivity series, metal extraction, acids/bases, electrolysis (molten and aqueous), and bond energy calculations." },
        { label: "Rates & Equilibrium", detail: "Collision theory, catalysts, reversible reactions, Le Chatelier's principle, and the Haber process [Single Science Only]." },
        { label: "Organic Chemistry & Analysis", detail: "Alkanes, alkenes, alcohols, carboxylic acids, addition and condensation polymerisation [Single Science Only], flame tests, and ion identification tests [Single Science Only]." },
        { label: "Atmospheric & Earth Science", detail: "Atmosphere evolution, greenhouse gases, potable water production, and life-cycle assessments." },
      ],
    },
    {
      unit: "Physics",
      elements: [
        { label: "Energy & Electricity", detail: "Energy stores, power, efficiency; current, potential difference, series/parallel rules, domestic mains (a.c.), and static electricity [Single Science Only]." },
        { label: "Particle Model", detail: "Density, internal energy, specific heat capacity, and specific latent heat calculations." },
        { label: "Forces & Motion", detail: "Vectors, Newton's laws, momentum, stopping distances, pressure in fluids, and moments/levers/gears [Single Science Only]." },
        { label: "Waves & Optics", detail: "Transverse/longitudinal waves, wave equation (v = frequency × wavelength), EM spectrum, ray diagrams for convex/concave lenses [Single Science Only], and black body radiation [Single Science Only]." },
        { label: "Magnetism & Electromagnetism", detail: "Magnetic fields, motor effect (F = B × I × l), transformers, dynamic generators/alternators, and microphones/loudspeakers [Single Science Only]." },
        { label: "Nuclear & Space Physics", detail: "Radioactive decay (alpha, beta, gamma), half-life, nuclear fission/fusion, life cycle of stars, orbital mechanics, and red-shift/Big Bang [Single Science Only]." },
      ],
    },
  ],
  "Sociology": [
    {
      unit: "The Sociological Approach & Core Theories",
      elements: [
        { label: "Core Perspectives", detail: "Functionalism, Marxism, Feminist theories, and Interactionism." },
        { label: "Debates & Concepts", detail: "Consensus vs. conflict; nature vs. nurture; norms, values, roles, socialization, deviance, power, and authority." },
        { label: "Foundational Sociologists", detail: "Key contributions of Émile Durkheim, Karl Marx, and Max Weber." },
      ],
    },
    {
      unit: "Families",
      elements: [
        { label: "Functions of the Family", detail: "Parsons' functionalist perspective (primary socialisation and stabilisation of adult personalities)." },
        { label: "Family Diversity", detail: "Nuclear, extended, reconstituted, lone-parent, and same-sex families; Rapoports' five types of family diversity." },
        { label: "Conjugal Roles & Relationships", detail: "Joint vs. segregated roles, domestic division of labour, and Oakley's feminist critique of the conventional family." },
        { label: "Changing Relationships Over Time", detail: "Willmott and Young (the symmetrical family and stratified diffusion)." },
        { label: "Critical Perspectives on the Family", detail: "Zaretsky (Marxist view of the family under capitalism) and Delphy & Leonard (radical feminist critique of domestic exploitation)." },
      ],
    },
    {
      unit: "Education",
      elements: [
        { label: "Functions of Education", detail: "Durkheim (social solidarity, transmission of norms/values) and Parsons (meritocracy, achieved status)." },
        { label: "Capitalism & Education", detail: "Bowles and Gintis' correspondence principle and the hidden curriculum." },
        { label: "Differential Educational Achievement", detail: "Impact of social class, gender, and ethnicity; Halsey (class inequality) and Ball (marketisation and parental choice)." },
        { label: "Internal School Processes", detail: "Streaming, setting, labelling, the self-fulfilling prophecy, Ball (teacher expectations), and Willis (counter-school subcultures)." },
      ],
    },
    {
      unit: "Crime and Deviance",
      elements: [
        { label: "Social Construction of Crime & Deviance", detail: "Deviance across cultures/time; Merton's strain theory (anomie) and Becker's labelling theory." },
        { label: "Social Control", detail: "Formal vs. informal agencies of social control; Heidensohn (female conformity and patriarchal control)." },
        { label: "Patterns of Criminal Behaviour", detail: "Social class, gender, ethnicity, and age; Albert Cohen (delinquent subcultures) and Pat Carlen (women, crime, and poverty)." },
        { label: "Measuring Crime", detail: "Official statistics, victim surveys, self-report studies, and the \"dark figure\" of unreported/unrecorded crime." },
      ],
    },
    {
      unit: "Social Stratification",
      elements: [
        { label: "Theories of Stratification", detail: "Davis and Moore's functionalist theory (role allocation); Marxist and Weberian models of socio-economic class." },
        { label: "Life Chances & Inequalities", detail: "Impact of class, gender, ethnicity, age, and disability; Fiona Devine's study revisiting the affluent worker." },
        { label: "Poverty & Deprivation", detail: "Absolute vs. relative poverty; Townsend (relative deprivation); Charles Murray (underclass and dependency culture)." },
        { label: "Power, Authority & Patriarchy", detail: "Weber's three types of authority (traditional, charismatic, rational-legal); Sylvia Walby's six structures of patriarchy." },
      ],
    },
    {
      unit: "Sociological Research Methods",
      elements: [
        { label: "Research Design", detail: "Aims, hypotheses, operationalisation, pilot studies, and sampling techniques (random, stratified, snowball, quota)." },
        { label: "Primary Research Methods", detail: "Questionnaires (open/closed), structured and unstructured interviews, and observations (participant, non-participant, overt, covert)." },
        { label: "Secondary Sources", detail: "Official statistics, personal documents, and mass media." },
        { label: "Methodological Criteria", detail: "Quantitative vs. qualitative data, reliability, validity, representativeness, and generalisability." },
        { label: "Practical & Ethical Considerations", detail: "Time, cost, access; informed consent, confidentiality, anonymity, and harm prevention." },
      ],
    },
  ],
  "Statistics": [
    {
      unit: "Planning & Data Collection",
      elements: [
        { label: "The Statistical Enquiry Cycle", detail: "Hypotheses, constraints (time, cost, ethics), and planning proactive mitigation strategies." },
        { label: "Data Classifications", detail: "Primary vs. secondary; quantitative vs. qualitative; categorical, ordinal, discrete, and continuous data." },
        { label: "Variables", detail: "Explanatory (independent) and response (dependent) variables; controlling extraneous variables and using control groups [Higher Tier Only]." },
        { label: "Data Structures", detail: "Ungrouped, grouped, bivariate, and multivariate data [Higher Tier Only]." },
        { label: "Sampling Techniques", detail: "Random, systematic, quota, and stratified sampling (calculating sample proportions)." },
        { label: "Sampling Bias & Errors", detail: "Population vs. sample frame vs. sample; convenience sampling risks; dealing with non-response and data cleaning." },
        { label: "Population Estimation", detail: "Petersen capture/recapture formula [Higher Tier Only]." },
      ],
    },
    {
      unit: "Data Visualisation & Representation",
      elements: [
        { label: "Tabular & Pictorial Displays", detail: "Tallies, frequency tables, pictograms, pie charts, stem and leaf diagrams, and Venn diagrams." },
        { label: "Comparative Visualisations", detail: "Population pyramids, choropleth maps, comparative pie charts (radius calculation), and 2D/3D representations [Higher Tier Only]." },
        { label: "Graphical Charts", detail: "Line charts, bar line charts, frequency polygons, scatter plots, and time series." },
        { label: "Cumulative Frequency & Box Plots", detail: "Cumulative frequency curves, medians, quartiles, and box plots." },
        { label: "Histograms", detail: "Equal-width histograms, calculating frequency density, and drawing unequal-width histograms [Higher Tier Only]." },
        { label: "Misleading Graphs", detail: "Spotting distorted axes, truncated scales, and incorrect graphical representations." },
      ],
    },
    {
      unit: "Statistical Measures (Central Tendency & Spread)",
      elements: [
        { label: "Averages", detail: "Mode, median, arithmetic mean, weighted mean [Higher Tier Only], and geometric mean [Higher Tier Only]." },
        { label: "Measures of Spread", detail: "Range, quartiles, interquartile range (IQR), percentiles, interdecile/interpercentile ranges [Higher Tier Only], and standard deviation [Higher Tier Only]." },
        { label: "Outliers & Skewness", detail: "Identifying outliers by inspection or calculation [LQ - 1.5 × IQR and UQ + 1.5 × IQR, or mean ± 3 standard deviations] [Higher Tier Only]; skewness by inspection and formula [Higher Tier Only]." },
        { label: "Time Series & Trends", detail: "Moving averages (4-point and n-point moving averages), mean seasonal variation, and making predictions." },
      ],
    },
    {
      unit: "Correlation, Regression & Rates",
      elements: [
        { label: "Correlation & Regression", detail: "Types of correlation, line of best fit by eye, line through the double-mean point, and regression lines [Higher Tier Only]." },
        { label: "Correlation Coefficients", detail: "Calculating and interpreting Spearman's rank correlation coefficient [Higher Tier Only], and interpreting Pearson's product moment correlation coefficient (PMCC) [Higher Tier Only]." },
        { label: "Rates of Change & Index Numbers", detail: "Calculating rates of change (e.g., birth rates), simple index numbers, and weighted index numbers [Higher Tier Only]." },
      ],
    },
    {
      unit: "Probability & Distributions",
      elements: [
        { label: "Probability Basics & Risk", detail: "0 to 1 scale, expected frequency, and calculating absolute and relative risk." },
        { label: "Combined Events", detail: "Two-way tables, tree diagrams, Venn diagrams (up to three events), and formal notation for independent events and conditional probability." },
        { label: "Distributions", detail: "Binomial distribution characteristics [Higher Tier Only], and Normal distribution characteristics (68–95–99.7 rule, standardisation, warning and action lines in quality control) [Higher Tier Only]." },
      ],
    },
  ],
};

export function subjectUnits(subjectName: string): SubjectUnit[] {
  return SUBJECT_TOPICS[subjectName] ?? [];
}

export function subjectElementCount(subjectName: string): number {
  return subjectUnits(subjectName).reduce((sum, unit) => sum + unit.elements.length, 0);
}
