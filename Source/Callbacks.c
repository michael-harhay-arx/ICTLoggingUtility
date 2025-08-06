/***************************************************************************//*!
* \file Callbacks.c
* \author 
* \copyright . All Rights Reserved.
* \date 2025-08-06 11:51:26 AM
* \brief A short description.
* 
* A longer description.
*******************************************************************************/

//! \cond
/// REGION START Header
//! \endcond
//==============================================================================
// Include files

/***************************************************************************//*!
* \brief Disables system logging completely.  Needs to be defined before including
* 	ArxtronToolslib.h.  By default, it is defined in each source file to allow
* 	for source file level control for disabling.
*******************************************************************************/
//#define SYSLOGDISABLE
/***************************************************************************//*!
* \brief Overrides config log level.  Needs to be defined before including
* 	ArxtronToolslib.h.  By default, it is defined in each source file to allow
* 	for source file level control for overrides.
*******************************************************************************/
//#define SYSLOGOVERRIDE 3

#include "Callbacks.h"
#include <stdlib.h>

#include "SystemLog_LIB.h"

//==============================================================================
// Constants

//==============================================================================
// Types

//==============================================================================
// Static global variables

/***************************************************************************//*!
* \brief Stores the log level used for SYSLOG macro
*******************************************************************************/
static int glbSysLogLevel = 0;

//==============================================================================
// Static functions

//==============================================================================
// Global variables

char glbLogsPath[MAX_PATH] = {0};

//==============================================================================
// Global functions

//! \cond
/// REGION END

/// REGION START Code Body
//! \endcond
/***************************************************************************//*!
* \brief Main panel: Callback for closing main panel
*******************************************************************************/
int CVICALLBACK MainPanelCB (int panel, int event, void *callbackData, int eventData1, int eventData2)
{
	if (event == EVENT_CLOSE)
	{
		QuitUserInterface (0);
	}
	
	return 0;
}

/***************************************************************************//*!
* \brief Main panel: Callback for datapath selection button
*******************************************************************************/
int CVICALLBACK SelectDataButtonCB (int panel, int control, int event, void *callbackData, int eventData1, int eventData2)
{
	if (event == EVENT_LEFT_CLICK)
	{
		// Open file selection dialogue
		int selectionStatus = DirSelectPopupEx ("", "Select a datapath...", glbLogsPath);
		if (selectionStatus == 0)
		{
			return 0;
		}
		
		printf ("Selected path: %s\n", glbLogsPath);
	}
	
	return 0;
}

/***************************************************************************//*!
* \brief Main panel: Callback for config edit button
*******************************************************************************/
int CVICALLBACK EditConfigButtonCB (int panel, int control, int event, void *callbackData, int eventData1, int eventData2)
{
	if (event == EVENT_LEFT_CLICK)
	{
		printf ("Edit Config button pressed.\n");
	}
	
	return 0;
}

/***************************************************************************//*!
* \brief Main panel: Callback for data filtering button
*******************************************************************************/
int CVICALLBACK FilterDataButtonCB (int panel, int control, int event, void *callbackData, int eventData1, int eventData2)
{
	if (event == EVENT_LEFT_CLICK)
	{
		printf ("Filter button pressed.\n");
	}
	
	return 0;
}

/***************************************************************************//*!
* \brief Main panel: Callback for generate button
*******************************************************************************/
int CVICALLBACK GenerateButtonCB (int panel, int control, int event, void *callbackData, int eventData1, int eventData2)
{
	if (event == EVENT_LEFT_CLICK)
	{
		printf ("Generate button pressed.\n");
		
		// If no datapath selected, generate error
		if (strcmp (glbLogsPath, "") == 0)
		{
			printf ("Error: no datapath selected");
			return 0;
		}
		
		// Check which results are desired, error if none are checked
		int cpkChecked = 0;
		int grrChecked = 0;
		GetCtrlVal (panel, MAINPANEL_CPKCHECKBOX, &cpkChecked);
		GetCtrlVal (panel, MAINPANEL_GRRCHECKBOX, &grrChecked);
		
		if (!cpkChecked && !grrChecked)
		{
			printf ("Error: neither CPK nor GRR view are selected");
			return 0;
		}
		
		// Parse logs (call python script)
		char command[256] = {0};
		sprintf (command, "python C:\\Arxtron\\RD25XXX_ICT\\Source\\ParseLogs.py %s", glbLogsPath);
		system (command);
		
		// Generate HTML
	}
	
	return 0;
}
//! \cond
/// REGION END
//! \endcond