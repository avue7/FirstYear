import { Component } from '@angular/core';
import { NavController, MenuController } from 'ionic-angular';
import { LifoHistoryProvider } from '../../providers/lifo-history/lifo-history';


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
    private lifoHistory: LifoHistoryProvider) {
    this.enableMenu();
    this.updateBottleSummary();
    //this.updateMealSummary();
    //this.sortTodayArray();
  }

  updateBottleSummary(){
    this.lifoHistory.init().then(() => {
      this.lifoHistory.lifoHistory('bottlefeeding').then(() => {
        this.bottleHasToday = this.lifoHistory.hasToday;
        this.bottleHasYesterday = this.lifoHistory.hasYesterday;
        this.bottleHasMore = this.lifoHistory.hasMore;
        console.log("THIS BOTTLE HAS TODAY IS:", this.bottleHasToday);
        console.log("THIS BOTTLE HAS YESTERDAY IS:", this.bottleHasYesterday);
        console.log("THIS BOTTLE HAS MORE IS:", this.bottleHasMore);

        if(this.bottleHasToday == true){
          this.bottleTodayHistoryArray = this.lifoHistory.todayHistoryArray;
          console.log("THIS BOTTLE TDOAY HISTORY ARRAY:", this.bottleTodayHistoryArray);
        }
        this.bottleYesterdayHistoryArray = this.lifoHistory.yesterdayHistoryArray;
        this.bottleMoreHistoryArray = this.lifoHistory.moreHistoryArray;
      });
    })
  }

  updateMealSummary(){
    this.lifoHistory.init().then(() => {
      this.lifoHistory.lifoHistory('meal').then(() => {
        this.mealHasToday = this.lifoHistory.hasToday;
        // console.log("update meal has today is", this.mealHasToday);
        this.mealHasYesterday = this.lifoHistory.hasYesterday;
        this.mealHasMore = this.lifoHistory.hasMore;
        if(this.mealHasToday == true){
          this.mealTodayHistoryArray = this.lifoHistory.todayHistoryArray;
          console.log("THIS MEAL TDOAY HISTORY ARRAY:", this.mealTodayHistoryArray);
        }
        this.mealYesterdayHistoryArray = this.lifoHistory.yesterdayHistoryArray;
        this.mealMoreHistoryArray = this.lifoHistory.moreHistoryArray;
      });
    })
  }

  sortTodayArray(){
    //this.todayHistoryArray.join(this.bottleTodayHistoryArray, this.mealTodayHistoryArray);
    //console.log("HOME::Todays history array:", this.todayHistoryArray);
  }

  openPage(page: any) {
    this.navCtrl.push(page.component);
  }

  getSegments(type: any){
    return this.segments[type];
  }

  enableMenu(){
    this.menu.enable(true);
  }
}
