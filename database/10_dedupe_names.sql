-- DHANSETU v1.2 -- name deduplication.
-- Hand-written. Run AFTER 02_load.sql (needs enterprises populated). Safe to
-- re-run (every UPDATE targets a fixed enterprise_id with a fixed value).
--
-- The name generator (data/dhansetu_v1_2/src/simulate.py) draws
-- first-name/surname pairs WITH replacement from a small per-language pool
-- (6-8 first names x 6 surnames), independently for each of the ~42
-- enterprises per district -- collisions are near-guaranteed by birthday-
-- paradox math, not a generator bug. Before this file: 252 enterprises had
-- only 212 distinct proprietor_name values and 119 distinct business_name
-- values, including one of the 6 named demo personas (Sunita Devi, ENT0067)
-- colliding with an unrelated enterprise (ENT0213) in the same district.
--
-- Fix: for every duplicate group, the named persona (if any, else the
-- lowest enterprise_id) keeps its name; every other member is renamed.
-- Replacement proprietor names are redrawn from the SAME language+gender
-- pool the generator uses, rejecting anything still colliding, so they
-- read as generated data, not an inserted patch. Replacement business
-- names append the enterprise's block ("Shree Dairy" ->
-- "Shree Dairy -- Anand East"); the ~14 pairs where block alone still
-- collided (same generic name AND same block) get a further "(2)"/"(3)"
-- numeric suffix. See KPIS.md/STORY.md for why this mattered: a name
-- collision between a demo persona and a random panel member is exactly
-- the kind of thing that confuses a live walkthrough.

SET search_path TO dhansetu, public;
BEGIN;
UPDATE enterprises SET proprietor_name = 'Mridula Bora' WHERE enterprise_id = 'ENT0221';
UPDATE enterprises SET proprietor_name = 'Shubhangi Patil' WHERE enterprise_id = 'ENT0023';
UPDATE enterprises SET proprietor_name = 'Suresh Goud' WHERE enterprise_id = 'ENT0059';
UPDATE enterprises SET proprietor_name = 'Venkatesh Naidu' WHERE enterprise_id = 'ENT0222';
UPDATE enterprises SET proprietor_name = 'Kalpana Kulkarni' WHERE enterprise_id = 'ENT0035';
UPDATE enterprises SET proprietor_name = 'Sushma Kulkarni' WHERE enterprise_id = 'ENT0091';
UPDATE enterprises SET proprietor_name = 'Sushma Jadhav' WHERE enterprise_id = 'ENT0168';
UPDATE enterprises SET proprietor_name = 'Archana Shinde' WHERE enterprise_id = 'ENT0192';
UPDATE enterprises SET proprietor_name = 'Manisha Kulkarni' WHERE enterprise_id = 'ENT0061';
UPDATE enterprises SET proprietor_name = 'Bornali Das' WHERE enterprise_id = 'ENT0161';
UPDATE enterprises SET proprietor_name = 'Bhavnaben Desai' WHERE enterprise_id = 'ENT0147';
UPDATE enterprises SET proprietor_name = 'Namita Patra' WHERE enterprise_id = 'ENT0034';
UPDATE enterprises SET proprietor_name = 'Bhupen Das' WHERE enterprise_id = 'ENT0225';
UPDATE enterprises SET proprietor_name = 'Meera Meena' WHERE enterprise_id = 'ENT0229';
UPDATE enterprises SET proprietor_name = 'Manisha Shinde' WHERE enterprise_id = 'ENT0239';
UPDATE enterprises SET proprietor_name = 'Nilima Hazarika' WHERE enterprise_id = 'ENT0053';
UPDATE enterprises SET proprietor_name = 'Anjali Bora' WHERE enterprise_id = 'ENT0111';
UPDATE enterprises SET proprietor_name = 'Bipin Patra' WHERE enterprise_id = 'ENT0140';
UPDATE enterprises SET proprietor_name = 'Mridula Hazarika' WHERE enterprise_id = 'ENT0064';
UPDATE enterprises SET proprietor_name = 'Sunita Sharma' WHERE enterprise_id = 'ENT0213';
UPDATE enterprises SET proprietor_name = 'Srinivas Goud' WHERE enterprise_id = 'ENT0178';
UPDATE enterprises SET proprietor_name = 'Ramulu Goud' WHERE enterprise_id = 'ENT0252';
UPDATE enterprises SET proprietor_name = 'Lakshmi Reddy' WHERE enterprise_id = 'ENT0216';
UPDATE enterprises SET proprietor_name = 'Narayana Mudiraj' WHERE enterprise_id = 'ENT0114';
UPDATE enterprises SET proprietor_name = 'Kiritbhai Patel' WHERE enterprise_id = 'ENT0218';
UPDATE enterprises SET proprietor_name = 'Rohini Jadhav' WHERE enterprise_id = 'ENT0119';
UPDATE enterprises SET proprietor_name = 'Anita Kulkarni' WHERE enterprise_id = 'ENT0189';
UPDATE enterprises SET proprietor_name = 'Anjali Pradhan' WHERE enterprise_id = 'ENT0136';
UPDATE enterprises SET proprietor_name = 'Kailash Kumhar' WHERE enterprise_id = 'ENT0208';
UPDATE enterprises SET proprietor_name = 'Anjaneyulu Mudiraj' WHERE enterprise_id = 'ENT0165';
UPDATE enterprises SET proprietor_name = 'Anjali Saikia' WHERE enterprise_id = 'ENT0240';
UPDATE enterprises SET proprietor_name = 'Rekhaben Chaudhari' WHERE enterprise_id = 'ENT0144';
UPDATE enterprises SET proprietor_name = 'Venkatesh Rao' WHERE enterprise_id = 'ENT0231';
UPDATE enterprises SET proprietor_name = 'Anjali Nath' WHERE enterprise_id = 'ENT0149';
UPDATE enterprises SET proprietor_name = 'Dakshaben Solanki' WHERE enterprise_id = 'ENT0210';
UPDATE enterprises SET proprietor_name = 'Radha Sharma' WHERE enterprise_id = 'ENT0176';
UPDATE enterprises SET proprietor_name = 'Nitin Jadhav' WHERE enterprise_id = 'ENT0238';
UPDATE enterprises SET proprietor_name = 'Rameshbhai Vaghela' WHERE enterprise_id = 'ENT0251';
UPDATE enterprises SET proprietor_name = 'Pushpa Devi' WHERE enterprise_id = 'ENT0212';
UPDATE enterprises SET proprietor_name = 'Rekhaben Desai' WHERE enterprise_id = 'ENT0206';
UPDATE enterprises SET business_name = 'Jai Gopal Dairy — Anand East' WHERE enterprise_id = 'ENT0030';
UPDATE enterprises SET business_name = 'Jai Gopal Dairy — Anand South' WHERE enterprise_id = 'ENT0144';
UPDATE enterprises SET business_name = 'Jai Gopal Dairy — Anand South (2)' WHERE enterprise_id = 'ENT0206';
UPDATE enterprises SET business_name = 'Jai Gopal Dairy — Ganjam East' WHERE enterprise_id = 'ENT0223';
UPDATE enterprises SET business_name = 'Shree Annapurna Unit — Ganjam Rural' WHERE enterprise_id = 'ENT0043';
UPDATE enterprises SET business_name = 'Shree Annapurna Unit — Kolhapur East' WHERE enterprise_id = 'ENT0090';
UPDATE enterprises SET business_name = 'Shree Annapurna Unit — Nizamabad East' WHERE enterprise_id = 'ENT0123';
UPDATE enterprises SET business_name = 'Shree Annapurna Unit — Kolhapur Rural' WHERE enterprise_id = 'ENT0158';
UPDATE enterprises SET business_name = 'Sri Krishi FPO — Nizamabad South' WHERE enterprise_id = 'ENT0059';
UPDATE enterprises SET business_name = 'Sri Krishi FPO — Nagaon Rural' WHERE enterprise_id = 'ENT0129';
UPDATE enterprises SET business_name = 'Sri Krishi FPO — Kolhapur Rural' WHERE enterprise_id = 'ENT0169';
UPDATE enterprises SET business_name = 'Sri Krishi FPO — Nagaon Rural (2)' WHERE enterprise_id = 'ENT0221';
UPDATE enterprises SET business_name = 'Sri Krishi FPO — Nizamabad South (2)' WHERE enterprise_id = 'ENT0242';
UPDATE enterprises SET business_name = 'Shree Taant Ghar — Nagaon Rural' WHERE enterprise_id = 'ENT0076';
UPDATE enterprises SET business_name = 'Shree Taant Ghar — Ganjam North' WHERE enterprise_id = 'ENT0135';
UPDATE enterprises SET business_name = 'Shree Taant Ghar — Bhilwara East' WHERE enterprise_id = 'ENT0166';
UPDATE enterprises SET business_name = 'Shree Gopal Dairy — Anand East' WHERE enterprise_id = 'ENT0121';
UPDATE enterprises SET business_name = 'Nav Vegetable Cart — Kolhapur East' WHERE enterprise_id = 'ENT0029';
UPDATE enterprises SET business_name = 'Nav Vegetable Cart — Kolhapur East (2)' WHERE enterprise_id = 'ENT0060';
UPDATE enterprises SET business_name = 'Nav Vegetable Cart — Bhilwara West' WHERE enterprise_id = 'ENT0176';
UPDATE enterprises SET business_name = 'Sri Sabzi Stall — Kolhapur West' WHERE enterprise_id = 'ENT0023';
UPDATE enterprises SET business_name = 'Sri Sabzi Stall — Kolhapur South' WHERE enterprise_id = 'ENT0099';
UPDATE enterprises SET business_name = 'Sri Sabzi Stall — Bhilwara South' WHERE enterprise_id = 'ENT0153';
UPDATE enterprises SET business_name = 'Sri Sabzi Stall — Anand East' WHERE enterprise_id = 'ENT0210';
UPDATE enterprises SET business_name = 'Shree Krishi FPO — Anand East' WHERE enterprise_id = 'ENT0251';
UPDATE enterprises SET business_name = 'Nav Fresh Greens — Nagaon North' WHERE enterprise_id = 'ENT0228';
UPDATE enterprises SET business_name = 'Maa Annapurna Unit — Anand Rural' WHERE enterprise_id = 'ENT0058';
UPDATE enterprises SET business_name = 'Nav Weavers Unit — Nagaon East' WHERE enterprise_id = 'ENT0105';
UPDATE enterprises SET business_name = 'Shree Murgi Palan — Ganjam West' WHERE enterprise_id = 'ENT0075';
UPDATE enterprises SET business_name = 'Maa General Stores — Ganjam North' WHERE enterprise_id = 'ENT0027';
UPDATE enterprises SET business_name = 'Maa General Stores — Ganjam South' WHERE enterprise_id = 'ENT0032';
UPDATE enterprises SET business_name = 'Maa General Stores — Anand West' WHERE enterprise_id = 'ENT0092';
UPDATE enterprises SET business_name = 'Maa General Stores — Anand Rural' WHERE enterprise_id = 'ENT0183';
UPDATE enterprises SET business_name = 'Jai Poultry Farm — Nizamabad West' WHERE enterprise_id = 'ENT0232';
UPDATE enterprises SET business_name = 'Maa Farmer Producer Co — Nizamabad Rural' WHERE enterprise_id = 'ENT0127';
UPDATE enterprises SET business_name = 'Maa Farmer Producer Co — Nizamabad North' WHERE enterprise_id = 'ENT0216';
UPDATE enterprises SET business_name = 'Maa Taant Ghar — Bhilwara North' WHERE enterprise_id = 'ENT0214';
UPDATE enterprises SET business_name = 'Shree Dairy — Bhilwara East' WHERE enterprise_id = 'ENT0028';
UPDATE enterprises SET business_name = 'Shree Dairy — Kolhapur North' WHERE enterprise_id = 'ENT0081';
UPDATE enterprises SET business_name = 'Shree Dairy — Kolhapur West' WHERE enterprise_id = 'ENT0115';
UPDATE enterprises SET business_name = 'Shree Dairy — Anand East' WHERE enterprise_id = 'ENT0186';
UPDATE enterprises SET business_name = 'Jai Murgi Palan — Nagaon South' WHERE enterprise_id = 'ENT0064';
UPDATE enterprises SET business_name = 'Jai Murgi Palan — Nizamabad South' WHERE enterprise_id = 'ENT0131';
UPDATE enterprises SET business_name = 'Jai Murgi Palan — Nizamabad West' WHERE enterprise_id = 'ENT0195';
UPDATE enterprises SET business_name = 'Jai Murgi Palan — Ganjam Rural' WHERE enterprise_id = 'ENT0203';
UPDATE enterprises SET business_name = 'Sri Provision Store — Anand Rural' WHERE enterprise_id = 'ENT0128';
UPDATE enterprises SET business_name = 'Sri Provision Store — Ganjam North' WHERE enterprise_id = 'ENT0201';
UPDATE enterprises SET business_name = 'Shree Swasahayata Foods — Ganjam East' WHERE enterprise_id = 'ENT0034';
UPDATE enterprises SET business_name = 'Shree Swasahayata Foods — Ganjam East (2)' WHERE enterprise_id = 'ENT0207';
UPDATE enterprises SET business_name = 'Shree Swasahayata Foods — Bhilwara West' WHERE enterprise_id = 'ENT0229';
UPDATE enterprises SET business_name = 'Maa Handloom — Bhilwara West' WHERE enterprise_id = 'ENT0194';
UPDATE enterprises SET business_name = 'Maa Gopal Dairy — Kolhapur North' WHERE enterprise_id = 'ENT0095';
UPDATE enterprises SET business_name = 'Maa Gopal Dairy — Anand West' WHERE enterprise_id = 'ENT0198';
UPDATE enterprises SET business_name = 'Jai Handloom — Bhilwara Rural' WHERE enterprise_id = 'ENT0122';
UPDATE enterprises SET business_name = 'Jai Mahila SHG Foods — Nizamabad North' WHERE enterprise_id = 'ENT0073';
UPDATE enterprises SET business_name = 'Sri Dudh Utpadak — Kolhapur West' WHERE enterprise_id = 'ENT0054';
UPDATE enterprises SET business_name = 'Sri Dudh Utpadak — Anand East' WHERE enterprise_id = 'ENT0184';
UPDATE enterprises SET business_name = 'Sri Dudh Utpadak — Nizamabad South' WHERE enterprise_id = 'ENT0235';
UPDATE enterprises SET business_name = 'Maa Dairy — Kolhapur West' WHERE enterprise_id = 'ENT0082';
UPDATE enterprises SET business_name = 'Maa Dairy — Anand North' WHERE enterprise_id = 'ENT0086';
UPDATE enterprises SET business_name = 'Maa Dairy — Kolhapur South' WHERE enterprise_id = 'ENT0162';
UPDATE enterprises SET business_name = 'Nav Poultry Farm — Nizamabad Rural' WHERE enterprise_id = 'ENT0178';
UPDATE enterprises SET business_name = 'Nav Kirana Store — Ganjam North' WHERE enterprise_id = 'ENT0068';
UPDATE enterprises SET business_name = 'Nav Kirana Store — Nizamabad Rural' WHERE enterprise_id = 'ENT0139';
UPDATE enterprises SET business_name = 'Nav Kirana Store — Kolhapur Rural' WHERE enterprise_id = 'ENT0234';
UPDATE enterprises SET business_name = 'Shree General Stores — Anand South' WHERE enterprise_id = 'ENT0056';
UPDATE enterprises SET business_name = 'Shree General Stores — Bhilwara Rural' WHERE enterprise_id = 'ENT0071';
UPDATE enterprises SET business_name = 'Shree General Stores — Kolhapur East' WHERE enterprise_id = 'ENT0154';
UPDATE enterprises SET business_name = 'Shree General Stores — Nagaon South' WHERE enterprise_id = 'ENT0171';
UPDATE enterprises SET business_name = 'Maa Silai Kendra — Bhilwara North' WHERE enterprise_id = 'ENT0079';
UPDATE enterprises SET business_name = 'Nav Handloom — Nagaon North' WHERE enterprise_id = 'ENT0077';
UPDATE enterprises SET business_name = 'Nav Agri Producer Co — Nagaon North' WHERE enterprise_id = 'ENT0070';
UPDATE enterprises SET business_name = 'Nav Agri Producer Co — Anand East' WHERE enterprise_id = 'ENT0109';
UPDATE enterprises SET business_name = 'Nav Agri Producer Co — Ganjam West' WHERE enterprise_id = 'ENT0117';
UPDATE enterprises SET business_name = 'Nav Agri Producer Co — Nizamabad Rural' WHERE enterprise_id = 'ENT0157';
UPDATE enterprises SET business_name = 'Shree Dudh Utpadak — Anand North' WHERE enterprise_id = 'ENT0066';
UPDATE enterprises SET business_name = 'Shree Dudh Utpadak — Ganjam East' WHERE enterprise_id = 'ENT0136';
UPDATE enterprises SET business_name = 'Maa Tailors — Nagaon West' WHERE enterprise_id = 'ENT0111';
UPDATE enterprises SET business_name = 'Shree Kirana Store — Nizamabad Rural' WHERE enterprise_id = 'ENT0165';
UPDATE enterprises SET business_name = 'Shree Kirana Store — Bhilwara North' WHERE enterprise_id = 'ENT0185';
UPDATE enterprises SET business_name = 'Jai Dudh Utpadak — Kolhapur West' WHERE enterprise_id = 'ENT0189';
UPDATE enterprises SET business_name = 'Jai Vegetable Cart — Nizamabad East' WHERE enterprise_id = 'ENT0114';
UPDATE enterprises SET business_name = 'Jai Vegetable Cart — Bhilwara East' WHERE enterprise_id = 'ENT0116';
UPDATE enterprises SET business_name = 'Jai Vegetable Cart — Nagaon Rural' WHERE enterprise_id = 'ENT0149';
UPDATE enterprises SET business_name = 'Jai Taant Ghar — Nizamabad South' WHERE enterprise_id = 'ENT0120';
UPDATE enterprises SET business_name = 'Jai Taant Ghar — Anand East' WHERE enterprise_id = 'ENT0147';
UPDATE enterprises SET business_name = 'Jai Taant Ghar — Nagaon North' WHERE enterprise_id = 'ENT0196';
UPDATE enterprises SET business_name = 'Jai Taant Ghar — Bhilwara West' WHERE enterprise_id = 'ENT0226';
UPDATE enterprises SET business_name = 'Jai Dairy — Bhilwara North' WHERE enterprise_id = 'ENT0089';
UPDATE enterprises SET business_name = 'Jai Dairy — Bhilwara East' WHERE enterprise_id = 'ENT0137';
UPDATE enterprises SET business_name = 'Jai Dairy — Anand West' WHERE enterprise_id = 'ENT0199';
UPDATE enterprises SET business_name = 'Jai Krishi FPO — Anand North' WHERE enterprise_id = 'ENT0219';
UPDATE enterprises SET business_name = 'Maa Murgi Palan — Kolhapur West' WHERE enterprise_id = 'ENT0209';
UPDATE enterprises SET business_name = 'Maa Murgi Palan — Nizamabad West' WHERE enterprise_id = 'ENT0252';
UPDATE enterprises SET business_name = 'Nav Dairy — Kolhapur Rural' WHERE enterprise_id = 'ENT0192';
UPDATE enterprises SET business_name = 'Nav Dairy — Anand South' WHERE enterprise_id = 'ENT0205';
UPDATE enterprises SET business_name = 'Nav Dudh Utpadak — Nizamabad South' WHERE enterprise_id = 'ENT0108';
UPDATE enterprises SET business_name = 'Nav Dudh Utpadak — Anand West' WHERE enterprise_id = 'ENT0124';
UPDATE enterprises SET business_name = 'Shree Vegetable Cart — Anand South' WHERE enterprise_id = 'ENT0187';
UPDATE enterprises SET business_name = 'Jai Kirana Store — Ganjam East' WHERE enterprise_id = 'ENT0191';
UPDATE enterprises SET business_name = 'Jai Kirana Store — Anand North' WHERE enterprise_id = 'ENT0197';
UPDATE enterprises SET business_name = 'Jai Agri Producer Co — Kolhapur Rural' WHERE enterprise_id = 'ENT0193';
UPDATE enterprises SET business_name = 'Jai Agri Producer Co — Ganjam North' WHERE enterprise_id = 'ENT0220';
UPDATE enterprises SET business_name = 'Sri Kirana Store — Ganjam Rural' WHERE enterprise_id = 'ENT0103';
UPDATE enterprises SET business_name = 'Sri Kirana Store — Kolhapur Rural' WHERE enterprise_id = 'ENT0112';
UPDATE enterprises SET business_name = 'Sri Kirana Store — Nagaon East' WHERE enterprise_id = 'ENT0240';
UPDATE enterprises SET business_name = 'Maa Mahila SHG Foods — Nagaon West' WHERE enterprise_id = 'ENT0134';
UPDATE enterprises SET business_name = 'Maa Mahila SHG Foods — Nagaon North' WHERE enterprise_id = 'ENT0160';
UPDATE enterprises SET business_name = 'Nav Terracotta Unit — Bhilwara East' WHERE enterprise_id = 'ENT0163';
UPDATE enterprises SET business_name = 'Nav Terracotta Unit — Ganjam North' WHERE enterprise_id = 'ENT0172';
UPDATE enterprises SET business_name = 'Nav Terracotta Unit — Ganjam North (2)' WHERE enterprise_id = 'ENT0245';
UPDATE enterprises SET business_name = 'Jai General Stores — Bhilwara Rural' WHERE enterprise_id = 'ENT0132';
UPDATE enterprises SET business_name = 'Jai General Stores — Nagaon West' WHERE enterprise_id = 'ENT0225';
UPDATE enterprises SET business_name = 'Sri Dairy — Kolhapur South' WHERE enterprise_id = 'ENT0239';
UPDATE enterprises SET business_name = 'Sri Dairy — Anand Rural' WHERE enterprise_id = 'ENT0243';
UPDATE enterprises SET business_name = 'Nav Broiler Unit — Ganjam East' WHERE enterprise_id = 'ENT0237';
UPDATE enterprises SET business_name = 'Nav Murgi Palan — Nizamabad West' WHERE enterprise_id = 'ENT0130';
UPDATE enterprises SET business_name = 'Nav Pottery Works — Ganjam East' WHERE enterprise_id = 'ENT0143';
UPDATE enterprises SET business_name = 'Jai Weavers Unit — Bhilwara West' WHERE enterprise_id = 'ENT0159';
UPDATE enterprises SET business_name = 'Shree Mahila SHG Foods — Anand West' WHERE enterprise_id = 'ENT0179';
UPDATE enterprises SET business_name = 'Nav General Stores — Bhilwara West' WHERE enterprise_id = 'ENT0208';
UPDATE enterprises SET business_name = 'Nav General Stores — Kolhapur East' WHERE enterprise_id = 'ENT0238';
UPDATE enterprises SET business_name = 'Maa Swasahayata Foods — Nagaon South' WHERE enterprise_id = 'ENT0161';
UPDATE enterprises SET business_name = 'Maa Swasahayata Foods — Anand East' WHERE enterprise_id = 'ENT0218';
UPDATE enterprises SET business_name = 'Maa Krishi FPO — Bhilwara West' WHERE enterprise_id = 'ENT0212';
UPDATE enterprises SET business_name = 'Maa Krishi FPO — Kolhapur North' WHERE enterprise_id = 'ENT0236';
UPDATE enterprises SET business_name = 'Maa Sabzi Stall — Ganjam Rural' WHERE enterprise_id = 'ENT0204';
UPDATE enterprises SET business_name = 'Maa Dudh Utpadak — Bhilwara Rural' WHERE enterprise_id = 'ENT0182';
UPDATE enterprises SET business_name = 'Maa Poultry Farm — Anand Rural' WHERE enterprise_id = 'ENT0177';
UPDATE enterprises SET business_name = 'Maa Poultry Farm — Nizamabad North' WHERE enterprise_id = 'ENT0202';
UPDATE enterprises SET business_name = 'Sri Weavers Unit — Ganjam North' WHERE enterprise_id = 'ENT0200';
UPDATE enterprises SET business_name = 'Sri Weavers Unit — Nizamabad North' WHERE enterprise_id = 'ENT0222';
UPDATE enterprises SET business_name = 'Sri Broiler Unit — Nizamabad East' WHERE enterprise_id = 'ENT0244';
COMMIT;
