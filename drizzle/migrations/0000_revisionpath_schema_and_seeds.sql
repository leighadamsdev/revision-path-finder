-- ============ ENUMS ============
create type public.content_mode as enum ('ai', 'manual', 'library');

-- ============ PROFILES ============
create table public.profiles (
  id uuid primary key,
  display_name text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile select" on public.profiles for select to authenticated using (id = auth.uid());
create policy "own profile insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- ============ SUBJECTS ============
create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  exam_board text not null,
  color_key text not null default 'media',
  is_custom boolean not null default false,
  created_by uuid,
  created_at timestamptz not null default now(),
  unique (name, exam_board, created_by)
);
grant select, insert on public.subjects to authenticated;
grant all on public.subjects to service_role;
alter table public.subjects enable row level security;
create policy "read global or own subjects" on public.subjects for select to authenticated
  using (created_by is null or created_by = auth.uid());
create policy "insert own custom subjects" on public.subjects for insert to authenticated
  with check (created_by = auth.uid() and is_custom = true);

-- ============ PLANS ============
create table public.plans (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null default 'My revision plan',
  weeks int not null default 6,
  days_per_week int not null default 4,
  study_days text[] not null default array['Monday','Tuesday','Wednesday','Thursday'],
  sessions_per_day int not null default 2,
  session_length_minutes int not null default 45,
  content_mode public.content_mode not null default 'ai',
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.plans to authenticated;
grant all on public.plans to service_role;
alter table public.plans enable row level security;
create policy "own plans all" on public.plans for all to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- ============ PLAN SUBJECTS ============
create table public.plan_subjects (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  unique (plan_id, subject_id)
);
grant select, insert, update, delete on public.plan_subjects to authenticated;
grant all on public.plan_subjects to service_role;
alter table public.plan_subjects enable row level security;
create policy "own plan subjects all" on public.plan_subjects for all to authenticated
  using (exists (select 1 from public.plans p where p.id = plan_id and p.profile_id = auth.uid()))
  with check (exists (select 1 from public.plans p where p.id = plan_id and p.profile_id = auth.uid()));

-- ============ SESSIONS ============
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans(id) on delete cascade,
  week_number int not null,
  day_label text not null,
  session_slot int not null default 1,
  subject_id uuid references public.subjects(id) on delete set null,
  topic_text text not null default '',
  confidence int check (confidence between 1 and 5),
  gap_notes text not null default '',
  updated_at timestamptz not null default now()
);
create index sessions_plan_week_idx on public.sessions (plan_id, week_number);
grant select, insert, update, delete on public.sessions to authenticated;
grant all on public.sessions to service_role;
alter table public.sessions enable row level security;
create policy "own sessions all" on public.sessions for all to authenticated
  using (exists (select 1 from public.plans p where p.id = plan_id and p.profile_id = auth.uid()))
  with check (exists (select 1 from public.plans p where p.id = plan_id and p.profile_id = auth.uid()));

-- ============ REFERENCE TABLES ============
create table public.topic_library (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  position int not null,
  topic text not null,
  unique (subject_id, position)
);
grant select on public.topic_library to authenticated;
grant all on public.topic_library to service_role;
alter table public.topic_library enable row level security;
create policy "read topic library" on public.topic_library for select to authenticated using (true);

create table public.past_papers (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  spec_code text not null,
  official_portal_url text not null,
  free_resource_url text not null,
  free_resource_name text not null,
  unique (subject_id)
);
grant select on public.past_papers to authenticated;
grant all on public.past_papers to service_role;
alter table public.past_papers enable row level security;
create policy "read past papers" on public.past_papers for select to authenticated using (true);

create table public.revision_sites (
  id uuid primary key default gen_random_uuid(),
  subject_name text,
  site_name text not null,
  site_url text not null,
  description text not null
);
grant select on public.revision_sites to authenticated;
grant all on public.revision_sites to service_role;
alter table public.revision_sites enable row level security;
create policy "read revision sites" on public.revision_sites for select to authenticated using (true);

-- ============ SEED SUBJECTS ============
insert into public.subjects (name, exam_board, color_key) values
  ('Maths','AQA','maths'), ('Maths','Edexcel','maths'), ('Maths','OCR','maths'), ('Maths','WJEC Eduqas','maths'),
  ('English Language','AQA','eng'), ('English Language','Edexcel','eng'), ('English Language','OCR','eng'), ('English Language','WJEC Eduqas','eng'),
  ('English Literature','AQA','lit'), ('English Literature','Edexcel','lit'), ('English Literature','OCR','lit'), ('English Literature','WJEC Eduqas','lit'),
  ('Combined Science: Trilogy','AQA','sci'),
  ('Combined Science','Edexcel','sci'), ('Combined Science','OCR','sci'),
  ('Biology','AQA','sci'), ('Chemistry','AQA','chem'), ('Physics','AQA','phys'),
  ('History','AQA','hist'), ('History','Edexcel','hist'), ('History','OCR','hist'), ('History','WJEC Eduqas','hist'),
  ('PE','AQA','pe'), ('PE','Edexcel','pe'), ('PE','OCR','pe'),
  ('Business Studies','AQA','biz'), ('Business Studies','Edexcel','biz'), ('Business Studies','OCR','biz'), ('Business Studies','WJEC Eduqas','biz'),
  ('Media Studies','AQA','media'), ('Media Studies','WJEC Eduqas','media'), ('Media Studies','OCR','media');

-- ============ SEED PAST PAPERS ============
insert into public.past_papers (subject_id, spec_code, official_portal_url, free_resource_url, free_resource_name)
select id, '1MA1', 'https://qualifications.pearson.com/en/qualifications/edexcel-gcses/mathematics-2015.html', 'https://www.mathsgenie.co.uk/gcse.html', 'Maths Genie topic papers'
from public.subjects where name='Maths' and exam_board='Edexcel';

insert into public.past_papers (subject_id, spec_code, official_portal_url, free_resource_url, free_resource_name)
select id, '8300', 'https://www.aqa.org.uk/subjects/mathematics/gcse/mathematics-8300/assessment-resources', 'https://www.mathsgenie.co.uk/gcse.html', 'Maths Genie topic papers'
from public.subjects where name='Maths' and exam_board='AQA';

insert into public.past_papers (subject_id, spec_code, official_portal_url, free_resource_url, free_resource_name)
select id, '8700', 'https://www.aqa.org.uk/subjects/english/gcse/english-language-8700/assessment-resources', 'https://www.physicsandmathstutor.com/english-revision/gcse-aqa/', 'PMT English revision notes'
from public.subjects where name='English Language' and exam_board='AQA';

insert into public.past_papers (subject_id, spec_code, official_portal_url, free_resource_url, free_resource_name)
select id, '8702', 'https://www.aqa.org.uk/subjects/english/gcse/english-literature-8702/assessment-resources', 'https://www.physicsandmathstutor.com/english-revision/gcse-aqa/', 'PMT English revision notes'
from public.subjects where name='English Literature' and exam_board='AQA';

insert into public.past_papers (subject_id, spec_code, official_portal_url, free_resource_url, free_resource_name)
select id, '8464', 'https://www.aqa.org.uk/subjects/science/gcse/combined-science-trilogy-8464/assessment-resources', 'https://www.physicsandmathstutor.com/past-papers/gcse-biology/', 'PMT Science past papers'
from public.subjects where name='Combined Science: Trilogy' and exam_board='AQA';

insert into public.past_papers (subject_id, spec_code, official_portal_url, free_resource_url, free_resource_name)
select id, 'C100QS', 'https://www.eduqas.co.uk/qualifications/history-gcse/', 'https://senecalearning.com/en-GB/', 'Seneca free history courses'
from public.subjects where name='History' and exam_board='WJEC Eduqas';

insert into public.past_papers (subject_id, spec_code, official_portal_url, free_resource_url, free_resource_name)
select id, '1PE0', 'https://qualifications.pearson.com/en/qualifications/edexcel-gcses/physical-education-2016.html', 'https://senecalearning.com/en-GB/', 'Seneca free PE courses'
from public.subjects where name='PE' and exam_board='Edexcel';

insert into public.past_papers (subject_id, spec_code, official_portal_url, free_resource_url, free_resource_name)
select id, 'J204', 'https://www.ocr.org.uk/qualifications/gcse/business-j204-from-2017/assessment/', 'https://www.tutor2u.net/business/gcse', 'tutor2u GCSE Business'
from public.subjects where name='Business Studies' and exam_board='OCR';

insert into public.past_papers (subject_id, spec_code, official_portal_url, free_resource_url, free_resource_name)
select id, 'C680QS', 'https://www.eduqas.co.uk/qualifications/media-studies-gcse/', 'https://www.bbc.co.uk/bitesize/subjects/ztnygk7', 'BBC Bitesize Media Studies'
from public.subjects where name='Media Studies' and exam_board='WJEC Eduqas';

-- ============ SEED REVISION SITES ============
insert into public.revision_sites (subject_name, site_name, site_url, description) values
  (null, 'Physics & Maths Tutor', 'https://www.physicsandmathstutor.com/', 'Past papers and topic questions for almost every GCSE subject and board.'),
  (null, 'Seneca Learning', 'https://senecalearning.com/en-GB/', 'Free courses that quiz you as you read, so revision actually sticks.'),
  (null, 'BBC Bitesize', 'https://www.bbc.co.uk/bitesize/levels/z98jmp3', 'Short, exam-board-tagged explanations with quick tests.'),
  (null, 'Quizlet', 'https://quizlet.com/en-gb', 'Flashcards for anything you need to memorise, including shared class sets.'),
  ('Maths', 'Maths Genie', 'https://www.mathsgenie.co.uk/gcse.html', 'Topic-by-topic papers graded by difficulty, with video solutions.'),
  ('Maths', 'Corbettmaths', 'https://corbettmaths.com/', 'Practice questions and 5-a-day warm-ups for every topic.'),
  ('English Language', 'Mr Bruff', 'https://www.youtube.com/@mrbruff', 'Walkthroughs of each paper and question with model answers.'),
  ('English Literature', 'Mr Bruff', 'https://www.youtube.com/@mrbruff', 'Text-by-text analysis videos for the set novels, plays and poetry.'),
  ('Combined Science: Trilogy', 'Cognito', 'https://www.youtube.com/@CognitoEdu', 'Short animated videos covering the whole combined science spec.'),
  ('Combined Science: Trilogy', 'Physics & Maths Tutor', 'https://www.physicsandmathstutor.com/past-papers/gcse-biology/', 'Topic questions split by paper, ideal for exam practice.'),
  ('Biology', 'Cognito', 'https://www.youtube.com/@CognitoEdu', 'Clear animated biology explanations with end-of-video quizzes.'),
  ('Chemistry', 'Cognito', 'https://www.youtube.com/@CognitoEdu', 'Reaction and calculation topics broken into short videos.'),
  ('Physics', 'Cognito', 'https://www.youtube.com/@CognitoEdu', 'Equations and required practicals explained visually.'),
  ('History', 'Seneca Learning', 'https://senecalearning.com/en-GB/', 'Free timed courses for each history depth and thematic study.'),
  ('PE', 'Seneca Learning', 'https://senecalearning.com/en-GB/', 'Anatomy, physiology and socio-cultural topics with quick recall quizzes.'),
  ('Business Studies', 'tutor2u', 'https://www.tutor2u.net/business/gcse', 'Exam-focused notes, definitions and revision webinars.'),
  ('Media Studies', 'BBC Bitesize', 'https://www.bbc.co.uk/bitesize/subjects/ztnygk7', 'Theory and set-product revision written for the exam.');

-- ============ SEED TOPIC LIBRARY ============
insert into public.topic_library (subject_id, position, topic)
select s.id, t.pos, t.topic from public.subjects s,
(values
  (1,'Number: fractions, decimals and percentages'),(2,'Percentage change and reverse percentages'),
  (3,'Ratio and proportion problems'),(4,'Expanding and factorising expressions'),
  (5,'Solving linear equations and inequalities'),(6,'Quadratic graphs and transformations'),
  (7,'Simultaneous equations'),(8,'Straight line graphs: gradient and intercept'),
  (9,'Pythagoras and trigonometry (SOHCAHTOA)'),(10,'Circle theorems'),
  (11,'Area, surface area and volume'),(12,'Probability trees and Venn diagrams'),
  (13,'Cumulative frequency and box plots'),(14,'Vectors'),(15,'Iteration and bounds')
) as t(pos, topic)
where s.name='Maths' and s.exam_board='Edexcel';

insert into public.topic_library (subject_id, position, topic)
select s.id, t.pos, t.topic from public.subjects s,
(values
  (1,'Cell biology and microscopy'),(2,'Enzymes and digestion'),
  (3,'Photosynthesis and respiration'),(4,'Infection and response'),
  (5,'Inheritance, variation and Punnett squares'),(6,'Ecology and food chains'),
  (7,'Atomic structure and the periodic table'),(8,'Bonding, structure and properties'),
  (9,'Quantitative chemistry and moles'),(10,'Rates of reaction and equilibrium'),
  (11,'Energy changes and fuels'),(12,'Energy stores and transfers'),
  (13,'Electricity: circuits and charge flow'),(14,'Forces, motion and Newton''s laws'),
  (15,'Waves and the electromagnetic spectrum')
) as t(pos, topic)
where s.name='Combined Science: Trilogy' and s.exam_board='AQA';

insert into public.topic_library (subject_id, position, topic)
select s.id, t.pos, t.topic from public.subjects s,
(values
  (1,'Paper 1 Q1: finding explicit information'),(2,'Paper 1 Q2: language analysis'),
  (3,'Paper 1 Q3: structure analysis'),(4,'Paper 1 Q4: evaluating a text'),
  (5,'Paper 1 Q5: descriptive writing'),(6,'Paper 2 Q1: true/false statements'),
  (7,'Paper 2 Q2: summarising differences'),(8,'Paper 2 Q3: language comparison'),
  (9,'Paper 2 Q4: comparing viewpoints'),(10,'Paper 2 Q5: writing to argue or persuade'),
  (11,'Sentence forms and punctuation for effect'),(12,'Spoken language endorsement prep')
) as t(pos, topic)
where s.name='English Language' and s.exam_board='AQA';

insert into public.topic_library (subject_id, position, topic)
select s.id, t.pos, t.topic from public.subjects s,
(values
  (1,'Macbeth: plot and key quotations'),(2,'Macbeth: ambition and kingship themes'),
  (3,'Macbeth: Shakespearean context'),(4,'A Christmas Carol: Scrooge''s transformation'),
  (5,'A Christmas Carol: poverty and Victorian context'),(6,'An Inspector Calls: responsibility'),
  (7,'An Inspector Calls: class and gender'),(8,'Power and Conflict poetry: war poems'),
  (9,'Power and Conflict poetry: nature and power'),(10,'Unseen poetry: comparison skills'),
  (11,'Writing a thesis-led essay introduction'),(12,'Embedding context into analysis')
) as t(pos, topic)
where s.name='English Literature' and s.exam_board='AQA';

insert into public.topic_library (subject_id, position, topic)
select s.id, t.pos, t.topic from public.subjects s,
(values
  (1,'Causes of World War One: alliances'),(2,'Trench warfare and the Western Front'),
  (3,'The Treaty of Versailles'),(4,'Weimar Germany and hyperinflation'),
  (5,'Hitler''s rise to power'),(6,'Life in Nazi Germany'),
  (7,'The Cold War: origins and Berlin'),(8,'The Cuban Missile Crisis'),
  (9,'Depression, war and recovery in Wales and England'),(10,'Changes in health and medicine'),
  (11,'Source evaluation: usefulness and reliability'),(12,'Structuring a 12-mark answer')
) as t(pos, topic)
where s.name='History' and s.exam_board='WJEC Eduqas';

insert into public.topic_library (subject_id, position, topic)
select s.id, t.pos, t.topic from public.subjects s,
(values
  (1,'Skeletal system and joint actions'),(2,'Muscular system and antagonistic pairs'),
  (3,'Cardiovascular system and blood flow'),(4,'Respiratory system and gas exchange'),
  (5,'Short and long term effects of exercise'),(6,'Movement analysis and levers'),
  (7,'Components of fitness and testing'),(8,'Principles of training'),
  (9,'Diet, nutrition and hydration'),(10,'Classification of skill and guidance'),
  (11,'Commercialisation and the media in sport'),(12,'Participation rates and barriers')
) as t(pos, topic)
where s.name='PE' and s.exam_board='Edexcel';

insert into public.topic_library (subject_id, position, topic)
select s.id, t.pos, t.topic from public.subjects s,
(values
  (1,'Enterprise, entrepreneurship and risk'),(2,'Market research and segmentation'),
  (3,'The marketing mix: product and price'),(4,'The marketing mix: place and promotion'),
  (5,'Business ownership structures'),(6,'Sources of finance'),
  (7,'Break-even analysis'),(8,'Cash flow forecasting'),
  (9,'Profit, revenue and cost calculations'),(10,'Recruitment, training and motivation'),
  (11,'Production methods and quality'),(12,'External influences: ethics and the economy')
) as t(pos, topic)
where s.name='Business Studies' and s.exam_board='OCR';

insert into public.topic_library (subject_id, position, topic)
select s.id, t.pos, t.topic from public.subjects s,
(values
  (1,'Media language: camera, mise-en-scene and editing'),(2,'Genre and narrative theory'),
  (3,'Representation of gender'),(4,'Representation of ethnicity and place'),
  (5,'Audience targeting and categorisation'),(6,'Audience response theories'),
  (7,'Media industries: ownership and regulation'),(8,'Set product: music video analysis'),
  (9,'Set product: magazine analysis'),(10,'Set product: advertising analysis'),
  (11,'Online, social and participatory media'),(12,'Applying theorists in exam answers')
) as t(pos, topic)
where s.name='Media Studies' and s.exam_board='WJEC Eduqas';
