-- Repair for 2026-09-02-S1-transport-office-bus-name-update.sql.
-- The previous migration's YIA value was longer than the original
-- translateroute column sizes, which caused warning #1265 and truncation.
-- This migration is safe to run after that migration has already run.
--
-- YIA is intentionally kept as the user-approved full label:
--   Yasumoto International Academic Park / Seven Dragons
--   康本國際學術園 / 七小龍

SET NAMES utf8mb4;

-- ALTER TABLE causes an implicit commit in MySQL/MariaDB, so keep the DDL
-- outside the data transaction.
ALTER TABLE `translateroute`
  MODIFY COLUMN `中文` varchar(27) DEFAULT NULL,
  MODIFY COLUMN `ENG` varchar(75) DEFAULT NULL;

START TRANSACTION;

UPDATE `translateroute`
SET `中文` = '康本國際學術園 / 七小龍',
    `ENG` = 'Yasumoto International Academic Park / Seven Dragons'
WHERE `Code` = 'YIA';

UPDATE `translatebuilding`
SET `中文` = '康本國際學術園 / 七小龍',
    `ENG` = 'Yasumoto International Academic Park / Seven Dragons'
WHERE `Code` = 'YIA';

COMMIT;
