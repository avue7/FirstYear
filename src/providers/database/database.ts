import { Injectable } from '@angular/core';
import { /*AlertController,*/ ModalController } from 'ionic-angular';
import { BabyModalPage } from '../../pages/baby-modal/baby-modal';
import { BabyProvider } from '../baby/baby';
import { UserProvider } from '../user/user';
import { DatePipe } from '@angular/common';
import { ToastController } from 'ionic-angular';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';

// Modals
import { BottlefeedingModalPage } from '../../pages/bottlefeeding-modal/bottlefeeding-modal';
import { BreastfeedingModalPage } from '../../pages/breastfeeding-modal/breastfeeding-modal';
import { MealModalPage } from '../../pages/meal-modal/meal-modal';


// Testing firestore
import firebase from 'firebase';
import 'firebase/firestore';

@Injectable()
export class DatabaseProvider {
  myModal: any;
  babyName: any;
  babyLastName: any;
  babyBirthday: any;
  babyGender: any;
  bdayYear: any;
  bdayMonth: any;
  noBabyYet: boolean;
  noBfHistoryYet: boolean;
  noBottleHistoryYet: boolean;
  noDiaperingHistoryYet: boolean;
  noMealHistoryYet: boolean;
  noSleepingHistoryYet: boolean;

  //bfHistoryObservable: new Observable();
  bfHistoryArray: any;
  bottleHistoryArray: any;
  diaperingHistoryArray: any;
  mealHistoryArray: any;
  sleepingHistoryArray: any;

  // Toast flags
  silent: boolean;

  // Modals
  bottlefeedingModal: any;
  breastfeedingModal: any;
  mealModal: any;


  constructor(/*private alertCtrl: AlertController,*/
    private modal: ModalController,
    private baby: BabyProvider,
    private user: UserProvider,
    private datePipe: DatePipe,
    private toastCtrl: ToastController) {
    this.bfHistoryArray = [];
    this.bottleHistoryArray = [];
    this.diaperingHistoryArray = [];
    this.mealHistoryArray = [];
    this.sleepingHistoryArray = [];
  }

  setNewUserNewBaby(userId : any, babyObject?: any){
    return new Promise (resolve => {
      let db = firebase.firestore();

      db.settings({
        timestampsInSnapshots: true
      });

      let currentUserRef = db.collection('users').doc(userId).collection('babies');

      // First check if user exists
      this.checkIfBabyExists(currentUserRef).then((retVal) => {
        if(retVal == "true"){
          // console.log("Database:: user already exists in the users collection.");
          this.noBabyYet = false;
          resolve("true");
        } else if(retVal == "later"){
          // console.log("Database:: user decides to do baby info later");
          resolve("later");
        } else {
          // console.log("Database:: Successfully created new user in users collection.");
          resolve("false");
        }
      });
    });
  }

  checkIfBabyExists(currentUserRef : any, babyObject?: any){
    return new Promise(resolve => {
      currentUserRef.get().then((docSnapShot) => {
        if (!docSnapShot.empty){
          console.log("Database::checkIfBabyExists(): baby doc(s) exists.")
          this.noBabyYet = false;
          resolve("true");
        } else {
          console.log("Database::checkIfBabyExists: no baby doc(s) exists.")
          this.openModal().then((baby) => {
            let babyObject = baby;
            if (babyObject == undefined){
              this.noBabyYet = true;
              resolve("later");
            } else {
              currentUserRef.doc(babyObject.firstName).set(babyObject);
              this.noBabyYet = false;
              resolve("false");
            };
          });
        };
      });
    });
  }

  openModal() : any{
    return new Promise(resolve => {
      this.myModal = this.modal.create(BabyModalPage);
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

  createBabyObservable(userId: any){
    return new Promise(resolve => {
      if(this.noBabyYet == true){
        console.log("Database::createBabyObservable(): noBabyYet is set to:", this.noBabyYet);
        resolve(false);
      } else {
        this.getUserReference().then((currentUserRef) => {
          currentUserRef.onSnapshot((snapShot) => {
            snapShot.forEach((doc) => {
              let baby = doc.data();
              this.babyName = baby.firstName;
              this.babyBirthday = baby.birthday;
              this.babyLastName = baby.lastName;
              this.babyGender = baby.gender;
              resolve(this.calculateAge());
              // console.log("Database::createBabyObservable: babyFirstname:", this.babyName);
              // console.log("Database::createBabyObservable: babyBirthday:", this.babyBirthday);
            });
          });
        });
      };
    });
  }

  getBabyObject(){
    return new Promise(resolve => {
      let babyObject = {
        firstName: this.babyName,
        lastName: this.babyLastName,
        birthday: this.babyBirthday,
        gender: this.babyGender
      };
      resolve(babyObject);
    });
  }

  createBreastFeedingHistoryObservable(userId: any, breastFeedRef: any){
    return new Promise(resolve => {
      breastFeedRef.onSnapshot((snapShot) => {
        if(snapShot.empty){
          resolve(false);
        }
        this.bfHistoryArray.splice(0, this.bfHistoryArray.length);
        snapShot.forEach(doc => {
          let data = doc.data();
          this.bfHistoryArray.push(data);
          resolve(true);
        });
      });
    });
  }

  createBottleFeedingHistoryObservable(userId: any, bottleFeedRef: any){
    return new Promise(resolve => {
      bottleFeedRef.onSnapshot((snapShot) => {
        // console.log("4. snapshot is:", snapShot)
        if(snapShot.empty){
          resolve(false);
        }
        //snapShot.docChanges().forEach((change) => {
        this.bottleHistoryArray.splice(0, this.bottleHistoryArray.length);
        snapShot.forEach((doc, index, array) => {
          let data = doc.data();
          this.bottleHistoryArray.push(data);
            resolve(true);
          });
        });
    });
  }

  // THis method is called in apps.ts
  async createMealHistoryObservable(userId: any, mealRef: any){
    return new Promise(resolve => {
      mealRef.onSnapshot((snapShot) => {
        // console.log("4. meal snapshot is:", snapShot)
        if(snapShot.empty){
          // console.log("4.b snapshot is empty");
          resolve(false);
        }
        this.mealHistoryArray.splice(0, this.mealHistoryArray.length);
        snapShot.forEach(doc => {
          let data = doc.data();
          this.mealHistoryArray.push(data);
          resolve(true);
        });
      });
    });
  }

  createDiaperingHistoryObservable(userId: any, diaperingRef: any){
    return new Promise(resolve => {
      diaperingRef.onSnapshot((snapShot) => {
        if(snapShot.empty){
          resolve(false);
        }
        //snapShot.docChanges().forEach((change) => {
        this.diaperingHistoryArray.splice(0, this.diaperingHistoryArray.length);
        snapShot.forEach(doc => {
          let data = doc.data();
          this.diaperingHistoryArray.push(data);
          // console.log("Database: mealHistoryArray:", this.mealHistoryArray);
          resolve(true);
        });
      });
    });
  }

  createSleepHistoryObservable(userId: any, sleepingRef){
    return new Promise(resolve => {
      sleepingRef.onSnapshot((snapShot) => {
        if(snapShot.empty){
          resolve(false);
        }
        //snapShot.docChanges().forEach((change) => {
        this.sleepingHistoryArray.splice(0, this.sleepingHistoryArray.length);
        snapShot.forEach(doc => {
          let data = doc.data();
          this.sleepingHistoryArray.push(data);
          // console.log("Database: mealHistoryArray:", this.mealHistoryArray);
          resolve(true);
        });
      });
    });
  }

  calculateAge(){
    return new Promise (resolve => {
      let todayUnformatted = new Date();
      let today = this.datePipe.transform(todayUnformatted, 'yyyy-MM-dd');
      // console.log("today ", today);
      let splitToday = today.split('-');
      // console.log("split today", splitToday);
      let splitBirthday = this.babyBirthday.split('-');
      // console.log("split birthday", splitBirthday);

      // Calculate the year, month, day by taking the difference
      this.bdayYear = Math.abs(Number(splitToday[0]) - Number(splitBirthday[0]));
      // console.log("Year difference:", this.bdayYear);
      this.bdayMonth = Math.abs(Number(splitToday[1]) - Number(splitBirthday[1]));
      // console.log("Month difference:", this.bdayMonth);
      // let day = Number(splitToday[2]) - Number(splitBirthday[2]);
      // console.log("Year difference:", day);
      resolve(true);
    });
  }

  getUserReference() : any {
    return new Promise (resolve => {
      let db = firebase.firestore();

      db.settings({
        timestampsInSnapshots: true
      });

      let currentUserRef = db.collection('users').doc(this.user.id).collection('babies');
      resolve(currentUserRef);
    });
  }

  getBabyReference() : any{
    let db = firebase.firestore();

    db.settings({
      timestampsInSnapshots: true
    });

    // let firstName = this.baby.getBabyFirstName();
    // console.log("firstName is ", this.babyName);

    let babyRef = db.collection('users').doc(this.user.id).collection('babies').doc(this.babyName);
    return babyRef;
  }

  getActivityReference(activity : any) : any {
    return new Promise (resolve => {
      let db = firebase.firestore();

      db.settings({
        timestampsInSnapshots: true
      });

      // let firstName = this.baby.getBabyFirstName();
      // console.log("firstName is ", this.babyName);

      let activityRef: any;
      let userId = this.user.getUserId();
      // console.log("userId", userId, "babyname", this.babyName, activity);
      if(userId == null || this.babyName == undefined){
        console.log("Database:: Cannot get activity ref yet");
      } else {
        resolve(activityRef = db.collection('users').doc(userId).collection('babies').doc(this.babyName)
        .collection(activity));
      };
    });
  }

  async editEvent(event: any){
    return new Promise( async resolve => {
      let activityRef: any;
      await this.getActivityReference(event.activity).then((_activityRef) => {
        activityRef = _activityRef;
      }).then( async() => {
        if(activityRef.doc(event.dateTime)){
          activityRef.doc(event.dateTime).get().then(async(doc) => {
            let object = doc.data();
            console.log("Data for doc is", object);
            // Note: bottlefeeding
            if(event.activity == "bottlefeeding"){
              await this.editBottle(object, event).then(() => {
                resolve();
              });
            } else if(event.activity == "meal"){
              await this.editMeal(object, event).then(() => {
                resolve();
              })
            } else if(event.activity == "breastfeeding"){
              await this.editBreast(object, event).then(() => {
                resolve();
              });
            } else if(event.activity == "sleeping"){

            };
          })
        };
      });
    });
  }

  editMeal(object: any, event: any){
    return new Promise(resolve => {
      this.openMealModal(object).then( async(meal) => {
        if(meal == undefined){
          console.log("Database:: editMeal(): user canceled modal");
        } else {
          // // Extract only the date
          let dateTempSplit = meal.date.split('-');
          let date = dateTempSplit[1] + '-' + dateTempSplit[2] + '-' + dateTempSplit[0];
          let time: any;
          time = meal.time;
          let dateTime = date + " " + time;

          if(meal.note){
            object = {
              activity: 'meal',
              dateTime: dateTime,
              time: meal.time,
              note: meal.note
            }
          } else {
            object = {
              activity: 'meal',
              dateTime: dateTime,
              time: meal.time
            }
          };

          await this.deleteEvent(event);
          
          this.saveBabyActivity("meal", object).then((retVal) => {
            if(retVal){
              console.log("Database:: editMeal(): succesfully saved:", object);
            } else {
              console.log("Database:: editMeal(): cannot save activity:", object);
            };
            resolve();
          });
        };
      });
    });
  }

  openMealModal(object_: any) : any {
    return new Promise(resolve =>{
      this.mealModal = this.modal.create(MealModalPage, {object: object_});
      this.mealModal.present();
      resolve(this.waitForMealReturn());
    })
  }

  waitForMealReturn() : any{
    return new Promise(resolve => {
      this.mealModal.onDidDismiss( data => {
        let babyObject = data;
        resolve(babyObject);
      });
    });
  }

  editBreast(object: any, event: any){
    return new Promise(resolve => {
      this.openBfModal(object).then( async(breastFeeding) => {
        if(breastFeeding == undefined){
          console.log("Database::editBreast(): user canceled modal");
        } else {
          let totalDuration: any;
          // Take care of duration if it is a number or moment
          if(typeof breastFeeding.duration == "number"){
            totalDuration = breastFeeding.duration;
          } else {
            let durationTemp = breastFeeding.duration;
            let splitDurationArray = durationTemp.split(':');
            splitDurationArray[1] = Number(splitDurationArray[1]);
            splitDurationArray[2] = Number(splitDurationArray[2]);
            // This will be the value of time (duration for database)
            totalDuration = (splitDurationArray[1] * 60) + (splitDurationArray[2]);
          };
          // // Extract only the date
          let dateTempSplit = breastFeeding.date.split('-');
          let date = dateTempSplit[1] + '-' + dateTempSplit[2] + '-' + dateTempSplit[0];
          let time: any;
          time = breastFeeding.time;
          let dateTime = date + " " + time;

          let manualObject = {};

          if(breastFeeding.note){
            manualObject = {
              activity: 'breastfeeding',
              breast: breastFeeding.breast,
              dateTime: dateTime,
              time: time,
              duration: totalDuration,
              note: breastFeeding.note
            }
          } else {
            manualObject = {
              activity: 'breastfeeding',
              breast: breastFeeding.breast,
              dateTime: dateTime,
              time: time,
              duration: totalDuration,
            }
          };

          // Delete old object first then update (save another one)
          await this.deleteEvent(event);

          // Call method to store into Database
          this.saveBabyActivity('breastfeeding', manualObject).then((retVal) => {
          if(retVal = true){
            console.log("Edited breastFeeding saved successfully");
          } else {
            console.log("Edited breaastFeeding was not saved succesfully. Something happend");
          };
            //this.getLastBottleFeed();
            resolve();
          });
        };
      });
    });
  }

  openBfModal(object_: any) : any {
    return new Promise(resolve =>{
      this.breastfeedingModal = this.modal.create(BreastfeedingModalPage, {object: object_});
      this.breastfeedingModal.present();
      resolve(this.waitForBreastReturn());
    })
  }

  waitForBreastReturn() : any{
    return new Promise(resolve => {
      this.breastfeedingModal.onDidDismiss( data => {
        let babyObject = data;
        resolve(babyObject);
      });
    });
  }

  editBottle(object: any, event: any){
    return new Promise(resolve => {
      this.openBottleModal(object).then( async(bottleFeeding) => {
        if (bottleFeeding == undefined){
          console.log("Database:: editBottle(): user canceled modal");
        } else {
          let totalDuration: any;
          // Take care of duration if it is a number or moment
          if(typeof bottleFeeding.duration == "number"){
            totalDuration = bottleFeeding.duration;
          } else {
            let durationTemp = bottleFeeding.duration;
            let splitDurationArray = durationTemp.split(':');
            splitDurationArray[1] = Number(splitDurationArray[1]);
            splitDurationArray[2] = Number(splitDurationArray[2]);
            // This will be the value of time (duration for database)
            totalDuration = (splitDurationArray[1] * 60) + (splitDurationArray[2]);
          };
          let dateTempSplit = bottleFeeding.date.split('-');
          let date = dateTempSplit[1] + '-' + dateTempSplit[2] + '-' + dateTempSplit[0];
          let time: any;
          // if(bottleFeeding.edit){
          time = bottleFeeding.time;
          let dateTime = date + " " + time;

          if(bottleFeeding.volume == undefined){
            bottleFeeding.volume = 6;
          };

          let manualObject = {};

          if(bottleFeeding.note){
            manualObject = {
              activity: 'bottlefeeding',
              type: bottleFeeding.type,
              dateTime: dateTime,
              volume: bottleFeeding.volume,
              time: time,
              duration: totalDuration,
              unit: bottleFeeding.unit,
              note: bottleFeeding.note
            }
          } else {
            manualObject = {
              activity: 'bottlefeeding',
              type: bottleFeeding.type,
              dateTime: dateTime,
              volume: bottleFeeding.volume,
              time: time,
              duration: totalDuration,
              unit: bottleFeeding.unit
            }
          };

          // Delete old object first then update (save another one)
          await this.deleteEvent(event);

          // Call method to store into Database
          this.saveBabyActivity('bottlefeeding', manualObject).then((retVal) => {
          if(retVal = true){
            console.log("Edited bottleFeeding saved successfully");
          } else {
            console.log("Edited bottleFeeding was not saved succesfully. Something happend");
          };
            //this.getLastBottleFeed();
            resolve();
          });
        };
      });
    });
  }

  addZeroToTime(time : any) : any{
    if(time < 10){
      time = "0" + time;
    };
    return time;
  }

  openBottleModal(object_: any) : any {
    return new Promise(resolve =>{
      this.bottlefeedingModal = this.modal.create(BottlefeedingModalPage, {object: object_});
      this.bottlefeedingModal.present();
      resolve(this.waitForBottleReturn());
    })
  }

  waitForBottleReturn() : any{
    return new Promise(resolve => {
      this.bottlefeedingModal.onDidDismiss( data => {
        let babyObject = data;
        resolve(babyObject);
      });
    });
  }

  async deleteEvent(event: any){
    let activityRef: any;
    await this.getActivityReference(event.activity).then( async(_activityRef) => {
      activityRef = _activityRef;
    }).then( () => {
      if(activityRef.doc(event.dateTime)){
        console.log("Yes it exists..deleting");
        activityRef.doc(event.dateTime).delete().then(() => {
          this.deleteToast(event.activity);
        }).catch((error) => {
          console.log("Database:: deleteEvent(): Error removing document", error);
        });
      }
    });


  }

  saveBabyActivity(activity : any, object : any){
    return new Promise (resolve => {
      console.log("Database::saveBabyActivity(): activity is", activity);
      console.log("Database::saveBabyActivity(): object is", object);

      // Convert date back to YYYY/MM/DD
      let splitDateTime = object.dateTime.split(' ');
      let dateArray = splitDateTime[0].split('-');
      let newDate = dateArray[2] + '-' + dateArray[0] + '-' + dateArray[1];
      object.dateTime = newDate + ' ' + splitDateTime[1];

      let babyReference = this.getBabyReference();
      babyReference.collection(activity).doc(object.dateTime).set(object);

      // Check if saved was Successful
      babyReference.collection(activity).doc(object.dateTime).get().then((doc) => {
        if (doc.exists){
          this.successToast(activity);
          console.log("Database::saveBabyActivity(): doc was successfully saved to database");
          resolve(true);
        } else {
          this.failureToast();
          console.log("Database::saveBabyActivity(): doc was not successfully saved.");
          resolve(false);
        };
      });
    });
  }

  successToast(activity? : any){
    let toast = this.toastCtrl.create({
      message: this.babyName + '\'s ' + activity + ' activity was successfully saved.',
      duration: 4000,
      position: 'bottom'
    });

    toast.onDidDismiss(() => {
      console.log("Database::presentToaast(): toast was dismissed");
    });

    toast.present();
  }

  deleteToast(activity: any){
    let toast = this.toastCtrl.create({
      message: this.babyName + '\'s ' + activity + " activity was deleted successfully.",
      duration: 3000,
      position: 'bottom'
    });

    toast.onDidDismiss(() => {
      console.log("Database::deleteToast(): toast was dismissed");
    });

    toast.present();
  }

  failureToast(){
    let toast = this.toastCtrl.create({
      message: 'Error. Somthing happened. This event was not saved succesfully.',
      duration: 4000,
      position: 'bottom'
    });

    toast.present();
  }
}
