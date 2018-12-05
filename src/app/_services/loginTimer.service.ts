import {Injectable, Injector} from '@angular/core';
import {Idle, DEFAULT_INTERRUPTSOURCES} from '@ng-idle/core';
import { Router } from '@angular/router';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class LoginTimerService{

    idleStateSubject = new Subject<string>();
    
    constructor(private idle: Idle, private injector: Injector){
    }

    setIdelStateString(value: string){
        this.idleStateSubject.next(value);
    }

    getIdelStateString(){
        return this.idleStateSubject.asObservable()
    }

    startLoginTimer(){
        //Set user as idle if no activity for 2 hours
        this.idle.setIdle(7200);
        // After xx seconds of inactivity, the user will be considered timed out.
        this.idle.setTimeout(30);
        // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
        this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);
    
        this.idle.onIdleEnd.subscribe(() => this.setIdelStateString(''));
        this.idle.onTimeout.subscribe(() => {
        this.setIdelStateString('You\'ve been logged out!');
          localStorage.setItem('shouldReload', 'true');
          const router = this.injector.get(Router);
          router.navigate(['/login'], { queryParams: { returnUrl: router.url }});
        });
        this.idle.onIdleStart.subscribe(() => this.setIdelStateString('You\'ve gone idle!'));
        this.idle.onTimeoutWarning.subscribe((countdown) =>this.setIdelStateString('You will log out in ' + countdown + ' seconds!'));
    
        if(!window.location.pathname.includes("login")){
            this.resetTimer();
        }
            
    }

    resetTimer(){
        this.idle.watch();
      }

}
