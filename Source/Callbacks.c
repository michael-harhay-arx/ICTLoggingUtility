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
//! \cond
/// REGION END
//! \endcond