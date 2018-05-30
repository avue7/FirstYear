import { Injectable } from '@angular/core';


@Injectable()
export class UserProvider {
  name: any = null;
  email: any = null;
  picture: any = null;

  constructor() {
  }

  setUserName(name_param : any){
    this.name = name_param;
  }

  setUserEmail(email_param : any){
    this.email = email_param;
  }

  // This is a url to the photo
  setUserPicture(picture_param: any){
    this.picture = picture_param;
  }

}
