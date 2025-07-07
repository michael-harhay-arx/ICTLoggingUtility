# ICTLoggingUtility

## Overview
This tool displays ICT log files through a presentable and readable GUI.

## How to use
1. Clone this repository by running the following command: ```git clone git@github.com:michael-harhay-arx/ICTLoggingUtility.git```
2. Open the newly cloned directory, and populate the **Logs** folder with the log files to be processed.
3. Run **ParseLogs.py**
4. Open **DataDisplay.html** (located in the **Display** folder) to view the processed log data.
5. Click the "Choose file" button, and select **LogDB.db** (located in the **DB** folder).

## GUI Features
Upon loading the database, the user can select whether to view Panel or CPK data. Both tables are filterable and sortable:
- To sort the data, simply click on the column header of the category you'd like to sort by.
- To filter the data, type into the filter box of the column you'd like to filter from.
    - You can filter for exact matches (e.g. you might be looking for components with names containing the word "power")
    - You can filter for values greater than or less than a specified value (e.g. you might be looking for CPK values less than 1, so you would type <1 in the box)
- Upon filtering and/or sorting data in the CPKView table, the chart should update accordingly.

Additionally, the data can be exported to a .csv file by clicking the "Export to CSV" button.
