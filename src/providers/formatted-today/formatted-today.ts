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

  // getDateFromUnformat(rawDateTime : any) : any {
  //   let date = this.datePipe.transform(rawDateTime, 'yyyy-MM-dd');
  //   let splitDate = date.split('-');
  //   return(this.getDateMonthFirst(splitDate));
  // }

  getTodayMonthFirst(date : any) : any {
    let dateString = date[1] + "-" + date[2] + "-" + date[0];
    //console.log("FormattedToday::getDateMonthFirst(): date is:", dateString);
    return dateString;
  }

  getTodayMonthFirstWithTime() : any{
    let today = new Date();
    let todayTimeString = this.dateTimePipe.transform(today);
    // console.log("FormattedToday:getTodayMonthFirstWithTime(): today with time is:", todayTimeString);
    return todayTimeString;
  }

  getDateFromDateTime(dateTime : any) : any {
    let splitDateTime = dateTime.split(' ');
    return splitDateTime[0];
  }

  formatDateTimeStandard(dateTime: any) : any{
    let splitDateTimeArray = dateTime.split(' ');
    let date = splitDateTimeArray[0];
    let timeNeedSplit = splitDateTimeArray[1];
    let am = false;
    let pm = false;

    let timeArray = timeNeedSplit.split(':');

    let number = Number(timeArray[0]);
    // Check if am or pm
    if(number >= 12){
      pm = true;
      // console.log("PM IS TRUE");
    } else {
      am = true;
      // console.log("AM IS TRUE");
    };

    if(pm == true){
      timeArray[0] = this.convertToStandardTime(timeArray);

      let timeString = timeArray[0] + ":" + timeArray[1] + ":" + timeArray[2] + " pm";
      let temp = this.getToday();
      let today = this.getTodayMonthFirst(temp);

      let dateTime: any;
      if(today == date){
        dateTime = "Today at " + timeString;
        //console.log("timestring is: ", dateTime);
        return dateTime;
      } else{
        dateTime = date + " at " + timeString;
        //console.log("timestring is: ", dateTime);
        return dateTime;
      };
    } else { //Time is in AM
      if (timeArray[0] == '00'){
        timeArray[0] = this.convertToStandardTime(timeArray);
      };

      let timeString = timeArray[0] + ":" + timeArray[1] + ":" + timeArray[2] + " am";
      let temp = this.getToday();
      let today = this.getTodayMonthFirst(temp);

      let dateTime: any;
      //console.log("FormattedToday::formatDateTimeStandard(): today is:", today, "date retrieved is:", date);
      if(today == date){
        dateTime = "Today at " + timeString;
        // console.log("timestring is: ", dateTime);
        return dateTime;
      } else{
        dateTime = date + " at " + timeString;
        // console.log("timestring is: ", dateTime);
        return dateTime;
      };
    };
  }

  convertToStandardTime(timeArray : any) : any {
    switch(timeArray[0]){
      case "13": {
        timeArray[0] = "01";
        break;
      };
      case "14": {
        timeArray[0] = "02";
        break;
      };
      case "15": {
        timeArray[0] = "03";
        break;
      };
      case "16": {
        timeArray[0] = "04";
        break;
      };
      case "17": {
        timeArray[0] = "05";
        break;
      };
      case "18": {
        timeArray[0] = "06";
        break;
      };
      case "19": {
        timeArray[0] = "07";
        break;
      };
      case "20": {
        timeArray[0] = "08";
        break;
      };
      case "21": {
        timeArray[0] = "09";
        break;
      };
      case "22": {
        timeArray[0] = "10";
        break;
      };
      case "23": {
        timeArray[0] = "11";
        break;
      };
      case "24": {
        timeArray[0] = "12";
        break;
      };
      case "00": {
        timeArray[0] = "12";
        break;
      }
      default: {
        console.log("DateTimePipe:: error cannot convert from mil to stand.");
        break;
      };
    };
    return timeArray[0];
  }
}
