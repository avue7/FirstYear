import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DateTimePipe } from '../../pipes/date-time/date-time';


@Injectable()
export class FormattedTodayProvider {
  timeArray: any;

  constructor(private datePipe: DatePipe,
    private dateTimePipe: DateTimePipe) {

  }

  getToday() : any{
    let todayUnformatted = new Date();
    let today = this.datePipe.transform(todayUnformatted, 'yyyy-MM-dd');
    // console.log("today ", today);
    let splitToday = today.split('-');
    // console.log("FormattedToday::getToday(): today is :", splitToday);
    return splitToday;
  }

  getTodayMonthFirst(today : any) : any {
    let todayString = today[1] + "-" + today[2] + "-" + today[0];
    console.log("FormattedToday::getTodayMonthFirst(): today is:", todayString);
    return todayString;
  }

  getTodayMonthFirstWithTime() : any{
    let today = new Date();
    let todayTimeString = this.dateTimePipe.transform(today);
    // console.log("FormattedToday:getTodayMonthFirstWithTime(): today with time is:", todayTimeString);
    return todayTimeString;
  }

  formatDateTimeStandard(dateTime: any) : any{
    let splitDateTimeArray = dateTime.split(' ');
    let date = splitDateTimeArray[0];
    let timeNeedSplit = splitDateTimeArray[1];
    let am = false;
    let pm = false;

    this.timeArray = timeNeedSplit.split(':');

    // Check if am or pm
    if(this.timeArray[0] >= 12){
      pm = true;
    } else {
      am = true;
    };

    console.log("Timearray is: ", this.timeArray);
    // Set anything above 12 to match standard

    if(pm == true){
      switch(this.timeArray[0]){
        case "13": {
          this.timeArray[0] = "1";
          break;
        };
        case "14": {
          this.timeArray[0] = "2";
          break;
        };
        case "15": {
          this.timeArray[0] = "3";
          break;
        };
        case "16": {
          this.timeArray[0] = "4";
          break;
        };
        case "17": {
          this.timeArray[0] = "5";
          break;
        };
        case "18": {
          this.timeArray[0] = "6";
          break;
        };
        case "19": {
          this.timeArray[0] = "7";
          break;
        };
        case "20": {
          this.timeArray[0] = "8";
          break;
        };
        case "21": {
          this.timeArray[0] = "9";
          break;
        };
        case "22": {
          this.timeArray[0] = "10";
          break;
        };
        case "23": {
          this.timeArray[0] = "11";
          break;
        };
        case "24": {
          this.timeArray[0] = "12";
          break;
        };
        default: {
          console.log("DateTimePipe:: error cannot convert from mil to stand.");
          break;
        };
      };
     let timeString = this.timeArray[0] + ":" + this.timeArray[1] + ":" + this.timeArray[2] + " pm";
     let temp = this.getToday();
     let today = this.getTodayMonthFirst(temp);

     let dateTime: any;
     if(today = date){
       dateTime = "Today at " + timeString;
       console.log("timestring is: ", dateTime);
       return dateTime;
     } else{
       dateTime = date + " at " + timeString;
       console.log("timestring is: ", dateTime);
       return dateTime;
     };
    } else {
     let timeString = this.timeArray[0] + ":" + this.timeArray[1] + ":" + this.timeArray[2] + " am";
     let temp = this.getToday();
     let today = this.getTodayMonthFirst(temp);

     let dateTime: any;
     if(today = date){
       dateTime = "Today at " + timeString;
       console.log("timestring is: ", dateTime);
       return dateTime;
     } else{
       dateTime = date + " at " + timeString;
       console.log("timestring is: ", dateTime);
       return dateTime;
     };
    };
  }
}
