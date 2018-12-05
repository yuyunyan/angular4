import { Http, RequestOptions,Headers, RequestMethod, Response } from '@angular/http';
import { MyRequestOptions } from './../_helpers/myRequestOptions';
import {Injectable, Inject, Injector} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/catch';
import { environment } from './../../environments/environment';
import { Router } from '@angular/router';
import { ErrorManagementService } from './errorManagement.service';

@Injectable()
export class HttpService{

private apiUrl:string;

    constructor(
        private http: Http,
        private injector: Injector,
        private errorManagementService: ErrorManagementService) {
        this.apiUrl = environment.apiEndPoint; 
    }

    private get router(): Router{
        return this.injector.get(Router);
    }

    Get(url:string, headers?: Headers): Observable<Response>
    {
        let requestOptions = new MyRequestOptions();
        
        if(headers != null)
        {
            for (var index = 0; index < headers.keys.length; index++) {
                
                var key = headers.keys[index];
                requestOptions.headers.append(key, headers[key]);
            } 
        }
        let endPoint = this.getFullUrl(url);

        return this.http.get(endPoint, requestOptions)
        .catch(this.catchError.bind(this));
        
    }

    Post(url:string, body: {}): Observable<Response>
    {
        let requestOptions = new MyRequestOptions();
        requestOptions.headers.append( 'Content-Type','application/json');
        requestOptions.method = RequestMethod.Post;
        let bodyToSend = JSON.stringify(body);
        let endPoint = this.getFullUrl(url);
        return this.http.post(endPoint, bodyToSend, requestOptions).map(
            res=>{
                if(res.status < 200 || res.status >= 300) {
                    throw new Error('This request has failed ' + res.status);
            } 
                return res;
            }
           
        ).catch(this.catchError.bind(this));
    }

    PostImage(url:string, body:any): Observable<Response>
    {
        let requestOptions = new MyRequestOptions();
        //requestOptions.headers.append( 'Content-Type','application/json');
        requestOptions.method = RequestMethod.Post;
        let endPoint = this.getFullUrl(url);
        return this.http.post(endPoint, body, requestOptions).map(
            res=>{
                if(res.status < 200 || res.status >= 300) {
                    throw new Error('This request has failed ' + res.status);
            } 
                return res;
            }
           
        ).catch(this.catchError.bind(this));
    }

    UnauthorizedPost(url:string, body: {}): Observable<Response>
    {
        let headers = new Headers({ 'Content-Type': 'application/json'});
        let options = new RequestOptions( {method: RequestMethod.Post, headers: headers });
        let bodyToSend = JSON.stringify(body);
        let endPoint = this.getFullUrl(url);
        return this.http.post(endPoint, bodyToSend, options).map(
            res=>{
                if(res.status < 200 || res.status >= 300) {
                    throw new Error('This request has failed ' + res.status);
            } 
                return res;
            }
           
        ).catch(e => {
            return  Observable.throw('Error Occured');
        });
    }

    getFullUrl(url:string)
    {
        return this.apiUrl +'/' + url;
    }


    catchError(e: Response): Observable<Response>{
        if (e.status == 401){
            this.router.navigate(['login'], { queryParams: { returnUrl: this.router.url }})
            return Observable.empty();
        } else {
            return this.errorManagementService.handleApiError(e);
        }
    }
}

