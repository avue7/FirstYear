import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { TimerProvider } from '../../providers/timer/timer'




@Component({
  selector: 'page-feeding',
  templateUrl: 'feeding.html',
})
export class FeedingPage {
  leftBreast: any = null;
  rightBreast: any = null;



  // Default value for breastfeeding radio left or right
  breastfeeding = "leftBreast";

  segmentType = 'Breast';

  segments: any = {
    'Breast':[

    ],
    'Bottle':[

    ],
    'Meal':[

    ]
  }

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private timer: TimerProvider) {
    this.setLeftBreast();
    // this.tick = 0;

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FeedingPage');
  }

  ionViewWillLeave() {
    this.timer.timerSubscription.unsubscribe();
  }

  setLeftBreast(){
    this.leftBreast = true;
    this.rightBreast = false;
    console.log("Feeding::setLeftBreast: leftBreast is", this.leftBreast);
    console.log("Feeding::setLeftBreast: rightBreast is", this.rightBreast);
  }

  setRightBreast(){
    this.rightBreast = true;
    this.leftBreast = false;
    console.log("Feeding::setRightBreast: rightBreast is", this.rightBreast);
    console.log("Feeding::setRightBreast: leftBreast is", this.leftBreast);
  }

  startPauseTimer(){
    this.timer.startPauseTimer();
  }

  refreshTimer(){
    if(this.timer.timerSubscription != undefined){
      this.timer.refreshTimer();
    } else{
      console.log("Feedings::refreshTimer(): timerSubscription is undefined");
    };
  }


}
