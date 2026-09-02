-- Separate the 七小龍 building from the YIA building label.
-- Follow-up migration: the earlier migrations have already been applied.
--
-- Canonical building codes:
--   YIA  = 康本國際學術園 / Yasumoto International Academic Park
--   YIAE = 七小龍
--
-- YIAE is a searchable building only, not a bus stop. Its GPS point is the
-- existing YIA point, as in the original approved building-search data. Its
-- English field remains empty because no separate official English building
-- name was supplied. CUHK describes 七小龍 as a student nickname for YIA;
-- the separate searchable row below is the user's approved search design.

SET NAMES utf8mb4;
START TRANSACTION;

-- Remove 七小龍 from the YIA label in both translation tables.
UPDATE `translateroute`
SET `中文` = '康本國際學術園',
    `ENG` = 'Yasumoto International Academic Park'
WHERE `Code` = 'YIA';

UPDATE `translatebuilding`
SET `中文` = '康本國際學術園',
    `ENG` = 'Yasumoto International Academic Park'
WHERE `Code` = 'YIA';

-- Restore 七小龍 as its own searchable building parent.
INSERT INTO `translatebuilding`
  (`Code`, `Append to js?`, `中文`, `ENG`)
VALUES
  ('YIAE', '', '七小龍', '');

-- Reuse the existing YIA GPS point; no new coordinate is being invented.
INSERT INTO `gps`
  (`Location`, `Lat`, `Lng`, `ImportantStation`)
SELECT 'YIAE', `Lat`, `Lng`, `ImportantStation`
FROM `gps`
WHERE `Location` = 'YIA';

-- Restore the four approved direct nearest-station rows formerly belonging
-- to YIAE. IDs 960-963 are new migration-owned IDs after the 2026-09-02
-- migration's highest inserted station ID (959).
INSERT INTO `station`
  (`ID`, `建築物`, `最近之車站`, `Area`)
VALUES
  (960, 'YIAE', 'MTRP', NULL),
  (961, 'YIAE', 'CCTEA', NULL),
  (962, 'YIAE', 'MTR', NULL),
  (963, 'YIAE', 'YIA', NULL);

COMMIT;
