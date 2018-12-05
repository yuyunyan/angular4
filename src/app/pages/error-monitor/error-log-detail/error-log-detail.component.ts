import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { HttpService } from './../../../_services/httpService';
import { Observable } from 'rxjs';
import { ErrorLog } from './../../../_models/errorLog';
import JSONFormatter from 'json-formatter-js';

@Component({
  selector: 'az-error-log-detail',
  templateUrl: './error-log-detail.component.html',
  styleUrls: ['./error-log-detail.component.scss']
})
export class ErrorLogDetailComponent implements OnInit{
  private errorLog : ErrorLog;
  private postDataJSON: string;
  private errorId: number;
  constructor(
    private httpService: HttpService,
    private route: ActivatedRoute) {
    
  }

  ngOnInit(){
    const _self = this;
    this.route.params.subscribe(params => {
      this.errorId = params['errorId'] ? +params['errorId']: undefined;
      if (this.errorId) {
        let url = 'api/error-logging/errorLogDetail?errorId=' + this.errorId;
        _self.httpService.Get(url).subscribe(res => {
          let errorDetail = res.json();
          _self.errorLog = _self.mapErrorLog(errorDetail);
          _self.postDataJSON = errorDetail.postData;
          if (_self.errorLog.url) {
            _self.renderPostData();
          }
        });
      }
    });
  }

  mapErrorLog(element){
    let errorlog = new ErrorLog();
    errorlog.application = element.application;
    errorlog.errorId = element.errorId;
    errorlog.errorMessage = element.errorMessage;
    errorlog.exceptionType = element.exceptionType;
    errorlog.innerExceptionMessage = element.innerExceptionMessage;
    errorlog.stackTrace = element.stackTrace;
    errorlog.timestamp = element.timestamp;
    errorlog.url = element.url;
    errorlog.user = element.user;
    return errorlog;
  }

  renderPostData(){
    const _self = this;
    if (_self.postDataJSON) {
      const formatter = new JSONFormatter(JSON.parse(_self.postDataJSON), 1, {
        theme: ''
      }, 'Post Data');
      document.getElementById('postData').appendChild(formatter.render());
    }
  }
}
