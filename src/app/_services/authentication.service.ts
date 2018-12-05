import {Http, Response, Headers, RequestOptions, RequestMethod} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { Injectable } from '@angular/core';
import { User } from './../_models/user';
import { UserLogInResponse } from './../_models/userLogInResponse';
import { environment } from './../../environments/environment';

@Injectable()
export class AuthenticationService{
	constructor(
		private http: Http){
	}

	private userKey = 'currentUser';

	login(userName: string, password: string){

		let apiUrl = environment.apiEndPoint; 
		let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'});
		let options = new RequestOptions( {method: RequestMethod.Post, headers: headers });
		let body = 'username='+userName+'&password='+password+'&grant_type=password';
		return this.http.post(apiUrl + '/token', body, options)
			.map((response: Response) => {
				let apiResponse: UserLogInResponse;
				apiResponse = response.json();
				let isSuccess = apiResponse.access_token.length > 0 ? true:false;
				if(isSuccess){
					localStorage.setItem(this.userKey, JSON.stringify(apiResponse));
				}
				return { success: isSuccess };
		});
	}

	logout(){
		localStorage.removeItem(this.userKey);
		localStorage.removeItem('BuyerId');
	}
}