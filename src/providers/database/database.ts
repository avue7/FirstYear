import { Injectable } from '@angular/core';
import { /*AlertController,*/ ModalController } from 'ionic-angular';
import { BabyModalPage } from '../../pages/baby-modal/baby-modal';
import { BabyProvider } from '../baby/baby';
import { UserProvider } from '../user/user';
import { DatePipe } from '@angular/common';
import { ToastController } from 'ionic-angular';

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

  constructor(/*private alertCtrl: AlertController,*/
    private modal: ModalController,
    private baby: BabyProvider,
    private user: UserProvider,
    private datePipe: DatePipe,
    private toastCtrl: ToastController) {

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
        if(retVal == true){
          console.log("Database:: user already exists in the users collection.");
          this.noBabyYet = false;
          resolve(false);
        } else if(retVal == "later"){
          console.log("Database:: user decides to do baby info later");
          resolve("later");
        } else {
          console.log("Database:: Successfully created new user in users collection.");
          resolve(true);
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
          resolve(true);
        } else {
          console.log("Database::checkIfBabyExists: no baby doc(s) exists.")
          this.openModal().then((baby) => {
            let babyObject = baby;
            if (babyObject == undefined){
              resolve("later");
              this.noBabyYet = true;
            } else {
              currentUserRef.doc(babyObject.firstName).set(babyObject);
              this.noBabyYet = false;
              resolve(false);
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
              console.log("Database::createBabyObservable: babyFirstname:", this.babyName);
              console.log("Database::createBabyObservable: babyBirthday:", this.babyBirthday);
            });
          });
        });
      };
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
      console.log("Year difference:", this.bdayYear);
      this.bdayMonth = Math.abs(Number(splitToday[1]) - Number(splitBirthday[1]));
      console.log("Month difference:", this.bdayMonth);
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

  saveBabyActivity(activity : any, object : any){
    console.log("Database::saveBabyActivity(): activity is", activity);
    console.log("Database::saveBabyActivity(): object is", object);

    let babyReference = this.getBabyReference();
    babyReference.collection(activity).doc(object.date).set(object);

    // Check if saved was Successful
    babyReference.collection(activity).doc(object.date).get().then((doc) => {
      if (doc.exists){
        this.successToast(activity);
        console.log("Database::saveBabyActivity(): doc was successfully saved to database");
      } else {
        this.failureToast();
        console.log("Database::saveBabyActivity(): doc was not successfully saved.");
      };
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
