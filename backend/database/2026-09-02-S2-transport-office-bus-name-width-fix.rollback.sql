-- Rollback for 2026-09-02-S2-transport-office-bus-name-width-fix.sql.
-- Restores the values and original translateroute column sizes from the
-- already-applied 2026-09-02-canonical-station-code-update.sql state.

SET NAMES utf8mb4;
START TRANSACTION;

UPDATE `translateroute`
SET `中文` = '康本國際學術園',
    `ENG` = 'Yasumoto International Academic Park'
WHERE `Code` = 'YIA';

UPDATE `translatebuilding`
SET `中文` = '康本國際學術園 / 七小龍',
    `ENG` = 'Yasumoto International Academic Park / Seven Dragons'
WHERE `Code` = 'YIA';

COMMIT;

-- The restored values fit the original schema sizes, so narrow the columns
-- only after the data has been restored.
ALTER TABLE `translateroute`
  MODIFY COLUMN `中文` varchar(8) DEFAULT NULL,
  MODIFY COLUMN `ENG` varchar(36) DEFAULT NULL;
