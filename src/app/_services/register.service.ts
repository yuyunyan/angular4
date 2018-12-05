import {Http, Response, Headers, RequestOptions, RequestMethod} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { Injectable } from '@angular/core';
import {newUser } from './../_models/newUser';
import { RegisterResponse} from './../_models/registerResponse';
import { HttpService } from './../_services/httpService';

@Injectable()
export class RegisterServicce{
    constructor(private httpService:HttpService){}

     creatNewUser(userName:string, emailaddress:string, password:string, firstname:string, lastname:string, organizationid:number, isenabled:boolean){
        let body = {userName:userName, emailaddress:emailaddress, password:password, firstname:firstname, lastname:lastname, organizationid:organizationid, isenabled:isenabled};
        let url = 'api/user/create';
        return this.httpService.UnauthorizedPost(url,body);
    }
       
}