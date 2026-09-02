-- Rollback for 2026-08-31-bus-service-update.sql.
-- Restores the route and notice values from
-- /Users/ansoncheng/Downloads/u386506412_cuBusApp.sql.
-- Back up the database before applying it.

SET NAMES utf8mb4;
START TRANSACTION;

-- Remove the migrated route rows first because RouteStops references Route.
DELETE FROM `RouteStops`
WHERE `BUSNO` IN ('1A', '1B', '1', '2', '2#', '2S', '7', '7#', '8', '8#', 'H', 'H#');

DELETE FROM `Route`
WHERE `BUSNO` IN ('1A', '1B', '1', '2', '2#', '2S', '7', '7#', '8', '8#', 'H', 'H#');

-- The forward migration keeps the supplied GPS codes WYS and SHHO, so there
-- are no GPS station-code changes to reverse here.

-- SHAWHALL was added by the forward migration because the supplied dump only
-- had it as a building, not as a GPS station or route translation.
DELETE FROM `translateroute`
WHERE `Code` = 'SHAWHALL';

DELETE FROM `gps`
WHERE `Location` = 'SHAWHALL';

INSERT INTO `Route`
  (`BUSNO`, `StartTime`, `EndTime`, `Period`, `Days`, `Weekdays`, `Warning`, `colorCode`)
VALUES
  ('1A', '07:40', '18:40', '10, 20, 40, 50', 'TD,NT', 'WK-Mon,WK-Tue,WK-Wed,WK-Thu,WK-Fri,WK-Sat', '', 'rgb(225,222,73)'),
  ('1B', '08:00', '18:00', '00, 30',         'TD,NT', 'WK-Mon,WK-Tue,WK-Wed,WK-Thu,WK-Fri,WK-Sat', '', 'rgb(225,222,73)'),
  ('2',  '07:45', '18:45', '15, 30',          'TD,NT', 'WK-Mon,WK-Tue,WK-Wed,WK-Thu,WK-Fri,WK-Sat', '', 'rgb(235,112,201)'),
  ('2#', '07:45', '18:45', '00, 45',          'TD,NT', 'WK-Mon,WK-Tue,WK-Wed,WK-Thu,WK-Fri,WK-Sat', '', 'rgb(235,112,201)'),
  ('7',  '08:18', '17:50', '18, 50',          'TD',    'WK-Mon,WK-Tue,WK-Wed,WK-Thu,WK-Fri',         '', 'rgb(191,191,191)'),
  ('7#', '08:18', '13:18', '18, 50',          'TD',    'WK-Sat',                                     '', 'rgb(191,191,191)'),
  ('8',  '07:40', '18:40', '00, 20, 40',      'TD',    'WK-Mon,WK-Tue,WK-Wed,WK-Thu,WK-Fri,WK-Sat', '只有教學日 Teaching Days only',       'rgb(245,191,90)'),
  ('8#', '07:40', '18:40', '00, 20, 40',      'NT',    'WK-Mon,WK-Tue,WK-Wed,WK-Thu,WK-Fri,WK-Sat', '只有非教學日 Non-Teaching days only', 'rgb(245,191,90)'),
  ('H',  '08:20', '23:20', '20, 40',          'HD',    'WK-Mon,WK-Tue,WK-Wed,WK-Thu,WK-Fri,WK-Sat,WK-Sun', '', 'rgb(140,27,149)'),
  ('H#', '08:20', '23:20', '00',              'HD',    'WK-Mon,WK-Tue,WK-Wed,WK-Thu,WK-Fri,WK-Sat,WK-Sun', '', 'rgb(140,27,149)');

-- Restore the original RouteStopID values from the supplied dump.
INSERT INTO `RouteStops`
  (`RouteStopID`, `BUSNO`, `StopOrder`, `Location`, `Direction`, `TravelTime`)
VALUES
  (1, '1A', 1, 'MTR', NULL, 111.007334),
  (2, '1A', 2, 'SPORTC', NULL, 108.764411),
  (3, '1A', 3, 'SRR', NULL, 106.038634),
  (4, '1A', 4, 'UADM', NULL, 143.910911),
  (5, '1A', 5, 'SHHO', NULL, 109.902914),
  (6, '1A', 6, 'MTR', NULL, 0.000000),

  (7, '1B', 1, 'MTR', NULL, 130.075935),
  (8, '1B', 2, 'JCPH', 'UPPERST', 98.067169),
  (9, '1B', 3, 'SPORTC', NULL, 109.562531),
  (10, '1B', 4, 'SRR', NULL, 106.387098),
  (11, '1B', 5, 'UADM', NULL, 146.006179),
  (12, '1B', 6, 'SHHO', NULL, 97.073608),
  (13, '1B', 7, 'JCPH', 'DOWNST', 140.733704),
  (14, '1B', 8, 'MTR', NULL, 0.000000),

  (15, '2', 1, 'MTRP', NULL, 162.511900),
  (16, '2', 2, 'SPORTC', NULL, 199.445937),
  (17, '2', 3, 'FKHB', NULL, 218.807733),
  (18, '2', 4, 'UC', 'UPPERST', 84.085089),
  (19, '2', 5, 'NAC', NULL, 66.492965),
  (20, '2', 6, 'UC', 'DOWNST', 92.557962),
  (21, '2', 7, 'UADM', NULL, 152.417684),
  (22, '2', 8, 'SHHO', NULL, 105.243767),
  (23, '2', 9, 'MTR', NULL, 0.000000),

  (24, '2#', 1, 'MTRP', NULL, 162.511900),
  (25, '2#', 2, 'SPORTC', NULL, 120.665898),
  (26, '2#', 3, 'SRR', NULL, 90.032172),
  (27, '2#', 4, 'FKHB', NULL, 218.807733),
  (28, '2#', 5, 'UC', 'UPPERST', 84.085089),
  (29, '2#', 6, 'NAC', NULL, 66.492965),
  (30, '2#', 7, 'UC', 'DOWNST', 92.557962),
  (31, '2#', 8, 'UADM', NULL, 152.417684),
  (32, '2#', 9, 'SHHO', NULL, 105.243767),
  (33, '2#', 10, 'MTR', NULL, 0.000000),

  (89, '7', 1, 'SHAWC', 'DOWNST', 75.593161),
  (90, '7', 2, 'WYS', 'DOWNST', 87.369657),
  (91, '7', 3, 'NAC', NULL, 63.112827),
  (92, '7', 4, 'UC', 'DOWNST', 104.970780),
  (93, '7', 5, 'UADM', NULL, 129.322696),
  (94, '7', 6, 'SHHO', NULL, 150.938715),
  (95, '7', 7, 'MTRP', NULL, 70.707498),
  (96, '7', 8, 'CCTEA', NULL, 0.000000),

  (212, '7#', 1, 'SHAWC', 'DOWNST', 75.593161),
  (213, '7#', 2, 'WYS', 'DOWNST', 87.369657),
  (214, '7#', 3, 'NAC', NULL, 63.112827),
  (215, '7#', 4, 'UC', 'DOWNST', 104.970780),
  (216, '7#', 5, 'UADM', NULL, 129.322696),
  (217, '7#', 6, 'SHHO', NULL, 150.938715),
  (218, '7#', 7, 'MTRP', NULL, 70.707498),
  (219, '7#', 8, 'CCTEA', NULL, 0.000000),

  (97, '8', 1, 'AREA39', 'UPPERST', 70.359038),
  (98, '8', 2, 'CWCC', 'DOWNST', 78.942715),
  (99, '8', 3, 'UCSR', NULL, 59.967439),
  (100, '8', 4, 'CCHH', NULL, 135.566731),
  (101, '8', 5, 'SHAWC', 'DOWNST', 74.648488),
  (102, '8', 6, 'WYS', 'DOWNST', 101.214667),
  (103, '8', 7, 'UADM', NULL, 127.134342),
  (104, '8', 8, 'SCIC', NULL, 86.814213),
  (105, '8', 9, 'NAC', NULL, 46.800650),
  (106, '8', 10, 'UC', 'DOWNST', 50.534016),
  (107, '8', 11, 'WYS', 'UPPERST', 89.103937),
  (108, '8', 12, 'SHAWC', 'UPPERST', 159.378357),
  (109, '8', 13, 'AREA39', 'DOWNST', 73.806636),
  (110, '8', 14, 'CCEN', NULL, 86.882137),
  (111, '8', 15, 'CCEE', 'DOWNST', 79.983076),
  (112, '8', 16, 'MTR', NULL, 0.000000),

  (113, '8#', 1, 'AREA39', 'UPPERST', 70.359038),
  (114, '8#', 2, 'CWCC', 'DOWNST', 78.942715),
  (115, '8#', 3, 'UCSR', NULL, 59.967439),
  (116, '8#', 4, 'CCHH', NULL, 135.566731),
  (117, '8#', 5, 'SHAWC', 'DOWNST', 74.648488),
  (118, '8#', 6, 'WYS', 'DOWNST', 101.214667),
  (119, '8#', 7, 'UADM', NULL, 127.134342),
  (120, '8#', 8, 'SCIC', NULL, 86.814213),
  (121, '8#', 9, 'NAC', NULL, 46.800650),
  (122, '8#', 10, 'UC', 'DOWNST', 50.534016),
  (123, '8#', 11, 'WYS', 'UPPERST', 89.103937),
  (124, '8#', 12, 'SHAWC', 'UPPERST', 159.378357),
  (125, '8#', 13, 'AREA39', 'DOWNST', 73.806636),
  (126, '8#', 14, 'CCEN', NULL, 86.882137),
  (127, '8#', 15, 'CCEE', 'DOWNST', 79.983076),
  (128, '8#', 16, 'MTRP', NULL, 55.093744),
  (129, '8#', 17, 'CCTEA', NULL, 0.000000),

  (130, 'H', 1, 'MTR', NULL, 98.082404),
  (131, 'H', 2, 'SPORTC', NULL, 113.581138),
  (132, 'H', 3, 'SRR', NULL, 86.236706),
  (133, 'H', 4, 'NAC', 'UPPERST', 47.769363),
  (134, 'H', 5, 'UC', 'DOWNST2', 50.827911),
  (135, 'H', 6, 'WYS', 'UPPERST', 90.573628),
  (136, 'H', 7, 'SHAWC', 'UPPERST', 147.858672),
  (137, 'H', 8, 'CWCC', 'DOWNST', 63.593244),
  (138, 'H', 9, 'RESI10', NULL, 40.696024),
  (139, 'H', 10, 'RESI15', NULL, 43.391169),
  (140, 'H', 11, 'UCSR', NULL, 50.621556),
  (141, 'H', 12, 'CCHH', NULL, 121.385927),
  (142, 'H', 13, 'SHAWC', 'DOWNST', 73.684060),
  (143, 'H', 14, 'WYS', 'DOWNST', 87.511765),
  (144, 'H', 15, 'NAC', 'DOWNST', 61.784861),
  (145, 'H', 16, 'UC', 'DOWNST', 937.810183),
  (146, 'H', 17, 'UADM', NULL, 120.456992),
  (147, 'H', 18, 'SHHO', NULL, 115.266050),
  (148, 'H', 19, 'MTR', NULL, 0.000000),

  (149, 'H#', 1, 'MTR', NULL, 129.875527),
  (150, 'H#', 2, 'JCPH', 'UPPERST', 97.724534),
  (151, 'H#', 3, 'SPORTC', NULL, 116.105261),
  (152, 'H#', 4, 'SRR', NULL, 87.993529),
  (153, 'H#', 5, 'NAC', 'UPPERST', 47.769363),
  (154, 'H#', 6, 'UC', 'DOWNST2', 50.827911),
  (155, 'H#', 7, 'WYS', 'UPPERST', 90.573628),
  (156, 'H#', 8, 'SHAWC', 'UPPERST', 147.858672),
  (157, 'H#', 9, 'AREA39', 'UPPERST', 74.768616),
  (158, 'H#', 10, 'CWCC', 'DOWNST', 62.594472),
  (159, 'H#', 11, 'RESI10', NULL, 40.971733),
  (160, 'H#', 12, 'RESI15', NULL, 41.717608),
  (161, 'H#', 13, 'UCSR', NULL, 49.070160),
  (162, 'H#', 14, 'CCHH', NULL, 120.802258),
  (163, 'H#', 15, 'SHAWC', 'DOWNST', 75.012010),
  (164, 'H#', 16, 'WYS', 'DOWNST', 89.425315),
  (165, 'H#', 17, 'NAC', 'DOWNST', 47.819323),
  (166, 'H#', 18, 'UC', 'DOWNST', 103.536605),
  (167, 'H#', 19, 'UADM', NULL, 119.084185),
  (168, 'H#', 20, 'SHHO', NULL, 113.918829),
  (169, 'H#', 21, 'JCPH', 'DOWNST', 140.362184),
  (170, 'H#', 22, 'MTR', NULL, 0.000000);

-- Restore the two notice rows from the supplied dump and remove the added one.
DELETE FROM `notice`
WHERE `ID` = 7;

INSERT INTO `notice`
  (`ID`, `Type`, `CHINESE`, `ENGLISH`, `hide`, `duration`, `link`, `dismissible`, `saveDismiss`)
VALUES
  (5, 'light',
   ' 如八號颱風警告信號於上課時始告發出，各班須立即停課。<br>轉堂校巴（5, 6A, 6B, 7）將停止服務。  <br>穿梭校巴（1A, 1B, 2, 3, 4, 8, N）將繼續行走一小時。',
   'If Typhoon Warning Signal No. 8 is issued during class, classes must be suspended immediately.<br>The transfer school bus (5, 6A, 6B, 7) will stop service. <br> The shuttle bus (1A, 1B, 2, 3, 4, 8, N) will be maintained for one hour.',
   1, 0, '', 1, 0)
ON DUPLICATE KEY UPDATE
  `Type` = VALUES(`Type`),
  `CHINESE` = VALUES(`CHINESE`),
  `ENGLISH` = VALUES(`ENGLISH`),
  `hide` = VALUES(`hide`),
  `duration` = VALUES(`duration`),
  `link` = VALUES(`link`),
  `dismissible` = VALUES(`dismissible`),
  `saveDismiss` = VALUES(`saveDismiss`);

COMMIT;
