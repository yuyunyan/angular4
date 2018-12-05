import { Component, ViewEncapsulation } from '@angular/core';
import {LoginTimerService} from './../app/_services/loginTimer.service';
import { Observable } from 'rxjs/Observable'

@Component({
   selector: 'az-root',
   encapsulation: ViewEncapsulation.None,
   template:`
   <p class="idleStateClass"><span [ngClass]="(idleState | async)?.toUpperCase().includes('LOGGED OUT') ? 'black-text': 'white-text'"><strong>{{idleState | async}}</strong></span></p>
   
  <router-outlet></router-outlet>`,
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
 
  private idleState: Observable<string>;

  constructor(private timer: LoginTimerService) {
    this.idleState = this.timer.getIdelStateString();
    this.timer.startLoginTimer();
  }

}

