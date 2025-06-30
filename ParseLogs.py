import os
import re
import sqlite3
import statistics

# ------------- Classes -------------

class Panel:
    def __init__(self, name, serial_num, date, test_start_time, test_end_time, blocks):
        self.name = name
        self.serial_num = serial_num
        self.date = date
        self.test_start_time = test_start_time
        self.test_end_time = test_end_time
        self.blocks = blocks

class Block:
    def __init__(self, daughterboard, name, status, components):
        self.daughterboard = daughterboard
        self.name = name
        self.status = status
        self.components = components

class Component:
    def __init__(self, name, val, nom_lim, hi_lim, low_lim):
        self.name = name
        self.val = val
        self.nom_lim = nom_lim
        self.hi_lim = hi_lim
        self.low_lim = low_lim

# ------------- Globals -------------

current_dir = os.getcwd()
logs_dir = current_dir + "\\Logs"
db_dir = current_dir + "\\DB"
panels = []

# ------------- Functions -------------

# Parse Log Files
def ParseLogs():

    # Iterate through files
    for log in os.listdir(logs_dir):
        print(f"Parsing log: {log}")

        log_path = logs_dir + "\\" + log
        content = ""
        block_obj_list = []
        with open(log_path, "r") as log_file:
            content = log_file.read()

        # Get each block
        blocks = re.findall(r"(\{@BLOCK.*?)(?=\{@BLOCK|\Z)", content, re.DOTALL)
        if blocks is not None:
            for block in blocks:
                block_obj = Block(None, None, None, None)

                # Get each component within the block
                components = re.findall(r"\{.*", block)
                if components is not None:
                    component_obj_list = []
                    for i, component in enumerate(components):
                        
                        # Tokenize line
                        split_component = re.split(r"[|{]+", component)
                        if len(split_component) < 7 and len(split_component) != 4:
                            break

                        # If first line in block, get header data (not actually a component)
                        if i == 0:
                            block_obj.daughterboard = split_component[2].split("%")[0]
                            block_obj.name = split_component[2].split("%")[1]
                            block_obj.status = split_component[3]
                            
                        # Else create component object
                        else:
                            if len(split_component) == 7:
                                split_component.append(split_component[6])
                                split_component[6] = split_component[5]
                                split_component[5] = ''

                            component_obj = Component(split_component[1], split_component[3], split_component[5], split_component[6], split_component[7][:-2])
                            component_obj_list.append(component_obj)

                    # Add all components to block
                    block_obj.components = component_obj_list

                # Append block to block list
                block_obj_list.append(block_obj)


        # Instantiate panel object
        header = re.search(r"\{@BATCH\|([^|]*)\|.*btest\|([^|]*).*\s+\{@BTEST\|([^|]*)\|.*\|\w\|(.*)\|\|", content)
        date = header.group(2)[:6]
        start_time = header.group(2)[6:]
        end_time = header.group(4)[6:]

        panel = Panel(header.group(1), header.group(3), date, start_time, end_time, block_obj_list)
        panels.append(panel)


# Store log data in DB
def StoreData():
    db_path = db_dir + "\\LogDB.db"
    print(f"Storing log data in {db_path}")

    # Initialize connection to DB
    db_connection = sqlite3.connect(db_path)    
    cursor = db_connection.cursor()
    print("Connected to database.")

    # Query DB
    for panel in panels:
        
        # Update Panels table
        panel_query = """INSERT INTO Panels(Name, SerialNum, Date, StartTestTime, EndTestTime)
                         VALUES (?, ?, ?, ?, ?)"""
        panel_values = (
            panel.name,
            panel.serial_num,
            panel.date,
            panel.test_start_time,
            panel.test_end_time
        )
        cursor.execute(panel_query, panel_values)

        # Update Blocks table
        panel_id = cursor.lastrowid

        for block in panel.blocks:
            block_query = """INSERT INTO Blocks(PanelID, Daughterboard, Name, Status)
                             VALUES (?, ?, ?, ?)"""
            block_values = (
                panel_id,
                block.daughterboard,
                block.name,
                block.status
            )
            cursor.execute(block_query, block_values)

            # Update Components table
            block_id = cursor.lastrowid
            
            for component in block.components:
                component_query = """INSERT INTO Components(BlockID, Name, Value, NomLimit, HiLimit, LowLimit)
                                     VALUES (?, ?, ?, ?, ?, ?)"""
                component_values = (
                    block_id,
                    component.name,
                    component.val,
                    component.nom_lim,
                    component.hi_lim,
                    component.low_lim
                )
                cursor.execute(component_query, component_values)

    # Close DB
    db_connection.commit()
    db_connection.close()
    print("Successfully wrote to raw log data database.")


# Prep data for display
def PrepDisplayData():
    db_connection = sqlite3.connect(".\\Logs\\LogDB.db")
    cursor = db_connection.cursor()

    # Get all component names
    cursor.execute("SELECT DISTINCT Name FROM Components")
    component_names = [row[0] for row in cursor.fetchall()]

    display_rows = []

    for name in component_names:
        cursor.execute("SELECT CAST(Value AS REAL) FROM Components WHERE Name = ?", (name,))
        values = [row[0] for row in cursor.fetchall()]
        
        if not values:
            continue
        
        lsl = float(cursor.execute("SELECT LowLimit FROM Components WHERE Name = ? LIMIT 1", (name,)).fetchone()[0])
        usl = float(cursor.execute("SELECT HiLimit FROM Components WHERE Name = ? LIMIT 1", (name,)).fetchone()[0])

        avg = statistics.mean(values)
        median = statistics.median(values)
        std_dev = statistics.stdev(values) if len(values) > 1 else 0
        count = len(values)
        min_v = min(values)
        max_v = max(values)
        range_v = max_v - min_v
        cv = (std_dev / avg * 100) if avg != 0 else 0
        cpk = min((usl - avg) / (3 * std_dev), (avg - lsl) / (3 * std_dev)) if std_dev != 0 else 0

        display_rows.append((name, lsl, usl, avg, median, std_dev, max_v, min_v, range_v, cv, count, cpk))

    cursor.executemany("""INSERT INTO Display (Component, LSL, USL, Average, Median, "Std Dev", Max, Min, Range, "C.V.", Count, CPK) 
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""", display_rows)

    db_connection.commit()
    db_connection.close()
    print("Successfully prepped data for display.")


# Main
if __name__ == "__main__":
    ParseLogs()
    StoreData()
    PrepDisplayData()
