import {Component,OnInit, Attribute} from '@angular/core';
import { UsersService } from './../../../_services/users.service';
import {Timezones} from './../../../_models/common/timezones';

@Component({
  selector: 'timezone',
  template: `
      <h6 (updateTime)="updateMyTime()">{{date}}</h6>
    `
})
export class Timezone implements OnInit {
   private date;
   private format;
   public Timezones = new Array<Timezones>();
   public timezoneList = [];
   
  constructor(
      private UsersService : UsersService,
  ) {
    this.date =  new Date().getTime();

    
    setInterval(() => {
        this.date =  new Date();
     }, 1000);
    }

    ngOnInit(){
    }


} 


