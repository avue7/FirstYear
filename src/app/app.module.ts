import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
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
import { PlayingPage } from '../pages/playing/playing';
import { CameraPage } from '../pages/camera/camera';
import { CreditsPage } from '../pages/credits/credits';
import { BabyModalPage } from '../pages/baby-modal/baby-modal';


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
    PlayingPage,
    CameraPage,
    CreditsPage,
    BabyModalPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(firebaseConfig.fire),
    NgxErrorsModule,
    BrowserAnimationsModule,
    // Testing firestore
    AngularFirestoreModule
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
    PlayingPage,
    CameraPage,
    CreditsPage,
    BabyModalPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AngularFireAuth,
    AuthServiceProvider,
    GooglePlus,
    UserProvider,
    DatabaseProvider
  ]
})
export class AppModule {}
