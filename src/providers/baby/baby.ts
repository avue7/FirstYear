import { Injectable } from '@angular/core';
import { UserProvider } from '../user/user';
// import { NativeStorage } from '@ionic-native/native-storage';


@Injectable()
export class BabyProvider {
  firstName: any;
  lastName: any;
  birthday: any;
  gender: any;


  constructor(private user: UserProvider,
    // private nativeStorage: NativeStorage
  ) {

  }

  // SETTERS
  setBabyObject(babyObject : any){
    this.firstName = babyObject.firstName;
    this.lastName = babyObject.lastName;
    this.birthday = babyObject.birthday;
    this.gender = babyObject.gender;
  }

  setBabyFirstName(babyFirstName : any){
    this.firstName = babyFirstName;
  }

  // GETTERS
  getBabyFirstName() : any{
    return this.firstName;
  }

  getBabyBirthday(){
    return this.birthday;
  }

  getBabyObject(){
    let babyObject = {
      firstName: this.firstName,
      lastName: this.lastName,
      birthday: this.birthday,
      gender: this.gender
    };

    return babyObject;
  }

  removeBabyRef(){
    // this.nativeStorage.clear();
  }
}
