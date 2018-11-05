import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class EventSettingProvider {

  constructor(public http: HttpClient) {
    
  }

}
