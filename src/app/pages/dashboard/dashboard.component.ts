import { Component, ViewEncapsulation } from '@angular/core';
import { AppConfig } from "../../app.config";
import { DashboardService } from './dashboard.service';
import {HttpService} from './../../_services/httpService'
import { ErrorManagementService } from './../../_services/errorManagement.service';

@Component({
  selector: 'az-dashboard',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [ DashboardService, HttpService, ErrorManagementService ] 
})
export class DashboardComponent  { 
    public config:any;
    public configFn:any; 
    public bgColor:any;
    public date = new Date(); 
    public weatherData:any;
    public aa:string;

    constructor(private _appConfig:AppConfig, private _dashboardService:DashboardService, private httpService: HttpService){
        this.config = this._appConfig.config;
        this.configFn = this._appConfig;
        this.weatherData = _dashboardService.getWeatherData();

        //This is as an example of how to use the http service
        var req =  this.httpService.Get('api/data/authenticate');
        req.subscribe(
            data => {this.aa = data.text();},
            error => {this.aa = error.text()});
    }
}
