import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, MenuController, ModalController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Subscription} from 'rxjs/Subscription';
import { UserProvider } from '../providers/user/user';
import { AuthServiceProvider } from '../providers/auth-service/auth-service';
import { GooglePlus } from '@ionic-native/google-plus';
import { DatabaseProvider } from '../providers/database/database';
// import { FcmProvider } from '../providers/fcm/fcm';

// Pages:
import { HomePage } from '../pages/home/home';
import { WelcomePage } from '../pages/welcome/welcome';
import { FeedingPage } from '../pages/feeding/feeding';
import { DiaperingPage } from '../pages/diapering/diapering';
import { SleepingPage } from '../pages/sleeping/sleeping';
import { GrowthPage } from '../pages/growth/growth';
import { PlayingPage } from '../pages/playing/playing';
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

  constructor(public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private auth: AuthServiceProvider,
    private menu: MenuController,
    private user: UserProvider,
    private googlePlus: GooglePlus,
    private db: DatabaseProvider,
    private modal: ModalController,
    // private fcm: FcmProvider
    ) {
    this.initializeApp();

    this.pages = [
      { title: 'Home', component: HomePage, icon: 'home' },
      { title: 'Feeding', component: FeedingPage, icon: 'custom-bottle' },
      { title: 'Diapering', component: DiaperingPage, icon: 'custom-diaper' },
      { title: 'Sleeping', component: SleepingPage, icon: 'custom-sleeping-baby' },
      { title: 'Playing', component: PlayingPage, icon: 'custom-cubes' },
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
    }).then(async () => {
      await this.createAuthObservable().then((retVal) => {
        if(retVal == true){
          this.nav.setRoot(HomePage);
        } else {
          this.nav.setRoot(WelcomePage);
        }
      });
    });

  }

  async createAuthObservable(){
    return new Promise(async resolve => {
      // Logic to check if users are logged in or not.
      this.userSubscription = this.auth.afAuth.authState.subscribe( user => {
        if(user){
          if(user.email){
            this.user.setUserEmail(user.email);
          };
          if(user.uid){
            this.user.setUserId(user.uid).then(async () =>{
              await this.db.setNewUserNewBaby(user.uid).then( async retVal => {
                // User decided to add baby later
                if(retVal == "later"){
                  this.bdayYear = 0;
                  this.bdayMonth = 0;
                  this.babyName = "No baby added yet!";
                  resolve(true);
                }
                // No baby file found but user added baby
                else {
                  // Create a baby observable as soon as the user adds him or her
                  console.log("App:: Creating baby observable...");
                  await this.db.createBabyObservable(user.uid).then((retVal) => {
                    this.bdayYear = this.db.bdayYear;
                    this.bdayMonth = this.db.bdayMonth;
                    this.babyName = this.db.babyName;
                    this.babyObservableDone = true;
                    console.log("APP:: done creating baby observable!");
                    //this.nav.setRoot(HomePage);
                    resolve(true);
                  });
                }
              });
            });
          } else {
            console.log("App::initializeApp(): No user exists...going to WelcomePage.");
            //this.nav.setRoot(WelcomePage);
            resolve(false);
          };
        };
      });
    });
  }

  // NOTE: working on this...settings are lagging away by one set
  async editBabyProfile(){
    console.log("Editing baby profile");
    this.db.getUserReference().then((currentUserRef) => {
      // console.log("1");
      this.db.getBabyObject().then((babyObject) => {
        // console.log("2");
        this.openModal(babyObject).then(async (baby) => {
          // console.log("3. baby birthday", baby.birthday);
          await currentUserRef.doc(baby.firstName).set(baby);
          this.bdayYear = this.db.bdayYear;
          // console.log("4. baby birthday", this.bdayYear);
          this.bdayMonth = this.db.bdayMonth;
          this.babyName = this.db.babyName;
        });
      });
    });
  }

  openModal(babyObject: any) : any{
    return new Promise(resolve => {
      this.myModal = this.modal.create(EditBabyModalPage, {babyObject: babyObject});
      this.myModal.present();
      resolve(this.waitForReturn());
    });
  }

  // This method serves as a condition while loop and waits for the
  // modal to dismiss before it goes to the next line of the caller.
  waitForReturn() : any{
    return new Promise(resolve => {
      this.myModal.onDidDismiss( data => {
        let babyObject = data;
        // console.log("This babyObject_", babyObject);
        resolve(babyObject);
      });
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
    console.log("App::logOut(): User logged out");
  }

}
