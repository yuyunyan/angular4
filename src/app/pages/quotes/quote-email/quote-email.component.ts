import { Component, OnInit, AfterViewInit, Input, ViewEncapsulation, } from '@angular/core';
import { default as swal } from 'sweetalert2';
import { QuoteService } from './../../../_services/quotes.service';
import { NotificationsService } from 'angular2-notifications';
import { QuoteHeader } from './../../../_models/quotes/quoteHeader';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'az-quote-email',
  templateUrl: './quote-email.component.html',
  styleUrls: ['./quote-email.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class QuoteEmailComponent implements OnInit{
  @Input() quoteHeader: QuoteHeader = new QuoteHeader();
  private subject: string = '';
  private recipient: string = '';
  private ccList: string = '';
  private bCcList: string = '';
  private message: string = '';
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  constructor(private quoteService: QuoteService, private _notificationsService: NotificationsService) { }

  ngOnInit() {
    this.clearEmailvalues()
  }

  // ngAfterViewInit(){
  //   this.enterTagOnBlurEvent();
  // }

  validated() {
    if (this.subject && this.recipient && this.message)
      return true;
    else
      return false;
  }

  sendEmail() {
    if (this.validated()) {
      jQuery('#sendQuote').modal('hide');
      swal('Sending...');
      swal.showLoading()
      this.quoteService.emailQuote(this.quoteHeader.quoteId, this.quoteHeader.versionId, this.quoteHeader.accountId, this.quoteHeader.sentDate, this.quoteHeader.salesperson? this.quoteHeader.salesperson : '', this.quoteHeader.salespersonEmail? this.quoteHeader.salespersonEmail : '', this.recipient, this.subject, this.ccList, this.bCcList, this.message).takeUntil(this.ngUnsubscribe.asObservable())
        .subscribe(data => {
          if (data) {
            swal.close()
            this.clearEmailvalues();
            this._notificationsService.success(
              'Sent!',
              'Quote email attachment sent',
              {
                pauseOnHover: false,
                clickToClose: false
              }
            );
          }

        })
    }
  }

  clearEmailvalues(){
    this.subject = '';
    this.recipient = '';
    this.message = 'Please see the attached PDF quote from Sourceability.';
    this.ccList = '';
    this.bCcList =  '';
  }

  enterTagOnBlurEvent(){
    var _self = this;
    jQuery('tags-input input').blur(function (e) {
      if (this.value) {
        var pushValue = { displayValue: this.value };
        var ngModel = this.parentElement.parentElement.getAttribute('ng-reflect-name');
        eval("_self." + ngModel + ".push(pushValue)");
        this.value = '';
      }
    });
  }
}
