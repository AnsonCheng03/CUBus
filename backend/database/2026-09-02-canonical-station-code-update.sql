-- Combined CU Bus station/building update effective 2026-09-02.
-- This single migration contains the canonical station-code cleanup followed
-- by the official CUHK building-code cleanup and recent-building additions.
-- Run after the already-applied
-- 2026-09-01 station-search migration.
--
-- Canonical station codes:
--   邵逸夫堂       -> SRR
--   港鐵大學站     -> MTR
--   伍宜孫書院     -> WYS
--   三、四苑       -> RESI34
--
-- The official CUHK abbreviation sources use the following building codes:
--   CWC, KHB, CML, NA TT, SC, USC, TYW LT, and YIA.
-- Duplicate local aliases are merged into CCT, SWC LT, UG, and YIA.
-- SRR and MTR are intentionally preserved as the user-approved canonical
-- codes for 邵逸夫堂 and 港鐵大學站.

SET NAMES utf8mb4;
START TRANSACTION;

-- ========================================================================
-- Part 1: canonical station-code cleanup
-- ========================================================================

-- Normalize the University station label before removing its duplicate codes.
UPDATE `translatebuilding`
SET `中文` = '港鐵大學站'
WHERE `Code` IN ('MTR', 'CUMTR', 'UNIMTR')
  AND `中文` = '港鐵東鐵線大學站';

UPDATE `translateroute`
SET `中文` = '港鐵大學站'
WHERE `Code` = 'MTR'
  AND `中文` = '港鐵東鐵線大學站';

-- Keep the precise existing University bus-stop point under the canonical
-- MTR code before moving foreign-key references.
INSERT INTO `gps`
  (`Location`, `Lat`, `Lng`, `ImportantStation`)
VALUES
  ('MTR', 22.414523, 114.210223, '1')
ON DUPLICATE KEY UPDATE
  `Lat` = VALUES(`Lat`),
  `Lng` = VALUES(`Lng`),
  `ImportantStation` = VALUES(`ImportantStation`);

-- The already-applied 2026-09-01 snapshot uses MTR in RouteStops,
-- StopTime, groupedStation, and station.最近之車站. CUMTR and UNIMTR occur
-- only as building-code aliases in that snapshot, so those GPS-backed
-- references require no rewrite.

-- Create the canonical building parent before renaming the existing
-- 邵逸夫堂 building rows. This preserves their nearest-station mappings.
INSERT INTO `translatebuilding`
  (`Code`, `Append to js?`, `中文`, `ENG`)
VALUES
  ('SRR', '', '邵逸夫堂', 'Sir Run Run Shaw Hall')
ON DUPLICATE KEY UPDATE
  `Append to js?` = VALUES(`Append to js?`),
  `中文` = VALUES(`中文`),
  `ENG` = VALUES(`ENG`);

UPDATE `station`
SET `建築物` = 'SRR'
WHERE `建築物` = 'SHAWHALL';

-- Ensure the canonical building parent exists before renaming any University
-- Station building rows. This also allows the migration to repair a database
-- where the older CUMTR-only version removed the MTR parent.
INSERT INTO `translatebuilding`
  (`Code`, `Append to js?`, `中文`, `ENG`)
VALUES
  ('MTR', '', '港鐵大學站', 'University Station')
ON DUPLICATE KEY UPDATE
  `Append to js?` = VALUES(`Append to js?`),
  `中文` = VALUES(`中文`),
  `ENG` = VALUES(`ENG`);

-- Remove duplicate University Station building-code rows before restoring
-- MTR as the canonical building code. The post-2026-09-01 state contains
-- duplicate MTR/CUMTR/UNIMTR pairs, while this pair-based cleanup also keeps
-- any non-duplicate CUMTR row if the older CUMTR-only version was used.
DELETE `old`
FROM `station` AS `old`
JOIN `station` AS `canonical`
  ON `canonical`.`建築物` = 'MTR'
 AND `canonical`.`最近之車站` <=> `old`.`最近之車站`
WHERE `old`.`建築物` IN ('CUMTR', 'UNIMTR');

DELETE `old`
FROM `station` AS `old`
JOIN `station` AS `keep`
  ON `keep`.`建築物` = 'CUMTR'
 AND `keep`.`最近之車站` <=> `old`.`最近之車站`
WHERE `old`.`建築物` = 'UNIMTR';

UPDATE `station`
SET `建築物` = 'MTR'
WHERE `建築物` = 'CUMTR';

DELETE FROM `translatebuilding`
WHERE `Code` IN ('CUMTR', 'UNIMTR', 'SHAWHALL');

-- Keep only the canonical MTR route translation. SRR already exists.
DELETE FROM `translateroute`
WHERE `Code` IN ('CUMTR', 'UNIMTR', 'SHAWHALL');

INSERT INTO `translateroute`
  (`Code`, `Append to js?`, `中文`, `ENG`)
VALUES
  ('MTR', '', '港鐵大學站', 'University Station')
ON DUPLICATE KEY UPDATE
  `Append to js?` = VALUES(`Append to js?`),
  `中文` = VALUES(`中文`),
  `ENG` = VALUES(`ENG`);

-- The already-applied 2026-09-01 migration moved SHAWHALL route references
-- to SRR, and the University aliases have no GPS-backed references. The old
-- alias GPS rows can therefore be removed safely.
DELETE FROM `gps`
WHERE `Location` IN ('CUMTR', 'UNIMTR', 'SHAWHALL');

-- Residence-code cleanup: 伍宜孫書院 -> WYS; RESI34 remains 三、四苑.
INSERT INTO `gps`
  (`Location`, `Lat`, `Lng`, `ImportantStation`)
VALUES
  ('WYS', 22.421094, 114.203502, NULL)
ON DUPLICATE KEY UPDATE
  `Lat` = VALUES(`Lat`),
  `Lng` = VALUES(`Lng`);

INSERT INTO `gps`
  (`Location`, `Lat`, `Lng`, `ImportantStation`)
VALUES
  ('RESI34', 22.421094, 114.203502, NULL)
ON DUPLICATE KEY UPDATE
  `Lat` = VALUES(`Lat`),
  `Lng` = VALUES(`Lng`);

UPDATE `RouteStops`
SET `Location` = 'WYS'
WHERE `Location` = 'RESI34';

UPDATE `StopTime`
SET `StartLocation` = 'WYS'
WHERE `StartLocation` = 'RESI34';

UPDATE `StopTime`
SET `EndLocation` = 'WYS'
WHERE `EndLocation` = 'RESI34';

UPDATE `groupedStation`
SET `Station` = 'WYS'
WHERE `Station` = 'RESI34';

UPDATE `station`
SET `最近之車站` = 'WYS'
WHERE `最近之車站` = 'RESI34';

INSERT INTO `translatebuilding`
  (`Code`, `Append to js?`, `中文`, `ENG`)
VALUES
  ('WYS', '', '伍宜孫書院', 'Wu Yee Sun College')
ON DUPLICATE KEY UPDATE
  `Append to js?` = VALUES(`Append to js?`),
  `中文` = VALUES(`中文`),
  `ENG` = VALUES(`ENG`);

INSERT INTO `translatebuilding`
  (`Code`, `Append to js?`, `中文`, `ENG`)
VALUES
  ('RESI34', '', '三、四苑', 'Residences No. 3 & 4')
ON DUPLICATE KEY UPDATE
  `Append to js?` = VALUES(`Append to js?`),
  `中文` = VALUES(`中文`),
  `ENG` = VALUES(`ENG`);

INSERT INTO `translateroute`
  (`Code`, `Append to js?`, `中文`, `ENG`)
VALUES
  ('WYS', '', '伍宜孫書院', 'Wu Yee Sun College')
ON DUPLICATE KEY UPDATE
  `Append to js?` = VALUES(`Append to js?`),
  `中文` = VALUES(`中文`),
  `ENG` = VALUES(`ENG`);

DELETE FROM `translateroute`
WHERE `Code` = 'RESI34';

-- ========================================================================
-- Part 2: official building-code cleanup
-- ========================================================================

-- Create the official building parents before changing station.建築物.
INSERT INTO `translatebuilding`
  (`Code`, `Append to js?`, `中文`, `ENG`)
VALUES
  ('CWC', '', '敬文書院', 'C.W. Chu College'),
  ('KHB', '', '馮景禧樓', 'Fung King Hey Building'),
  ('CML', '', '錢穆圖書館', 'Ch\'ien Mu Library'),
  ('NA TT', '', '新亞書院乒乓球室', 'Table Tennis Room, New Asia College'),
  ('SC', '', '科學館', 'Science Centre'),
  ('USC', '', '大學體育中心', 'University Sports Centre'),
  ('TYW LT', '', '王統元堂', 'T.Y. Wong Hall'),
  ('YIA', '', '康本國際學術園 / 七小龍', 'Yasumoto International Academic Park / Seven Dragons'),
  ('CCT', '', '神學樓', 'Theology Building'),
  ('SWC LT', '', '大講堂', 'Lecture Theatre, Shaw College'),
  ('UG', '', '大學體育館', 'University Gymnasium')
ON DUPLICATE KEY UPDATE
  `Append to js?` = VALUES(`Append to js?`),
  `中文` = VALUES(`中文`),
  `ENG` = VALUES(`ENG`);

-- Copy each old GPS point to its official code. The three duplicate aliases
-- below already have the same coordinates as their canonical GPS rows.
INSERT INTO `gps`
  (`Location`, `Lat`, `Lng`, `ImportantStation`)
SELECT 'CWC', `Lat`, `Lng`, `ImportantStation` FROM `gps` WHERE `Location` = 'CWCC'
UNION ALL
SELECT 'KHB', `Lat`, `Lng`, `ImportantStation` FROM `gps` WHERE `Location` = 'FKHB'
UNION ALL
SELECT 'CML', `Lat`, `Lng`, `ImportantStation` FROM `gps` WHERE `Location` = 'NALIB'
UNION ALL
SELECT 'NA TT', `Lat`, `Lng`, `ImportantStation` FROM `gps` WHERE `Location` = 'NATT'
UNION ALL
SELECT 'SC', `Lat`, `Lng`, `ImportantStation` FROM `gps` WHERE `Location` = 'SCIC'
UNION ALL
SELECT 'USC', `Lat`, `Lng`, `ImportantStation` FROM `gps` WHERE `Location` = 'SPORTC'
UNION ALL
SELECT 'TYW LT', `Lat`, `Lng`, `ImportantStation` FROM `gps` WHERE `Location` = 'WTY'
UNION ALL
SELECT 'YIA', `Lat`, `Lng`, `ImportantStation` FROM `gps` WHERE `Location` = 'YIAP'
ON DUPLICATE KEY UPDATE
  `Lat` = VALUES(`Lat`),
  `Lng` = VALUES(`Lng`),
  `ImportantStation` = VALUES(`ImportantStation`);

-- Preserve route translations while the GPS foreign keys still exist.
INSERT INTO `translateroute`
  (`Code`, `Append to js?`, `中文`, `ENG`)
SELECT 'CWC', `Append to js?`, `中文`, `ENG` FROM `translateroute` WHERE `Code` = 'CWCC'
UNION ALL
SELECT 'KHB', `Append to js?`, `中文`, `ENG` FROM `translateroute` WHERE `Code` = 'FKHB'
UNION ALL
SELECT 'SC', `Append to js?`, `中文`, `ENG` FROM `translateroute` WHERE `Code` = 'SCIC'
UNION ALL
SELECT 'USC', `Append to js?`, `中文`, `ENG` FROM `translateroute` WHERE `Code` = 'SPORTC'
UNION ALL
SELECT 'YIA', `Append to js?`, `中文`, `ENG` FROM `translateroute` WHERE `Code` = 'YIAP'
ON DUPLICATE KEY UPDATE
  `Append to js?` = VALUES(`Append to js?`),
  `中文` = VALUES(`中文`),
  `ENG` = VALUES(`ENG`);

-- The 2026-09-01 direct-station pass contains duplicate mappings for the
-- aliases that are being merged below. Remove only those alias rows first;
-- the canonical target rows remain, so the unique key on
-- (建築物, 最近之車站) cannot be violated by the rename.
DELETE FROM `station`
WHERE `ID` IN (7, 54, 133, 344, 469, 470, 471, 491, 681, 682, 683, 684, 791, 792)
  AND `建築物` IN ('YIAE', 'UGYM', 'SCLT', 'CCTB');

-- Rename building-search values. The target parents above make this safe
-- with the station_fk_building foreign key.
UPDATE `station`
SET `建築物` = CASE `建築物`
  WHEN 'CWCC' THEN 'CWC'
  WHEN 'FKHB' THEN 'KHB'
  WHEN 'NALIB' THEN 'CML'
  WHEN 'NATT' THEN 'NA TT'
  WHEN 'SCIC' THEN 'SC'
  WHEN 'SPORTC' THEN 'USC'
  WHEN 'WTY' THEN 'TYW LT'
  WHEN 'YIAP' THEN 'YIA'
  WHEN 'YIAE' THEN 'YIA'
  WHEN 'CCTB' THEN 'CCT'
  WHEN 'SCLT' THEN 'SWC LT'
  WHEN 'UGYM' THEN 'UG'
  ELSE `建築物`
END
WHERE `建築物` IN ('CWCC', 'FKHB', 'NALIB', 'NATT', 'SCIC', 'SPORTC', 'WTY', 'YIAP', 'YIAE', 'CCTB', 'SCLT', 'UGYM');

-- Rename all GPS-backed references. This covers RouteStops, StopTime,
-- groupedStation, and station.最近之車站; it also handles YIAE if a later
-- database snapshot has used that alias as a nearest station.
UPDATE `RouteStops`
SET `Location` = CASE `Location`
  WHEN 'CWCC' THEN 'CWC'
  WHEN 'FKHB' THEN 'KHB'
  WHEN 'NALIB' THEN 'CML'
  WHEN 'NATT' THEN 'NA TT'
  WHEN 'SCIC' THEN 'SC'
  WHEN 'SPORTC' THEN 'USC'
  WHEN 'WTY' THEN 'TYW LT'
  WHEN 'YIAP' THEN 'YIA'
  WHEN 'YIAE' THEN 'YIA'
  WHEN 'CCTB' THEN 'CCT'
  WHEN 'SCLT' THEN 'SWC LT'
  WHEN 'UGYM' THEN 'UG'
  ELSE `Location`
END
WHERE `Location` IN ('CWCC', 'FKHB', 'NALIB', 'NATT', 'SCIC', 'SPORTC', 'WTY', 'YIAP', 'YIAE', 'CCTB', 'SCLT', 'UGYM');

UPDATE `StopTime`
SET `StartLocation` = CASE `StartLocation`
  WHEN 'CWCC' THEN 'CWC'
  WHEN 'FKHB' THEN 'KHB'
  WHEN 'NALIB' THEN 'CML'
  WHEN 'NATT' THEN 'NA TT'
  WHEN 'SCIC' THEN 'SC'
  WHEN 'SPORTC' THEN 'USC'
  WHEN 'WTY' THEN 'TYW LT'
  WHEN 'YIAP' THEN 'YIA'
  WHEN 'YIAE' THEN 'YIA'
  WHEN 'CCTB' THEN 'CCT'
  WHEN 'SCLT' THEN 'SWC LT'
  WHEN 'UGYM' THEN 'UG'
  ELSE `StartLocation`
END
WHERE `StartLocation` IN ('CWCC', 'FKHB', 'NALIB', 'NATT', 'SCIC', 'SPORTC', 'WTY', 'YIAP', 'YIAE', 'CCTB', 'SCLT', 'UGYM');

UPDATE `StopTime`
SET `EndLocation` = CASE `EndLocation`
  WHEN 'CWCC' THEN 'CWC'
  WHEN 'FKHB' THEN 'KHB'
  WHEN 'NALIB' THEN 'CML'
  WHEN 'NATT' THEN 'NA TT'
  WHEN 'SCIC' THEN 'SC'
  WHEN 'SPORTC' THEN 'USC'
  WHEN 'WTY' THEN 'TYW LT'
  WHEN 'YIAP' THEN 'YIA'
  WHEN 'YIAE' THEN 'YIA'
  WHEN 'CCTB' THEN 'CCT'
  WHEN 'SCLT' THEN 'SWC LT'
  WHEN 'UGYM' THEN 'UG'
  ELSE `EndLocation`
END
WHERE `EndLocation` IN ('CWCC', 'FKHB', 'NALIB', 'NATT', 'SCIC', 'SPORTC', 'WTY', 'YIAP', 'YIAE', 'CCTB', 'SCLT', 'UGYM');

UPDATE `groupedStation`
SET `Station` = CASE `Station`
  WHEN 'CWCC' THEN 'CWC'
  WHEN 'FKHB' THEN 'KHB'
  WHEN 'NALIB' THEN 'CML'
  WHEN 'NATT' THEN 'NA TT'
  WHEN 'SCIC' THEN 'SC'
  WHEN 'SPORTC' THEN 'USC'
  WHEN 'WTY' THEN 'TYW LT'
  WHEN 'YIAP' THEN 'YIA'
  WHEN 'YIAE' THEN 'YIA'
  WHEN 'CCTB' THEN 'CCT'
  WHEN 'SCLT' THEN 'SWC LT'
  WHEN 'UGYM' THEN 'UG'
  ELSE `Station`
END
WHERE `Station` IN ('CWCC', 'FKHB', 'NALIB', 'NATT', 'SCIC', 'SPORTC', 'WTY', 'YIAP', 'YIAE', 'CCTB', 'SCLT', 'UGYM');

UPDATE `station`
SET `最近之車站` = CASE `最近之車站`
  WHEN 'CWCC' THEN 'CWC'
  WHEN 'FKHB' THEN 'KHB'
  WHEN 'NALIB' THEN 'CML'
  WHEN 'NATT' THEN 'NA TT'
  WHEN 'SCIC' THEN 'SC'
  WHEN 'SPORTC' THEN 'USC'
  WHEN 'WTY' THEN 'TYW LT'
  WHEN 'YIAP' THEN 'YIA'
  WHEN 'YIAE' THEN 'YIA'
  WHEN 'CCTB' THEN 'CCT'
  WHEN 'SCLT' THEN 'SWC LT'
  WHEN 'UGYM' THEN 'UG'
  ELSE `最近之車站`
END
WHERE `最近之車站` IN ('CWCC', 'FKHB', 'NALIB', 'NATT', 'SCIC', 'SPORTC', 'WTY', 'YIAP', 'YIAE', 'CCTB', 'SCLT', 'UGYM');

-- Normalize the official names in both translation tables.
UPDATE `translatebuilding`
SET `中文` = CASE `Code`
  WHEN 'AMEW' THEN '中國文化研究所文物館東翼'
  WHEN 'CCT' THEN '神學樓'
  WHEN 'HCA' THEN '碧秋樓'
  WHEN 'HTC' THEN '6、7號夏鼎基網球場'
  WHEN 'LN' THEN '嶺南體育館'
  WHEN 'NAA' THEN '新亞書院誠明館'
  WHEN 'NAH' THEN '人文館'
  WHEN 'SCSH' THEN '逸夫書院室內體育及多功能館'
  WHEN 'SCTT' THEN '逸夫書院乒乓球室'
  WHEN 'SWH' THEN '太古堂'
  WHEN 'SWC LT' THEN '大講堂'
  WHEN 'TC' THEN '3、4、5號網球場'
  WHEN 'UCA' THEN '曾肇添樓'
  WHEN 'UCC' THEN '鄭棟材樓'
  WHEN 'UCG' THEN '聯合體育館'
  WHEN 'UC TT' THEN '聯合書院乒乓球室'
  WHEN 'UG' THEN '大學體育館'
  WHEN 'WLS' THEN '文瀾堂'
  WHEN 'CCPMHH' THEN '五旬節會樓高座'
  WHEN 'CCPMHL' THEN '五旬節會樓低座'
  WHEN 'CCWL' THEN '未圓湖'
  ELSE `中文`
END,
`ENG` = CASE `Code`
  WHEN 'AMEW' THEN 'Art Museum East Wing'
  WHEN 'CCT' THEN 'Theology Building'
  WHEN 'HCA' THEN 'Pi Chiu Building'
  WHEN 'HTC' THEN 'Haddon-Cave Tennis Court # 6, 7'
  WHEN 'LN' THEN 'Lingnan Stadium, Chung Chi College'
  WHEN 'NAA' THEN 'Cheng Ming Building, New Asia College'
  WHEN 'NAH' THEN 'Humanities Building, New Asia College'
  WHEN 'SCSH' THEN 'Multi-purpose Sports Hall, Shaw College'
  WHEN 'SCTT' THEN 'Table Tennis Room, Shaw College'
  WHEN 'SWH' THEN 'Swire Hall, Fung King Hey Building'
  WHEN 'SWC LT' THEN 'Lecture Theatre, Shaw College'
  WHEN 'TC' THEN 'Tennis Court # 3, 4, 5'
  WHEN 'UCA' THEN 'Tsang Shiu Tim Building, United College'
  WHEN 'UCC' THEN 'T.C. Cheng Building, United College'
  WHEN 'UCG' THEN 'United College Gymnasium'
  WHEN 'UC TT' THEN 'Table Tennis Room, United College'
  WHEN 'UG' THEN 'University Gymnasium'
  WHEN 'WLS' THEN 'Wen Lan Tang, Shaw College'
  WHEN 'CCPMHH' THEN 'Pentecostal Mission Hall Complex - High Block'
  WHEN 'CCPMHL' THEN 'Pentecostal Mission Hall Complex - Low Block'
  WHEN 'CCWL' THEN 'Weiyuan Lake - Lake Ad Excellentiam'
  ELSE `ENG`
END
WHERE `Code` IN ('AMEW', 'CCPMHH', 'CCPMHL', 'CCT', 'CCWL', 'HCA', 'HTC', 'LN', 'NAA', 'NAH', 'SCSH', 'SCTT', 'SWH', 'SWC LT', 'TC', 'UCA', 'UCC', 'UCG', 'UC TT', 'UG', 'WLS');

UPDATE `translateroute`
SET `中文` = CASE `Code`
  WHEN 'CWC' THEN '敬文書院'
  WHEN 'KHB' THEN '馮景禧樓'
  WHEN 'SC' THEN '科學館'
  WHEN 'USC' THEN '大學體育中心'
  WHEN 'YIA' THEN '康本國際學術園'
  ELSE `中文`
END,
`ENG` = CASE `Code`
  WHEN 'CWC' THEN 'C.W. Chu College'
  WHEN 'KHB' THEN 'Fung King Hey Building'
  WHEN 'SC' THEN 'Science Centre'
  WHEN 'USC' THEN 'University Sports Centre'
  WHEN 'YIA' THEN 'Yasumoto International Academic Park'
  ELSE `ENG`
END
WHERE `Code` IN ('CWC', 'KHB', 'SC', 'USC', 'YIA');

-- Remove the old codes after every foreign-key reference has moved. The
-- canonical GPS rows CCT, SWC LT, and UG remain because they already existed.
DELETE FROM `translateroute`
WHERE `Code` IN ('CWCC', 'FKHB', 'NALIB', 'NATT', 'SCIC', 'SPORTC', 'WTY', 'YIAP', 'YIAE', 'CCTB', 'SCLT', 'UGYM');

DELETE FROM `gps`
WHERE `Location` IN ('CWCC', 'FKHB', 'NALIB', 'NATT', 'SCIC', 'SPORTC', 'WTY', 'YIAP', 'YIAE', 'CCTB', 'SCLT', 'UGYM');

DELETE FROM `translatebuilding`
WHERE `Code` IN ('CWCC', 'FKHB', 'NALIB', 'NATT', 'SCIC', 'SPORTC', 'WTY', 'YIAP', 'YIAE', 'CCTB', 'SCLT', 'UGYM');

-- ========================================================================
-- Part 3: confirmed official buildings and important searchable aliases
-- ========================================================================

-- These nine buildings/facilities are absent from the pre-migration building search.
-- LFYB/KSC are the two blocks of the completed Chung Chi Student
-- Development Complex; MYT is the completed New Asia student-hostel complex
-- and TKPH is its Tin Ka Ping Hall block;
-- CKYR is the commissioned United College residence; MSHALL is the named
-- Mona Shaw Hall project, currently recorded by CUHK as under construction;
-- LDSYB is the official H3b Li Dak Sum Yip Yio Chin Building, distinct from
-- the existing H23 Li Dak Sum Building; SCE is Science Centre East Block;
-- LKC is Li Koon Chun Hall inside Sino Building.
INSERT INTO `translatebuilding`
  (`Code`, `Append to js?`, `中文`, `ENG`)
VALUES
  ('LFYB', '', '梁鳳儀樓', 'Leung Fung Yee Building'),
  ('KSC', '', '龔約翰學生中心', 'Kunkle Student Centre'),
  ('MYT', '', '梅雲堂', 'Mei Yun Tang'),
  ('TKPH', '', '田家炳宿舍樓', 'Tin Ka Ping Hall'),
  ('CKYR', '', '蔡繼有宿舍', 'Choi Kai Yau Residence'),
  ('MSHALL', '', '逸華樓', 'Mona Shaw Hall'),
  ('LDSYB', '', '李達三葉耀珍伉儷樓', 'Li Dak Sum Yip Yio Chin Building'),
  ('SCE', '', '科學館東座', 'Science Centre East Block'),
  ('LKC', '', '李冠春堂', 'Li Koon Chun Hall');

-- GPS values are rounded to the six decimal places supported by gps.
-- TKPH has no separate map point in the source; it uses the published
-- Mei Yun Tang complex coordinate because it is one of that complex's blocks.
-- CKYR longitude is published by the map source only to three decimals;
-- 114.204000 preserves that published precision rather than inventing
-- additional accuracy.
-- LKC is a hall inside Sino Building, so it intentionally uses the existing
-- Sino Building GPS point rather than inventing a separate interior point.
INSERT INTO `gps`
  (`Location`, `Lat`, `Lng`, `ImportantStation`)
VALUES
  ('LFYB', 22.417870, 114.208350, NULL),
  ('KSC', 22.417350, 114.208680, NULL),
  ('MYT', 22.420300, 114.208400, NULL),
  ('TKPH', 22.420300, 114.208400, NULL),
  ('CKYR', 22.420510, 114.204000, NULL),
  ('MSHALL', 22.423710, 114.201730, NULL),
  ('LDSYB', 22.419730, 114.204770, NULL),
  ('SCE', 22.419190, 114.208800, NULL),
  ('LKC', 22.415588, 114.207210, NULL);

-- Add all selected nearby route points as direct mappings. The database
-- retains its legacy SHHO GPS/route key; the mobile seed uses the current
-- SHHC key for the same S.H. Ho College stop.
INSERT INTO `station`
  (`ID`, `建築物`, `最近之車站`, `Area`)
VALUES
  (801, 'LFYB', 'SHHO', NULL),
  (802, 'LFYB', 'CCTEA', NULL),
  (803, 'LFYB', 'USC', NULL),
  (804, 'LFYB', 'SC', NULL),
  (805, 'LFYB', 'SRR', NULL),
  (806, 'KSC', 'CCTEA', NULL),
  (807, 'KSC', 'SHHO', NULL),
  (808, 'KSC', 'USC', NULL),
  (809, 'KSC', 'YIA', NULL),
  (810, 'KSC', 'SC', NULL),
  (811, 'MYT', 'SC', NULL),
  (812, 'MYT', 'NAC', NULL),
  (813, 'MYT', 'SRR', NULL),
  (814, 'MYT', 'SHHO', NULL),
  (815, 'TKPH', 'SC', NULL),
  (816, 'TKPH', 'NAC', NULL),
  (817, 'TKPH', 'SRR', NULL),
  (818, 'TKPH', 'SHHO', NULL),
  (819, 'CKYR', 'WYS', NULL),
  (820, 'CKYR', 'UC', NULL),
  (821, 'CKYR', 'CCHH', NULL),
  (822, 'CKYR', 'KHB', NULL),
  (823, 'MSHALL', 'SHAWC', NULL),
  (824, 'LDSYB', 'UC', NULL),
  (825, 'LDSYB', 'UADM', NULL),
  (826, 'LDSYB', 'KHB', NULL),
  (827, 'LDSYB', 'WYS', NULL),
  (828, 'SCE', 'SHHO', NULL),
  (829, 'SCE', 'SC', NULL),
  (830, 'SCE', 'SRR', NULL),
  (831, 'SCE', 'USC', NULL),
  (832, 'SCE', 'NAC', NULL),
  (833, 'LKC', 'CCTEA', NULL),
  (834, 'LKC', 'MTRP', NULL),
  (835, 'LKC', 'MTR', NULL),
  (836, 'LKC', 'YIA', NULL)
ON DUPLICATE KEY UPDATE
  `Area` = VALUES(`Area`);

-- Keep important official/current wording searchable while retaining the
-- established local names and codes.
UPDATE `translatebuilding`
SET `中文` = CASE `Code`
  WHEN 'BMS' THEN '基本醫學大樓 / 李卓敏基本醫學大樓'
  WHEN 'CCHH' THEN '陳震夏宿舍 / 陳震夏館'
  WHEN 'CCLIB' THEN '崇基圖書館 / 牟路思怡圖書館'
  WHEN 'ENGB' THEN '展標 / 蒙民偉工程學大樓'
  WHEN 'ENGGB' THEN '賤標 / 蒙民偉工程學大樓'
  WHEN 'ERB' THEN '蒙民偉工程學大樓'
  WHEN 'JCPH3' THEN '賽馬會研究生宿舍三號 / 賽馬會研究生宿舍三座'
  WHEN 'JCPHC' THEN '賽馬會研究生宿舍三座咖啡室'
  WHEN 'KSB' THEN '汾陽體育樓 / 汾陽體育館'
  WHEN 'HCA' THEN '碧秋樓'
  ELSE `中文`
END,
`ENG` = CASE `Code`
  WHEN 'BMS' THEN 'Choh-Ming Li Basic Medical Sciences Building'
  WHEN 'CCHH' THEN 'Chan Chun Ha Hostel / Chan Chun Ha Hall'
  WHEN 'CCLIB' THEN 'C.C. Library / Elisabeth Luce Moore Library'
  WHEN 'ENGB' THEN 'William M.W. Mong Engineering Building'
  WHEN 'ENGGB' THEN 'William M.W. Mong Engineering Building'
  WHEN 'ERB' THEN 'William M.W. Mong Engineering Building'
  WHEN 'JCPH3' THEN 'Jockey Club Postgraduate Hall 3'
  WHEN 'JCPHC' THEN 'Jockey Club Postgraduate Hall 3 Café'
  WHEN 'KSB' THEN 'Kwok Sports Building'
  WHEN 'HCA' THEN 'Pi Chiu Building'
  ELSE `ENG`
END
WHERE `Code` IN ('BMS', 'CCHH', 'CCLIB', 'ENGB', 'ENGGB', 'ERB', 'HCA', 'JCPH3', 'JCPHC', 'KSB');

-- ========================================================================
-- Part 4: missing searchable buildings, facilities, and current C.W. Chu
-- names. Every entry below is additive; the original building rows remain.
-- ========================================================================

INSERT INTO `translatebuilding`
  (`Code`, `Append to js?`, `中文`, `ENG`)
VALUES
  ('CK TSE', '', '崇基圖書館謝昭杰室', 'C.K. Tse Room, C.C. Library'),
  ('PGH3 MPH', '', '賽馬會研究生宿舍三座多用途禮堂', 'Multi-purpose Hall, Jockey Club Postgraduate Hall 3'),
  ('PSC MPH', '', '龐萬倫學生中心多用途禮堂', 'Multi-purpose Hall, Pommerenke Student Centre'),
  ('USC TT', '', '大學體育中心乒乓球室', 'University Sports Centre Table Tennis Room'),
  ('C12', '', '眾志堂', 'Chung Chi Tang'),
  ('C13', '', '方潤華堂', 'Fong Yun Wah Hall'),
  ('C14', '', '方樹泉樓', 'Fong Shu Chuen Building'),
  ('U2', '', '胡忠圖書館', 'United College Wu Chung Library'),
  ('U11a', '', '思源廣場', 'Si Yuan Amphitheatre'),
  ('S4', '', '雅群樓', 'Ya Qun Lodge'),
  ('S6', '', '逸仙樓', 'Yat Sen Hall'),
  ('MC1', '', '格林伯格樓', 'Maurice R. Greenberg Building'),
  ('MC2', '', '學生宿舍高座', 'Student Hostel High Block'),
  ('CW1', '', '何陳婉珍樓', 'Ina Ho Chan Un Chan Building'),
  ('FYW', '', '風雩樓', 'Feng Yu Building'),
  ('DMCB', '', '恩玲樓', 'David & Marina Chu Building'),
  ('YS1', '', '伍宜孫書院西座', 'Wu Yee Sun College West Block'),
  ('YS2', '', '伍宜孫書院東座', 'Wu Yee Sun College East Block'),
  ('YS3', '', '伍宜孫書院康體中心', 'Wu Yee Sun College Activity Centre'),
  ('PGH1', '', '賽馬會研究生宿舍一座', 'Jockey Club Postgraduate Hall 1'),
  ('PGH2', '', '賽馬會研究生宿舍二座', 'Jockey Club Postgraduate Hall 2'),
  ('PGH4', '', '研究生宿舍四座', 'Postgraduate Hall No. 4'),
  ('PGH5', '', '研究生宿舍五座', 'Postgraduate Hall No. 5'),
  ('PGH6', '', '研究生宿舍六座', 'Postgraduate Hall No. 6'),
  ('IH1', '', '國際生堂一座', 'International House 1'),
  ('IH2', '', '國際生堂二座', 'International House 2'),
  ('IH3', '', '國際生堂三座', 'International House 3'),
  ('IH4', '', '國際生堂四座', 'International House 4'),
  ('IH5', '', '國際生堂五座', 'International House 5'),
  ('R11', '', '第十一苑', 'University Residence No. 11'),
  ('R12', '', '第十二苑', 'University Residence No. 12'),
  ('R13', '', '第十三苑', 'University Residence No. 13'),
  ('R14', '', '第十四苑', 'University Residence No. 14'),
  ('R16', '', '第十六苑', 'University Residence No. 16'),
  ('R17', '', '第十七苑', 'University Residence No. 17');

-- Facilities inside an existing mapped building reuse the parent GPS point.
-- YS1/YS2 use the published WYS college point; YS3 uses the published WYS
-- activity-centre point. IH4/IH5 use the published International House 3-5
-- group point because the official map does not publish separate pins.
INSERT INTO `gps`
  (`Location`, `Lat`, `Lng`, `ImportantStation`)
VALUES
  ('CK TSE', 22.416536, 114.208664, NULL),
  ('PGH3 MPH', 22.426240, 114.205910, NULL),
  ('PSC MPH', 22.417165, 114.208800, NULL),
  ('USC TT', 22.417801, 114.210582, NULL),
  ('C12', 22.416657, 114.209699, NULL),
  ('C13', 22.415631, 114.210568, NULL),
  ('C14', 22.415363, 114.210367, NULL),
  ('U2', 22.420905, 114.204804, NULL),
  ('U11a', 22.421629, 114.204941, NULL),
  ('S4', 22.422891, 114.201915, NULL),
  ('S6', 22.423248, 114.201223, NULL),
  ('MC1', 22.419033, 114.210278, NULL),
  ('MC2', 22.418829, 114.210289, NULL),
  ('CW1', 22.425613, 114.206182, NULL),
  ('FYW', 22.425613, 114.206182, NULL),
  ('DMCB', 22.425613, 114.206182, NULL),
  ('YS1', 22.421094, 114.203502, NULL),
  ('YS2', 22.421094, 114.203502, NULL),
  ('YS3', 22.422117, 114.202580, NULL),
  ('PGH1', 22.420322, 114.211979, NULL),
  ('PGH2', 22.420074, 114.210614, NULL),
  ('PGH4', 22.423803, 114.204917, NULL),
  ('PGH5', 22.424286, 114.205032, NULL),
  ('PGH6', 22.424435, 114.204713, NULL),
  ('IH1', 22.423193, 114.204351, NULL),
  ('IH2', 22.423639, 114.204461, NULL),
  ('IH3', 22.419985, 114.210107, NULL),
  ('IH4', 22.419985, 114.210107, NULL),
  ('IH5', 22.419985, 114.210107, NULL),
  ('R11', 22.424309, 114.208306, NULL),
  ('R12', 22.424475, 114.207006, NULL),
  ('R13', 22.424438, 114.207387, NULL),
  ('R14', 22.423957, 114.207176, NULL),
  ('R16', 22.423726, 114.207985, NULL),
  ('R17', 22.423436, 114.208347, NULL);

-- Direct route points make each new entry searchable in the backend and
-- mirror the existing mobile station groups.
INSERT INTO `station`
  (`ID`, `建築物`, `最近之車站`, `Area`)
VALUES
  (901, 'CK TSE', 'MTRP', NULL),
  (902, 'PGH3 MPH', 'CWC', NULL),
  (903, 'PGH3 MPH', 'CCEN', NULL),
  (904, 'PSC MPH', 'MTRP', NULL),
  (905, 'PSC MPH', 'YIA', NULL),
  (906, 'PSC MPH', 'MTR', NULL),
  (907, 'PSC MPH', 'CCTEA', NULL),
  (908, 'PSC MPH', 'USC', NULL),
  (909, 'PSC MPH', 'SHHC', NULL),
  (910, 'USC TT', 'USC', NULL),
  (911, 'USC TT', 'SHHC', NULL),
  (912, 'C12', 'MTRP', NULL),
  (913, 'C12', 'YIA', NULL),
  (914, 'C12', 'MTR', NULL),
  (915, 'C12', 'CCTEA', NULL),
  (916, 'C13', 'MTRP', NULL),
  (917, 'C13', 'YIA', NULL),
  (918, 'C13', 'MTR', NULL),
  (919, 'C13', 'CCTEA', NULL),
  (920, 'C14', 'MTRP', NULL),
  (921, 'C14', 'YIA', NULL),
  (922, 'C14', 'MTR', NULL),
  (923, 'C14', 'CCTEA', NULL),
  (924, 'U2', 'UC', NULL),
  (925, 'U11a', 'UC', NULL),
  (926, 'S4', 'SHAWC', NULL),
  (927, 'S6', 'SHAWC', NULL),
  (928, 'MC1', 'USC', NULL),
  (929, 'MC1', 'SHHC', NULL),
  (930, 'MC2', 'USC', NULL),
  (931, 'MC2', 'SHHC', NULL),
  (932, 'CW1', 'CWC', NULL),
  (933, 'FYW', 'CWC', NULL),
  (934, 'DMCB', 'CWC', NULL),
  (935, 'YS1', 'WYS', NULL),
  (936, 'YS2', 'WYS', NULL),
  (937, 'YS3', 'WYS', NULL),
  (938, 'PGH1', 'JCPH', NULL),
  (939, 'PGH2', 'JCPH', NULL),
  (940, 'PGH4', 'JCPH', NULL),
  (941, 'PGH5', 'JCPH', NULL),
  (942, 'PGH6', 'JCPH', NULL),
  (943, 'IH1', 'UCSR', NULL),
  (944, 'IH2', 'UCSR', NULL),
  (945, 'IH3', 'USC', NULL),
  (946, 'IH3', 'SHHC', NULL),
  (947, 'IH4', 'USC', NULL),
  (948, 'IH4', 'SHHC', NULL),
  (949, 'IH5', 'USC', NULL),
  (950, 'IH5', 'SHHC', NULL),
  (951, 'R11', 'RESI15', NULL),
  (952, 'R12', 'RESI15', NULL),
  (953, 'R13', 'RESI15', NULL),
  (954, 'R14', 'RESI15', NULL),
  (955, 'R16', 'RESI15', NULL),
  (956, 'R17', 'RESI15', NULL),
  (957, 'CK TSE', 'YIA', NULL),
  (958, 'CK TSE', 'MTR', NULL),
  (959, 'CK TSE', 'CCTEA', NULL);

COMMIT;
