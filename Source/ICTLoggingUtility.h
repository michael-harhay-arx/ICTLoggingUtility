/***************************************************************************//*!
* \file ICTLoggingUtility.h
* \author 
* \copyright . All Rights Reserved.
* \date 2025-08-06 11:33:33 AM
*******************************************************************************/

#ifndef __ICTLoggingUtility_H__
#define __ICTLoggingUtility_H__

#ifdef __cplusplus
    extern "C" {
#endif

//==============================================================================
// Include files

#include "cvidef.h"
#include "toolbox.h"
#include <userint.h>
#include <ansi_c.h>
#include <utility.h>
		
#include "ArxtronToolslib.h"
#include "ICTLoggingUtility_Definitions.h"
#include "Panel.h"

//==============================================================================
// Constants

//==============================================================================
// Types
		
//==============================================================================
// Global vaiables

//==============================================================================
// External variables

//==============================================================================
// Global functions

int ICTLoggingUtility_CheckVersionCompatibility (IN int ExpectedVersionMajor, IN int ExpectedVersionMinor, int *VersionMajor, int *VersionMinor);
int Initialize_ICTLoggingUtility (char errmsg[ERRLEN]);

#ifdef __cplusplus
    }
#endif

#endif  /* ndef __ICTLoggingUtility_H__ */