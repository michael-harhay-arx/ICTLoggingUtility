DROP VIEW IF EXISTS "main"."CPKView";
CREATE VIEW CPKView AS

-- CTEs
WITH 
AvgTable AS (
	SELECT 
		t.Daughterboard,
		c.Name, 
		AVG(t.Value) AS AvgValue
	FROM ComponentTypes AS c
	JOIN TestInstances AS t ON c.ComponentID = t.FK_ComponentTypes
	GROUP BY t.Daughterboard, c.Name
),

StdDevTable AS (
	SELECT
		t.Daughterboard,
		c.Name,
		SQRT(SUM(POWER(t.Value - a.AvgValue, 2)) / COUNT(*)) AS StdDev
	FROM ComponentTypes AS c
	JOIN TestInstances AS t ON c.ComponentID = t.FK_ComponentTypes
	JOIN AvgTable AS a ON c.Name = a.Name AND t.Daughterboard = a.Daughterboard
	GROUP BY t.Daughterboard, c.Name
),

Counts AS (
  SELECT 
	t.Daughterboard,
	c.Name,
	COUNT(*) AS N
  FROM ComponentTypes AS c
  JOIN TestInstances AS t ON c.ComponentID = t.FK_ComponentTypes
  GROUP BY t.Daughterboard, c.Name
),

Ranked AS (
  SELECT
	t.Daughterboard,
    c.Name,
    t.Value,
    ROW_NUMBER() OVER (
		PARTITION BY t.Daughterboard, c.Name 
		ORDER BY t.Value
	) AS RowNum
  FROM ComponentTypes AS c
  JOIN TestInstances AS t ON c.ComponentID = t.FK_ComponentTypes
),

MedianTable AS (
  SELECT
	r.Daughterboard,
    r.Name,
    AVG(r.Value) AS Median
  FROM Ranked AS r
  JOIN Counts AS c 
	ON r.Name = c.Name AND r.Daughterboard = c.Daughterboard
  WHERE 
    r.RowNum = (c.N / 2)
  GROUP BY r.Daughterboard, r.Name
)

-- Main query
SELECT
	t.Daughterboard,
	c.Name,
	printf('%.3e', MIN(c.LowLimit), 3) AS LSL,
	printf('%.3e', MAX(c.HiLimit), 3) AS USL,
	printf('%.3e', a.AvgValue, 3) AS AvgValue,
	printf('%.3e', m.Median, 3) AS Median,
	printf('%.3e', s.StdDev, 3) AS StdDev,
	printf('%.3e', MIN(t.Value), 3) AS MinValue,
	printf('%.3e', MAX(t.Value), 3) AS MaxValue,
	printf('%.3e', MAX(t.Value) - MIN(t.Value), 3) AS 'Range',
	printf('%.3e', 100 * (s.StdDev / a.AvgValue), 3) AS CV,
	COUNT(*) AS NumTests,
	printf('%.3e', MIN((MAX(c.HiLimit) - a.AvgValue) / (3 * s.StdDev), (a.AvgValue - MIN(c.LowLimit)) / (3 * s.StdDev)), 3) AS CPK

FROM ComponentTypes AS c
LEFT JOIN TestInstances AS t ON c.ComponentID = t.FK_ComponentTypes
LEFT JOIN AvgTable AS a ON c.Name = a.Name AND t.Daughterboard = a.Daughterboard
LEFT JOIN StdDevTable AS s ON c.Name = s.Name AND t.Daughterboard = s.Daughterboard
LEFT JOIN MedianTable AS m ON c.Name = m.Name AND t.Daughterboard = m.Daughterboard
GROUP BY t.Daughterboard, c.Name
ORDER BY t.Daughterboard, c.Name