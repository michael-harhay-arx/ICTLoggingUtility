/**************************************************************************/
/* LabWindows/CVI User Interface Resource (UIR) Include File              */
/*                                                                        */
/* WARNING: Do not add to, delete from, or otherwise modify the contents  */
/*          of this include file.                                         */
/**************************************************************************/

#include <userint.h>

#ifdef __cplusplus
    extern "C" {
#endif

     /* Panels and Controls: */

#define  MAINPANEL                        1       /* callback function: MainPanelCB */
#define  MAINPANEL_SELECTDATABUTTON       2       /* control type: command, callback function: (none) */
#define  MAINPANEL_FILTERBUTTON           3       /* control type: command, callback function: (none) */
#define  MAINPANEL_EDITCONFIGBUTTON       4       /* control type: command, callback function: (none) */
#define  MAINPANEL_GENERATEBUTTON         5       /* control type: command, callback function: (none) */
#define  MAINPANEL_GRRCHECKBOX            6       /* control type: radioButton, callback function: (none) */
#define  MAINPANEL_CPKCHECKBOX            7       /* control type: radioButton, callback function: (none) */
#define  MAINPANEL_PICTURE                8       /* control type: picture, callback function: (none) */
#define  MAINPANEL_DECORATION_2           9       /* control type: deco, callback function: (none) */


     /* Control Arrays: */

          /* (no control arrays in the resource file) */


     /* Menu Bars, Menus, and Menu Items: */

          /* (no menu bars in the resource file) */


     /* Callback Prototypes: */

int  CVICALLBACK MainPanelCB(int panel, int event, void *callbackData, int eventData1, int eventData2);


#ifdef __cplusplus
    }
#endif