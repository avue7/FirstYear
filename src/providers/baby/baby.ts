import { Injectable } from '@angular/core';
import { UserProvider } from '../user/user';
// import { NativeStorage } from '@ionic-native/native-storage';


@Injectable()
export class BabyProvider {
  firstName: any;
  birthday: any;


  constructor(private user: UserProvider,
    // private nativeStorage: NativeStorage
  ) {
  }

  setBabyRef(babyRef: any, userId: any){
    // this.nativeStorage.setItem(userId, {babyRef: babyRef});
  }

  setBabyFirstName(babyFirstName : any){
    this.firstName = babyFirstName;
  }

  getBabyFirstName() : any{
    return this.firstName;
  }

  async getBabyRef(userId: any){
    // return new Promise(async(resolve) => {
    //   // await this.nativeStorage.getItem(userId).then((babyRef) => {
    //     let ref = babyRef.babyRef;
    //     resolve(ref);
    //   });
    // });
  }

  removeBabyRef(){
    // this.nativeStorage.clear();
  }
}
