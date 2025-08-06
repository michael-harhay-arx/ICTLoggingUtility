/***************************************************************************//*!
* \file main.c
* \author 
* \copyright . All Rights Reserved.
* \date 2025-08-06 11:33:33 AM
* \brief Used to create an example of how the library should be used
* 
* Main should contain a series of functions from the library demonstrating how
* 	its expected to be used. Make sure to comment adequetly if anything might be
* 	confusing. It should cover every public function of the library.
* 
* If there is a debug panel for the library, also add the ability to launch
* 	it as a standalone application.
* 
* To use main.c, include it in the build and change the build target to Executable
*******************************************************************************/

//! \cond
/// REGION START HEADER
//! \endcond
//==============================================================================
// Include files

#include "ICTLoggingUtility.h"
#include <formatio.h>
#include <ansi_c.h>
#include <cvirte.h>		
#include <userint.h>
#include "toolbox.h"
#include <string.h>

//==============================================================================
// Constants

//==============================================================================
// Types

//==============================================================================
// Static global variables

//==============================================================================
// Static functions

//==============================================================================
// Global variables

//==============================================================================
// Global functions

//! \cond
/// REGION END

/// REGION START Main
//! \endcond
int main (int argc, char *argv[])
{
	char errmsg[ERRLEN] = {0};
	fnInit;

	tsErrChk (Initialize_ICTLoggingUtility(errmsg),errmsg);

Error:
	/* clean up */
	if (error)
	{
		fprintf (stderr, errmsg);
		GetKey();
	}
	return error;
}
//! \cond
/// REGION END
//! \endcond