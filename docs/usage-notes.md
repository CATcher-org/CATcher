# Notes on using the CATcher Desktop App

You can download the latest release from https://github.com/CATcher-org/CATcher/releases

Start the application by clicking on the executable file, no installation is required.

The app will prompt you to enter the session you are participating in, using a dropdown.

![session_select](https://imgur.com/nBOy7zH.png)

## For Windows Users
For normal usage, you can run the `CATcher.exe` and the following dialog would appear. Simply click on the "More Info" button and then click the "Run Anyway" button which would have appeared on the bottom right corner of the dialog. 

![windows_warning](https://imgur.com/4p0Yn7s.png)

In some cases, the "Run Anyway" button may not appear. To troubleshoot this, you can open up "Windows Security" and under "App & browser control", click on "Reputation-based protection settings" and make sure CATcher is not blocked here.

If you are using an older version of Windows, you may not be able to find the "Reputation-based protection settings". Under "App and browser control", you would instead see "Check apps and files". In this section, make sure it is set to "Warn".

## For Mac Users
To run CATcher on MacOS, you would need to go to "System Preferences" and in "Security & Privacy", select "Open Anyway" for CATcher, as shown below.

![mac_security](https://imgur.com/INX9Juq.png)

### Troubleshooting
1. Copy and pasting images into the text editor for Mac Users

    You may find you are not able to copy (Cmd+c) and paste (Cmd+v) an image from the "Preview" application. As a workaround, there are other ways to paste stuff into the text editor such as dragging and dropping a screenshot image or a file.

## For Linux Users
After downloading the AppImage file, you should be able to run CATcher by clicking on the
AppImage file.
If this does not work, you may need to allow the file to be executed.
There are 2 methods to achieve this:
- From the GUI:
  - Right click on the file icon
  - Select `Properties`, then select `Permissions`
  - Enable the `Allow executing file as program` option. 
  - Note: the GUI menus may differ slightly on different Linux distributions.
- From the command line: Use `chmod +x CATcher-x.y.z.AppImage`
