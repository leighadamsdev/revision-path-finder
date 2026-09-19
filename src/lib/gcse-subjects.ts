/**
 * National GCSE subject catalogue.
 * Covers the subjects offered across AQA, Edexcel, OCR and WJEC Eduqas.
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
  { name: "Maths", colorKey: "maths", tiered: true, group: "Core" },
  { name: "English Language", colorKey: "eng", group: "Core" },
  { name: "English Literature", colorKey: "lit", group: "Core" },
  { name: "Combined Science: Trilogy", colorKey: "sci", tiered: true, group: "Core" },
  { name: "Combined Science: Synergy", colorKey: "sci", tiered: true, group: "Core" },

  // Sciences
  { name: "Biology", colorKey: "sci", tiered: true, group: "Sciences" },
  { name: "Chemistry", colorKey: "chem", tiered: true, group: "Sciences" },
  { name: "Physics", colorKey: "phys", tiered: true, group: "Sciences" },
  { name: "Astronomy", colorKey: "phys", group: "Sciences" },
  { name: "Psychology", colorKey: "sci", group: "Sciences" },
  { name: "Environmental Science", colorKey: "sci", group: "Sciences" },
  { name: "Statistics", colorKey: "maths", tiered: true, group: "Sciences" },

  // Humanities
  { name: "History", colorKey: "hist", group: "Humanities" },
  { name: "Geography", colorKey: "hist", group: "Humanities" },
  { name: "Religious Studies", colorKey: "hist", group: "Humanities" },
  { name: "Citizenship Studies", colorKey: "hist", group: "Humanities" },
  { name: "Ancient History", colorKey: "hist", group: "Humanities" },
  { name: "Classical Civilisation", colorKey: "hist", group: "Humanities" },
  { name: "Sociology", colorKey: "hist", group: "Humanities" },
  { name: "Philosophy", colorKey: "hist", group: "Humanities" },

  // Languages
  { name: "French", colorKey: "lit", tiered: true, group: "Languages" },
  { name: "German", colorKey: "lit", tiered: true, group: "Languages" },
  { name: "Spanish", colorKey: "lit", tiered: true, group: "Languages" },
  { name: "Italian", colorKey: "lit", tiered: true, group: "Languages" },
  { name: "Mandarin Chinese", colorKey: "lit", tiered: true, group: "Languages" },
  { name: "Arabic", colorKey: "lit", group: "Languages" },
  { name: "Urdu", colorKey: "lit", group: "Languages" },
  { name: "Polish", colorKey: "lit", group: "Languages" },
  { name: "Russian", colorKey: "lit", group: "Languages" },
  { name: "Portuguese", colorKey: "lit", group: "Languages" },
  { name: "Bengali", colorKey: "lit", group: "Languages" },
  { name: "Panjabi", colorKey: "lit", group: "Languages" },
  { name: "Japanese", colorKey: "lit", group: "Languages" },
  { name: "Greek (Classical)", colorKey: "lit", group: "Languages" },
  { name: "Latin", colorKey: "lit", group: "Languages" },
  { name: "Welsh (Second Language)", colorKey: "lit", group: "Languages" },
  { name: "Irish", colorKey: "lit", group: "Languages" },

  // Business, computing & technology
  { name: "Business Studies", colorKey: "biz", group: "Business & technology" },
  { name: "Economics", colorKey: "biz", group: "Business & technology" },
  { name: "Computer Science", colorKey: "biz", group: "Business & technology" },
  { name: "Design and Technology", colorKey: "biz", group: "Business & technology" },
  { name: "Engineering", colorKey: "biz", group: "Business & technology" },
  { name: "Electronics", colorKey: "biz", group: "Business & technology" },
  { name: "Food Preparation and Nutrition", colorKey: "biz", group: "Business & technology" },
  { name: "Enterprise and Marketing", colorKey: "biz", group: "Business & technology" },

  // Arts & media
  { name: "Media Studies", colorKey: "media", group: "Arts & media" },
  { name: "Art and Design", colorKey: "media", group: "Arts & media" },
  { name: "Photography", colorKey: "media", group: "Arts & media" },
  { name: "Textile Design", colorKey: "media", group: "Arts & media" },
  { name: "Three-Dimensional Design", colorKey: "media", group: "Arts & media" },
  { name: "Graphic Communication", colorKey: "media", group: "Arts & media" },
  { name: "Drama", colorKey: "media", group: "Arts & media" },
  { name: "Music", colorKey: "media", group: "Arts & media" },
  { name: "Film Studies", colorKey: "media", group: "Arts & media" },
  { name: "Dance", colorKey: "media", group: "Arts & media" },

  // Wellbeing & other
  { name: "PE", colorKey: "pe", group: "Other" },
  { name: "Health and Social Care", colorKey: "pe", group: "Other" },
  { name: "Child Development", colorKey: "pe", group: "Other" },
  { name: "Travel and Tourism", colorKey: "pe", group: "Other" },
  { name: "Hospitality and Catering", colorKey: "pe", group: "Other" },
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
