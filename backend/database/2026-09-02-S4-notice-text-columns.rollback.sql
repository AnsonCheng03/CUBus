-- Rollback for 2026-09-02-S4-notice-text-columns.sql.
-- Check for values longer than the original limits before running this file:
--   SELECT ID FROM notice
--   WHERE CHAR_LENGTH(CHINESE) > 155 OR CHAR_LENGTH(ENGLISH) > 246;
-- A rollback is unsafe while either query finds rows.

SET NAMES utf8mb4;

ALTER TABLE `notice`
  MODIFY COLUMN `CHINESE` VARCHAR(155) NULL,
  MODIFY COLUMN `ENGLISH` VARCHAR(246) NULL;
