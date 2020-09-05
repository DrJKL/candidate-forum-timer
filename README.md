# Candidate Forum Timer Software

## Instructions for setup (by the Timekeeper)
These instructions have been tested on Macs and Windows PCs.

## Initial software install and setup
* [Download OBS](https://obsproject.com), then install it and open it.
   * On Windows, the app is called "OBS Studio", on Mac, it's just "OBS".
   * When going through the auto-configuration wizard, when it asks you for "stream information" you can click "cancel" and close the wizard.
   * Mac users: OBS will ask you for permissions when it opens (to the microphone and to recieve keystrokes from any application); you can allow them.
* Install a virtual camera plugin for OBS.
   * For Windows users, [download obs-virtualcam](https://obsproject.com/forum/resources/obs-virtualcam.949/) and install it (when asked, you only need one virtual camera). 
   * For Mac users, [download obs-mac-virtualcam](https://github.com/johnboiles/obs-mac-virtualcam) by clicking on "Releases" on the right-hand side, then the "pkg" link under assets, then install it.

## Set up camera and timer
* Open OBS
* Enable the virtual camera:
  * On Windows, go to the Tools menu and select VirtualCam, then click "Start". (You can check "AutoStart" as well so you don't do this in the future).
  * On Mac, go to the Tools menu and select "Start Virtual Camera".
* Open the [timer](https://drjkl.github.io/candidate-forum-timer/) in your favorite browser
* Configure the timer by setting the:
  * Logo
  * Event Title
  * Host
  * Candidates
* In OBS, in the "Sources" section of the main window, click the +, then select "Window Capture"; name it (the name is not visible to anyone else) and click "OK". 
* Select the name of your browser window from the "Window" dropdown, then click OK.
  * Mac users: The first time you do this you may not see your browser listed at all, just OBS and the desktop. If this happens, check "Show Windows with empty names", then you should find one with the name of your browser. When you select it, macOS will ask you to grant OBS permissions to screen record. Follow its instructions to let OBS record your screen (you do not need to restart it).
* Adjust and crop the display to your liking (in OBS, you can move the red outline rectangle to crop off parts of the window to hide the browser navigation, scroll bar, etc; and you can also resize the window in your browser or adjust the zoom/font size).
* Go to Zoom's Video settings and you should see the OBS camera (Mac: OBS Virtual Camera, Windows: OBS-Camera), select it.
  * If you do not see the OBS camera in the dropdown (immediately after installation) restart Zoom and try again. 
  * If you are a Mac user and still do not see the OBS Virtual Camera, go to the zoom.us application menu and select "Check For Updates...". You need to be running version 5.1.2 or newer.
  * If you have a virtual background you will need to disable it to see the timer page. 
  * You can also disable "mirror my video" here so you see the timer page in the correct direction (changing this does not impact how others see it; they will always see it correctly).
