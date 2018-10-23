import { Injectable } from '@angular/core';
import { /*AlertController,*/ ModalController } from 'ionic-angular';
import { BabyModalPage } from '../../pages/baby-modal/baby-modal';
import { BabyProvider } from '../baby/baby';
import { UserProvider } from '../user/user';
import { DatePipe } from '@angular/common';
import { ToastController } from 'ionic-angular';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';

// Testing firestore
import firebase from 'firebase';
import 'firebase/firestore';

@Injectable()
export class DatabaseProvider {
  myModal: any;
  babyName: any;
  babyBirthday: any;
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
            snapShot.docChanges().forEach((change) => {
              let baby = change.doc.data();
              this.babyName = baby.firstName;
              this.babyBirthday = baby.birthday;
              resolve(this.calculateAge());
              // console.log("Database::createBabyObservable: babyFirstname:", this.babyName);
              // console.log("Database::createBabyObservable: babyBirthday:", this.babyBirthday);
            });
          });
        });
      };
    });
  }

  createBreastFeedingHistoryObservable(userId: any){
    return new Promise(resolve => {
      this.getActivityReference('breastfeeding').then((breastFeedRef) => {
        breastFeedRef.get().then((query) => {
          let collectionExists: any;
          if(query.size == 0){
            collectionExists = 0;
          } else {
            collectionExists = 1;
          };

          if (collectionExists == 1){
            breastFeedRef.onSnapshot((snapShot) => {
              this.bfHistoryArray.splice(0, this.bfHistoryArray.length);
              snapShot.forEach(doc => {
                let data = doc.data();
                this.bfHistoryArray.push(data);
                resolve(true);
              });
            });
          } else {
            console.log("Database::createBreastFeedingHistoryObservable(): no history yet");
            resolve(false);
          };
        });
      }, error => {
        console.log("Database::createBreastFeedingHistoryObservable(): no history yet");
        resolve(false);
      });
    });
  }

  createBottleFeedingHistoryObservable(userId: any, bottleFeedRef: any){
    return new Promise(resolve => {
      //this.getActivityReference('bottlefeeding').then((bottleFeedRef) => {
      //   console.log("1....database:: getActivityReferencer returned");
      //   bottleFeedRef.get().then((query) => {
      //     console.log("2....database:: query size is", query.size);
      //     let collectionExists: any;
      //     if(query.size == 0){
      //       collectionExists = 0;
      //     } else {
      //       collectionExists = 1;
      //       console.log("3. This should run")
      //     };
      //
      //     if (collectionExists == 1){
            // console.log("4. collectionExists is:", collectionExists)
            bottleFeedRef.onSnapshot((snapShot) => {
              console.log("4. snapshot is:", snapShot)
              //snapShot.docChanges().forEach((change) => {
              this.bottleHistoryArray.splice(0, this.bottleHistoryArray.length);
              snapShot.forEach((doc, index, array) => {
                let data = doc.data();
                this.bottleHistoryArray.push(data);
                console.log("5. Database: bottleHistoryArray:", this.bottleHistoryArray);
                resolve(true);
              });
            });
      //     } else {
      //       console.log("Database::createBottleFeedingHistoryObservable(): no history yet");
      //       resolve(false);
      //     };
      //   });
      // }, error => {
      //   console.log("Database::createBottleFeedingHistoryObservable(): no history yet");
      //   resolve(false);
      });
    // });
  }

  // THis method is called in apps.ts
  createMealHistoryObservable(userId: any, mealRef: any){
    return new Promise(resolve => {
      // this.getActivityReference('meal').then((mealRef) => {
      //   mealRef.get().then((query) => {
      //     let collectionExists: any;
      //     if(query.size == 0){
      //       collectionExists = 0;
      //     } else {
      //       collectionExists = 1;
      //     };
      //
      //     if (collectionExists == 1){
            mealRef.onSnapshot((snapShot) => {
              //snapShot.docChanges().forEach((change) => {
              this.mealHistoryArray.splice(0, this.mealHistoryArray.length);
              snapShot.forEach(doc => {
                let data = doc.data();
                this.mealHistoryArray.push(data);
                // console.log("Database: mealHistoryArray:", this.mealHistoryArray);
                resolve(true);
              });
            });
      //     } else {
      //       console.log("Database::createMealHistoryObservable(): no history yet");
      //       resolve(false);
      //     };
      //   });
      // }, error => {
      //   console.log("Database::createBottleFeedingHistoryObservable(): no history yet");
      //   resolve(false);
      // });
    });
  }

  createDiaperingHistoryObservable(userId: any){
    return new Promise(resolve => {
      this.getActivityReference('diapering').then((diaperingRef) => {
        diaperingRef.get().then((query) => {
          let collectionExists: any;
          if(query.size == 0){
            collectionExists = 0;
          } else {
            collectionExists = 1;
          };

          if (collectionExists == 1){
            diaperingRef.onSnapshot((snapShot) => {
              //snapShot.docChanges().forEach((change) => {
              this.diaperingHistoryArray.splice(0, this.diaperingHistoryArray.length);
              snapShot.forEach(doc => {
                let data = doc.data();
                this.diaperingHistoryArray.push(data);
                // console.log("Database: mealHistoryArray:", this.mealHistoryArray);
                resolve(true);
              });
            });
          } else {
            console.log("Database::createDiaperingHistoryObservable(): no history yet");
            resolve(false);
          };
        });
      }, error => {
        console.log("Database::createDiaperingHistoryObservable(): no history yet");
        resolve(false);
      });
    });
  }

  createSleepHistoryObservable(userId: any){
    return new Promise(resolve => {
      this.getActivityReference('sleeping').then((sleepingRef) => {
        sleepingRef.get().then((query) => {
          let collectionExists: any;
          if(query.size == 0){
            collectionExists = 0;
          } else {
            collectionExists = 1;
          };

          if (collectionExists == 1){
            sleepingRef.onSnapshot((snapShot) => {
              //snapShot.docChanges().forEach((change) => {
              this.sleepingHistoryArray.splice(0, this.sleepingHistoryArray.length);
              snapShot.forEach(doc => {
                let data = doc.data();
                this.sleepingHistoryArray.push(data);
                // console.log("Database: mealHistoryArray:", this.mealHistoryArray);
                resolve(true);
              });
            });
          } else {
            console.log("Database::createSleepingHistoryObservable(): no history yet");
            resolve(false);
          };
        });
      }, error => {
        console.log("Database::createSleepingFeedingHistoryObservable(): no history yet");
        resolve(false);
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
      resolve(activityRef = db.collection('users').doc(this.user.id).collection('babies').doc(this.babyName)
      .collection(activity));
      // resolve(activityRef);
    });
  }

  getAllActivity(){

  }

  saveBabyActivity(activity : any, object : any){
    return new Promise (resolve => {
      console.log("Database::saveBabyActivity(): activity is", activity);
      console.log("Database::saveBabyActivity(): object is", object);

      // Convert date back to YYYY/MM/DD
      let splitDateTime = object.date.split(' ');
      let dateArray = splitDateTime[0].split('-');
      let newDate = dateArray[2] + '-' + dateArray[0] + '-' + dateArray[1];
      object.date = newDate + ' ' + splitDateTime[1];

      let babyReference = this.getBabyReference();
      babyReference.collection(activity).doc(object.date).set(object);

      // Check if saved was Successful
      babyReference.collection(activity).doc(object.date).get().then((doc) => {
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

  failureToast(){
    let toast = this.toastCtrl.create({
      message: 'Error. Somthing happened. This event was not saved succesfully.',
      duration: 4000,
      position: 'bottom'
    });

    toast.present();
  }
}
