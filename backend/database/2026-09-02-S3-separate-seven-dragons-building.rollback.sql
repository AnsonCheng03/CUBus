-- Rollback for 2026-09-02-S3-separate-seven-dragons-building.sql.

SET NAMES utf8mb4;
START TRANSACTION;

DELETE FROM `station`
WHERE `ID` IN (960, 961, 962, 963)
  AND `建築物` = 'YIAE';

DELETE FROM `gps`
WHERE `Location` = 'YIAE';

DELETE FROM `translatebuilding`
WHERE `Code` = 'YIAE';

-- Restore the full YIA label from the preceding name/width migration.
UPDATE `translateroute`
SET `中文` = '康本國際學術園 / 七小龍',
    `ENG` = 'Yasumoto International Academic Park / Seven Dragons'
WHERE `Code` = 'YIA';

UPDATE `translatebuilding`
SET `中文` = '康本國際學術園 / 七小龍',
    `ENG` = 'Yasumoto International Academic Park / Seven Dragons'
WHERE `Code` = 'YIA';

COMMIT;
