import os
import re
import sqlite3

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
        self.lo_lim = low_lim

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
                        if len(split_component) < 7 and len(split_component) is not 4:
                            break

                        # If first line in block, get header data (not actually a component)
                        if i is 0:
                            block_obj.daughterboard = split_component[2].split("%")[0]
                            block_obj.name = split_component[2].split("%")[1]
                            block_obj.status = split_component[3]
                            
                        # Else create component object
                        else:
                            if len(split_component) is 7:
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
# def StoreData():
#     db_path = db_dir + "\\log_db.db"
#     print(f"Storing log data in {db_path}")

#     try:
#         dn_connection = sqlite3.connect(db_path)


# Main
if __name__ == "__main__":
    ParseLogs()
    # StoreData()

