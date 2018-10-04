import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { FormattedTodayProvider} from '../../providers/formatted-today/formatted-today';
import { Observable } from 'rxjs/Rx';


@Component({
  selector: 'page-bf-history-modal',
  templateUrl: 'bf-history-modal.html',
})
export class BfHistoryModalPage {
  historyArray: any = [];
  formattedHistoryArray: any = [];
  todayHistoryArray: any = [];
  dateDistanceArray: any = [];
  indexCounter: number;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private view: ViewController,
    private db: DatabaseProvider,
    private ft: FormattedTodayProvider) {
    this.historyArray = this.db.bfHistoryArray;
    this.indexCounter = 0;
    this.lifoHistory();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BfHistoryModalPage');
  }

  lifoHistory(){
    for(let x of this.historyArray){
      let formatDateTimeTemp = this.ft.formatDateTimeStandard(x.date);
      //this.formatHistoryOutput.push(this.ft.formatDateTimeStandard(x.date));
      let formatOutput = formatDateTimeTemp + " on " + x.breast;
      console.log("FormatTemp", formatDateTimeTemp);
      console.log("FormatOutput: ", formatOutput);

      // Unshift method appends to beg of array
      this.formattedHistoryArray.unshift(formatOutput);
    };
    console.log("FormattedHistory:", this.formattedHistoryArray);

    // For each entry extract and split the date
    for(let y of this.formattedHistoryArray){
      this.splitAndCheckDate(y, this.indexCounter);
      this.indexCounter += 1;
    }
  }

  splitAndCheckDate(entry : string, index : number){
    // Split the string using space as delimiter
    let splittedEntry = entry.split(' ');
    // Split the date: elements => 0: date, 2: time, 5: left or right breast
    let entryDate = splittedEntry[0].split('-');

    // Get todays date
    let todayYearFirst = this.ft.getToday();
    let todayMonthFirst = this.ft.getTodayMonthFirst(todayYearFirst);
    let splittedToday = todayMonthFirst.split('-');

    // Calculate the entries' date distance. Once done then store the distance
    // in reference to its index number.
    this.calculateDateDistance(entryDate, splittedToday).then((days) => {
      console.log("Days return after calculations:", days);
    });

  }

  calculateDateDistance(entryDate : any, today : any) : any {
    return new Promise(resolve => {
      // Calculate distance of each date and store into array
      let monthDistance = Math.abs(Number(entryDate[0]) - Number(today[0]));
      let dayDistance = Math.abs(Number(entryDate[1]) - Number(today[1]));
      let yearDistance = Math.abs(Number(entryDate[2]) - Number(today[2]));

      // DEBUG: checking the dates distance for correctness
      console.log("EntryDate:", entryDate);
      console.log("SplittedToday:", today);
      console.log("Found distance month:", monthDistance);
      console.log("Found distance day:", dayDistance);
      console.log("Found distance year:", yearDistance);
      //resolve(days);

      // let daysDistance = Math.abs(
      //   Math(monthDistance *) +
      // );
      resolve(true);
    });
  }

  cancelModal(){
    this.view.dismiss();
  }

}
