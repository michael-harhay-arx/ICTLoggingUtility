/***************************************************************************//*!
* \file ICTLoggingUtility.c
* \author 
* \copyright . All Rights Reserved.
* \date 2025-08-06 11:33:33 AM
* \brief A short description.
* 
* A longer description.
* 
* This Library was created using
* * Template version 2.1.0
* * ArxtronToolslib version 1.5.0
* PLEASE ONLY UPDATE THE VERSION NUMBERS WHEN UPDATING THE TEMPLATE OR RELATED TOOLSLIB
* THESE VERSION NUMBERS SHOULD BE SEPARATE FROM THE LIBRARY VERSION
* THE ALL CAPS PORTION OF THIS COMMENT SECTION CAN BE REMOVED AFTER CREATING THE LIBRARY
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

#include "ICTLoggingUtility.h"

#include "SystemLog_LIB.h"

//==============================================================================
// Constants

//==============================================================================
// Types

//==============================================================================
// Static global variables

static int libInitialized = 0;
static int panelHandle = 0;

/***************************************************************************//*!
* \brief Stores the log level used for SYSLOG macro
*******************************************************************************/
static int glbSysLogLevel = 0;

//==============================================================================
// Static functions

//==============================================================================
// Global variables

/***************************************************************************//*!
* \brief Stores the SystemLog.arx modified time to determine whether the file has
* 	changed.  This definition should be shared across all source files via extern
*******************************************************************************/
SysLogInfo glbSysLogInfo = {.hr=-1, .min=-1, .sec=-1};

//==============================================================================
// Global functions

void GetStandardErrMsg (int error, char errmsg[ERRLEN]);
void GetLibErrMsg (int error, char errmsg[ERRLEN]);

//! \cond
/// REGION END

/// REGION START Code Body
//! \endcond
/***************************************************************************//*!
* \brief 
*******************************************************************************/
int Initialize_ICTLoggingUtility (char errmsg[ERRLEN])
{
	fnInit;
	SYSLOG ("Function Start", 0, error, "");
	
	// Uncomment if depending on another lib, then update [baselibname] with actual library name (without quotes, Ex. Ini_LIB)
	// Make additional copies if depending on multiple libs
	//DEPENDENCY_VERSION_CHECK([baselibname],ExpectedVersionMajor,ExpectedVersionMinor,error,errmsg);
	
	// Init panel
	errChk (panelHandle = LoadPanel (0, "Panel.uir", MAINPANEL));
	errChk (DisplayPanel (panelHandle));
	errChk (RunUserInterface ());
	
	libInitialized = 1;
	
	/* error will be -99999 from fnInit if no calls to any of the ErrChk macros are made */
	
Error:
	SYSLOG ("Function End", 0, error, "");
	return error;
}

/***************************************************************************//*!
* \brief Library Function Template. Name all exported functions with LibName_Description,
* 	where LibName is the same for all functions and Description tells the user
* 	roughly what the function accomplishes.
* 
* This function is also set up to demonstrate how SYSLOG is expected to be used.
* 	In order to use SYSLOG, all function parameters have to be pointers.  The IN
* 	macro should be used to indicate input parameters.
* 
* All functions should use all components of this template function unless it must
* 	be excluded from system logging for speed reasons.
* 
* See the SYSLOG comment block for more details on the parameters being passed in.
*******************************************************************************/
int Lib_Fn (IN int *a, IN long long *b, IN float *c, double *d, short *e, char *f, char errmsg[ERRLEN])
{
	libInit;
	SYSLOG ("Function Start", 6, f, "ilfdsc");
	
	
	
Error:
	SYSLOG ("Function End", 0, error, "");
	return error;
}

/***************************************************************************//*!
* \brief Template for copy pasting
*******************************************************************************/
int Lib_Fn2 (char errmsg[ERRLEN])
{
	libInit;
	SYSLOG ("Function Start", 0, error, "");
	
	
	
Error:
	SYSLOG ("Function End", 0, error, "");
	return error;
}
//! \cond
/// REGION END

/// REGION START Standard Lib Error Handling
//! \endcond
/***************************************************************************//*!
* \brief Get error message for library error codes
* 
* Define error codes in the header file under CONSTANTS
*******************************************************************************/
void GetLibErrMsg (int error, char errmsg[ERRLEN])
{
	memset (errmsg,0,ERRLEN);
	
	switch (error)
	{
		//case ERR_[Lib]_[Err1]:
		//	strcpy (errmsg,"Err1 msg");
		//	break;
	}
}
//! \cond
/// REGION END
//! \endcond
