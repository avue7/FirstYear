import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule, ViewController} from 'ionic-angular';
import { NgxErrorsModule } from '@ultimate/ngxerrors';
import { MyApp } from './app.component';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuth } from 'angularfire2/auth';
import { firebaseConfig } from '../config';
import { AuthServiceProvider } from '../providers/auth-service/auth-service';
import { GooglePlus } from '@ionic-native/google-plus';
import { UserProvider } from '../providers/user/user';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DatabaseProvider } from '../providers/database/database';
import { DatePipe } from '@angular/common';
import { Firebase } from '@ionic-native/firebase';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { NativeStorage } from '@ionic-native/native-storage';



// Testing firestore
import { AngularFirestoreModule } from 'angularfire2/firestore';

// Pages:
import { WelcomePage } from '../pages/welcome/welcome';
import { LoginPage } from '../pages/login/login';
import { SignupPage } from '../pages/signup/signup';
import { ForgotPasswordPage } from '../pages/forgot-password/forgot-password';
import { HomePage } from '../pages/home/home';
import { FeedingPage } from '../pages/feeding/feeding';
import { DiaperingPage } from '../pages/diapering/diapering';
import { SleepingPage } from '../pages/sleeping/sleeping';
import { GrowthPage } from '../pages/growth/growth';
import { CameraPage } from '../pages/camera/camera';
import { CreditsPage } from '../pages/credits/credits';
import { BabyModalPage } from '../pages/baby-modal/baby-modal';
import { EditBabyModalPage } from '../pages/edit-baby-modal/edit-baby-modal';
import { BreastfeedingModalPage } from '../pages/breastfeeding-modal/breastfeeding-modal';
import { BfHistoryModalPage } from '../pages/bf-history-modal/bf-history-modal';
import { BottlefeedingModalPage } from '../pages/bottlefeeding-modal/bottlefeeding-modal';
import { DiaperingModalPage } from '../pages/diapering-modal/diapering-modal';
import { MealModalPage } from '../pages/meal-modal/meal-modal';
import { SleepingModalPage } from '../pages/sleeping-modal/sleeping-modal';
import { PopoverPage } from '../pages/popover/popover';
import { GrowthModalPage } from '../pages/growth-modal/growth-modal';
import { AlarmsModalPage } from '../pages/alarms-modal/alarms-modal';
import { AlarmsPage } from '../pages/alarms/alarms';

import { TimerProvider } from '../providers/timer/timer';
import { HoursMinutesSecondsPipe } from '../pipes/hours-minutes-seconds/hours-minutes-seconds';
import { FormattedTodayProvider } from '../providers/formatted-today/formatted-today';
import { BabyProvider } from '../providers/baby/baby';
import { DateTimePipe } from '../pipes/date-time/date-time';
import { GroupbyPipe } from '../pipes/groupby/groupby';
import { MomentPipe } from '../pipes/moment/moment';
import { NoteAlertProvider } from '../providers/note-alert/note-alert';
import { LifoHistoryProvider } from '../providers/lifo-history/lifo-history';
import { EventSettingProvider } from '../providers/event-setting/event-setting';
// import { NativeStorage } from '@ionic-native/native-storage';
import { FcmProvider } from '../providers/fcm/fcm';
import { CalculateSleepDurationProvider } from '../providers/calculate-sleep-duration/calculate-sleep-duration';
// import { Firebase } from '@ionic-native/firebase';



@NgModule({
  declarations: [
    MyApp,
    HomePage,
    WelcomePage,
    SignupPage,
    LoginPage,
    ForgotPasswordPage,
    FeedingPage,
    DiaperingPage,
    SleepingPage,
    GrowthPage,
    CameraPage,
    CreditsPage,
    BabyModalPage,
    HoursMinutesSecondsPipe,
    DateTimePipe,
    BreastfeedingModalPage,
    BfHistoryModalPage,
    GroupbyPipe,
    MomentPipe,
    BottlefeedingModalPage,
    DiaperingModalPage,
    MealModalPage,
    SleepingModalPage,
    EditBabyModalPage,
    PopoverPage,
    GrowthModalPage,
    AlarmsModalPage,
    AlarmsPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(firebaseConfig.fire),
    NgxErrorsModule,
    BrowserAnimationsModule,
    // Testing firestore
    AngularFirestoreModule,

  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    WelcomePage,
    SignupPage,
    LoginPage,
    ForgotPasswordPage,
    FeedingPage,
    DiaperingPage,
    SleepingPage,
    GrowthPage,
    CameraPage,
    CreditsPage,
    BabyModalPage,
    BreastfeedingModalPage,
    BfHistoryModalPage,
    BottlefeedingModalPage,
    DiaperingModalPage,
    MealModalPage,
    SleepingModalPage,
    EditBabyModalPage,
    PopoverPage,
    GrowthModalPage,
    AlarmsModalPage,
    AlarmsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AngularFireAuth,
    AuthServiceProvider,
    GooglePlus,
    DatabaseProvider,
    DatePipe,
    UserProvider,
    TimerProvider,
    FormattedTodayProvider,
    BabyProvider,
    DateTimePipe,
    HoursMinutesSecondsPipe,
    GroupbyPipe,
    MomentPipe,
    NoteAlertProvider,
    LifoHistoryProvider,
    EventSettingProvider,
    // NativeStorage,
    FcmProvider,
    Firebase,
    CalculateSleepDurationProvider,
    LocalNotifications,
    NativeStorage,
    // FeedingPage,
    // NavController
    // MyApp
  ]
})
export class AppModule {}
