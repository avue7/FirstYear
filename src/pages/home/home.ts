import { Component } from '@angular/core';
import { NavController, MenuController, NavParams, Platform} from 'ionic-angular';
import { LifoHistoryProvider } from '../../providers/lifo-history/lifo-history';
import { UserProvider } from '../../providers/user/user';
import { DatabaseProvider } from '../../providers/database/database';
import { FcmProvider } from '../../providers/fcm/fcm';


// Pages:
import { FeedingPage } from '../feeding/feeding';
import { DiaperingPage } from '../diapering/diapering';
import { SleepingPage } from '../sleeping/sleeping';
import { PlayingPage } from '../playing/playing';
import { GrowthPage } from '../growth/growth';
import { CameraPage } from '../camera/camera';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  pages: Array<{component: any, icon: string}>;
  segmentType = 'Activities';
  segments: any = {
    'Activities': [
      { component: FeedingPage, icon: 'custom-bottle' },
      { component: DiaperingPage, icon: 'custom-diaper' },
      { component: SleepingPage, icon: 'custom-sleeping-baby' },
      { component: PlayingPage, icon: 'custom-cubes' },
      { component: GrowthPage, icon: 'custom-growth' },
      { component: CameraPage, icon: 'custom-camera' }
    ],
    'Charts': [
      {
        name: 'Diaper chart'
      }
    ],
    'Chats': [
      {
        name: 'Main Chat'
      }
    ]
  }

  activitiesArray: string[] = new Array("bottlefeeding", "breastfeeding", "meal", "diapering", "sleeping");

  // Final Sort Arrays
  todayHistoryArray: any;
  hasToday: boolean = false;

  yesterdayHistoryArray: any;
  hasYesterday: boolean = false;

  moreHistoryArray: any;
  hasMore: boolean = false;

  // Breastfeeding history declarations
  breastTodayHistoryArray: any;
  breastYesterdayHistoryArray: any;
  breastMoreHistoryArray: any;

  breastHasToday: boolean;
  breastHasYesterday: boolean;
  breastHasMore: boolean;

  // BottleFeeding history declarations
  bottleTodayHistoryArray: any;
  bottleYesterdayHistoryArray: any;
  bottleMoreHistoryArray: any;

  bottleHasToday: boolean;
  bottleHasYesterday: boolean;
  bottleHasMore: boolean;

  // Meals history declarations
  mealTodayHistoryArray: any;
  mealYesterdayHistoryArray: any;
  mealMoreHistoryArray: any;

  mealHasToday: boolean;
  mealHasYesterday: boolean;
  mealHasMore: boolean;

  // Diapering history declarations
  diaperingTodayHistoryArray: any;
  diaperingYesterdayHistoryArray: any;
  diaperingMoreHistoryArray: any;

  diaperingHasToday: boolean;
  diaperingHasYesterday: boolean;
  diaperingHasMore: boolean;

  // Sleeping history declarations
  sleepingTodayHistoryArray: any;
  sleepingYesterdayHistoryArray: any;
  sleepingMoreHistoryArray: any;

  sleepingHasToday: boolean;
  sleepingHasYesterday: boolean;
  sleepingHasMore: boolean;

  // Flag to set if no history yet
  noHistoryYet: boolean = false;

  activities: Array<{type_: string, icon: string}>;

  constructor(public navCtrl: NavController,
    private menu: MenuController,
    private lifoHistory: LifoHistoryProvider,
    private user: UserProvider,
    private db: DatabaseProvider,
    private navParams: NavParams,
    private platform: Platform,
    private fcm: FcmProvider) {
    this.waitForPlatFormReady().then(() => {
      this.enableMenu();
      this.fcm.getToken();
    }).then(() => {
      this.init();
    });
  }

  async waitForPlatFormReady(){
    return new Promise(async resolve => {
      await this.platform.ready().then(() => {
        resolve(true);
      });
    });
  }
  // ionViewDidLoad(){
  //   console.log("Home:: ionViewDidLoad() ran...");
  //   this.updateBottleSummary();
  // }

  init(){
    this.createHistoryObservables(this.user).then(async() => {
      await this.updateBottleSummary();
      await this.updateMealSummary();
      await this.updateDiaperingSummary();
      await this.updateBreastSummary();
      await this.updateSleepSummary();
    }).then(() => {
      this.hasToday = false;
      this.hasYesterday = false;
      this.hasMore = false;
    }).then(async() => {
      await this.groupTodayArray();
      // Then sort:
      if(this.hasToday){
        this.todayHistoryArray = await this.todayHistoryArray.sort((a,b) => {
          return (a.time > b.time ? -1 : a.time < b.time ? 1 : 0);
        });
        // console.log("This todayHistoryArray: ", this.todayHistoryArray);
      };
      // console.log("SORTY TODAY ARRAY IS", this.todayHistoryArray);
    }).then(async() => {
      await this.groupYesterdayArray();
      if(this.hasYesterday){
        this.yesterdayHistoryArray = await this.yesterdayHistoryArray.sort((a,b) => {
          return (a.time > b.time ? -1 : a.time < b.time ? 1 : 0);
        });
      };
    }).then(async() => {
      await this.groupMoreArray();
      if(this.hasMore){
        this.moreHistoryArray = await this.moreHistoryArray.sort((a,b) => {
          return (a.dateTime > b.dateTime ? -1 : a.dateTime < b.dateTime ? 1 : 0);
        });
        // console.log("This moreHistoryArray: ", this.moreHistoryArray);
      };
    }).then(async() => {
      await this.checkForNoHistory();
    });
  }

  async createHistoryObservables(user: any){
    for (let activity of this.activitiesArray){
      let activityRef: any;
      await this.db.getActivityReference(activity).then( async(_activityRef) => {
        // console.log("1....database:: getActivityReference returned");
        activityRef = _activityRef;
      }).then(async() => {
        // console.log("2. Creating observable for <", activity, "> ....");
        if(activity == "bottlefeeding"){
          // console.log("3b) activity is bottlefeeding");
          await this.db.createBottleFeedingHistoryObservable(user.uid, activityRef).then(async() => {
            //await this.updateSummaryArray("bottlefeeding");
          });
        } else if(activity == "breastfeeding"){
          // console.log("3b) activity is meal");
          await this.db.createBreastFeedingHistoryObservable(user.uid, activityRef).then((retVal) => {
          });
        } else if(activity == "meal"){
          // console.log("3b) activity is meal");
          await this.db.createMealHistoryObservable(user.uid, activityRef).then((retVal) => {
          });
        } else if(activity == "diapering"){
          await this.db.createDiaperingHistoryObservable(user.uid, activityRef).then((retVal) => {
          });
        } else if(activity == "sleeping"){
          await this.db.createSleepHistoryObservable(user.uid, activityRef).then((retVal) => {
          });
        };
      });
      // console.log("-----Done creating history observable-----");
    };
  }

  updateBottleSummary(){
    return new Promise(resolve => {
      // console.log("Home:: 1. updateBottleSummary() ran");
      this.lifoHistory.init().then(() => {
        this.lifoHistory.lifoHistory('bottlefeeding').then(() => {
          this.bottleHasToday = this.lifoHistory.hasToday;
          this.bottleHasYesterday = this.lifoHistory.hasYesterday;
          this.bottleHasMore = this.lifoHistory.hasMore;

          // console.log("Home:: 2. updateBottleSummary(): bottleHasToday is:", this.bottleHasToday);

          if(this.bottleHasToday == true){
            this.bottleTodayHistoryArray = this.lifoHistory.todayHistoryArray;
            // console.log("Home:: 3. bottleTodayHistoryArray:", this.bottleTodayHistoryArray);
          }
          this.bottleYesterdayHistoryArray = this.lifoHistory.yesterdayHistoryArray;
          this.bottleMoreHistoryArray = this.lifoHistory.moreHistoryArray;
          resolve(true);
        });
      });
    });
  }

  updateBreastSummary(){
    return new Promise(resolve => {
      // console.log("Home:: 1. updateBottleSummary() ran");
      this.lifoHistory.init().then(() => {
        this.lifoHistory.lifoHistory('breastfeeding').then(() => {
          this.breastHasToday = this.lifoHistory.hasToday;
          this.breastHasYesterday = this.lifoHistory.hasYesterday;
          this.breastHasMore = this.lifoHistory.hasMore;

          // console.log("Home:: 2. updateBottleSummary(): bottleHasToday is:", this.bottleHasToday);

          if(this.breastHasToday == true){
            this.breastTodayHistoryArray = this.lifoHistory.todayHistoryArray;
            // console.log("Home:: 3. bottleTodayHistoryArray:", this.bottleTodayHistoryArray);
          }
          this.breastYesterdayHistoryArray = this.lifoHistory.yesterdayHistoryArray;
          this.breastMoreHistoryArray = this.lifoHistory.moreHistoryArray;
          resolve(true);
        });
      });
    });
  }

  updateMealSummary(){
    return new Promise(resolve => {
      this.lifoHistory.init().then(() => {
        this.lifoHistory.lifoHistory('meal').then(() => {
          this.mealHasToday = this.lifoHistory.hasToday;
          // console.log("update meal has today is", this.mealHasToday);
          this.mealHasYesterday = this.lifoHistory.hasYesterday;
          this.mealHasMore = this.lifoHistory.hasMore;
          if(this.mealHasToday == true){
            this.mealTodayHistoryArray = this.lifoHistory.todayHistoryArray;
          }
          this.mealYesterdayHistoryArray = this.lifoHistory.yesterdayHistoryArray;
          this.mealMoreHistoryArray = this.lifoHistory.moreHistoryArray;
          resolve(true);
        });
      })
    });
  }

  updateDiaperingSummary(){
    return new Promise(resolve => {
      this.lifoHistory.init().then(() => {
        this.lifoHistory.lifoHistory('diapering').then(() => {
          this.diaperingHasToday = this.lifoHistory.hasToday;
          // console.log("update meal has today is", this.mealHasToday);
          this.diaperingHasYesterday = this.lifoHistory.hasYesterday;
          this.diaperingHasMore = this.lifoHistory.hasMore;
          if(this.diaperingHasToday == true){
            this.diaperingTodayHistoryArray = this.lifoHistory.todayHistoryArray;
          }
          this.diaperingYesterdayHistoryArray = this.lifoHistory.yesterdayHistoryArray;
          this.diaperingMoreHistoryArray = this.lifoHistory.moreHistoryArray;
          resolve(true);
        });
      })
    });
  }

  updateSleepSummary(){
    return new Promise(resolve => {
      this.lifoHistory.init().then(() => {
        this.lifoHistory.lifoHistory('sleeping').then(() => {
          this.sleepingHasToday = this.lifoHistory.hasToday;
          // console.log("update meal has today is", this.mealHasToday);
          this.sleepingHasYesterday = this.lifoHistory.hasYesterday;
          this.sleepingHasMore = this.lifoHistory.hasMore;
          if(this.sleepingHasToday == true){
            this.sleepingTodayHistoryArray = this.lifoHistory.todayHistoryArray;
          }
          this.sleepingYesterdayHistoryArray = this.lifoHistory.yesterdayHistoryArray;
          this.sleepingMoreHistoryArray = this.lifoHistory.moreHistoryArray;
          resolve(true);
        });
      })
    });
  }

  async groupTodayArray(){
    if(this.todayHistoryArray != undefined){
      await this.todayHistoryArray.splice(0, this.todayHistoryArray.length);
    }

    if(this.breastHasToday){
      this.hasToday = true;
      if(this.todayHistoryArray != undefined){
        this.todayHistoryArray = this.todayHistoryArray.concat(this.breastTodayHistoryArray);
      } else {
        this.todayHistoryArray = this.breastTodayHistoryArray;
      };
    }
    if(this.bottleHasToday){
      this.hasToday = true;
      if(this.todayHistoryArray != undefined){
        this.todayHistoryArray = this.todayHistoryArray.concat(this.bottleTodayHistoryArray);
      } else {
        this.todayHistoryArray = this.bottleTodayHistoryArray;
      };
    }
    if(this.mealHasToday){
      this.hasToday = true;
      if(this.todayHistoryArray != undefined){
        this.todayHistoryArray = this.todayHistoryArray.concat(this.mealTodayHistoryArray);
      } else {
        this.todayHistoryArray = this.mealTodayHistoryArray;
      };
    }
    if(this.diaperingHasToday){
      this.hasToday = true;
      if(this.todayHistoryArray != undefined){
        this.todayHistoryArray = this.todayHistoryArray.concat(this.diaperingTodayHistoryArray);
      } else {
        this.todayHistoryArray = this.diaperingTodayHistoryArray;
      };
    }
    if(this.sleepingHasToday){
      this.hasToday = true;
      if(this.todayHistoryArray != undefined){
        this.todayHistoryArray =  this.todayHistoryArray.concat(this.sleepingTodayHistoryArray);
      } else {
        this.todayHistoryArray = this.sleepingTodayHistoryArray;
      };
    }
  }

  async groupYesterdayArray(){
    if(this.yesterdayHistoryArray != undefined){
      await this.yesterdayHistoryArray.splice(0, this.yesterdayHistoryArray.length);
    }

    if(this.breastHasYesterday){
      this.hasYesterday = true;
      if(this.yesterdayHistoryArray != undefined){
        this.yesterdayHistoryArray = this.yesterdayHistoryArray.concat(this.breastYesterdayHistoryArray);
      } else {
        this.yesterdayHistoryArray = this.breastYesterdayHistoryArray;
      };
    }
    if(this.bottleHasYesterday){
      this.hasYesterday = true;
      if(this.yesterdayHistoryArray != undefined){
        this.yesterdayHistoryArray =  this.yesterdayHistoryArray.concat(this.bottleYesterdayHistoryArray);
      } else {
        this.yesterdayHistoryArray = this.bottleYesterdayHistoryArray;
      };
    }
    if(this.mealHasYesterday){
      this.hasYesterday = true;
      if(this.yesterdayHistoryArray != undefined){
        this.yesterdayHistoryArray = this.yesterdayHistoryArray.concat(this.mealYesterdayHistoryArray);
      } else {
        this.yesterdayHistoryArray = this.mealYesterdayHistoryArray;
      };
    }
    if(this.diaperingHasYesterday){
      this.hasYesterday = true;
      if(this.yesterdayHistoryArray != undefined){
        this.yesterdayHistoryArray = this.yesterdayHistoryArray.concat(this.diaperingYesterdayHistoryArray);
      } else {
        this.yesterdayHistoryArray = this.diaperingYesterdayHistoryArray;
      };
    }
    if(this.sleepingHasYesterday){
      this.hasYesterday = true;
      if(this.yesterdayHistoryArray != undefined){
        this.yesterdayHistoryArray = this.yesterdayHistoryArray.concat(this.sleepingYesterdayHistoryArray);
      } else {
        this.yesterdayHistoryArray = this.sleepingYesterdayHistoryArray;
      };
    }
    // console.log("hasYesterday", this.hasYesterday);
  }

  async groupMoreArray(){
    if(this.moreHistoryArray != undefined){
      await this.moreHistoryArray.splice(0, this.moreHistoryArray.length);
    }

    if(this.breastHasMore){
      this.hasMore = true;
      if(this.moreHistoryArray != undefined){
        this.moreHistoryArray = this.moreHistoryArray.concat(this.breastMoreHistoryArray);
      } else {
        this.moreHistoryArray = this.breastMoreHistoryArray;
      };
    }
    if(this.bottleHasMore){
      this.hasMore = true;
      if(this.moreHistoryArray != undefined){
        this.moreHistoryArray = this.moreHistoryArray.concat(this.bottleMoreHistoryArray);
      } else {
        this.moreHistoryArray = this.bottleMoreHistoryArray;
      };
    }
    if(this.mealHasMore){
      this.hasMore = true;
      if(this.moreHistoryArray != undefined){
        this.moreHistoryArray = this.moreHistoryArray.concat(this.mealMoreHistoryArray);
      } else {
        this.moreHistoryArray = this.mealMoreHistoryArray;
      };
    }
    if(this.diaperingHasMore){
      this.hasMore = true;
      if(this.moreHistoryArray != undefined){
        this.moreHistoryArray = this.moreHistoryArray.concat(this.diaperingMoreHistoryArray);
      } else {
        this.moreHistoryArray = this.diaperingMoreHistoryArray;
      };
    }
    if(this.sleepingHasMore){
      this.hasMore = true;
      if(this.moreHistoryArray != undefined){
        this.moreHistoryArray = this.moreHistoryArray.concat(this.sleepingMoreHistoryArray);
      } else {
        this.moreHistoryArray = this.sleepingMoreHistoryArray;
      };
    }
    // console.log("hasMore", this.hasMore);
  }

  checkForNoHistory(){
    if((this.hasToday === true) || (this.hasYesterday === true) || (this.hasMore === true)){
      console.log("Home:: has history!", this.hasToday, this.hasYesterday, this.hasMore);
      this.noHistoryYet = false;
      // console.log("today history length", this.todayHistoryArray.length)
    } else {
      console.log("Home:: no history yet!");
      this.noHistoryYet = true;
    }
  }

  async editEvent(slidingItem: any, event: any){
    await this.db.editEvent(event).then(async() => {
      this.init();
    });
    console.log("CLICKED ON EVENT");
    slidingItem.close();
  }

  async deleteEvent(slidingItem: any, event: any){
    console.log("CLICKED ON DELETE EVENT", event);
    slidingItem.close();
    await this.db.deleteEvent(event).then(() => {
      this.init();
    });
  }

  openPage(page: any) {
    this.navCtrl.push(page.component, {parentPage: this});
  }

  getSegments(type: any){
    return this.segments[type];
  }

  enableMenu(){
    this.menu.enable(true);
  }

  async refresh(refresher){
    console.log('Begin async operation', refresher);
    await this.init();
    refresher.complete();
  }
}


//NOTE: you need to work on deleting the other ones now.
