import { Injectable } from '@angular/core';


@Injectable()
export class UserProvider {
  name: any = null;
  email: any = null;
  isLoggedIn: any = null;

  constructor() {
  }

  setUserName(name_param : any){
    this.name = name_param;
  }

  setUserEmail(email_param : any){
    this.email = email_param;
  }

  setLoggedInStatus(value : any){
    this.isLoggedIn = value;
  }

}
