import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, MenuController, ModalController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Subscription} from 'rxjs/Subscription';
import { UserProvider } from '../providers/user/user';
import { AuthServiceProvider } from '../providers/auth-service/auth-service';
import { GooglePlus } from '@ionic-native/google-plus';
import { DatabaseProvider } from '../providers/database/database';
import { FcmProvider } from '../providers/fcm/fcm';
import { BabyProvider } from '../providers/baby/baby';

// Pages:
import { HomePage } from '../pages/home/home';
import { WelcomePage } from '../pages/welcome/welcome';
import { FeedingPage } from '../pages/feeding/feeding';
import { DiaperingPage } from '../pages/diapering/diapering';
import { SleepingPage } from '../pages/sleeping/sleeping';
import { GrowthPage } from '../pages/growth/growth';
import { CreditsPage } from '../pages/credits/credits';
import { CameraPage } from '../pages/camera/camera';
import { EditBabyModalPage } from '../pages/edit-baby-modal/edit-baby-modal';

import firebase from 'firebase';
import 'firebase/firestore';
import { async } from '@firebase/util';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = HomePage;
  userSubscription: Subscription;
  summaryArray: string[] = new Array();

  pages: Array<{title: string, component: any, icon: string}>;
  activePage: any;

  babyName: any;
  babyAge: any;
  babyPicture: any;
  babyBirthday: any;
  bdayYear: number;
  bdayMonth: number;

  // Observable flags
  babyObservableDone: boolean = false;

  // Has history Flags
  hasHistoryFlagsArray: string[] = new Array();

  // NOTE: Add to this damn list as activities grows.
  activitiesArray: string[] = new Array("bottlefeeding", "breastfeeding", "meal", "diapering", "sleeping");

  myModal: any;
  babyArray: any;

  constructor(public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private auth: AuthServiceProvider,
    private menu: MenuController,
    private user: UserProvider,
    private googlePlus: GooglePlus,
    private db: DatabaseProvider,
    private modal: ModalController,
    private fcm: FcmProvider,
    private baby: BabyProvider
    ) {
    this.initializeApp();

    this.pages = [
      { title: 'Home', component: HomePage, icon: 'home' },
      { title: 'Feeding', component: FeedingPage, icon: 'custom-bottle' },
      { title: 'Diapering', component: DiaperingPage, icon: 'custom-diaper' },
      { title: 'Sleeping', component: SleepingPage, icon: 'custom-sleeping-baby' },
      { title: 'Growth', component: GrowthPage, icon: 'custom-growth' },
      { title: 'PhotoShoot', component: CameraPage, icon: 'custom-camera' },
      { title: 'Credits', component: CreditsPage, icon: 'custom-cited'},
    ];

    this.activePage = this.pages[0];
  }

  async initializeApp() {
    await this.platform.ready().then(async () => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      //this.statusBar.styleDefault();
      this.splashScreen.hide();
      // if(this.summaryArray.length != 0){
      //   this.summaryArray.splice(0, this.summaryArray.length);
      // };
    }).then(() => {
      this.createUserAuthObservable()
      // this.createBabyObservable();
    });

  }

  async createUserAuthObservable(){
    return new Promise(async resolve => {
      // Logic to check if users are logged in or not.
      this.userSubscription = this.auth.afAuth.authState.subscribe( user => {
        if(user){
          if(user.email){
            this.user.setUserEmail(user.email);
          };
          if(user.uid){
            this.user.setUserId(user.uid).then(async () =>{
              await this.db.setNewUser(user).then( async retVal => {
                console.log("Set new user finished")
                resolve(this.createBabyObservable());
              });
            });
          }
        } else {
          console.log("App::initializeApp(): No user exists...going to WelcomePage.");
          resolve(this.nav.setRoot(WelcomePage));
        };
      }, error => {
        console.log("Error while subscribing to authstate", error);
      });
    });
  }

  createBabyObservable(){
    return new Promise(async resolve => {
      let currentBabyRef = await this.db.getCurrentBabyRef();
      await currentBabyRef.onSnapshot(async (snapShot) => {
        let count: number = 0;
        let skip: boolean = false;
        let babyArray = [];

        await snapShot.forEach(async (doc) => {
          count = count + 1;
          let babyObject = doc.data();
          babyArray.push(babyObject);

          if(babyObject.current == true){
            this.baby.setBabyObject(babyObject);
            await this.db.calculateAge();
            this.bdayYear = this.db.bdayYear;
            this.bdayMonth = this.db.bdayMonth;
            this.babyName = this.baby.getBabyFirstName();
            skip = true;
          }
        });
        // Update the babies array in the db
        this.db.setBabiesArray(babyArray);
        // If we have only one baby use that baby, else ask user which
        // baby to use.
        if (count == 0 && skip == false){
          console.log("Creating first baby file");
          this.db.createNewBaby().then(async () => {
            await this.db.calculateAge();
            this.bdayYear = this.db.bdayYear
            this.bdayMonth = this.db.bdayMonth;
            this.babyName = this.baby.getBabyFirstName();
            this.db.setCurrentBabyFlag(this.babyName);
            resolve(this.nav.setRoot(HomePage));
          });
        }
        resolve(this.nav.setRoot(HomePage));
      });
      //   } else if (count == 1){
      //     let baby = babyArray[0];
      //     this.baby.setBabyObject(baby);
      //     await this.db.calculateAge();
      //     this.bdayYear = this.db.bdayYear
      //     this.bdayMonth = this.db.bdayMonth;
      //     this.babyName = this.baby.getBabyFirstName();
      //     resolve(this.nav.setRoot(HomePage));
      //     console.log("Database::createBabyObservable: baby obervable is:", baby);
      //   }
      //   else {
      //         console.log("More than one baby ask user to choose baby");
      //         console.log("Baby array is:", babyArray);
      //         await this.db.moreThanOneBabyAlert(babyArray).then(async (babyFirstName) => {
      //           console.log(babyFirstName)
      //           if(babyFirstName == null){
      //             console.log("cancel is pressed")
      //             resolve(this.nav.setRoot(HomePage));
      //           } else {
      //             for(let baby of babyArray){
      //               if(baby.firstName == babyFirstName){
      //                 let babyObject = baby;
      //                 await this.baby.resetBabyObject();
      //                 await this.baby.setBabyObject(babyObject);
      //                 await this.db.calculateAge();
      //                 this.bdayYear = this.db.bdayYear
      //                 this.bdayMonth = this.db.bdayMonth;
      //                 this.babyName = this.baby.getBabyFirstName();
      //                 resolve(this.nav.setRoot(HomePage));
      //               }
      //             };
      //           };
      //         });
      //       };
      //     });
      // });
    });
  }

  setYearMonth(year: any, month: any){
    this.bdayYear = year;
    this.bdayMonth = month;
    this.babyName = this.baby.getBabyFirstName();
  }

  // NOTE: working on this...settings are lagging away by one set
  async editBabyProfile(){
    console.log("Editing baby profile");
    this.db.editBabyProfile().then(() => {
      this.bdayYear - this.db.bdayYear;
      this.bdayMonth = this.db.bdayMonth;
      this.babyName = this.db.babyName;
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.menu.close();
    this.nav.setRoot(page.component);
    this.activePage = page;
  }

  checkActive(page){
    return page == this.activePage;
  }

  logout() {
	  this.menu.close();
	  this.auth.signOut();
    this.googlePlus.logout().then(() => {
    }, error => {
      console.log("App::logout(): error: ", error);
    });
    this.user.deleteUser();
	  this.nav.setRoot(WelcomePage);
    this.activePage = this.pages[0];
    this.summaryArray.splice(0, this.summaryArray.length);
    //this.userSubscription.unsubscribe();
    //this.db.removeSubs();
    console.log("App::logOut(): User logged out");
  }

}
