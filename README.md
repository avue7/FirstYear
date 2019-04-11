# FirstYear
This is an android app using the Ionic Framework and Google's Firebase to store information that will help keep track of the user's baby's or babies daily essential activities such as feeding, diapering, sleeping, and eating.
<br/>
<br/>

### Welcome Page:
Users have the option login with normal username/password credentials, Google+, Facebook, or Twitter. If an account is not recognized by or not in Firebase's Authentication system via the login button, then the user will have the option to signup. Signing in with Google+, Facebook, or Twitter will automatically add users to the Firebase Authentication system. 

<img align="center" src="Readme_screenshots/welcome.png" width="400" />
<br/>

### Home Page: 

#### Activities Segment:
In this segment of the home page, each logged activitiy will be display here in chronological order from the latest to the oldest. At the bottom of the screen is a fixed footer that contains the icon for each activity. By clicking on the icon, the app will take the user to the appropriate page to record the activity chosen. 

<img src="Readme_screenshots/home.png" width="400" />
<br/>

Users can swipe the activity item left for the option to delete it.

<img src="Readme_screenshots/delete_activity_home.png" width="400" />
<br/>

Users can also swipe the activity item right to edit the information. 

<img src="Readme_screenshots/edit_activity_home.png" width="400" />
<br/>

Clicking on the icon feeding will take the user to this page. Bottlefeeding is set as the preference by the app for the first segment to be automatically display. Later, I will add the option for the user to choose which segment is best for them. 

<b>Bottlefeeding:</b>
For bottlefeeding, users can choose the type of fluid, volume in oz or ml, and add any notes. The right row displays a timer for the feeding event. Timing is optional and if there exists a time, the detail for the feeding time will be displayed with the activity item. The next column shows the latest bottlefeed. This event listener will automatically update relative to the current time on the latest bottlefeeding recorded. The information below this shows the history for the baby's bottlefeedings. I plan to make the items in this list editable in the future. 

<img src="Readme_screenshots/bottlefeeding.png" width="400" />
<br/>




