import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { TimerProvider } from '../../providers/timer/timer';
import { FormattedTodayProvider} from '../../providers/formatted-today/formatted-today';
import { DatabaseProvider } from '../../providers/database/database';
import { AlertController } from 'ionic-angular';

@Component({
  selector: 'page-feeding',
  templateUrl: 'feeding.html',
})
export class FeedingPage {
  leftBreast: any = null;
  rightBreast: any = null;
  activeBreast: any;

  lastBreastFeed: any = null;
  lastBreastSide: any = null;


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
    private timer: TimerProvider,
    private ft: FormattedTodayProvider,
    private db: DatabaseProvider,
    private alertCtrl: AlertController) {
    this.setLeftBreast();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FeedingPage');
    this.getLastBreastFeed();
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

  saveBreastFeeding(){
    let today = this.ft.getTodayMonthFirstWithTime();

    let breast_: any;

    if(this.leftBreast){
      breast_ = "left breast";
      console.log("Feeding::save(): feed on the left breast");
    } else{
      breast_ = "right breast";
      console.log("Feeding::save(): feed on the right breast");
    }

    let object = {
      breast: breast_,
      date: today,
      time: this.timer.tick
    }

    console.log("Feeding::save(): object is:", object);
    console.log("Feeding::save(): today is:", today);
    console.log("Feeding::save(): tick is:", this.timer.tick);

    this.db.saveBabyActivity("breastfeeding", object).then(() => {
      this.getLastBreastFeed();
    });
  }

  getLastBreastFeed(){
    console.log("this ran");
    let count = 0;
    let babyRef = this.db.getBabyReference();
    babyRef.collection('breastfeeding')
      // .where('date', '==', 'date')
      .get().then((latestSnapshot) => {
        latestSnapshot.forEach(doc => {
          count = count + 1;
          // console.log("Feeding::getLastBreastFeed(): lastest breastfeed:", doc.data());
        });
    });

    babyRef.collection('breastfeeding').get().then((latestSnapshot) => {
      latestSnapshot.forEach(doc => {
        count = count - 1;
        if(count == 0){
          // console.log("Feeding::getLastBreastFeed(): count is:", count);
          console.log("Feeding::getLastBreastFeed(): last doc retrieved is:", typeof doc.data());
          this.lastBreastFeed = this.ft.formatDateTimeStandard(doc.data().date);
          this.lastBreastSide = doc.data().breast;
        };
      });
    });
  }

  manualAdd(){
    // let alert = this.alertCtrl.create({
    //   title: 'Manually Add Breastfeed',
    //   inputs: [
    //     {
    //       name: 'breast',
    //       placeholder: 'Which Breast'
    //     }
    //   ]
    // })
  }

}
