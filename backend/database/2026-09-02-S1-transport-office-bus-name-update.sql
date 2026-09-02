-- CUHK Transport Office bus-stop name alignment.
-- Follow-up migration: 2026-09-02-canonical-station-code-update.sql has
-- already been applied. This migration changes labels only; station codes,
-- GPS coordinates, route order, and nearest-station mappings are unchanged.
--
-- Official sources checked on 2026-09-02:
--   https://transport.cuhk.edu.hk/route/1a/
--   https://transport.cuhk.edu.hk/route/2/
--   https://transport.cuhk.edu.hk/route/1b/
--   https://transport.cuhk.edu.hk/route/3/
--   https://transport.cuhk.edu.hk/route/4/
--   https://transport.cuhk.edu.hk/route/5/
--   https://transport.cuhk.edu.hk/route/6a/
--   https://transport.cuhk.edu.hk/route/6b/
--   https://transport.cuhk.edu.hk/route/7/
--   https://transport.cuhk.edu.hk/route/8/
--   https://transport.cuhk.edu.hk/route/n/
--   https://transport.cuhk.edu.hk/route/h/
--   https://transport.cuhk.edu.hk/tc/route/4/
--
-- Directional labels such as “(Upward)” and “(Downward)” are represented by
-- RouteStops.Direction, so the shared translation stores the official base
-- stop name. The official pages use NAC for both “New Asia College” and
-- “New Asia Circle”; because this database has one GPS/code for both, NAC is
-- intentionally left as the existing “New Asia College” label. Per the
-- user's explicit preference, YIA retains “Yasumoto International Academic
-- Park / Seven Dragons” and “康本國際學術園 / 七小龍”, and MTR retains
-- “University Station” and “港鐵大學站”.

SET NAMES utf8mb4;
START TRANSACTION;

-- Keep the transport-stop translations aligned with the official route pages,
-- with the explicit YIA and MTR wording preferences documented above.
UPDATE `translateroute`
SET `中文` = CASE `Code`
  WHEN 'AREA39' THEN '39區'
  WHEN 'CCEE' THEN '環迴東站'
  WHEN 'CCEN' THEN '環迴北站'
  WHEN 'CCHH' THEN '陳震夏宿舍'
  WHEN 'CCTEA' THEN '崇基教學樓'
  WHEN 'CWC' THEN '敬文書院'
  WHEN 'JCPH' THEN '研究生宿舍一座'
  WHEN 'KHB' THEN '馮景禧樓'
  WHEN 'MTR' THEN '港鐵大學站'
  WHEN 'MTRP' THEN '大學站廣場'
  WHEN 'NAC' THEN '新亞書院'
  WHEN 'RESI15' THEN '十五苑'
  WHEN 'SC' THEN '科學館'
  WHEN 'SHAWC' THEN '逸夫書院'
  WHEN 'SHHC' THEN '善衡書院'
  WHEN 'SRR' THEN '邵逸夫堂'
  WHEN 'UC' THEN '聯合書院'
  WHEN 'UCSR' THEN '聯合苑'
  WHEN 'UADM' THEN '大學行政樓'
  WHEN 'USC' THEN '大學體育中心'
  WHEN 'WYS' THEN '伍宜孫書院'
  WHEN 'YIA' THEN '康本國際學術園 / 七小龍'
  ELSE `中文`
END,
`ENG` = CASE `Code`
  WHEN 'AREA39' THEN 'Area 39'
  WHEN 'CCEE' THEN 'Campus Circuit East'
  WHEN 'CCEN' THEN 'Campus Circuit North'
  WHEN 'CCHH' THEN 'Chan Chun Ha Hostel'
  WHEN 'CCTEA' THEN 'Chung Chi Teaching Bldg.'
  WHEN 'CWC' THEN 'CW Chu College'
  WHEN 'JCPH' THEN 'Postgraduate Hall 1'
  WHEN 'KHB' THEN 'Fung King Hey Bldg.'
  WHEN 'MTR' THEN 'University Station'
  WHEN 'MTRP' THEN 'Station Piazza'
  WHEN 'NAC' THEN 'New Asia College'
  WHEN 'RESI15' THEN 'Residence No. 15'
  WHEN 'SC' THEN 'Science Centre'
  WHEN 'SHAWC' THEN 'Shaw College'
  WHEN 'SHHC' THEN 'S.H. Ho College'
  WHEN 'SRR' THEN 'Sir Run Run Shaw Hall'
  WHEN 'UC' THEN 'United College'
  WHEN 'UCSR' THEN 'U.C. Staff Residence'
  WHEN 'UADM' THEN 'Univ. Admin. Bldg.'
  WHEN 'USC' THEN 'Univ. Sports Centre'
  WHEN 'WYS' THEN 'Wu Yee Sun College'
  WHEN 'YIA' THEN 'Yasumoto International Academic Park / Seven Dragons'
  ELSE `ENG`
END
WHERE `Code` IN (
  'AREA39', 'CCEE', 'CCEN', 'CCHH', 'CCTEA', 'CWC', 'JCPH', 'KHB',
  'MTR', 'MTRP', 'NAC', 'RESI15', 'SC', 'SHAWC', 'SHHC', 'SRR', 'UC',
  'UCSR', 'UADM', 'USC', 'WYS', 'YIA'
);

-- The API merges translatebuilding into the same translation bundle after
-- translateroute. Mirror the official bus wording here as well, otherwise a
-- duplicate building code would overwrite the route wording in the API.
UPDATE `translatebuilding`
SET `中文` = CASE `Code`
  WHEN 'AREA39' THEN '39區'
  WHEN 'CCEE' THEN '環迴東站'
  WHEN 'CCEN' THEN '環迴北站'
  WHEN 'CCHH' THEN '陳震夏宿舍'
  WHEN 'CCTEA' THEN '崇基教學樓'
  WHEN 'CWC' THEN '敬文書院'
  WHEN 'JCPH' THEN '研究生宿舍一座'
  WHEN 'KHB' THEN '馮景禧樓'
  WHEN 'MTR' THEN '港鐵大學站'
  WHEN 'MTRP' THEN '大學站廣場'
  WHEN 'NAC' THEN '新亞書院'
  WHEN 'RESI15' THEN '十五苑'
  WHEN 'SC' THEN '科學館'
  WHEN 'SHAWC' THEN '逸夫書院'
  WHEN 'SHHC' THEN '善衡書院'
  WHEN 'SRR' THEN '邵逸夫堂'
  WHEN 'UC' THEN '聯合書院'
  WHEN 'UCSR' THEN '聯合苑'
  WHEN 'UADM' THEN '大學行政樓'
  WHEN 'USC' THEN '大學體育中心'
  WHEN 'WYS' THEN '伍宜孫書院'
  WHEN 'YIA' THEN '康本國際學術園 / 七小龍'
  ELSE `中文`
END,
`ENG` = CASE `Code`
  WHEN 'AREA39' THEN 'Area 39'
  WHEN 'CCEE' THEN 'Campus Circuit East'
  WHEN 'CCEN' THEN 'Campus Circuit North'
  WHEN 'CCHH' THEN 'Chan Chun Ha Hostel'
  WHEN 'CCTEA' THEN 'Chung Chi Teaching Bldg.'
  WHEN 'CWC' THEN 'CW Chu College'
  WHEN 'JCPH' THEN 'Postgraduate Hall 1'
  WHEN 'KHB' THEN 'Fung King Hey Bldg.'
  WHEN 'MTR' THEN 'University Station'
  WHEN 'MTRP' THEN 'Station Piazza'
  WHEN 'NAC' THEN 'New Asia College'
  WHEN 'RESI15' THEN 'Residence No. 15'
  WHEN 'SC' THEN 'Science Centre'
  WHEN 'SHAWC' THEN 'Shaw College'
  WHEN 'SHHC' THEN 'S.H. Ho College'
  WHEN 'SRR' THEN 'Sir Run Run Shaw Hall'
  WHEN 'UC' THEN 'United College'
  WHEN 'UCSR' THEN 'U.C. Staff Residence'
  WHEN 'UADM' THEN 'Univ. Admin. Bldg.'
  WHEN 'USC' THEN 'Univ. Sports Centre'
  WHEN 'WYS' THEN 'Wu Yee Sun College'
  WHEN 'YIA' THEN 'Yasumoto International Academic Park / Seven Dragons'
  ELSE `ENG`
END
WHERE `Code` IN (
  'AREA39', 'CCEE', 'CCEN', 'CCHH', 'CCTEA', 'CWC', 'JCPH', 'KHB',
  'MTR', 'MTRP', 'NAC', 'RESI15', 'SC', 'SHAWC', 'SHHC', 'SRR', 'UC',
  'UCSR', 'UADM', 'USC', 'WYS', 'YIA'
);

-- Match the official directional wording shown beside stops on the route
-- pages. The internal attribute codes remain unchanged.
UPDATE `translateattribute`
SET `中文` = CASE `Code`
  WHEN 'DOWNST' THEN '下行'
  WHEN 'DOWNST2' THEN '下行'
  WHEN 'UPPERST' THEN '上行'
  ELSE `中文`
END,
`ENG` = CASE `Code`
  WHEN 'DOWNST' THEN 'Downward'
  WHEN 'DOWNST2' THEN 'Downward'
  WHEN 'UPPERST' THEN 'Upward'
  ELSE `ENG`
END
WHERE `Code` IN ('DOWNST', 'DOWNST2', 'UPPERST');

COMMIT;
