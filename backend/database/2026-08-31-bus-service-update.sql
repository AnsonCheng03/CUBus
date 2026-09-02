-- CU Bus service update effective 2026-09-01.
-- Source: mobile/src/initDatas/Route.json and notice.json.
-- Apply this migration to the database from u386506412_cuBusApp.sql.
-- Back up the database before applying it.

SET NAMES utf8mb4;
START TRANSACTION;

-- The supplied dump stores both building codes and route/station codes in
-- station.`建築物`, but translatebuilding is missing the current station
-- parents. Add the missing parents before changing route data; otherwise
-- the station foreign key fails while validating existing rows.
INSERT INTO `translatebuilding`
  (`Code`, `Append to js?`, `中文`, `ENG`)
VALUES
  ('RESI34', '', '伍宜孫書院', 'Wu Yee Sun College'),
  ('SHAWHALL', '', '邵逸夫堂', 'Sir Run Run Shaw Hall'),
  ('SHHC', '', '善衡書院', 'S.H. Ho College')
ON DUPLICATE KEY UPDATE
  `Append to js?` = VALUES(`Append to js?`),
  `中文` = VALUES(`中文`),
  `ENG` = VALUES(`ENG`);

-- Keep the existing station foreign key valid for the other station codes
-- already present in station. Their translations currently live in
-- translateroute in the supplied schema.
INSERT INTO `translatebuilding`
  (`Code`, `Append to js?`, `中文`, `ENG`)
SELECT tr.`Code`, tr.`Append to js?`, tr.`中文`, tr.`ENG`
FROM `translateroute` tr
JOIN (
  SELECT DISTINCT s.`建築物` AS `Code`
  FROM `station` s
  LEFT JOIN `translatebuilding` tb ON tb.`Code` = s.`建築物`
  WHERE s.`建築物` IS NOT NULL
    AND tb.`Code` IS NULL
) missing ON missing.`Code` = tr.`Code`
ON DUPLICATE KEY UPDATE
  `Append to js?` = VALUES(`Append to js?`),
  `中文` = VALUES(`中文`),
  `ENG` = VALUES(`ENG`);

-- Keep the supplied database's legacy GPS codes WYS and SHHO. The route rows
-- below intentionally use those existing parent keys; no GPS rows are
-- renamed or cascaded.

-- SHAWHALL exists as a building in the dump, but is not yet a GPS station.
-- It is a route stop in the current mobile data, so add its station metadata
-- before inserting RouteStops.
INSERT INTO `gps` (`Location`, `Lat`, `Lng`, `ImportantStation`)
VALUES ('SHAWHALL', 22.419883, 114.206907, '1')
ON DUPLICATE KEY UPDATE
  `Lat` = VALUES(`Lat`),
  `Lng` = VALUES(`Lng`),
  `ImportantStation` = VALUES(`ImportantStation`);

INSERT INTO `translateroute` (`Code`, `Append to js?`, `中文`, `ENG`)
VALUES ('SHAWHALL', '', '邵逸夫堂', 'Sir Run Run Shaw Hall')
ON DUPLICATE KEY UPDATE
  `Append to js?` = VALUES(`Append to js?`),
  `中文` = VALUES(`中文`),
  `ENG` = VALUES(`ENG`);

-- Remove stale definitions first because RouteStops has a foreign key to Route.
DELETE FROM `RouteStops`
WHERE `BUSNO` IN ('1A', '1B', '1', '2', '2#', '2S', '7', '7#', '8', '8#', 'H', 'H#');

DELETE FROM `Route`
WHERE `BUSNO` IN ('1A', '1B', '1', '2', '2#', '2S', '7', '7#', '8', '8#', 'H', 'H#');

INSERT INTO `Route`
  (`BUSNO`, `StartTime`, `EndTime`, `Period`, `Days`, `Weekdays`, `Warning`, `colorCode`)
VALUES
  ('1',  '07:40', '18:55', '10, 25, 40, 55', 'TD,NT', 'WK-Mon,WK-Tue,WK-Wed,WK-Thu,WK-Fri,WK-Sat', '', 'rgb(225,222,73)'),
  ('2',  '07:45', '18:45', '15',             'TD,NT', 'WK-Mon,WK-Tue,WK-Wed,WK-Thu,WK-Fri,WK-Sat', '', 'rgb(235,112,201)'),
  ('2#', '07:45', '18:45', '45',             'TD,NT', 'WK-Mon,WK-Tue,WK-Wed,WK-Thu,WK-Fri,WK-Sat', '', 'rgb(235,112,201)'),
  ('2S', '08:00', '18:30', '00, 30',         'TD,NT', 'WK-Mon,WK-Tue,WK-Wed,WK-Thu,WK-Fri,WK-Sat', '', 'rgb(235,112,201)'),
  ('7',  '08:18', '17:18', '00, 18',         'TD',    'WK-Mon,WK-Tue,WK-Wed,WK-Thu,WK-Fri',         '', 'rgb(191,191,191)'),
  ('7#', '08:18', '13:18', '00, 18',         'TD',    'WK-Sat',                                     '星期六服務至下午1時18分 Saturday service until 1:18 p.m.', 'rgb(191,191,191)'),
  ('8',  '07:35', '18:35', '15, 35, 55 (教學日 Teaching Days)',       'TD', 'WK-Mon,WK-Tue,WK-Wed,WK-Thu,WK-Fri,WK-Sat', '只有教學日 Teaching Days only',       'rgb(245,191,90)'),
  ('8#', '07:35', '18:35', '15, 35, 55 (非教學日 Non-Teaching days)', 'NT', 'WK-Mon,WK-Tue,WK-Wed,WK-Thu,WK-Fri,WK-Sat', '只有非教學日 Non-Teaching days only', 'rgb(245,191,90)'),
  ('H',  '08:20', '23:20', '20, 40',         'HD',    'WK-Mon,WK-Tue,WK-Wed,WK-Thu,WK-Fri,WK-Sat,WK-Sun', '', 'rgb(140,27,149)'),
  ('H#', '08:20', '23:20', '00',             'HD',    'WK-Mon,WK-Tue,WK-Wed,WK-Thu,WK-Fri,WK-Sat,WK-Sun', '', 'rgb(140,27,149)');

-- RouteStops uses AUTO_INCREMENT for RouteStopID, so IDs are intentionally
-- omitted. StopOrder controls the order returned by the API.
INSERT INTO `RouteStops`
  (`BUSNO`, `StopOrder`, `Location`, `Direction`, `TravelTime`)
VALUES
  ('1',  1, 'MTR',      NULL,       111.007334),
  ('1',  2, 'SPORTC',   NULL,       108.764411),
  ('1',  3, 'SHAWHALL', NULL,       106.038634),
  ('1', 4, 'UADM', NULL, 143.910911),
  ('1', 5, 'SHHO', NULL, 109.902914),
  ('1', 6, 'MTR', NULL, 0.000000),

  ('2', 1, 'MTRP', NULL, 162.511900),
  ('2', 2, 'SPORTC', NULL, 199.445937),
  ('2', 3, 'FKHB', NULL, 218.807733),
  ('2', 4, 'UC', 'UPPERST', 84.085089),
  ('2', 5, 'NAC', NULL, 66.492965),
  ('2', 6, 'UC', 'DOWNST', 92.557962),
  ('2', 7, 'UADM', NULL, 152.417684),
  ('2', 8, 'SHHO', NULL, 105.243767),
  ('2', 9, 'MTR', NULL, 0.000000),

  ('2#', 1, 'MTRP', NULL, 162.511900),
  ('2#', 2, 'SPORTC', NULL, 120.665898),
  ('2#', 3, 'SHAWHALL', NULL, 90.032172),
  ('2#', 4, 'FKHB', NULL, 218.807733),
  ('2#', 5, 'UC', 'UPPERST', 84.085089),
  ('2#', 6, 'NAC', NULL, 66.492965),
  ('2#', 7, 'UC', 'DOWNST', 92.557962),
  ('2#', 8, 'UADM', NULL, 152.417684),
  ('2#', 9, 'SHHO', NULL, 105.243767),
  ('2#', 10, 'MTR', NULL, 0.000000),

  ('2S', 1, 'MTRP', NULL, 130.075935),
  ('2S', 2, 'JCPH', 'UPPERST', 98.067169),
  ('2S', 3, 'SPORTC', NULL, 120.665898),
  ('2S', 4, 'SHAWHALL', NULL, 90.032172),
  ('2S', 5, 'FKHB', NULL, 218.807733),
  ('2S', 6, 'UC', 'UPPERST', 84.085089),
  ('2S', 7, 'NAC', NULL, 66.492965),
  ('2S', 8, 'UC', 'DOWNST', 92.557962),
  ('2S', 9, 'UADM', NULL, 152.417684),
  ('2S', 10, 'SHHO', NULL, 97.073608),
  ('2S', 11, 'JCPH', 'DOWNST', 140.733704),
  ('2S', 12, 'MTR', NULL, 0.000000),

  ('7', 1, 'SHAWC', 'DOWNST', 75.593161),
  ('7', 2, 'WYS', 'DOWNST', 87.369657),
  ('7', 3, 'NAC', NULL, 63.112827),
  ('7', 4, 'UC', 'DOWNST', 104.970780),
  ('7', 5, 'UADM', NULL, 129.322696),
  ('7', 6, 'SHHO', NULL, 150.938715),
  ('7', 7, 'MTRP', NULL, 70.707498),
  ('7', 8, 'CCTEA', NULL, 0.000000),

  ('7#', 1, 'SHAWC', 'DOWNST', 75.593161),
  ('7#', 2, 'WYS', 'DOWNST', 87.369657),
  ('7#', 3, 'NAC', NULL, 63.112827),
  ('7#', 4, 'UC', 'DOWNST', 104.970780),
  ('7#', 5, 'UADM', NULL, 129.322696),
  ('7#', 6, 'SHHO', NULL, 150.938715),
  ('7#', 7, 'MTRP', NULL, 70.707498),
  ('7#', 8, 'CCTEA', NULL, 0.000000),

  ('8', 1, 'YIAP', NULL, 80.104161),
  ('8', 2, 'CCEE', 'UPPERST', 86.822019),
  ('8', 3, 'CWCC', 'UPPERST', 82.404232),
  ('8', 4, 'AREA39', 'UPPERST', 70.359038),
  ('8', 5, 'CWCC', 'DOWNST', 78.942715),
  ('8', 6, 'UCSR', NULL, 59.967439),
  ('8', 7, 'CCHH', NULL, 135.566731),
  ('8', 8, 'SHAWC', 'DOWNST', 74.648488),
  ('8', 9, 'WYS', 'DOWNST', 101.214667),
  ('8', 10, 'UADM', NULL, 127.134342),
  ('8', 11, 'SCIC', NULL, 86.814213),
  ('8', 12, 'NAC', NULL, 46.800650),
  ('8', 13, 'UC', 'DOWNST', 50.534016),
  ('8', 14, 'WYS', 'UPPERST', 89.103937),
  ('8', 15, 'SHAWC', 'UPPERST', 159.378357),
  ('8', 16, 'AREA39', 'DOWNST', 73.806636),
  ('8', 17, 'CCEN', NULL, 86.882137),
  ('8', 18, 'CCEE', 'DOWNST', 79.983076),
  ('8', 19, 'MTR', NULL, 0.000000),

  ('8#', 1, 'YIAP', NULL, 80.104161),
  ('8#', 2, 'CCEE', 'UPPERST', 86.822019),
  ('8#', 3, 'CWCC', 'UPPERST', 82.404232),
  ('8#', 4, 'AREA39', 'UPPERST', 70.359038),
  ('8#', 5, 'CWCC', 'DOWNST', 78.942715),
  ('8#', 6, 'UCSR', NULL, 59.967439),
  ('8#', 7, 'CCHH', NULL, 135.566731),
  ('8#', 8, 'SHAWC', 'DOWNST', 74.648488),
  ('8#', 9, 'WYS', 'DOWNST', 101.214667),
  ('8#', 10, 'UADM', NULL, 127.134342),
  ('8#', 11, 'SCIC', NULL, 86.814213),
  ('8#', 12, 'NAC', NULL, 46.800650),
  ('8#', 13, 'UC', 'DOWNST', 50.534016),
  ('8#', 14, 'WYS', 'UPPERST', 89.103937),
  ('8#', 15, 'SHAWC', 'UPPERST', 159.378357),
  ('8#', 16, 'AREA39', 'DOWNST', 73.806636),
  ('8#', 17, 'CCEN', NULL, 86.882137),
  ('8#', 18, 'CCEE', 'DOWNST', 79.983076),
  ('8#', 19, 'MTRP', NULL, 55.093744),
  ('8#', 20, 'CCTEA', NULL, 0.000000),

  ('H', 1, 'MTR', NULL, 98.082404),
  ('H', 2, 'SPORTC', NULL, 113.581138),
  ('H', 3, 'SHAWHALL', NULL, 86.236706),
  ('H', 4, 'NAC', 'UPPERST', 47.769363),
  ('H', 5, 'UC', 'DOWNST', 50.827911),
  ('H', 6, 'WYS', 'UPPERST', 90.573628),
  ('H', 7, 'SHAWC', 'UPPERST', 147.858672),
  ('H', 8, 'CWCC', 'DOWNST', 104.289268),
  ('H', 9, 'RESI15', NULL, 43.391169),
  ('H', 10, 'UCSR', NULL, 50.621556),
  ('H', 11, 'CCHH', NULL, 121.385927),
  ('H', 12, 'SHAWC', 'DOWNST', 73.684060),
  ('H', 13, 'WYS', 'DOWNST', 87.511765),
  ('H', 14, 'NAC', 'DOWNST', 61.784861),
  ('H', 15, 'UC', 'DOWNST', 937.810183),
  ('H', 16, 'UADM', NULL, 120.456992),
  ('H', 17, 'SHHO', NULL, 115.266050),
  ('H', 18, 'MTR', NULL, 0.000000),

  ('H#', 1, 'MTR', NULL, 129.875527),
  ('H#', 2, 'JCPH', 'UPPERST', 97.724534),
  ('H#', 3, 'SPORTC', NULL, 116.105261),
  ('H#', 4, 'SHAWHALL', NULL, 87.993529),
  ('H#', 5, 'NAC', 'UPPERST', 47.769363),
  ('H#', 6, 'UC', 'DOWNST', 50.827911),
  ('H#', 7, 'WYS', 'UPPERST', 90.573628),
  ('H#', 8, 'SHAWC', 'UPPERST', 147.858672),
  ('H#', 9, 'AREA39', 'UPPERST', 74.768616),
  ('H#', 10, 'CWCC', 'DOWNST', 103.566205),
  ('H#', 11, 'RESI15', NULL, 41.717608),
  ('H#', 12, 'UCSR', NULL, 49.070160),
  ('H#', 13, 'CCHH', NULL, 120.802258),
  ('H#', 14, 'SHAWC', 'DOWNST', 75.012010),
  ('H#', 15, 'WYS', 'DOWNST', 89.425315),
  ('H#', 16, 'NAC', 'DOWNST', 47.819323),
  ('H#', 17, 'UC', 'DOWNST', 103.536605),
  ('H#', 18, 'UADM', NULL, 119.084185),
  ('H#', 19, 'SHHO', NULL, 113.918829),
  ('H#', 20, 'JCPH', 'DOWNST', 140.362184),
  ('H#', 21, 'MTR', NULL, 0.000000);

-- The dump's Type column is VARCHAR(6), so use the existing light variant
-- instead of widening the schema just for this notice.
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

-- Route timetable JSON is a generated file, not a database table. After this
-- migration, regenerate it from the updated Route/RouteStops tables:
-- npm run --workspace=@cu-bus/backend job:generate-timetable
