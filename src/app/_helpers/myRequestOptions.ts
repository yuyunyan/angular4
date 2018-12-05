import {Headers,RequestMethod, RequestOptions} from '@angular/http';
import {UserLogInResponse} from './../_models/userLogInResponse';

export class MyRequestOptions extends RequestOptions {
  constructor() {
      let currentUserString = localStorage.getItem('currentUser');
      let currentUser:UserLogInResponse;
      currentUser = JSON.parse(currentUserString);
      super({ 
      method: RequestMethod.Get,
      headers: new Headers({
        'Authorization': 'Bearer '+ currentUser.access_token
      })
    });
  }
}
