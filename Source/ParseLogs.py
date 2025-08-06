import os
import re
import sys
import sqlite3

# ------------- Classes -------------

class Panel:
    def __init__(self, name, serial_num, date, test_start_time, test_end_time, components):
        self.name = name
        self.serial_num = serial_num
        self.date = date
        self.test_start_time = test_start_time
        self.test_end_time = test_end_time
        self.components = components

class Component:
    def __init__(self, daughterboard, name, status, val, nom_lim, hi_lim, low_lim):
        self.daughterboard = daughterboard
        self.name = name
        self.status = status
        self.val = val
        self.nom_lim = nom_lim
        self.hi_lim = hi_lim
        self.low_lim = low_lim

# ------------- Globals -------------

current_dir = os.getcwd()
logs_dir = sys.argv[1]
db_dir = current_dir + "..\\DB"
panels = []

# ------------- Functions -------------

# Parse Log Files
def ParseLogs():

    # Iterate through files
    for log in os.listdir(logs_dir):
        print(f"Parsing log: {log}")

        log_path = logs_dir + "\\" + log
        content = ""
        with open(log_path, "r") as log_file:
            content = log_file.read()

        component_obj_list = []

        # Get each block
        blocks = re.findall(r"(\{@BLOCK.*?)(?=\{@BLOCK|\Z)", content, re.DOTALL)
        if blocks is not None:
            for block in blocks:

                # Get component data from block
                lines = re.findall(r"\{.*", block)
                if lines is not None:
                    component_daughterboard = ""
                    component_name = ""
                    component_status = ""

                    for i, line in enumerate(lines):
                        
                        # Tokenize line
                        split_line = re.split(r"[|{}]+", line)

                        # If first line in block, get component header data
                        if i == 0:
                            component_daughterboard = split_line[2].split("%")[0]
                            char_index = split_line[2].find("%")
                            component_name = split_line[2][char_index + 1:]
                            component_status = split_line[3]
                            
                        # Else get rest of component data, create new component object
                        else:

                            # Check for unwanted data
                            if split_line[3][0] != "+" and split_line[3][0] != "-":
                                continue

                            component_obj = Component(component_daughterboard, component_name, component_status, split_line[3], None, None, None)
                            
                            # Get limits
                            for j, element in enumerate(split_line):
                                if element.startswith("@LIM"):
                                    if element == "@LIM2":
                                        component_obj.nom_lim = "n/a"
                                        component_obj.hi_lim = split_line[j+1]
                                        component_obj.low_lim = split_line[j+2]

                                    if element == "@LIM3":
                                        component_obj.nom_lim = split_line[j+1]
                                        component_obj.hi_lim = split_line[j+2]
                                        component_obj.low_lim = split_line[j+3]

                            # If multiple components in block
                            if not split_line[4].startswith("@LIM"):
                                component_obj.name += "%" + split_line[4]

                            component_obj_list.append(component_obj)


        # Instantiate panel object
        header = re.search(r"\{@BATCH\|([^|]*)\|.*btest\|([^|]*).*\s+\{@BTEST\|([^|]*)\|.*\|\w\|(.*)\|\|", content)
        date = header.group(2)[:6]
        start_time = header.group(2)[6:]
        end_time = header.group(4)[6:]

        panel = Panel(header.group(1), header.group(3), date, start_time, end_time, component_obj_list)
        panels.append(panel)


# Store log data in DB
def StoreData():
    db_path = db_dir + "\\LogDB.db"
    print(f"Storing log data in {db_path}")

    # Initialize connection to DB
    db_connection = sqlite3.connect(db_path)    
    cursor = db_connection.cursor()
    print("Connected to database.")

    # Clear pre-existing data
    cursor.execute("""DELETE FROM PanelTypes""")
    cursor.execute("""DELETE FROM PanelInstances""")
    cursor.execute("""DELETE FROM ComponentTypes""")
    cursor.execute("""DELETE FROM TestInstances""")

    # Query DB
    for panel in panels:
        
        # Update PanelTypes table
        panel_types_query = """INSERT INTO PanelTypes(Name) VALUES (?)"""
        panel_types_values = (panel.name,)
        cursor.execute(panel_types_query, panel_types_values)

        # Update PanelInstances table
        fk_panel_types = cursor.lastrowid
        panel_instances_query = """INSERT INTO PanelInstances(FK_PanelTypes, SerialNum, Date, StartTestTime, EndTestTime)
                                   VALUES (?, ?, ?, ?, ?)"""
        panel_instances_values = (
            fk_panel_types,
            panel.serial_num,
            panel.date,
            panel.test_start_time,
            panel.test_end_time,
        )
        cursor.execute(panel_instances_query, panel_instances_values)

        # Update ComponentTypes table
        for component in panel.components:
            component_types_query = """INSERT INTO ComponentTypes(FK_PanelTypes, Name, NomLimit, HiLimit, LowLimit)
                                       VALUES (?, ?, ?, ?, ?)"""
            component_types_values = (
                fk_panel_types,
                component.name,
                component.nom_lim,
                component.hi_lim,
                component.low_lim,
            )
            cursor.execute(component_types_query, component_types_values)
        
            # Update TestInstances table
            fk_component_types = cursor.lastrowid
            test_instances_query = """INSERT INTO TestInstances(FK_ComponentTypes, Daughterboard, Status, Value)
                                      VALUES (?, ?, ?, ?)"""
            test_instances_values = (
                fk_component_types,
                component.daughterboard,
                component.status,
                component.val,
            )

            cursor.execute(test_instances_query, test_instances_values)

    # Close DB
    db_connection.commit()
    db_connection.close()
    print("Successfully wrote to raw log data database.")


# Main
if __name__ == "__main__":
    ParseLogs()
    StoreData()
