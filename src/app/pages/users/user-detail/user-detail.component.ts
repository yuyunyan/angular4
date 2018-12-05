import { Component, ViewEncapsulation } from '@angular/core';
import { UsersService } from './../../../_services/users.service';
import { ActivatedRoute, Params } from '@angular/router';
import { NotificationsService } from 'angular2-notifications';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'az-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UserDetailComponent {
  
  private errorMessage: string;
  private userId: number;
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  private notifyOptions = {
    position: ["top", "right"],
    timeOut: 3000,
    lastOnBottom: true
  };

  constructor(
    private usersService: UsersService,
    private activatedRoute: ActivatedRoute,
    private _notificationsService: NotificationsService) {
    this.activatedRoute.params
      .takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe((params: Params) => {
        this.userId = params['userId'];  
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
