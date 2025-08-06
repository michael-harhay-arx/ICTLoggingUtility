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
#define  MAINPANEL_SELECTDATABUTTON       2       /* control type: command, callback function: SelectDataButtonCB */
#define  MAINPANEL_FILTERBUTTON           3       /* control type: command, callback function: FilterDataButtonCB */
#define  MAINPANEL_EDITCONFIGBUTTON       4       /* control type: command, callback function: EditConfigButtonCB */
#define  MAINPANEL_GENERATEBUTTON         5       /* control type: command, callback function: GenerateButtonCB */
#define  MAINPANEL_GRRCHECKBOX            6       /* control type: radioButton, callback function: (none) */
#define  MAINPANEL_CPKCHECKBOX            7       /* control type: radioButton, callback function: (none) */
#define  MAINPANEL_PICTURE                8       /* control type: picture, callback function: (none) */
#define  MAINPANEL_DECORATION_2           9       /* control type: deco, callback function: (none) */
#define  MAINPANEL_DECORATION_3           10      /* control type: deco, callback function: (none) */
#define  MAINPANEL_TEXTMSG                11      /* control type: textMsg, callback function: (none) */


     /* Control Arrays: */

          /* (no control arrays in the resource file) */


     /* Menu Bars, Menus, and Menu Items: */

          /* (no menu bars in the resource file) */


     /* Callback Prototypes: */

int  CVICALLBACK EditConfigButtonCB(int panel, int control, int event, void *callbackData, int eventData1, int eventData2);
int  CVICALLBACK FilterDataButtonCB(int panel, int control, int event, void *callbackData, int eventData1, int eventData2);
int  CVICALLBACK GenerateButtonCB(int panel, int control, int event, void *callbackData, int eventData1, int eventData2);
int  CVICALLBACK MainPanelCB(int panel, int event, void *callbackData, int eventData1, int eventData2);
int  CVICALLBACK SelectDataButtonCB(int panel, int control, int event, void *callbackData, int eventData1, int eventData2);


#ifdef __cplusplus
    }
#endif