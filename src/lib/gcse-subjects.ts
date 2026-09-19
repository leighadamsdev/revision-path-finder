/**
 * National GCSE subject catalogue — the 31 subjects covered by the
 * GCSE Master Subject Content checklists.
 * `tiered` marks subjects that are sat at either Foundation or Higher tier.
 */
export type CatalogueSubject = {
  name: string;
  colorKey: string;
  tiered?: boolean;
  group: string;
};

export const GCSE_SUBJECTS: CatalogueSubject[] = [
  // Core
  { name: "Mathematics", colorKey: "maths", tiered: true, group: "Core" },
  { name: "English Language", colorKey: "eng", group: "Core" },
  {
    name: "Combined Science (Trilogy / Double Award)",
    colorKey: "sci",
    tiered: true,
    group: "Core",
  },
  {
    name: "Single Science (Biology, Chemistry, Physics)",
    colorKey: "sci",
    tiered: true,
    group: "Core",
  },

  // Sciences
  { name: "Astronomy", colorKey: "phys", group: "Sciences" },
  { name: "Geology", colorKey: "sci", group: "Sciences" },
  { name: "Psychology", colorKey: "sci", group: "Sciences" },
  { name: "Statistics", colorKey: "maths", tiered: true, group: "Sciences" },

  // Humanities
  { name: "Ancient History", colorKey: "hist", group: "Humanities" },
  { name: "Citizenship Studies", colorKey: "hist", group: "Humanities" },
  { name: "Classical Civilisation", colorKey: "hist", group: "Humanities" },
  { name: "Geography", colorKey: "hist", group: "Humanities" },
  { name: "History", colorKey: "hist", group: "Humanities" },
  { name: "Religious Studies", colorKey: "hist", group: "Humanities" },
  { name: "Sociology", colorKey: "hist", group: "Humanities" },

  // Languages
  { name: "Ancient Languages", colorKey: "lit", group: "Languages" },
  {
    name: "Modern Foreign Languages (MFL)",
    colorKey: "lit",
    tiered: true,
    group: "Languages",
  },

  // Business & technology
  { name: "Business", colorKey: "biz", group: "Business & technology" },
  { name: "Economics", colorKey: "biz", group: "Business & technology" },
  { name: "Design & Technology", colorKey: "biz", group: "Business & technology" },
  { name: "Electronics", colorKey: "biz", group: "Business & technology" },
  { name: "Engineering", colorKey: "biz", group: "Business & technology" },
  {
    name: "Food Preparation and Nutrition",
    colorKey: "biz",
    group: "Business & technology",
  },

  // Arts & media
  { name: "Art and Design", colorKey: "media", group: "Arts & media" },
  { name: "Dance", colorKey: "media", group: "Arts & media" },
  { name: "Drama", colorKey: "media", group: "Arts & media" },
  { name: "Film Studies", colorKey: "media", group: "Arts & media" },
  { name: "Media Studies", colorKey: "media", group: "Arts & media" },
  { name: "Music", colorKey: "media", group: "Arts & media" },

  // Other
  { name: "English Literature", colorKey: "lit", group: "Other" },
  { name: "Physical Education (Full Course)", colorKey: "pe", group: "Other" },
  { name: "Physical Education (Short Course)", colorKey: "pe", group: "Other" },
];

export const SUBJECT_GROUPS = [
  "Core",
  "Sciences",
  "Humanities",
  "Languages",
  "Business & technology",
  "Arts & media",
  "Other",
] as const;

export type Tier = "Foundation" | "Higher";

export function catalogueSubject(name: string) {
  return GCSE_SUBJECTS.find((s) => s.name.toLowerCase() === name.toLowerCase());
}

export function isTiered(name: string) {
  return Boolean(catalogueSubject(name)?.tiered);
}
