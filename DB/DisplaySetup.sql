-- Clear Display
DELETE FROM Display

-- Insert values into Display
INSERT INTO Display (
	Daughterboard,
	Component,
	LSL,
	USL,
	Average,
	Median,
	StdDev,
	Min,
	Max,
	Range,
	CV,
	NumTests,
	CPK
)

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

-- CTEs to calculate median
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

-- Main Query
SELECT
	c.Daughterboard,
	c.Name,
	MIN(c.LowLimit) AS LSL,
	MAX(c.HiLimit) AS USL,
	a.AvgValue,
	m.Median,
	s.StdDev,
	MIN(c.Value) AS MinValue,
	MAX(c.Value) AS MaxValue,
	MAX(c.Value) - MIN(Value) AS Range,
	100 * (s.StdDev / a.AvgValue) AS CV,
	COUNT(*) AS NumTests,
	MIN(((MAX(c.HiLimit) - a.AvgValue) / (3 * s.StdDev)), (a.AvgValue - (MIN(c.LowLimit)) / (3 * s.StdDev))) AS CPK
FROM Components AS c
JOIN AvgTable AS a ON c.Name = a.Name
JOIN StdDevTable AS s ON c.Name = s.Name
JOIN MedianTable AS m ON c.Name = m.Name
GROUP BY c.Name
ORDER BY c.Name;