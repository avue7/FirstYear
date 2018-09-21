import { Injectable } from '@angular/core';
import { UserProvider } from '../user/user';



@Injectable()
export class BabyProvider {
  firstName: any;
  birthday: any;


  constructor(private user: UserProvider) {

  }

  setBabyFirstName(babyFirstName : any){
    this.firstName = babyFirstName;
  }

  getBabyFirstName() : any{
    return this.firstName;
  }
}
