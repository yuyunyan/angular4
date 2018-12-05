import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import swal from 'sweetalert2';
import { Location } from '@angular/common';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class ErrorManagementService {
  private dbErrorSubject = new Subject<any>();

  constructor(private location: Location) {
  }

  handleApiError(e): Observable<any>{
    if (e.statusText == DB_ERROR) {
      swal({
        title: DB_ERROR,
        text: e._body,
        type: 'error',
        showCancelButton: true,
        allowOutsideClick: false
      }).then((value) => {
        this.dbErrorSubject.next();
      }, (dismiss) => {
        this.dbErrorSubject.next(true);
      });
    } else if (e.status == 500 || e.statusText == BAD_REQUEST ||  e.statusText ==  API_ERROR){
      swal({
        title: API_ERROR,
        text: e._body,
        type: 'error'
      });
    } else {
      swal({
        title: CLIENT_ERROR,
        text: "Error occured in the client. Please reload the application.",
        type: 'error',
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false
      });
    }
    return Observable.throw(new Error());
  }

  getApiError(): Observable<any>{
    return this.dbErrorSubject.asObservable();
  }
}

export const DB_ERROR = "Db Error";
export const BAD_REQUEST = "Bad Request";
export const API_ERROR = 'Api Error';
export const CLIENT_ERROR = 'Client Error';
