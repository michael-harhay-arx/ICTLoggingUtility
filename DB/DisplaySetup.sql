-- Create View
CREATE VIEW CPKView AS

-- CTEs
WITH 
AvgTable AS (
	SELECT 
		Name, 
		AVG(Value) AS AvgValue
	FROM Components
	GROUP BY Name
),

StdDevTable AS (
	SELECT
		c.Name,
		SQRT(SUM(POWER(c.Value - a.AvgValue, 2)) / (COUNT(*) - 1)) AS StdDev
	FROM Components AS c
	JOIN AvgTable AS a ON c.Name = a.Name
	GROUP BY c.Name
),

Counts AS (
  SELECT Name, COUNT(*) AS N
  FROM Components
  GROUP BY Name
),

Ranked AS (
  SELECT
    Name,
    Value,
    ROW_NUMBER() OVER (PARTITION BY Name ORDER BY Value) AS RowNum
  FROM Components
),

MedianTable AS (
  SELECT
    r.Name,
    AVG(r.Value) AS Median
  FROM Ranked AS r
  JOIN Counts AS c ON r.Name = c.Name
  WHERE 
    -- Odd count, get middle row
    (c.N % 2 = 1 AND r.RowNum = (c.N + 1) / 2)
    -- Even count, average two middle rows
    OR (c.N % 2 = 0 AND r.RowNum IN (c.N / 2, c.N / 2 + 1))
  GROUP BY r.Name
)

-- Main query
SELECT
	c.Daughterboard,
	c.Name,
	printf('%.3e', MIN(c.LowLimit), 3) AS LSL,
	printf('%.3e', MAX(c.HiLimit), 3) AS USL,
	printf('%.3e', a.AvgValue, 3) AS AvgValue,
	printf('%.3e', m.Median, 3) AS Median,
	printf('%.3e', s.StdDev, 3) AS StdDev,
	printf('%.3e', MIN(c.Value), 3) AS MinValue,
	printf('%.3e', MAX(c.Value), 3) AS MaxValue,
	printf('%.3e', MAX(c.Value) - MIN(Value), 3) AS Range,
	printf('%.3e', 100 * (s.StdDev / a.AvgValue), 3) AS CV,
	COUNT(*) AS NumTests,
	printf('%.3e', MIN((MAX(c.HiLimit) - a.AvgValue) / (3 * s.StdDev), (a.AvgValue - MIN(c.LowLimit)) / (3 * s.StdDev)), 3) AS CPK
	
	
	
	
FROM Components AS c
LEFT JOIN AvgTable AS a ON c.Name = a.Name
LEFT JOIN StdDevTable AS s ON c.Name = s.Name
LEFT JOIN MedianTable AS m ON c.Name = m.Name
GROUP BY c.Daughterboard, c.Name
ORDER BY c.Daughterboard, c.Name;