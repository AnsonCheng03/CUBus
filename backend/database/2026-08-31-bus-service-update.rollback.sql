-- Rollback for 2026-08-31-bus-service-update.sql.
-- Restores the route and notice values from
-- /Users/ansoncheng/Downloads/CUBus-1/backend/database/initial.sql.
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

-- SHAWHALL already exists in the supplied initial dump as both a GPS row and
-- a route translation. The forward migration upserts the same values, so
-- retain both rows during rollback.

INSERT INTO `Route`
  (`BUSNO`, `StartTime`, `EndTime`, `Period`, `Days`, `Weekdays`, `Warning`, `colorCode`)
VALUES
  ('1', '07:40', '18:55', '10, 25, 40, 55', 'TD,NT', 'WK-Mon,WK-Tue,WK-Wed,WK-Thu,WK-Fri,WK-Sat', '', 'rgb(225,222,73)'),
  ('2', '07:45', '18:45', '15', 'TD,NT', 'WK-Mon,WK-Tue,WK-Wed,WK-Thu,WK-Fri,WK-Sat', '', 'rgb(235,112,201)'),
  ('2#', '07:45', '18:45', '45', 'TD,NT', 'WK-Mon,WK-Tue,WK-Wed,WK-Thu,WK-Fri,WK-Sat', '', 'rgb(235,112,201)'),
  ('2S', '08:00', '18:30', '00, 30', 'TD,NT', 'WK-Mon,WK-Tue,WK-Wed,WK-Thu,WK-Fri,WK-Sat', '', 'rgb(235,112,201)'),
  ('7', '08:18', '17:18', '00, 18', 'TD', 'WK-Mon,WK-Tue,WK-Wed,WK-Thu,WK-Fri', '', 'rgb(191,191,191)'),
  ('7#', '08:18', '13:18', '00, 18', 'TD', 'WK-Sat', '星期六服務至下午1時18分 Saturday service until 1:18 p.m.', 'rgb(191,191,191)'),
  ('8', '07:35', '18:35', '15, 35, 55 (教學日 Teaching Days)', 'TD', 'WK-Mon,WK-Tue,WK-Wed,WK-Thu,WK-Fri,WK-Sat', '只有教學日 Teaching Days only', 'rgb(245,191,90)'),
  ('8#', '07:35', '18:35', '15, 35, 55 (非教學日 Non-Teaching days)', 'NT', 'WK-Mon,WK-Tue,WK-Wed,WK-Thu,WK-Fri,WK-Sat', '只有非教學日 Non-Teaching days only', 'rgb(245,191,90)'),
  ('H', '08:20', '23:20', '20, 40', 'HD', 'WK-Mon,WK-Tue,WK-Wed,WK-Thu,WK-Fri,WK-Sat,WK-Sun', '', 'rgb(140,27,149)'),
  ('H#', '08:20', '23:20', '00', 'HD', 'WK-Mon,WK-Tue,WK-Wed,WK-Thu,WK-Fri,WK-Sat,WK-Sun', '', 'rgb(140,27,149)');

-- Restore the original RouteStopID values from the supplied dump.
INSERT INTO `RouteStops`
  (`RouteStopID`, `BUSNO`, `StopOrder`, `Location`, `Direction`, `TravelTime`)
VALUES
  (236, '1', 1, 'MTR', NULL, 111.007334),
  (237, '1', 2, 'SPORTC', NULL, 108.764411),
  (238, '1', 3, 'SHAWHALL', NULL, 106.038634),
  (239, '1', 4, 'UADM', NULL, 143.910911),
  (240, '1', 5, 'SHHO', NULL, 109.902914),
  (241, '1', 6, 'MTR', NULL, 0.000000),
  (242, '2', 1, 'MTRP', NULL, 162.511900),
  (243, '2', 2, 'SPORTC', NULL, 199.445937),
  (244, '2', 3, 'FKHB', NULL, 218.807733),
  (245, '2', 4, 'UC', 'UPPERST', 84.085089),
  (246, '2', 5, 'NAC', NULL, 66.492965),
  (247, '2', 6, 'UC', 'DOWNST', 92.557962),
  (248, '2', 7, 'UADM', NULL, 152.417684),
  (249, '2', 8, 'SHHO', NULL, 105.243767),
  (250, '2', 9, 'MTR', NULL, 0.000000),
  (251, '2#', 1, 'MTRP', NULL, 162.511900),
  (252, '2#', 2, 'SPORTC', NULL, 120.665898),
  (253, '2#', 3, 'SHAWHALL', NULL, 90.032172),
  (254, '2#', 4, 'FKHB', NULL, 218.807733),
  (255, '2#', 5, 'UC', 'UPPERST', 84.085089),
  (256, '2#', 6, 'NAC', NULL, 66.492965),
  (257, '2#', 7, 'UC', 'DOWNST', 92.557962),
  (258, '2#', 8, 'UADM', NULL, 152.417684),
  (259, '2#', 9, 'SHHO', NULL, 105.243767),
  (260, '2#', 10, 'MTR', NULL, 0.000000),
  (261, '2S', 1, 'MTRP', NULL, 130.075935),
  (262, '2S', 2, 'JCPH', 'UPPERST', 98.067169),
  (263, '2S', 3, 'SPORTC', NULL, 120.665898),
  (264, '2S', 4, 'SHAWHALL', NULL, 90.032172),
  (265, '2S', 5, 'FKHB', NULL, 218.807733),
  (266, '2S', 6, 'UC', 'UPPERST', 84.085089),
  (267, '2S', 7, 'NAC', NULL, 66.492965),
  (268, '2S', 8, 'UC', 'DOWNST', 92.557962),
  (269, '2S', 9, 'UADM', NULL, 152.417684),
  (270, '2S', 10, 'SHHO', NULL, 97.073608),
  (271, '2S', 11, 'JCPH', 'DOWNST', 140.733704),
  (272, '2S', 12, 'MTR', NULL, 0.000000),
  (273, '7', 1, 'SHAWC', 'DOWNST', 75.593161),
  (274, '7', 2, 'WYS', 'DOWNST', 87.369657),
  (275, '7', 3, 'NAC', NULL, 63.112827),
  (276, '7', 4, 'UC', 'DOWNST', 104.970780),
  (277, '7', 5, 'UADM', NULL, 129.322696),
  (278, '7', 6, 'SHHO', NULL, 150.938715),
  (279, '7', 7, 'MTRP', NULL, 70.707498),
  (280, '7', 8, 'CCTEA', NULL, 0.000000),
  (281, '7#', 1, 'SHAWC', 'DOWNST', 75.593161),
  (282, '7#', 2, 'WYS', 'DOWNST', 87.369657),
  (283, '7#', 3, 'NAC', NULL, 63.112827),
  (284, '7#', 4, 'UC', 'DOWNST', 104.970780),
  (285, '7#', 5, 'UADM', NULL, 129.322696),
  (286, '7#', 6, 'SHHO', NULL, 150.938715),
  (287, '7#', 7, 'MTRP', NULL, 70.707498),
  (288, '7#', 8, 'CCTEA', NULL, 0.000000),
  (289, '8', 1, 'YIAP', NULL, 80.104161),
  (290, '8', 2, 'CCEE', 'UPPERST', 86.822019),
  (291, '8', 3, 'CWCC', 'UPPERST', 82.404232),
  (292, '8', 4, 'AREA39', 'UPPERST', 70.359038),
  (293, '8', 5, 'CWCC', 'DOWNST', 78.942715),
  (294, '8', 6, 'UCSR', NULL, 59.967439),
  (295, '8', 7, 'CCHH', NULL, 135.566731),
  (296, '8', 8, 'SHAWC', 'DOWNST', 74.648488),
  (297, '8', 9, 'WYS', 'DOWNST', 101.214667),
  (298, '8', 10, 'UADM', NULL, 127.134342),
  (299, '8', 11, 'SCIC', NULL, 86.814213),
  (300, '8', 12, 'NAC', NULL, 46.800650),
  (301, '8', 13, 'UC', 'DOWNST', 50.534016),
  (302, '8', 14, 'WYS', 'UPPERST', 89.103937),
  (303, '8', 15, 'SHAWC', 'UPPERST', 159.378357),
  (304, '8', 16, 'AREA39', 'DOWNST', 73.806636),
  (305, '8', 17, 'CCEN', NULL, 86.882137),
  (306, '8', 18, 'CCEE', 'DOWNST', 79.983076),
  (307, '8', 19, 'MTR', NULL, 0.000000),
  (308, '8#', 1, 'YIAP', NULL, 80.104161),
  (309, '8#', 2, 'CCEE', 'UPPERST', 86.822019),
  (310, '8#', 3, 'CWCC', 'UPPERST', 82.404232),
  (311, '8#', 4, 'AREA39', 'UPPERST', 70.359038),
  (312, '8#', 5, 'CWCC', 'DOWNST', 78.942715),
  (313, '8#', 6, 'UCSR', NULL, 59.967439),
  (314, '8#', 7, 'CCHH', NULL, 135.566731),
  (315, '8#', 8, 'SHAWC', 'DOWNST', 74.648488),
  (316, '8#', 9, 'WYS', 'DOWNST', 101.214667),
  (317, '8#', 10, 'UADM', NULL, 127.134342),
  (318, '8#', 11, 'SCIC', NULL, 86.814213),
  (319, '8#', 12, 'NAC', NULL, 46.800650),
  (320, '8#', 13, 'UC', 'DOWNST', 50.534016),
  (321, '8#', 14, 'WYS', 'UPPERST', 89.103937),
  (322, '8#', 15, 'SHAWC', 'UPPERST', 159.378357),
  (323, '8#', 16, 'AREA39', 'DOWNST', 73.806636),
  (324, '8#', 17, 'CCEN', NULL, 86.882137),
  (325, '8#', 18, 'CCEE', 'DOWNST', 79.983076),
  (326, '8#', 19, 'MTRP', NULL, 55.093744),
  (327, '8#', 20, 'CCTEA', NULL, 0.000000),
  (328, 'H', 1, 'MTR', NULL, 98.082404),
  (329, 'H', 2, 'SPORTC', NULL, 113.581138),
  (330, 'H', 3, 'SHAWHALL', NULL, 86.236706),
  (331, 'H', 4, 'NAC', 'UPPERST', 47.769363),
  (332, 'H', 5, 'UC', 'DOWNST', 50.827911),
  (333, 'H', 6, 'WYS', 'UPPERST', 90.573628),
  (334, 'H', 7, 'SHAWC', 'UPPERST', 147.858672),
  (335, 'H', 8, 'CWCC', 'DOWNST', 104.289268),
  (336, 'H', 9, 'RESI15', NULL, 43.391169),
  (337, 'H', 10, 'UCSR', NULL, 50.621556),
  (338, 'H', 11, 'CCHH', NULL, 121.385927),
  (339, 'H', 12, 'SHAWC', 'DOWNST', 73.684060),
  (340, 'H', 13, 'WYS', 'DOWNST', 87.511765),
  (341, 'H', 14, 'NAC', 'DOWNST', 61.784861),
  (342, 'H', 15, 'UC', 'DOWNST', 937.810183),
  (343, 'H', 16, 'UADM', NULL, 120.456992),
  (344, 'H', 17, 'SHHO', NULL, 115.266050),
  (345, 'H', 18, 'MTR', NULL, 0.000000),
  (346, 'H#', 1, 'MTR', NULL, 129.875527),
  (347, 'H#', 2, 'JCPH', 'UPPERST', 97.724534),
  (348, 'H#', 3, 'SPORTC', NULL, 116.105261),
  (349, 'H#', 4, 'SHAWHALL', NULL, 87.993529),
  (350, 'H#', 5, 'NAC', 'UPPERST', 47.769363),
  (351, 'H#', 6, 'UC', 'DOWNST', 50.827911),
  (352, 'H#', 7, 'WYS', 'UPPERST', 90.573628),
  (353, 'H#', 8, 'SHAWC', 'UPPERST', 147.858672),
  (354, 'H#', 9, 'AREA39', 'UPPERST', 74.768616),
  (355, 'H#', 10, 'CWCC', 'DOWNST', 103.566205),
  (356, 'H#', 11, 'RESI15', NULL, 41.717608),
  (357, 'H#', 12, 'UCSR', NULL, 49.070160),
  (358, 'H#', 13, 'CCHH', NULL, 120.802258),
  (359, 'H#', 14, 'SHAWC', 'DOWNST', 75.012010),
  (360, 'H#', 15, 'WYS', 'DOWNST', 89.425315),
  (361, 'H#', 16, 'NAC', 'DOWNST', 47.819323),
  (362, 'H#', 17, 'UC', 'DOWNST', 103.536605),
  (363, 'H#', 18, 'UADM', NULL, 119.084185),
  (364, 'H#', 19, 'SHHO', NULL, 113.918829),
  (365, 'H#', 20, 'JCPH', 'DOWNST', 140.362184),
  (366, 'H#', 21, 'MTR', NULL, 0.000000);

-- Restore both notice rows from the supplied dump. Notice ID 7 already
-- existed before the forward migration; it was updated rather than added.
INSERT INTO `notice`
  (`ID`, `Type`, `CHINESE`, `ENGLISH`, `hide`, `duration`, `link`, `dismissible`, `saveDismiss`)
VALUES
  (5, 'light',
   ' 如八號颱風警告信號於上課時始告發出，各班須立即停課。<br>轉堂校巴（5, 6A, 6B, 7）將停止服務。  <br>穿梭校巴（1, 2, 2S, 3, 4, 8, N）將繼續行走一小時。',
   'If Typhoon Warning Signal No. 8 is issued during class, classes must be suspended immediately.<br>The transfer school bus (5, 6A, 6B, 7) will stop service. <br> The shuttle bus (1, 2, 2S, 3, 4, 8, N) will be maintained for one hour.',
   1, 0, '', 1, 0),
  (7, 'light',
   '校巴安排（2026年9月1日起）：1A線改為1線；1B線取消；新增2S線；2線只開每小時15及45分；7線分平日及星期六班次；8線由康本園開出；H線取消十苑站。',
   'Bus changes from 1 September 2026: 1A becomes 1; 1B is cancelled; 2S is added; Route 2 runs at :15 and :45; Route 7 has separate weekday and Saturday schedules; Route 8 starts at YIAP; H skips Residence No. 10.',
   0, 0, '', 1, 0)
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
