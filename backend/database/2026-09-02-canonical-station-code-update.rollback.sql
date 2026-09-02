-- Rollback for the combined 2026-09-02 station/building update.
-- Reverse Part 3 (recent buildings and aliases), then Part 2 (official
-- building-code cleanup), then Part 1 (canonical station-code cleanup).
-- Restores the data state after the canonical station-code migration:
-- CWCC, FKHB, NALIB, NATT, SCIC, SPORTC, WTY, YIAP, YIAE, CCTB, SCLT,
-- and UGYM are present again.

SET NAMES utf8mb4;
START TRANSACTION;

-- ========================================================================
-- Roll back Part 3 first: confirmed official buildings and aliases
-- ========================================================================

-- Roll back Part 4 first. These are additive rows only; delete by the IDs
-- created by Part 4 so any original rows with the same building names remain.
DELETE FROM `station`
WHERE `ID` IN (
  901, 902, 903, 904, 905, 906, 907, 908, 909,
  910, 911, 912, 913, 914, 915, 916, 917, 918, 919,
  920, 921, 922, 923, 924, 925, 926, 927, 928, 929,
  930, 931, 932, 933, 934, 935, 936, 937, 938, 939,
  940, 941, 942, 943, 944, 945, 946, 947, 948, 949,
  950, 951, 952, 953, 954, 955, 956, 957, 958, 959
);

DELETE FROM `gps`
WHERE `Location` IN (
  'CK TSE', 'PGH3 MPH', 'PSC MPH', 'USC TT',
  'C12', 'C13', 'C14', 'U2', 'U11a', 'S4', 'S6',
  'MC1', 'MC2', 'CW1', 'FYW', 'DMCB', 'YS1', 'YS2', 'YS3',
  'PGH1', 'PGH2', 'PGH4', 'PGH5', 'PGH6',
  'IH1', 'IH2', 'IH3', 'IH4', 'IH5',
  'R11', 'R12', 'R13', 'R14', 'R16', 'R17'
);

DELETE FROM `translatebuilding`
WHERE `Code` IN (
  'CK TSE', 'PGH3 MPH', 'PSC MPH', 'USC TT',
  'C12', 'C13', 'C14', 'U2', 'U11a', 'S4', 'S6',
  'MC1', 'MC2', 'CW1', 'FYW', 'DMCB', 'YS1', 'YS2', 'YS3',
  'PGH1', 'PGH2', 'PGH4', 'PGH5', 'PGH6',
  'IH1', 'IH2', 'IH3', 'IH4', 'IH5',
  'R11', 'R12', 'R13', 'R14', 'R16', 'R17'
);

DELETE FROM `station`
WHERE `建築物` IN ('LFYB', 'KSC', 'MYT', 'TKPH', 'CKYR', 'MSHALL', 'LDSYB', 'SCE', 'LKC');

DELETE FROM `gps`
WHERE `Location` IN ('LFYB', 'KSC', 'MYT', 'TKPH', 'CKYR', 'MSHALL', 'LDSYB', 'SCE', 'LKC');

DELETE FROM `translatebuilding`
WHERE `Code` IN ('LFYB', 'KSC', 'MYT', 'TKPH', 'CKYR', 'MSHALL', 'LDSYB', 'SCE', 'LKC');

-- Restore the exact post-2026-09-01 labels, including the source dump's
-- trailing space on ERB's English value.
UPDATE `translatebuilding`
SET `中文` = CASE `Code`
  WHEN 'BMS' THEN '基本醫學大樓'
  WHEN 'CCHH' THEN '陳震夏宿舍'
  WHEN 'CCLIB' THEN '崇基圖書館'
  WHEN 'ENGB' THEN '展標'
  WHEN 'ENGGB' THEN '賤標'
  WHEN 'ERB' THEN '蒙民偉工程學大樓'
  WHEN 'JCPH3' THEN '賽馬會研究生宿舍三號'
  WHEN 'JCPHC' THEN '賽馬會研究生宿舍三座咖啡室'
  WHEN 'KSB' THEN '汾陽體育樓'
  WHEN 'HCA' THEN '碧秋樓'
  ELSE `中文`
END,
`ENG` = CASE `Code`
  WHEN 'BMS' THEN 'Basic Medical Sciences Building '
  WHEN 'CCHH' THEN 'Chan Chun Ha Hostel'
  WHEN 'CCLIB' THEN 'C.C. Library '
  WHEN 'ENGB' THEN ''
  WHEN 'ENGGB' THEN ''
  WHEN 'ERB' THEN 'William M.W. Mong Engineering Building '
  WHEN 'JCPH3' THEN 'Jockey Club Postgrad Hall No.3'
  WHEN 'JCPHC' THEN 'Postgraduate Hall 3 Café'
  WHEN 'KSB' THEN 'Kwok Sports Building '
  WHEN 'HCA' THEN 'Pi Chiu Building'
  ELSE `ENG`
END
WHERE `Code` IN ('BMS', 'CCHH', 'CCLIB', 'ENGB', 'ENGGB', 'ERB', 'HCA', 'JCPH3', 'JCPHC', 'KSB');

-- Recreate every old GPS parent before restoring GPS-backed references.
INSERT INTO `gps`
  (`Location`, `Lat`, `Lng`, `ImportantStation`)
SELECT 'CWCC', `Lat`, `Lng`, `ImportantStation` FROM `gps` WHERE `Location` = 'CWC'
UNION ALL
SELECT 'FKHB', `Lat`, `Lng`, `ImportantStation` FROM `gps` WHERE `Location` = 'KHB'
UNION ALL
SELECT 'NALIB', `Lat`, `Lng`, `ImportantStation` FROM `gps` WHERE `Location` = 'CML'
UNION ALL
SELECT 'NATT', `Lat`, `Lng`, `ImportantStation` FROM `gps` WHERE `Location` = 'NA TT'
UNION ALL
SELECT 'SCIC', `Lat`, `Lng`, `ImportantStation` FROM `gps` WHERE `Location` = 'SC'
UNION ALL
SELECT 'SPORTC', `Lat`, `Lng`, `ImportantStation` FROM `gps` WHERE `Location` = 'USC'
UNION ALL
SELECT 'WTY', `Lat`, `Lng`, `ImportantStation` FROM `gps` WHERE `Location` = 'TYW LT'
UNION ALL
SELECT 'YIAP', `Lat`, `Lng`, `ImportantStation` FROM `gps` WHERE `Location` = 'YIA'
UNION ALL
SELECT 'YIAE', `Lat`, `Lng`, `ImportantStation` FROM `gps` WHERE `Location` = 'YIA'
UNION ALL
SELECT 'CCTB', `Lat`, `Lng`, `ImportantStation` FROM `gps` WHERE `Location` = 'CCT'
UNION ALL
SELECT 'SCLT', `Lat`, `Lng`, `ImportantStation` FROM `gps` WHERE `Location` = 'SWC LT'
UNION ALL
SELECT 'UGYM', `Lat`, `Lng`, `ImportantStation` FROM `gps` WHERE `Location` = 'UG'
ON DUPLICATE KEY UPDATE
  `Lat` = VALUES(`Lat`),
  `Lng` = VALUES(`Lng`),
  `ImportantStation` = VALUES(`ImportantStation`);

-- Restore the pre-update building parents. These rows are needed before the
-- station building foreign key is pointed back to the old codes.
INSERT INTO `translatebuilding`
  (`Code`, `Append to js?`, `中文`, `ENG`)
VALUES
  ('CWCC', '', '敬文書院', 'C.W. Chu College'),
  ('FKHB', '', '馮景禧樓', 'Fung King Hey Building'),
  ('NALIB', '', '錢穆圖書館', 'Ch\'ien Mu Library '),
  ('NATT', '', '新亞書院乒乓球室', 'New Asia College Table Tennis Room '),
  ('SCIC', '', '科學館', 'Science Centre'),
  ('SPORTC', '', '大學體育中心', 'University Sports Centre'),
  ('WTY', '', '王統元堂', 'T.Y. Wong Hall'),
  ('YIAP', '', '康本國際學術園', 'Yasumoto International Academic Park'),
  ('YIAE', '', '七小龍', ''),
  ('CCTB', '', '神學樓', 'Theology Building'),
  ('SCLT', '', '逸夫大講堂', 'Shaw Lecture Theatre '),
  ('UGYM', '', '大學體育館', '')
ON DUPLICATE KEY UPDATE
  `Append to js?` = VALUES(`Append to js?`),
  `中文` = VALUES(`中文`),
  `ENG` = VALUES(`ENG`);

-- Restore building codes. These are the station IDs that existed in the
-- supplied initial dump or were inserted by the already-applied 2026-09-01
-- station-search migration. The three merged aliases need ID-scoped updates
-- because their official target codes already existed before this migration.
UPDATE `station`
SET `建築物` = CASE `建築物`
  WHEN 'CWC' THEN 'CWCC'
  WHEN 'KHB' THEN 'FKHB'
  WHEN 'CML' THEN 'NALIB'
  WHEN 'NA TT' THEN 'NATT'
  WHEN 'SC' THEN 'SCIC'
  WHEN 'USC' THEN 'SPORTC'
  WHEN 'TYW LT' THEN 'WTY'
  WHEN 'YIA' THEN 'YIAP'
  ELSE `建築物`
END
WHERE `建築物` IN ('CWC', 'KHB', 'CML', 'NA TT', 'SC', 'USC', 'TYW LT', 'YIA');

UPDATE `station`
SET `建築物` = 'YIAE'
WHERE `ID` IN (7, 469, 470, 471)
  AND `建築物` = 'YIAP';

UPDATE `station`
SET `建築物` = 'CCTB'
WHERE `ID` IN (344, 681, 682, 683, 684, 791, 792)
  AND `建築物` = 'CCT';

UPDATE `station`
SET `建築物` = 'SCLT'
WHERE `ID` = 133
  AND `建築物` = 'SWC LT';

UPDATE `station`
SET `建築物` = 'UGYM'
WHERE `ID` IN (54, 491)
  AND `建築物` = 'UG';

-- Restore the duplicate alias mappings removed before the forward building
-- rename. The canonical rows remain under their original canonical codes.
INSERT INTO `station`
  (`ID`, `建築物`, `最近之車站`, `Area`)
VALUES
  (7, 'YIAE', 'MTRP', NULL),
  (54, 'UGYM', 'SPORTC', NULL),
  (133, 'SCLT', 'SHAWC', NULL),
  (344, 'CCTB', 'MTRP', NULL),
  (469, 'YIAE', 'CCTEA', NULL),
  (470, 'YIAE', 'MTR', NULL),
  (471, 'YIAE', 'YIAP', NULL),
  (491, 'UGYM', 'SHHO', NULL),
  (681, 'CCTB', 'CCTEA', NULL),
  (682, 'CCTB', 'MTR', NULL),
  (683, 'CCTB', 'YIAP', NULL),
  (684, 'CCTB', 'UADM', NULL),
  (791, 'CCTB', 'SRR', NULL),
  (792, 'CCTB', 'SCIC', NULL);

-- Reverse all GPS-backed references for the codes that were newly created.
UPDATE `RouteStops`
SET `Location` = CASE `Location`
  WHEN 'CWC' THEN 'CWCC'
  WHEN 'KHB' THEN 'FKHB'
  WHEN 'CML' THEN 'NALIB'
  WHEN 'NA TT' THEN 'NATT'
  WHEN 'SC' THEN 'SCIC'
  WHEN 'USC' THEN 'SPORTC'
  WHEN 'TYW LT' THEN 'WTY'
  WHEN 'YIA' THEN 'YIAP'
  ELSE `Location`
END
WHERE `Location` IN ('CWC', 'KHB', 'CML', 'NA TT', 'SC', 'USC', 'TYW LT', 'YIA');

UPDATE `StopTime`
SET `StartLocation` = CASE `StartLocation`
  WHEN 'CWC' THEN 'CWCC'
  WHEN 'KHB' THEN 'FKHB'
  WHEN 'CML' THEN 'NALIB'
  WHEN 'NA TT' THEN 'NATT'
  WHEN 'SC' THEN 'SCIC'
  WHEN 'USC' THEN 'SPORTC'
  WHEN 'TYW LT' THEN 'WTY'
  WHEN 'YIA' THEN 'YIAP'
  ELSE `StartLocation`
END
WHERE `StartLocation` IN ('CWC', 'KHB', 'CML', 'NA TT', 'SC', 'USC', 'TYW LT', 'YIA');

UPDATE `StopTime`
SET `EndLocation` = CASE `EndLocation`
  WHEN 'CWC' THEN 'CWCC'
  WHEN 'KHB' THEN 'FKHB'
  WHEN 'CML' THEN 'NALIB'
  WHEN 'NA TT' THEN 'NATT'
  WHEN 'SC' THEN 'SCIC'
  WHEN 'USC' THEN 'SPORTC'
  WHEN 'TYW LT' THEN 'WTY'
  WHEN 'YIA' THEN 'YIAP'
  ELSE `EndLocation`
END
WHERE `EndLocation` IN ('CWC', 'KHB', 'CML', 'NA TT', 'SC', 'USC', 'TYW LT', 'YIA');

UPDATE `groupedStation`
SET `Station` = CASE `Station`
  WHEN 'CWC' THEN 'CWCC'
  WHEN 'KHB' THEN 'FKHB'
  WHEN 'CML' THEN 'NALIB'
  WHEN 'NA TT' THEN 'NATT'
  WHEN 'SC' THEN 'SCIC'
  WHEN 'USC' THEN 'SPORTC'
  WHEN 'TYW LT' THEN 'WTY'
  WHEN 'YIA' THEN 'YIAP'
  ELSE `Station`
END
WHERE `Station` IN ('CWC', 'KHB', 'CML', 'NA TT', 'SC', 'USC', 'TYW LT', 'YIA');

UPDATE `station`
SET `最近之車站` = CASE `最近之車站`
  WHEN 'CWC' THEN 'CWCC'
  WHEN 'KHB' THEN 'FKHB'
  WHEN 'CML' THEN 'NALIB'
  WHEN 'NA TT' THEN 'NATT'
  WHEN 'SC' THEN 'SCIC'
  WHEN 'USC' THEN 'SPORTC'
  WHEN 'TYW LT' THEN 'WTY'
  WHEN 'YIA' THEN 'YIAP'
  ELSE `最近之車站`
END
WHERE `最近之車站` IN ('CWC', 'KHB', 'CML', 'NA TT', 'SC', 'USC', 'TYW LT', 'YIA');

-- Restore route translations for the codes that were renamed. No route
-- translation existed for the building-only aliases, so they are omitted.
DELETE FROM `translateroute`
WHERE `Code` IN ('CWC', 'KHB', 'SC', 'USC', 'YIA');

INSERT INTO `translateroute`
  (`Code`, `Append to js?`, `中文`, `ENG`)
VALUES
  ('CWCC', '', '敬文書院', 'C.W. Chu College'),
  ('FKHB', '', '馮景禧樓', 'Fung King Hey Building'),
  ('SCIC', '', '科學館', 'Science Centre'),
  ('SPORTC', '', '大學體育中心', 'University Sports Centre'),
  ('YIAP', '', '康本國際學術園', 'Yasumoto International Academic Park');

-- Restore the names changed by Part 2's official-label normalization. The
-- trailing spaces match the post-2026-09-01 source rows exactly.
UPDATE `translatebuilding`
SET `中文` = CASE `Code`
  WHEN 'AMEW' THEN '中國文化研究所文物館'
  WHEN 'CCPMHH' THEN '五旬節會樓高座'
  WHEN 'CCPMHL' THEN '五旬節會樓低座'
  WHEN 'CCT' THEN '崇基神學樓'
  WHEN 'CCWL' THEN '未圓湖 '
  WHEN 'HCA' THEN '碧秋樓'
  WHEN 'HTC' THEN '夏鼎基網球場'
  WHEN 'LN' THEN '嶺南體育館'
  WHEN 'NAA' THEN '誠明館'
  WHEN 'NAH' THEN '人文館'
  WHEN 'SCSH' THEN '逸夫書院室內體育及多功能館'
  WHEN 'SCTT' THEN '逸夫書院乒乓球室'
  WHEN 'SWH' THEN '太古堂'
  WHEN 'SWC LT' THEN '逸夫書院演講廳'
  WHEN 'TC' THEN '網球場'
  WHEN 'UCA' THEN '曾肇添樓'
  WHEN 'UCC' THEN '鄭棟材樓'
  WHEN 'UCG' THEN '聯合體育館'
  WHEN 'UC TT' THEN '聯合書院乒乓球室'
  WHEN 'UG' THEN '楊明標室內體育館'
  WHEN 'WLS' THEN '文瀾堂'
  ELSE `中文`
END,
`ENG` = CASE `Code`
  WHEN 'AMEW' THEN 'Art Museum '
  WHEN 'CCPMHH' THEN 'Pentecostal Mission Hall Complex (High Block)'
  WHEN 'CCPMHL' THEN 'Pentecostal Mission Hall Complex (Low Block)'
  WHEN 'CCT' THEN 'Chung Chi College Theology Building '
  WHEN 'CCWL' THEN 'Weiyuan Lake (Lake Ad Excellentiam)'
  WHEN 'HCA' THEN 'Pi Chiu Building '
  WHEN 'HTC' THEN 'Haddon-Cave Tennis Court '
  WHEN 'LN' THEN 'Lingnan Stadium '
  WHEN 'NAA' THEN 'Cheng Ming Building '
  WHEN 'NAH' THEN 'Humanities Building '
  WHEN 'SCSH' THEN 'Multi-purpose Sports Hall - Shaw College '
  WHEN 'SCTT' THEN 'Table Tennis Room - Shaw College '
  WHEN 'SWH' THEN 'Swire Hall '
  WHEN 'SWC LT' THEN 'Lecture Theatre - Shaw College '
  WHEN 'TC' THEN 'Tennis Court '
  WHEN 'UCA' THEN 'Tsang Shiu Tim Building '
  WHEN 'UCC' THEN 'T.C. Cheng Building '
  WHEN 'UCG' THEN 'The Thomas H.C. Cheung Gymnasium of United College '
  WHEN 'UC TT' THEN 'Table Tennis Room - United College '
  WHEN 'UG' THEN 'University Gymnasium '
  WHEN 'WLS' THEN 'Wen Lan Tang '
  ELSE `ENG`
END
WHERE `Code` IN ('AMEW', 'CCPMHH', 'CCPMHL', 'CCT', 'CCWL', 'HCA', 'HTC', 'LN', 'NAA', 'NAH', 'SCSH', 'SCTT', 'SWH', 'SWC LT', 'TC', 'UCA', 'UCC', 'UCG', 'UC TT', 'UG', 'WLS');

DELETE FROM `gps`
WHERE `Location` IN ('CWC', 'KHB', 'CML', 'NA TT', 'SC', 'USC', 'TYW LT', 'YIA');

DELETE FROM `translatebuilding`
WHERE `Code` IN ('CWC', 'KHB', 'CML', 'NA TT', 'SC', 'USC', 'TYW LT', 'YIA');

-- ========================================================================
-- Part 1 rollback: canonical station-code cleanup
-- ========================================================================

-- Roll back the residence-code label cleanup first. RESI34 and its GPS point
-- existed in the supplied post-2026-09-01 state; only its label changes.
INSERT INTO `gps`
  (`Location`, `Lat`, `Lng`, `ImportantStation`)
VALUES
  ('RESI34', 22.421094, 114.203502, NULL)
ON DUPLICATE KEY UPDATE
  `Lat` = VALUES(`Lat`),
  `Lng` = VALUES(`Lng`),
  `ImportantStation` = VALUES(`ImportantStation`);

INSERT INTO `translatebuilding`
  (`Code`, `Append to js?`, `中文`, `ENG`)
VALUES
  ('RESI34', '', '伍宜孫書院', 'Wu Yee Sun College')
ON DUPLICATE KEY UPDATE
  `Append to js?` = VALUES(`Append to js?`),
  `中文` = VALUES(`中文`),
  `ENG` = VALUES(`ENG`);

-- Recreate the old University Station alias GPS parents. MTR remains the
-- canonical GPS row after rollback because it was already present in the
-- post-2026-09-01 state.
INSERT INTO `gps`
  (`Location`, `Lat`, `Lng`, `ImportantStation`)
VALUES
  ('CUMTR', 22.413570, 114.210100, NULL),
  ('UNIMTR', 22.413570, 114.210100, NULL),
  ('SHAWHALL', 22.419883, 114.206907, '1')
ON DUPLICATE KEY UPDATE
  `Lat` = VALUES(`Lat`),
  `Lng` = VALUES(`Lng`),
  `ImportantStation` = VALUES(`ImportantStation`);

INSERT INTO `translatebuilding`
  (`Code`, `Append to js?`, `中文`, `ENG`)
VALUES
  ('CUMTR', '', '港鐵東鐵線大學站', 'University Station'),
  ('UNIMTR', '', '港鐵東鐵線大學站', 'University Station'),
  ('SHAWHALL', '', '邵逸夫堂', 'Sir Run Run Shaw Hall');

DELETE FROM `translateroute`
WHERE `Code` = 'MTR';

INSERT INTO `translateroute`
  (`Code`, `Append to js?`, `中文`, `ENG`)
VALUES
  ('MTR', '', '港鐵東鐵線大學站', 'University Station'),
  ('SHAWHALL', '', '邵逸夫堂', 'Sir Run Run Shaw Hall');

-- Restore any alias references that were moved by the forward migration.
-- The supplied post-2026-09-01 snapshot has no RouteStops, StopTime,
-- groupedStation, or nearest-station rows using CUMTR/UNIMTR, so no broad
-- MTR-to-alias update is safe here: MTR references that predate this change
-- must remain MTR.

-- Restore the three building rows that were renamed to the canonical SRR
-- building code by the forward migration. SRR's translation row existed
-- before this migration and is therefore intentionally retained.
UPDATE `station`
SET `建築物` = 'SHAWHALL'
WHERE `ID` IN (126, 527, 528)
  AND `建築物` = 'SRR';

-- Restore the six direct rows deleted or merged by the forward migration.
-- ON DUPLICATE KEY UPDATE also handles rows that were renamed in place when
-- the migration was run against the older CUMTR-only state.
INSERT INTO `station`
  (`ID`, `建築物`, `最近之車站`, `Area`)
VALUES
  (309, 'CUMTR', 'MTRP', NULL),
  (461, 'UNIMTR', 'MTR', NULL),
  (462, 'UNIMTR', 'MTRP', NULL),
  (463, 'UNIMTR', 'YIAP', NULL),
  (653, 'CUMTR', 'MTR', NULL),
  (654, 'CUMTR', 'YIAP', NULL)
ON DUPLICATE KEY UPDATE
  `建築物` = VALUES(`建築物`),
  `最近之車站` = VALUES(`最近之車站`),
  `Area` = VALUES(`Area`);

-- ID 652 was the one CUMTR row that did not duplicate an existing MTR pair.
UPDATE `station`
SET `建築物` = 'CUMTR'
WHERE `ID` = 652
  AND `建築物` = 'MTR';

-- Restore the old label used by the already-applied 2026-09-01 migration.
UPDATE `translatebuilding`
SET `中文` = '港鐵東鐵線大學站',
    `ENG` = 'University Station'
WHERE `Code` = 'MTR';

COMMIT;
