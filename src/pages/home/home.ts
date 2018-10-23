import { Component } from '@angular/core';
import { NavController, MenuController, NavParams} from 'ionic-angular';
import { LifoHistoryProvider } from '../../providers/lifo-history/lifo-history';
import { UserProvider } from '../../providers/user/user';
import { DatabaseProvider } from '../../providers/database/database';


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

  // Final Sort Arrays
  todayHistoryArray: any;

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

  constructor(public navCtrl: NavController,
    private menu: MenuController,
    private lifoHistory: LifoHistoryProvider,
    private user: UserProvider,
    private db: DatabaseProvider,
    private navParams: NavParams) {
    this.enableMenu();
    this.init();
  }

  // ionViewDidLoad(){
  //   console.log("Home:: ionViewDidLoad() ran...");
  //   this.updateBottleSummary();
  // }

  init(){
    // Must clear all arrays if have items
    // if(this.bottleTodayHistoryArray.length != 0){
    //   this.bottleTodayHistoryArray.splice(0, this.bottleTodayHistoryArray.length);
    // }
    // if(this.mealHasToday)


    let flags = this.navParams.get('flags');

    //let array: any = [];
    //array = flags;

    console.log("7. Flags is:", flags, typeof flags);

    if(flags.length == 0){
      console.log("Home::init(): there is no record of any activities");
    }

    this.updateActivity(flags);

  }

  async updateActivity(flags: any){
    for(let flag of flags){
      if(flag == "bottlefeeding"){
        await this.updateBottleSummary();
      } else if(flag == "meal"){
        await this.updateMealSummary();
      } else if(flag == "breastfeeding"){
        //his.updateBreastFeedingSummary();
      } else if(flag == "diapering"){
        //this.updateDiaperingSummary();
      } else if(flag == "sleeping"){
        //this.updateSleepingSummary();
      }
      // } else if(flag == undefined){
      //   console.log("Home::init(): there is no record of any activities");
      // };
    };
  }

  updateBottleSummary(){
    return new Promise(resolve => {
      console.log("Home:: updateBottleSummary() ran");
      this.lifoHistory.init().then(() => {
        this.lifoHistory.lifoHistory('bottlefeeding').then(() => {
          this.bottleHasToday = this.lifoHistory.hasToday;
          this.bottleHasYesterday = this.lifoHistory.hasYesterday;
          this.bottleHasMore = this.lifoHistory.hasMore;

          console.log("Home:: updateBottleSummary(): bottleHasToday is:", this.bottleHasToday);

          if(this.bottleHasToday == true){
            this.bottleTodayHistoryArray = this.lifoHistory.todayHistoryArray;
            console.log("Home:: bottleTodayHistoryArray:", this.bottleTodayHistoryArray);
          }
          this.bottleYesterdayHistoryArray = this.lifoHistory.yesterdayHistoryArray;
          this.bottleMoreHistoryArray = this.lifoHistory.moreHistoryArray;
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
            console.log("Home:: mealTodayHistoryArray:", this.mealTodayHistoryArray);
          }
          this.mealYesterdayHistoryArray = this.lifoHistory.yesterdayHistoryArray;
          this.mealMoreHistoryArray = this.lifoHistory.moreHistoryArray;
          resolve(true);
        });
      })
    });
  }

  sortTodayArray(){
    if (this.bottleTodayHistoryArray != undefined && this.mealMoreHistoryArray != undefined){
      this.todayHistoryArray = this.bottleTodayHistoryArray.concat(this.mealTodayHistoryArray).sort();
      this.todayHistoryArray = this.todayHistoryArray.reverse();
      console.log("HOME::Todays history array: ", this.todayHistoryArray);
    } else {
      console.log("HOME::sortTodayArray(): emtpy no history yet");
    }
  }

  openPage(page: any) {
    this.navCtrl.push(page.component, {"parentPage": this});
  }

  getSegments(type: any){
    return this.segments[type];
  }

  enableMenu(){
    this.menu.enable(true);
  }
}
