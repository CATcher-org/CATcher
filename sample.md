AuthComponent: Remove Unauthenticated API Calls 

The app does a version check upon initialisation, which makes use 
of an unauthenticated GitHub API request. Hence, users are severly
limited as they may be locked out of the application if too many 
unauthenticated requests are sent. 

Let's remove these unauthenticated API calls instead. 

We can shift this API call to a point after user authentication is
done such that authenticated GitHub API calls are made instead.