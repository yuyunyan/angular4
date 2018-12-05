import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'az-account-details',
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AccountDetailsComponent implements OnInit {

  constructor(private activatedRoute: ActivatedRoute) { }
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private accountId: number;

  ngOnInit() {
    this.activatedRoute.params
      .takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe((params: Params) => {
        this.accountId = +params['accountId'];
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }


}
