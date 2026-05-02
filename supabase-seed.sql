-- Seed test data for SkillGraph — 12 builders around Cork City
-- Run this in Supabase SQL Editor AFTER running supabase-schema.sql
--
-- This creates fake auth users first (required by FK), then profiles + skills + interests.

-- Create fake auth users in auth.users
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'aoife@test.local',   crypt('password123', gen_salt('bf')), now(), now(), now(), '', '{"provider":"email","providers":["email"]}', '{"name":"Aoife Murphy"}'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ciaran@test.local',  crypt('password123', gen_salt('bf')), now(), now(), now(), '', '{"provider":"email","providers":["email"]}', '{"name":"Ciaran Walsh"}'),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'niamh@test.local',   crypt('password123', gen_salt('bf')), now(), now(), now(), '', '{"provider":"email","providers":["email"]}', '{"name":"Niamh O Brien"}'),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'tadhg@test.local',   crypt('password123', gen_salt('bf')), now(), now(), now(), '', '{"provider":"email","providers":["email"]}', '{"name":"Tadhg Brennan"}'),
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sinead@test.local',  crypt('password123', gen_salt('bf')), now(), now(), now(), '', '{"provider":"email","providers":["email"]}', '{"name":"Sinead Foley"}'),
  ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'daithi@test.local',  crypt('password123', gen_salt('bf')), now(), now(), now(), '', '{"provider":"email","providers":["email"]}', '{"name":"Daithi Quinn"}'),
  ('00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'emma@test.local',    crypt('password123', gen_salt('bf')), now(), now(), now(), '', '{"provider":"email","providers":["email"]}', '{"name":"Emma Lucey"}'),
  ('00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ronan@test.local',   crypt('password123', gen_salt('bf')), now(), now(), now(), '', '{"provider":"email","providers":["email"]}', '{"name":"Ronan Stafford"}'),
  ('00000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'fiona@test.local',   crypt('password123', gen_salt('bf')), now(), now(), now(), '', '{"provider":"email","providers":["email"]}', '{"name":"Fiona Casey"}'),
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'padraig@test.local', crypt('password123', gen_salt('bf')), now(), now(), now(), '', '{"provider":"email","providers":["email"]}', '{"name":"Padraig Lee"}'),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'maire@test.local',   crypt('password123', gen_salt('bf')), now(), now(), now(), '', '{"provider":"email","providers":["email"]}', '{"name":"Maire Duggan"}'),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'cormac@test.local',  crypt('password123', gen_salt('bf')), now(), now(), now(), '', '{"provider":"email","providers":["email"]}', '{"name":"Cormac Healy"}');

-- Also need identities for Supabase auth to work
INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '{"sub":"00000000-0000-0000-0000-000000000001","email":"aoife@test.local"}',   'email', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '{"sub":"00000000-0000-0000-0000-000000000002","email":"ciaran@test.local"}',  'email', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', '{"sub":"00000000-0000-0000-0000-000000000003","email":"niamh@test.local"}',   'email', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', '{"sub":"00000000-0000-0000-0000-000000000004","email":"tadhg@test.local"}',   'email', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', '{"sub":"00000000-0000-0000-0000-000000000005","email":"sinead@test.local"}',  'email', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000006', '{"sub":"00000000-0000-0000-0000-000000000006","email":"daithi@test.local"}',  'email', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000007', '{"sub":"00000000-0000-0000-0000-000000000007","email":"emma@test.local"}',    'email', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000008', '{"sub":"00000000-0000-0000-0000-000000000008","email":"ronan@test.local"}',   'email', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000009', '{"sub":"00000000-0000-0000-0000-000000000009","email":"fiona@test.local"}',   'email', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000010', '{"sub":"00000000-0000-0000-0000-000000000010","email":"padraig@test.local"}', 'email', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000011', '{"sub":"00000000-0000-0000-0000-000000000011","email":"maire@test.local"}',   'email', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000012', '{"sub":"00000000-0000-0000-0000-000000000012","email":"cormac@test.local"}',  'email', now(), now(), now());

-- Profiles
INSERT INTO public.profiles (id, name, headline, bio, primary_role, looking_for, experience, lat, lng, availability, open_to_equity, full_time, linkedin_verified, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Aoife Murphy',    'Full-Stack Engineer',             'Full-stack engineer (React/Node). Built 2 B2B SaaS products. Ready to co-found for the first time.',              'Developer', 'Cofounder',    'senior', 51.910, -8.468, 'Open',  true,  true,  true,  'talent'),
  ('00000000-0000-0000-0000-000000000002', 'Ciaran Walsh',    'Product Designer - UX',           'Product designer, 6 yrs. Shipped at Stripe and two startups. Obsessed with B2C UX and conversion.',               'Designer',  'Cofounder',    'senior', 51.895, -8.440, 'Busy',  true,  true,  false, 'talent'),
  ('00000000-0000-0000-0000-000000000003', 'Niamh O''Brien',  '2x Founder, 1 Exit',              '2x founder, 1 exit. Exploring fintech and insurance. Seeking a technical co-founder urgently.',                    'Founder',   'Cofounder',    'expert', 51.882, -8.490, 'Open',  true,  true,  true,  'founder'),
  ('00000000-0000-0000-0000-000000000004', 'Tadhg Brennan',   'ML Engineer - NLP',               'ML engineer at a university spin-out. NLP, computer vision. Building AI hiring tools on the side.',                'Data',      'Collaborator', 'mid',    51.902, -8.415, 'Open',  false, false, false, 'talent'),
  ('00000000-0000-0000-0000-000000000005', 'Sinead Foley',    'Growth Lead - B2B SaaS',          'Growth lead (Series A-B). Scaled Irish SaaS companies to 1M ARR. Seeking a technical co-founder.',                'Marketing', 'Cofounder',    'expert', 51.878, -8.458, 'Busy',  true,  true,  true,  'both'),
  ('00000000-0000-0000-0000-000000000006', 'Daithi Quinn',    'Mobile Dev - iOS',                'Mobile-first dev (React Native & Swift). 3 apps on the App Store. Interested in health tech.',                     'Developer', 'Hiring',       'mid',    51.916, -8.504, 'Open',  false, true,  false, 'talent'),
  ('00000000-0000-0000-0000-000000000007', 'Emma Lucey',      'Ex-CTO, Advisor',                 'Ex-CTO turned founder. Built and sold a HR-tech product. Now advising early-stage companies.',                     'Founder',   'Advisor',      'expert', 51.886, -8.423, 'Open',  true,  false, true,  'founder'),
  ('00000000-0000-0000-0000-000000000008', 'Ronan Stafford',  'Founding Engineer - AI Infra',    'Founding engineer at 3 startups. Between ventures. Deep in AI/ML infrastructure and platform engineering.',        'CTO',       'Cofounder',    'expert', 51.870, -8.510, 'Busy',  true,  true,  false, 'talent'),
  ('00000000-0000-0000-0000-000000000009', 'Fiona Casey',     'CFO - VC-backed Scaleups',        'CFO background in VC-backed scale-ups. Covers fundraising, cap tables, and investor relations.',                   'Finance',   'Cofounder',    'expert', 51.905, -8.388, 'Open',  true,  true,  true,  'both'),
  ('00000000-0000-0000-0000-000000000010', 'Padraig Lee',     'Product & Ops Lead',              'Product and ops lead. Built digital products across health, logistics, and media verticals.',                       'Ops',       'Collaborator', 'senior', 51.866, -8.442, 'Busy',  false, false, false, 'talent'),
  ('00000000-0000-0000-0000-000000000011', 'Maire Duggan',    'Brand & Product Designer',        'Brand and product designer. Helped 12 startups launch. Wants to be on a founding team from day one.',              'Designer',  'Cofounder',    'mid',    51.874, -8.396, 'Open',  true,  true,  false, 'talent'),
  ('00000000-0000-0000-0000-000000000012', 'Cormac Healy',    'Backend Architect - Go',          'Backend architect (Go, Postgres, microservices). Interested in logistics and supply chain problems.',              'Developer', 'Cofounder',    'senior', 51.922, -8.396, 'Busy',  true,  true,  true,  'talent');

-- Skills
INSERT INTO public.skills (user_id, name, level) VALUES
  ('00000000-0000-0000-0000-000000000001', 'React',       'Expert'),
  ('00000000-0000-0000-0000-000000000001', 'Node.js',     'Expert'),
  ('00000000-0000-0000-0000-000000000001', 'AWS',         'Intermediate'),
  ('00000000-0000-0000-0000-000000000002', 'Figma',       'Expert'),
  ('00000000-0000-0000-0000-000000000002', 'Branding',    'Expert'),
  ('00000000-0000-0000-0000-000000000003', 'Fundraising', 'Expert'),
  ('00000000-0000-0000-0000-000000000003', 'GTM',         'Expert'),
  ('00000000-0000-0000-0000-000000000004', 'Python',      'Expert'),
  ('00000000-0000-0000-0000-000000000004', 'PyTorch',     'Expert'),
  ('00000000-0000-0000-0000-000000000004', 'NLP',         'Intermediate'),
  ('00000000-0000-0000-0000-000000000005', 'Growth',      'Expert'),
  ('00000000-0000-0000-0000-000000000005', 'SEO',         'Expert'),
  ('00000000-0000-0000-0000-000000000006', 'Swift',       'Expert'),
  ('00000000-0000-0000-0000-000000000006', 'iOS',         'Expert'),
  ('00000000-0000-0000-0000-000000000006', 'Firebase',    'Intermediate'),
  ('00000000-0000-0000-0000-000000000007', 'Fundraising', 'Expert'),
  ('00000000-0000-0000-0000-000000000007', 'GTM',         'Intermediate'),
  ('00000000-0000-0000-0000-000000000008', 'Kubernetes',  'Expert'),
  ('00000000-0000-0000-0000-000000000008', 'Python',      'Expert'),
  ('00000000-0000-0000-0000-000000000009', 'Fundraising', 'Expert'),
  ('00000000-0000-0000-0000-000000000009', 'FP&A',        'Expert'),
  ('00000000-0000-0000-0000-000000000009', 'VC',          'Intermediate'),
  ('00000000-0000-0000-0000-000000000010', 'Agile',       'Expert'),
  ('00000000-0000-0000-0000-000000000011', 'Figma',       'Expert'),
  ('00000000-0000-0000-0000-000000000011', 'Branding',    'Intermediate'),
  ('00000000-0000-0000-0000-000000000011', 'Webflow',     'Expert'),
  ('00000000-0000-0000-0000-000000000012', 'Go',          'Expert'),
  ('00000000-0000-0000-0000-000000000012', 'Postgres',    'Expert');

-- Industry verticals (as interests)
INSERT INTO public.interests (user_id, name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'SaaS'),
  ('00000000-0000-0000-0000-000000000001', 'Health Tech'),
  ('00000000-0000-0000-0000-000000000002', 'SaaS'),
  ('00000000-0000-0000-0000-000000000002', 'Consumer'),
  ('00000000-0000-0000-0000-000000000003', 'Fintech'),
  ('00000000-0000-0000-0000-000000000003', 'Health Tech'),
  ('00000000-0000-0000-0000-000000000004', 'AI/ML'),
  ('00000000-0000-0000-0000-000000000004', 'HR Tech'),
  ('00000000-0000-0000-0000-000000000005', 'SaaS'),
  ('00000000-0000-0000-0000-000000000005', 'B2B'),
  ('00000000-0000-0000-0000-000000000006', 'Health Tech'),
  ('00000000-0000-0000-0000-000000000006', 'Consumer'),
  ('00000000-0000-0000-0000-000000000007', 'HR Tech'),
  ('00000000-0000-0000-0000-000000000007', 'SaaS'),
  ('00000000-0000-0000-0000-000000000008', 'AI/ML'),
  ('00000000-0000-0000-0000-000000000008', 'B2B'),
  ('00000000-0000-0000-0000-000000000009', 'Fintech'),
  ('00000000-0000-0000-0000-000000000009', 'SaaS'),
  ('00000000-0000-0000-0000-000000000010', 'Logistics'),
  ('00000000-0000-0000-0000-000000000010', 'Media'),
  ('00000000-0000-0000-0000-000000000011', 'Consumer'),
  ('00000000-0000-0000-0000-000000000011', 'EdTech'),
  ('00000000-0000-0000-0000-000000000012', 'Logistics'),
  ('00000000-0000-0000-0000-000000000012', 'B2B');
