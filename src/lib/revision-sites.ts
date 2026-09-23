export type RevisionLinkSubject = {
  name: string;
  colorKey: string;
};

export type RevisionLinkGroup = {
  label: string;
  subjects: RevisionLinkSubject[];
};

export const REVISION_LINK_GROUPS: RevisionLinkGroup[] = [
  {
    label: "Core Subjects",
    subjects: [
      { name: "English Language", colorKey: "eng" },
      { name: "English Literature", colorKey: "lit" },
      { name: "Mathematics", colorKey: "maths" },
    ],
  },
  {
    label: "Sciences",
    subjects: [
      { name: "Biology", colorKey: "sci" },
      { name: "Chemistry", colorKey: "chem" },
      { name: "Physics", colorKey: "phys" },
      { name: "Combined Science", colorKey: "sci" },
      { name: "Astronomy", colorKey: "phys" },
    ],
  },
  {
    label: "Humanities",
    subjects: [
      { name: "History", colorKey: "hist" },
      { name: "Geography", colorKey: "hist" },
      { name: "Religious Studies", colorKey: "hist" },
      { name: "Ancient History / Classical Civilisation", colorKey: "hist" },
      { name: "Citizenship Studies", colorKey: "hist" },
      { name: "Sociology", colorKey: "hist" },
      { name: "Psychology", colorKey: "sci" },
    ],
  },
  {
    label: "Business and Computing",
    subjects: [
      { name: "Business Studies", colorKey: "biz" },
      { name: "Economics", colorKey: "biz" },
      { name: "Computer Science", colorKey: "biz" },
    ],
  },
  {
    label: "Design and Technology",
    subjects: [
      { name: "Design and Technology", colorKey: "biz" },
      { name: "Electronics", colorKey: "biz" },
      { name: "Engineering", colorKey: "biz" },
      { name: "Food Preparation and Nutrition", colorKey: "biz" },
    ],
  },
  {
    label: "Arts and Design",
    subjects: [
      { name: "Art & Design (Fine Art, Graphic Communication, Textile Design, 3D Design, Photography)", colorKey: "media" },
      { name: "Dance", colorKey: "media" },
      { name: "Drama", colorKey: "media" },
      { name: "Film Studies", colorKey: "media" },
      { name: "Media Studies", colorKey: "media" },
      { name: "Music", colorKey: "media" },
      { name: "Physical Education", colorKey: "pe" },
    ],
  },
  {
    label: "Mathematics and Statistics",
    subjects: [{ name: "Statistics", colorKey: "maths" }],
  },
  {
    label: "Languages",
    subjects: [
      { name: "French", colorKey: "lit" },
      { name: "German", colorKey: "lit" },
      { name: "Spanish", colorKey: "lit" },
      { name: "Italian", colorKey: "lit" },
      { name: "Latin", colorKey: "lit" },
      { name: "Classical Greek", colorKey: "lit" },
    ],
  },
];