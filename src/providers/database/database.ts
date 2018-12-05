import { Injectable } from '@angular/core';
import { /*AlertController,*/ ModalController, AlertController } from 'ionic-angular';
import { BabyModalPage } from '../../pages/baby-modal/baby-modal';
import { BabyProvider } from '../baby/baby';
import { UserProvider } from '../user/user';
import { DatePipe } from '@angular/common';
import { ToastController } from 'ionic-angular';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import { CalculateSleepDurationProvider } from '../calculate-sleep-duration/calculate-sleep-duration';
import { MyApp } from '../../app/app.component';

// Modals
import { BottlefeedingModalPage } from '../../pages/bottlefeeding-modal/bottlefeeding-modal';
import { BreastfeedingModalPage } from '../../pages/breastfeeding-modal/breastfeeding-modal';
import { MealModalPage } from '../../pages/meal-modal/meal-modal';
import { SleepingModalPage } from '../../pages/sleeping-modal/sleeping-modal';
import { DiaperingModalPage } from '../../pages/diapering-modal/diapering-modal';
import { EditBabyModalPage } from '../../pages/edit-baby-modal/edit-baby-modal';
import { GrowthModalPage } from '../../pages/growth-modal/growth-modal';


// Testing firestore
import * as firebase from 'firebase/app';
import 'firebase/firestore';

@Injectable()
export class DatabaseProvider {
  babyAlert: any;
  babiesArray: any;

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
  growthHistoryArray: any;

  // Toast flags
  silent: boolean;

  // Modals
  bottlefeedingModal: any;
  breastfeedingModal: any;
  mealModal: any;
  sleepModal: any;
  diaperingModal: any;
  growthModal: any;

  // Subscriptions
  babySub: any;
  bfSub: any;
  bottleSub: any;
  mealSub: any;
  diaperingSub: any;
  sleepingSub: any;
  growthSub: any;


  constructor(/*private alertCtrl: AlertController,*/
    private modal: ModalController,
    private baby: BabyProvider,
    private user: UserProvider,
    private datePipe: DatePipe,
    private toastCtrl: ToastController,
    private calculateSleepDuration: CalculateSleepDurationProvider,
    private alertCtrl: AlertController,
    // private myApp: MyApp
  ){
    this.bfHistoryArray = [];
    this.bottleHistoryArray = [];
    this.diaperingHistoryArray = [];
    this.mealHistoryArray = [];
    this.sleepingHistoryArray = [];
    this.growthHistoryArray = [];

    console.log()
  }

  getCurrentUserRef(){
    let db = firebase.firestore();
    db.settings({
      timestampsInSnapshots: true
    });
    let userId = this.user.getUserId();
    let currentUserRef = db.collection('users').doc(userId);
    return currentUserRef;
  }

  getActivityReference(activity : any){
    return new Promise (resolve => {
      let db = firebase.firestore();

      db.settings({
        timestampsInSnapshots: true
      });

      // let firstName = this.baby.getBabyFirstName();
      // console.log("firstName is ", this.babyName);

      let activityRef: any;
      let userId = this.user.getUserId();
      let babyName = this.baby.getBabyFirstName();
      // console.log("userId", userId, "babyname", this.babyName, activity);
      if(userId == null || babyName == undefined){
        console.log("Database:: Cannot get activity ref yet (userId, babyName)", userId, babyName);
        if(babyName == undefined){

        }
      } else {
        resolve(activityRef = db.collection('activities').where("activity", "==", activity).where("userId", "==", userId).where("babyFirstName", "==", babyName));
      };
    });
  }

  getCurrentBabyRef(){
    let db = firebase.firestore();
    db.settings({
      timestampsInSnapshots: true
    });
    let babyFirstName = this.baby.getBabyFirstName();
    let userId = this.user.getUserId();
    let currentBabyRef = db.collection('babies').where("userId", "==", userId);
    return currentBabyRef;
  }

  setNewUser(user : any){
    return new Promise (async resolve => {
      let currentUserRef = await this.getCurrentUserRef();

      let userObject = {
        userName: user.displayName,
        email: user.email,
        id: user.uid
      };

      // CHeck if user exists
      this.checkIfUserExists(currentUserRef).then( async retVal => {
        if(retVal == true){
          resolve();
        } else {
          await currentUserRef.set(userObject);
          resolve();
        };
      });
    });
  }

  createNewBaby(){
    return new Promise(resolve => {
      this.openModal().then((baby) => {
        let babyObject = baby;
        if (babyObject == undefined){
          this.noBabyYet = true;
          resolve("later");
        } else {
          let db = firebase.firestore();

          db.settings({
            timestampsInSnapshots: true
          });

          // Get current user id
          let currentUserId = this.user.getUserId();

          let entry = {
            firstName: babyObject.firstName,
            lastName: babyObject.lastName,
            birthday: babyObject.birthday,
            gender: babyObject.gender,
            userId: currentUserId,
            current: false
          }

          db.collection('babies').doc().set(entry);
          this.baby.setBabyObject(babyObject);
          this.noBabyYet = false;
          resolve("true");
        };
      });
    });
  }

  checkIfUserExists(currentUserRef: any){
    return new Promise(resolve => {
      currentUserRef.get().then((docSnapShot) => {
        if(docSnapShot.exists){
          resolve(true);
        } else {
          resolve(false);
        };
      });
    });
  }

  checkIfBabyExists(){
    return new Promise(resolve => {
      let db = firebase.firestore();
      let userId = this.user.getUserId();
      db.collection('babies').where("userId", "==", userId).get().then((docSnapShot) => {
        if(!docSnapShot.empty){
          resolve(true);
        } else {
          resolve(false);
        };
      });
    });
  }

  openModal(flag?: boolean) : any{
    return new Promise(resolve => {
      if(flag){
        this.myModal = this.modal.create(BabyModalPage, {'flag': flag});
      } else {
        this.myModal = this.modal.create(BabyModalPage);
      };
      this.myModal.present();
      resolve(this.waitForModalReturn("baby"));
    });
  }

  createBreastFeedingHistoryObservable(breastFeedRef: any){
    return new Promise(resolve => {
      this.bfSub = breastFeedRef.orderBy("dateTime", "asc").onSnapshot((snapShot) => {
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

  createBottleFeedingHistoryObservable(bottleFeedRef: any){
    return new Promise(resolve => {
      this.bottleSub = bottleFeedRef.orderBy("dateTime", "asc").onSnapshot((snapShot) => {
        // console.log("4. snapshot is:", snapShot)
        if(snapShot.exists == false){
          // console.log("Snapshot not exists truth is", snapShot.exists);
          resolve(false);
        }
        // } else {
        //snapShot.docChanges().forEach((change) => {
          this.bottleHistoryArray.splice(0, this.bottleHistoryArray.length);
          snapShot.forEach((doc/*, index, array*/) => {
            let data = doc.data();
            this.bottleHistoryArray.push(data);
            resolve(true);
          });
        // };
      });
    });
  }

  // THis method is called in apps.ts
  async createMealHistoryObservable(mealRef: any){
    return new Promise(resolve => {
      this.mealSub = mealRef.orderBy("dateTime", "asc").onSnapshot((snapShot) => {
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
      }, error => {
        console.log(error);
        resolve(false);
      });
    });
  }

  createDiaperingHistoryObservable(diaperingRef: any){
    return new Promise(resolve => {
      this.diaperingSub = diaperingRef.orderBy("dateTime", "asc").onSnapshot((snapShot) => {
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

  createSleepHistoryObservable(sleepingRef){
    return new Promise(resolve => {
      this.sleepingSub = sleepingRef.orderBy("dateTime", "asc").onSnapshot((snapShot) => {
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

  createGrowthObservable(growthRef){
    return new Promise(resolve => {
      this.growthSub = growthRef.orderBy("dateTime", "asc").onSnapshot((snapShot) => {
        if(snapShot.empty){
          resolve(false);
        };

        console.log("Growth history exists")
        this.growthHistoryArray.splice(0, this.growthHistoryArray.length);
        snapShot.forEach(doc => {
          let data = doc.data();
          this.growthHistoryArray.push(data);
          console.log("Growth array", this.growthHistoryArray);
          resolve(true);
        });
      });
    });
  }

  calculateAge(){
    return new Promise (async resolve => {
      let todayUnformatted = new Date();
      let today = this.datePipe.transform(todayUnformatted, 'yyyy-MM-dd');
      // console.log("today ", today);
      let splitToday = today.split('-');

      let babyBirthday = this.baby.getBabyBirthday();

      let splitBirthday = babyBirthday.split('-');
      // console.log("split birthday", splitBirthday);

      // Calculate the year, month, day by taking the difference
      this.bdayYear = await Math.abs(Number(splitToday[0]) - Number(splitBirthday[0]));
      // console.log("Year difference:", this.bdayYear);
      this.bdayMonth = await Math.abs(Number(splitToday[1]) - Number(splitBirthday[1]));
      // console.log("Month difference:", this.bdayMonth);
      // let day = Number(splitToday[2]) - Number(splitBirthday[2]);
      // console.log("Year difference:", day);
      resolve(true);
    });
  }

  async editEvent(event: any){
    return new Promise( async resolve => {
      let activityRef: any;
      await this.getActivityReference(event.activity).then((_activityRef) => {
        activityRef = _activityRef;
      })

      // Must query first, then get doc ref to delete.
      await activityRef.where("dateTime", "==", event.dateTime).get().then(querySnapshot => {
        querySnapshot.forEach(async (doc) => {
          let object = doc.data();
          console.log("event activity is", event.activity)
          if(event.activity == "bottlefeeding"){
            await this.editBottle(object, event).then(() => {
              resolve();
            });
          } else if(event.activity == "meal"){
            await this.editMeal(object, event).then(() => {
              resolve();
            });
          } else if(event.activity == "breastfeeding"){
            await this.editBreast(object, event).then(() => {
              resolve();
            });
          } else if(event.activity == "sleeping"){
            await this.editSleep(object, event).then(() => {
              resolve();
            });
          } else if(event.activity == "diapering"){
            await this.editDiapering(object, event).then(() => {
              resolve();
            });
          } else if(event.activity == "growth"){
            await this.editGrowth(object, event).then(() => {
              resolve();
            });
          };
        });
      });
    });
  }

  editGrowth(object: any, event: any){
    return new Promise(resolve => {
      this.openActivityModal(object, "growth").then(async (growth) => {
        if(growth == undefined){
          resolve();
        } else {
          let dateTempSplit = growth.date.split('-');
          let date = dateTempSplit[1] + '-' + dateTempSplit[2] + '-' + dateTempSplit[0];
          let time: any;
          time = growth.time;
          let dateTime = date + " " + time;

          await delete growth.date;
          await delete growth.time;
          growth.activity = "growth";
          growth.dateTime = dateTime;
          growth.time = time;

          let editFlag: boolean = true;
          await this.deleteEvent(event, editFlag);

          this.saveBabyActivity("growth", growth).then((retVal) => {
            if(retVal = true){
              console.log("Edited diapering saved successfully");
            } else {
              console.log("Edited diapering was not saved succesfully. Something happend");
            };
            resolve();
          });
        }
      })
    })
  }

  editBreast(object: any, event: any){
    return new Promise(resolve => {
      this.openActivityModal(object, "breastfeeding").then( async(breastFeeding) => {
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

          delete breastFeeding.date;
          delete breastFeeding.duration;
          breastFeeding.activity = "breastfeeding";
          breastFeeding.dateTime = dateTime;
          breastFeeding.duration = totalDuration;

          let editFlag: boolean = true;

          // Delete old object first then update (save another one)
          await this.deleteEvent(event, editFlag);

          // Call method to store into Database
          this.saveBabyActivity('breastfeeding', breastFeeding).then((retVal) => {
          if(retVal = true){
            console.log("Edited breastFeeding saved successfully");
          } else {
            console.log("Edited breaastFeeding was not saved succesfully. Something happend");
          };
            resolve();
          });
        };
      });
    });
  }

  editBottle(object: any, event: any){
    return new Promise(resolve => {
      this.openActivityModal(object, "bottlefeeding").then( async(bottleFeeding) => {
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

          delete bottleFeeding.date;
          delete bottleFeeding.duration;
          bottleFeeding.activity = "bottlefeeding";
          bottleFeeding.dateTime = dateTime;
          bottleFeeding.duration = totalDuration;

          let editFlag: boolean = true;
          await this.deleteEvent(event, editFlag);

          this.saveBabyActivity('bottlefeeding', bottleFeeding).then((retVal) => {
            if(retVal = true){
              console.log("Edited bottleFeeding saved successfully");
            } else {
              console.log("Edited bottleFeeding was not saved succesfully. Something happend");
            };
            resolve();
          });
        };
      });
    });
  }

  editMeal(object: any, event: any){
    return new Promise(resolve => {
      this.openActivityModal(object, "meal").then( async(meal) => {
        if(meal == undefined){
          console.log("Database:: editMeal(): user canceled modal");
        } else {
          // // Extract only the date
          let dateTempSplit = meal.date.split('-');
          let date = dateTempSplit[1] + '-' + dateTempSplit[2] + '-' + dateTempSplit[0];
          let time: any;
          time = meal.time;
          let dateTime = date + " " + time;

          delete meal.date;
          meal.activity = "meal";
          meal.dateTime = dateTime;

          let editFlag: boolean = true;
          await this.deleteEvent(event, editFlag);

          this.saveBabyActivity("meal", meal).then((retVal) => {
            if(retVal){
              console.log("Database:: editMeal(): succesfully saved:", meal);
            } else {
              console.log("Database:: editMeal(): cannot save activity:", meal);
            };
            resolve();
          });
        };
      });
    });
  }

  editDiapering(object: any, event: any){
    return new Promise(resolve => {
      this.openActivityModal(object, "diapering").then(async (diapering) => {
        if(diapering == undefined){
          console.log("Database:: editDiapering(): user canceled modal");
          resolve();
        } else {
          let dateTempSplit = diapering.date.split('-');
          let date = dateTempSplit[1] + '-' + dateTempSplit[2] + '-' + dateTempSplit[0];
          let time: any;
          time = diapering.time;
          let dateTime = date + " " + time;

          // Delete the date property
          await delete diapering.date;

          // Add new property to object
          diapering.activity = "diapering";
          diapering.dateTime = dateTime;

          let editFlag: boolean = true;
          await this.deleteEvent(event, editFlag);

          this.saveBabyActivity("diapering", diapering).then((retVal) => {
            if(retVal = true){
              console.log("Edited diapering saved successfully");
            } else {
              console.log("Edited diapering was not saved succesfully. Something happend");
            };
            resolve();
          });
        }
      })
    });
  }

  editSleep(object: any, event: any){
    return new Promise(resolve => {
      this.openActivityModal(object, "sleeping").then( async(sleeping) => {
        if(sleeping == undefined){
          console.log("Database:: editSleep(): user canceled modal");
          resolve();
        } else {
          let splitDateEnd = sleeping.dateEnd.split('-');
          let newDateEnd = splitDateEnd[1] + "-" + splitDateEnd[2] + "-" + splitDateEnd[0];
          // String up date and time and call the method to standardize the time
          let dateTime = sleeping.date + " " + sleeping.timeStart;

          // let sleepDurationString: any;
          //
          // await this.calculateSleepDuration.calculateDuration(sleeping).then((duration) => {
          //   sleepDurationString = duration;
          // });

          await delete sleeping.date;
          await delete sleeping.dateEnd;
          sleeping.activity = "sleeping";
          sleeping.dateTime = dateTime;
          sleeping.dateEnd = newDateEnd;
          sleeping.time = sleeping.timeStart;
          await delete sleeping.timeStart;


          // NOTE: WQORKING ON THIS NEED TO GET THE DATE TIME TO BE CORRECT FORMAT

          // sleeping.duration = sleepDurationString;

          let editFlag: boolean = true;
          await this.deleteEvent(event, editFlag);

          this.saveBabyActivity("sleeping", sleeping).then((retVal) => {
            if(retVal = true){
              console.log("Edited sleeping saved successfully");
            } else {
              console.log("Edited sleeping was not saved succesfully. Something happend");
            };
            resolve();
          });
        }
      });
    });
  }

  async deleteEvent(event: any, editFlag?: boolean){
    let activityRef: any;
    await this.getActivityReference(event.activity).then( async(_activityRef) => {
      activityRef = _activityRef;
    })

    // Must query first, then get doc ref to delete.
    await activityRef.where("dateTime", "==", event.dateTime).get().then(querySnapshot => {
      querySnapshot.forEach((doc) => {
        doc.ref.delete().then(() => {
          if(editFlag){
            return;
          } else {
            this.deleteToast(event.activity);
          };
        }).catch((error) => {
          console.log("Database:: deleteEvent(): Error removing document", error);
        });
      })
    });
  }

  editBabyProfile(){
    return new Promise(async resolve => {
      console.log("Editing baby profile");
      let babyFirstName = this.baby.getBabyFirstName();

      let currentBabyRef = await this.getCurrentBabyRef();
      let babyObject = await this.baby.getBabyObject();

      this.openEditBabyModal(babyObject).then(async editedBabyObject => {
        console.log("editedBabyObject", editedBabyObject)
        if(editedBabyObject == undefined){
          return;
        } else {
          await currentBabyRef.where('firstName', '==', babyFirstName).get().then(async querySnapshot => {
            querySnapshot.forEach(async doc => {
              doc.ref.update(editedBabyObject);

              // If first name is changed then we need to change it for
              // all activities.
              if(babyFirstName != editedBabyObject.firstName){
                await this.updateFirstNameInActivities(babyFirstName, editedBabyObject.firstName);
              };

              await this.baby.setBabyObject(editedBabyObject);
              resolve(this.calculateAge());
            });
          });
        };
      });
    });
  }

  async switchBaby(){
    console.log("Switching baby");
    let firstName = this.baby.getBabyFirstName();
    await this.moreThanOneBabyAlert(this.babiesArray, firstName).then(async (babyFirstName) => {
      console.log(babyFirstName)
      if(babyFirstName == null){
        console.log("cancel is pressed")
        return;
      } else {
        for(let baby of this.babiesArray){
          if(baby.firstName == babyFirstName){
            let babyObject = baby;
            await this.setCurrentBabyFlag(babyFirstName);
            await this.resetNotCurrentBabyFlag(babyFirstName);
            await this.baby.resetBabyObject();
            await this.baby.setBabyObject(babyObject);
            await this.calculateAge();
            // await this.myApp.setYearMonth(this.bdayYear, this.bdayMonth);
          }
        };
      };
    });
  }

  async setCurrentBabyFlag(babyFirstName: any){
    let currentBabyRef = await this.getCurrentBabyRef();
    currentBabyRef.where("firstName", "==", babyFirstName).get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        doc.ref.update({
          current: true
        });
      });
    });
  }

  async resetNotCurrentBabyFlag(babyFirstName: any){
    let currentBabyRef = await this.getCurrentBabyRef();
    currentBabyRef.get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        if(doc.data().firstName != babyFirstName){
          doc.ref.update({
            current: false
          });
        };
      });
    });
  }

  setBabiesArray(babies: any){
    this.babiesArray = [];
    this.babiesArray = babies;
  }

  openEditBabyModal(babyObject: any) : any{
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

  updateFirstNameInActivities(originalFirstName: any, newFirstName: any){
    let db = firebase.firestore();

    db.settings({
      timestampsInSnapshots: true
    });

    let userId = this.user.getUserId();

    let activityRef = db.collection('activities').where('userId', '==', userId).where('babyFirstName', '==', originalFirstName);

    activityRef.get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        doc.ref.update({
          babyFirstName: newFirstName
        });
      });
    })
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

      let db = firebase.firestore();
      db.settings({
        timestampsInSnapshots: true
      });

      let babyFirstName = this.baby.getBabyFirstName();
      let userId = this.user.getUserId();

      // Add new userId to activity object
      object.userId = userId;

      // Add baby FirstName to activity object
      object.babyFirstName = babyFirstName;

      db.collection('activities').doc().set(object).then((error) => {
        if(error){
          // console.log("Could not be saved");
          this.failureToast();
          resolve(false);
        } else {
          // console.log("Successfully saved");
          this.successToast(activity);
          resolve(true);
        }
      });
    });
  }

  /////////// NOTE: HELPER METHODS GOES HERE ////////////
  openActivityModal(object_: any, activity: any) : any {
    return new Promise(resolve => {
      if(activity == "breastfeeding"){
        this.breastfeedingModal = this.modal.create(BreastfeedingModalPage, {object: object_});
        this.breastfeedingModal.present();
        resolve(this.waitForModalReturn("breastfeeding"));
      } else if(activity == "bottlefeeding"){
        this.bottlefeedingModal = this.modal.create(BottlefeedingModalPage, {object: object_});
        this.bottlefeedingModal.present();
        resolve(this.waitForModalReturn("bottlefeeding"));
      } else if(activity == "meal"){
        this.mealModal = this.modal.create(MealModalPage, {object: object_});
        this.mealModal.present();
        resolve(this.waitForModalReturn("meal"));
      } else if(activity == "diapering"){
        this.diaperingModal = this.modal.create(DiaperingModalPage, {object: object_});
        this.diaperingModal.present();
        resolve(this.waitForModalReturn("diapering"));
      } else if(activity == "sleeping"){
        this.sleepModal = this.modal.create(SleepingModalPage, {object: object_});
        this.sleepModal.present();
        resolve(this.waitForModalReturn("sleeping"));
      } else if(activity == "growth"){
        this.growthModal = this.modal.create(GrowthModalPage, {object: object_});
        this.growthModal.present();
        resolve(this.waitForModalReturn("growth"));
      }
    });
  }

  waitForModalReturn(activity: any) : any{
    return new Promise(resolve => {
      let activityObject: any;
      if(activity == "baby"){
        this.myModal.onDidDismiss( data => {
          let babyObject = data;
          resolve(babyObject);
        });
      } else if(activity == "breastfeeding"){
        this.breastfeedingModal.onDidDismiss( data => {
          activityObject = data;
          resolve(activityObject);
        });
      } else if(activity == "bottlefeeding"){
        this.bottlefeedingModal.onDidDismiss( data => {
          activityObject = data;
          resolve(activityObject);
        });
      } else if(activity == "meal"){
        this.mealModal.onDidDismiss( data => {
          activityObject = data;
          resolve(activityObject);
        });
      } else if(activity == "diapering"){
        this.diaperingModal.onDidDismiss(data => {
          activityObject = data;
          resolve(activityObject);
        });
      } else if(activity == "sleeping"){
        this.sleepModal.onDidDismiss( data => {
          activityObject = data;
          resolve(activityObject);
        });
      } else if(activity == "growth"){
        this.growthModal.onDidDismiss(data => {
          activityObject = data;
          resolve(activityObject);
        });
      } else {
        console.log("No wait for modal returned for activity <", activity, "< yet!!!");
      };
    });
  }

  successToast(activity? : any){
    let babyFirstName = this.baby.getBabyFirstName();

    let toast = this.toastCtrl.create({
      message: babyFirstName + '\'s ' + activity + ' activity was successfully saved.',
      duration: 4000,
      position: 'bottom'
    });

    toast.onDidDismiss(() => {
      console.log("Database::presentToaast(): toast was dismissed");
    });

    toast.present();
  }

  deleteToast(activity: any){
    let babyFirstName = this.baby.getBabyFirstName();

    let toast = this.toastCtrl.create({
      message: babyFirstName + '\'s ' + activity + " activity was deleted successfully.",
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

  addZeroToTime(time : any) : any{
    if(time < 10){
      time = "0" + time;
    };
    return time;
  }

  removeSubs(){
    this.babySub.unsubscribe();
    this.bfSub.unsubscribe();
    this.bottleSub.unsubscribe();
    this.mealSub.unsubscribe();
    this.sleepingSub.unsubscribe();
    this.diaperingSub.unsubscribe();
    console.log("Successfully removed all subs");
  }

  addNewBaby(){
    let flag: boolean = true;
    this.openModal(flag).then(async (baby) => {
      let babyObject = baby;
      if (babyObject == undefined){
        return;
      } else {
        let db = firebase.firestore();

        db.settings({
          timestampsInSnapshots: true
        });

        // Get current user id
        let currentUserId = this.user.getUserId();

        let entry = {
          firstName: babyObject.firstName,
          lastName: babyObject.lastName,
          birthday: babyObject.birthday,
          gender: babyObject.gender,
          userId: currentUserId,
          current: false
        }

        await db.collection('babies').doc().set(entry);
        //await this.baby.setBabyObject(babyObject);
        return;
      };
    });
  }

  async moreThanOneBabyAlert(babiesArray: any, currentBabyFirstName){
    return new Promise(resolve => {
      console.log("babies are", babiesArray);

      let options: any = {
        title: 'Which baby to track?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Save',
            handler: data => {
              console.log(data);
            }
          }
        ]
      };

      options.inputs = [];

      for(let baby of babiesArray){
        let select: boolean = false;
        if(baby.firstName == currentBabyFirstName){
          select = true;
        }
        options.inputs.push({
          type: 'radio',
          label: baby.firstName,
          value: baby.firstName,
          checked: select
        })
      };

      this.babyAlert = this.alertCtrl.create(options);
      this.babyAlert.present();

      resolve(this.waitForAlertReturn());
    });
  }

  waitForAlertReturn() : any{
    return new Promise(resolve => {
      this.babyAlert.onDidDismiss(data => {
        if(data != undefined){
          let baby = data;
          console.log("baby choosen is", baby);
          resolve(baby);
        } else {
          let baby = null;
          resolve(baby);
        };
      }, (error) =>{
        console.log("Alert on dismiss error:", error);
      });
    })
  }
}
