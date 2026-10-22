/**
 * Built-in revision links, shown for every subject so the page is never empty.
 * Links added in Admin are shown alongside these.
 * Homepages only, so links don't break when a site moves its pages around.
 */
export type DefaultLink = { site_name: string; site_url: string; description: string };

const BITESIZE: DefaultLink = {
  site_name: "BBC Bitesize",
  site_url: "https://www.bbc.co.uk/bitesize",
  description: "Free GCSE revision notes, videos and quizzes for every major subject and exam board.",
};
const OAK: DefaultLink = {
  site_name: "Oak National Academy",
  site_url: "https://www.thenational.academy",
  description: "Free video lessons, quizzes and worksheets for key stage 4 (GCSE), by exam board.",
};
const SENECA: DefaultLink = {
  site_name: "Seneca Learning",
  site_url: "https://senecalearning.com",
  description: "Free bite-sized GCSE courses that test you as you go.",
};
const PMT: DefaultLink = {
  site_name: "Physics & Maths Tutor",
  site_url: "https://www.physicsandmathstutor.com",
  description: "Free past papers, notes and topic questions sorted by exam board.",
};
const SME: DefaultLink = {
  site_name: "Save My Exams",
  site_url: "https://www.savemyexams.com",
  description: "Revision notes and exam questions by board. Some content needs a subscription.",
};
const COGNITO: DefaultLink = {
  site_name: "Cognito",
  site_url: "https://cognito.org",
  description: "Free video lessons and quizzes for GCSE sciences, maths and computer science.",
};
const FSL: DefaultLink = {
  site_name: "Freesciencelessons (YouTube)",
  site_url: "https://www.youtube.com/@Freesciencelessons",
  description: "Short, clear GCSE science videos covering every required practical.",
};
const TUTOR2U: DefaultLink = {
  site_name: "tutor2u",
  site_url: "https://www.tutor2u.net",
  description: "Free study notes, videos and exam advice for social sciences, business and economics.",
};

const SCIENCE = [COGNITO, FSL, PMT, BITESIZE, SENECA, OAK];
const GENERAL = [BITESIZE, SENECA, OAK, SME];

const EXTRA: Record<string, DefaultLink[]> = {
  "English Language": [
    {
      site_name: "Mr Bruff (YouTube)",
      site_url: "https://www.youtube.com/@mrbruff",
      description: "GCSE English Language and Literature walkthroughs, exam tips and model answers.",
    },
  ],
  "English Literature": [
    {
      site_name: "Mr Bruff (YouTube)",
      site_url: "https://www.youtube.com/@mrbruff",
      description: "Set-text analysis, quotes and essay structure for GCSE English Literature.",
    },
  ],
  Mathematics: [
    {
      site_name: "Corbettmaths",
      site_url: "https://corbettmaths.com",
      description: "Free videos, practice questions and the famous 5-a-day for every GCSE maths topic.",
    },
    {
      site_name: "Maths Genie",
      site_url: "https://www.mathsgenie.co.uk",
      description: "Free GCSE maths revision sorted by grade, with exam questions and solutions.",
    },
    COGNITO,
    PMT,
  ],
  Statistics: [
    {
      site_name: "Corbettmaths",
      site_url: "https://corbettmaths.com",
      description: "Free videos and practice questions, including statistics topics.",
    },
    PMT,
  ],
  Geography: [
    {
      site_name: "Internet Geography",
      site_url: "https://www.internetgeography.net",
      description: "Free GCSE geography notes and case studies for AQA and other boards.",
    },
  ],
  "Computer Science": [
    {
      site_name: "Craig'n'Dave",
      site_url: "https://craigndave.org",
      description: "GCSE computer science videos for AQA and OCR.",
    },
    COGNITO,
  ],
  Music: [
    {
      site_name: "musictheory.net",
      site_url: "https://www.musictheory.net",
      description: "Free lessons and exercises for notation, keys, chords and listening.",
    },
  ],
  Psychology: [TUTOR2U],
  Sociology: [TUTOR2U],
  "Business Studies": [TUTOR2U],
  Economics: [TUTOR2U],
};

const SCIENCES = new Set(["Biology", "Chemistry", "Physics", "Combined Science"]);

export function defaultLinksFor(subject: string): DefaultLink[] {
  const list = SCIENCES.has(subject) ? SCIENCE : [...(EXTRA[subject] ?? []), ...GENERAL];
  const seen = new Set<string>();
  return list.filter((l) => (seen.has(l.site_url) ? false : (seen.add(l.site_url), true)));
}
