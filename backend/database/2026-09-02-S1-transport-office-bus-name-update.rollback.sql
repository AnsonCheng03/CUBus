-- Rollback for 2026-09-02-S1-transport-office-bus-name-update.sql.
-- This restores the values produced by the already-applied
-- 2026-09-02-canonical-station-code-update.sql.

SET NAMES utf8mb4;
START TRANSACTION;

UPDATE `translateroute`
SET `中文` = CASE `Code`
  WHEN 'AREA39' THEN '39區'
  WHEN 'CCEE' THEN '環迴東站'
  WHEN 'CCEN' THEN '環迴北站'
  WHEN 'CCHH' THEN '陳震夏宿舍'
  WHEN 'CCTEA' THEN '崇基教學樓'
  WHEN 'CWC' THEN '敬文書院'
  WHEN 'JCPH' THEN '賽馬會研究生宿舍'
  WHEN 'KHB' THEN '馮景禧樓'
  WHEN 'MTR' THEN '港鐵大學站'
  WHEN 'MTRP' THEN '地鐵大學站廣場'
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
  WHEN 'YIA' THEN '康本國際學術園'
  ELSE `中文`
END,
`ENG` = CASE `Code`
  WHEN 'AREA39' THEN 'Area 39'
  WHEN 'CCEE' THEN 'Campus Circuit East'
  WHEN 'CCEN' THEN 'Campus Circuit North'
  WHEN 'CCHH' THEN 'Chan Chun Ha Hostel'
  WHEN 'CCTEA' THEN 'Chung Chi Teaching Blocks'
  WHEN 'CWC' THEN 'C.W. Chu College'
  WHEN 'JCPH' THEN 'Jockey Club Postgraduate Hall'
  WHEN 'KHB' THEN 'Fung King Hey Building'
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
  WHEN 'USC' THEN 'University Sports Centre'
  WHEN 'WYS' THEN 'Wu Yee Sun College'
  WHEN 'YIA' THEN 'Yasumoto International Academic Park'
  ELSE `ENG`
END
WHERE `Code` IN (
  'AREA39', 'CCEE', 'CCEN', 'CCHH', 'CCTEA', 'CWC', 'JCPH', 'KHB',
  'MTR', 'MTRP', 'NAC', 'RESI15', 'SC', 'SHAWC', 'SHHC', 'SRR', 'UC',
  'UCSR', 'UADM', 'USC', 'WYS', 'YIA'
);

UPDATE `translatebuilding`
SET `中文` = CASE `Code`
  WHEN 'AREA39' THEN '39區'
  WHEN 'CCEE' THEN '環迴東站'
  WHEN 'CCEN' THEN '環迴北站'
  WHEN 'CCHH' THEN '陳震夏宿舍'
  WHEN 'CCTEA' THEN '崇基教學樓'
  WHEN 'CWC' THEN '敬文書院'
  WHEN 'JCPH' THEN '賽馬會研究生宿舍'
  WHEN 'KHB' THEN '馮景禧樓'
  WHEN 'MTR' THEN '港鐵大學站'
  WHEN 'MTRP' THEN '地鐵大學站廣場'
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
  WHEN 'CCTEA' THEN 'Chung Chi Teaching Blocks'
  WHEN 'CWC' THEN 'C.W. Chu College'
  WHEN 'JCPH' THEN 'Jockey Club Postgraduate Hall'
  WHEN 'KHB' THEN 'Fung King Hey Building'
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
  WHEN 'USC' THEN 'University Sports Centre'
  WHEN 'WYS' THEN 'Wu Yee Sun College'
  WHEN 'YIA' THEN 'Yasumoto International Academic Park / Seven Dragons'
  ELSE `ENG`
END
WHERE `Code` IN (
  'AREA39', 'CCEE', 'CCEN', 'CCHH', 'CCTEA', 'CWC', 'JCPH', 'KHB',
  'MTR', 'MTRP', 'NAC', 'RESI15', 'SC', 'SHAWC', 'SHHC', 'SRR', 'UC',
  'UCSR', 'UADM', 'USC', 'WYS', 'YIA'
);

UPDATE `translateattribute`
SET `中文` = CASE `Code`
  WHEN 'DOWNST' THEN '下行'
  WHEN 'DOWNST2' THEN '下行'
  WHEN 'UPPERST' THEN '上行'
  ELSE `中文`
END,
`ENG` = CASE `Code`
  WHEN 'DOWNST' THEN 'Downwards'
  WHEN 'DOWNST2' THEN 'Downwards'
  WHEN 'UPPERST' THEN 'Upwards'
  ELSE `ENG`
END
WHERE `Code` IN ('DOWNST', 'DOWNST2', 'UPPERST');

COMMIT;
