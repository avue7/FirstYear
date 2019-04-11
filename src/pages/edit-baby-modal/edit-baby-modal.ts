import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'page-edit-baby-modal',
  templateUrl: 'edit-baby-modal.html',
})
export class EditBabyModalPage {
  babyInfoForm: FormGroup;
  // gender: string = "male";
  passedInBabyObject: any;

  constructor( private view: ViewController,
    private fb: FormBuilder,
    private navParams: NavParams) {

    this.getBabyObject().then( (retVal) => {
      if(retVal === true){
        console.log("EditBabyModalPage:: passed in babyObject exists");
      } else {
        console.log("EditBabyModalPage:: no passed in babyObject");
      };
    }).then(() => {
      this.createForm();
    });
  };

  getBabyObject(){
    return new Promise(resolve => {
      if((this.navParams.get("babyObject")) != undefined){
        this.passedInBabyObject = this.navParams.get("babyObject");
        resolve(true);
      } else {
        resolve(false);
      };
    });
  }

  createForm(){
    this.babyInfoForm = this.fb.group({
      firstName: [this.passedInBabyObject.firstName, Validators.compose([Validators.required])],
      lastName: [this.passedInBabyObject.lastName, Validators.compose([Validators.required])],
      birthday: [this.passedInBabyObject.birthday, Validators.compose([Validators.required])],
      gender: [this.passedInBabyObject.gender, Validators.compose([Validators.required])]
    });
  }

  setBabyInfo(){
    let data = this.babyInfoForm.value;
    console.log(data);
    this.view.dismiss(data);
  }

  cancelModal(){
    this.view.dismiss();
  }
}
