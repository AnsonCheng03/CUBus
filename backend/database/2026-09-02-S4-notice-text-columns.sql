-- Match the production notice schema change.
-- The production database was changed manually before this migration was
-- recorded. Run this file only on environments that still have the original
-- VARCHAR columns; on production, record the migration as already applied.

SET NAMES utf8mb4;

-- DDL implicitly commits in MySQL/MariaDB, so this is intentionally not
-- wrapped in START TRANSACTION/COMMIT.
ALTER TABLE `notice`
  MODIFY COLUMN `CHINESE` TEXT NULL,
  MODIFY COLUMN `ENGLISH` TEXT NULL;
