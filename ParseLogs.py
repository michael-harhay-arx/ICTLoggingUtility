import os
import re

# ------------- Classes -------------

class Board:
    def __init__(self, name, serial_num, date, test_start_time, test_end_time, components):
        self.name = name
        self.serial_num = serial_num
        self.date = date
        self.test_start_time = test_start_time
        self.test_end_time = test_end_time
        self.components = components

class Component:
    def __init__(self, daughterboard, name, status, type, val, nom_lim, hi_lim, low_lim):
        self.daughterboard = daughterboard
        self.name = name
        self.status = status
        self.type = type
        self.val = val
        self.nom_lim = nom_lim
        self.hi_lim = hi_lim
        self.lo_lim = low_lim

# ------------- Globals -------------

current_dir = os.getcwd()
logs_dir = current_dir + "\\Logs"
component_obj_list = []
boards = []

# ------------- Functions -------------

if __name__ == "__main__":

# Iterate through logs
    for log in os.listdir(logs_dir):
        print(f"Parsing log: {log}")

        # Open and read log file
        log_path = logs_dir + "\\" + log
        content = ""
        with open(log_path, "r") as log_file:
            content = log_file.read()

        #  Get components
        component_list = re.findall(r"\{@BLOCK\|(\d)%(\w+)%?.*\|(\d{2})\s+\{(@.*)\|.*\|(.*)\{@\w+\|([^|]*)\|([^|]*)\|?([^|]*)?\}\}", content) # TODO fix regex to encompass all components
        if component_list is not None:
            for component in component_list:

                # If no nominal value, shift data accordingly
                if component[7] is '':
                    comp_tmp = list(component)
                    comp_tmp[7] = comp_tmp[6]
                    comp_tmp[6] = comp_tmp[5]
                    comp_tmp[5] = ''
                    component = tuple(comp_tmp)
                
                # Instantiate component object, add to list of component objects
                component_obj = Component(component[0], component[1], component[2], component[3], component[4], component[5], component[6], component[7])
                component_obj_list.append(component_obj)


        # Instantiate board object
        header = re.search(r"\{@BATCH\|([^|]*)\|.*btest\|([^|]*).*\s+\{@BTEST\|([^|]*)\|.*\|\w\|(.*)\|\|", content)
        date = header.group(2)[:6]
        start_time = header.group(2)[6:]
        end_time = header.group(4)[6:]

        board = Board(header.group(1), header.group(3), date, start_time, end_time, component_obj_list)
        boards.append(board)
        print("test")
