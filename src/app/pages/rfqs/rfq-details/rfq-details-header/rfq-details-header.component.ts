import { Component, OnInit, Input, SimpleChange, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { RfqsService } from './../../../../_services/rfqs.service';
import { RfqDetails } from './../../../../_models/rfqs/RfqDetails';
import { Contacts } from './../../../../_models/contactsAccount/contacts';
import { Status } from './../../../../_models/shared/status';
import { SharedService } from './../../../../_services/shared.service';
import { ContactsService } from './../../../../_services/contacts.service';
import { ContactDetails } from './../../../../_models/contactsAccount/contactDetails';
import { AccountByObjectType } from './../../../../_models/common/accountByObjectType';
import { FieldPermission } from './../../../../_models/permission/FieldPermission';
import { Router } from '@angular/router';
import { Currency } from '../../../../_models/shared/currency';
import { NgxPermissionsService } from 'ngx-permissions';
import { NotificationsService } from 'angular2-notifications';
import { RemoteData, CompleterService } from "ng2-completer";
import { environment } from './../../../../../environments/environment';
import { Subject } from 'rxjs/Subject';
import swal from 'sweetalert2';

@Component({
  selector: 'az-rfq-details-header',
  templateUrl: './rfq-details-header.component.html',
  styleUrls: ['./rfq-details-header.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RfqDetailsHeaderComponent implements OnInit {

  @Input() rfqId;
  @Input() rfqPermissions: Array<FieldPermission>;
  private rfqDetails: RfqDetails;
  private selectedSupplier: AccountByObjectType;
  private accountsByObjectType: AccountByObjectType[];
  private accountContacts: Contacts[];
  private currencies: Currency[];
  private statuses: Status[];
  private contactDetails: ContactDetails;
  private onReadonly: boolean =  true;
  private objectTypeId: number;
  private objectTypeIdForRfq: number;
  private dataRemote: RemoteData;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private accountString: string;
  public notifyOptions = {
    position: ['top', 'right'],
    timeout: 3000,
    lastOnBottom: true
  };

  @Output() newRfqId = new EventEmitter<number>();
  @Output() currencyId = new EventEmitter<string>();
  @Output() documentCount = new EventEmitter<number>();
  constructor(private rfqsService: RfqsService,
    private sharedService: SharedService,
    private contactsService: ContactsService,
    private router: Router,
    private permissionsService: NgxPermissionsService,
    private completerService: CompleterService,
    private _notificationsService: NotificationsService) {
    this.rfqsService.getVendorRfqObjectTypeId().subscribe(objectTypeId => {
      this.objectTypeId = objectTypeId;
    });
    this.accountsByObjectType = new Array<AccountByObjectType>();
    
    this.dataRemote = completerService.remote(
			null,
			"accountNameAndNum",
			"accountNameAndNum"
		);
		this.dataRemote.urlFormater(term => {
			return environment.apiEndPoint + '/api/accounts/getAccountsByNameNum?searchString='+ term + '&objectTypeId=' + this.objectTypeIdForRfq 
		});
    this.dataRemote.dataField("accounts");
    
  }

  permissionsAllowed() {
    const permissions = this.permissionsService.getPermissions();
    return (permissions['CanView27'])
  }

  ngOnInit() {
    this.rfqDetails = new RfqDetails();
    this.selectedSupplier = new AccountByObjectType();
    this.contactDetails = new ContactDetails();
    if (!this.permissionsAllowed()) {
      swal({
        title: 'An error has occured',
        text: "You do not have permission to view this page.",
        type: 'error',
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false
      });
    }

  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {

    let rfqIdProp = changes['rfqId'];
    if (this.permissionsAllowed) {
      if (rfqIdProp && rfqIdProp.currentValue != 0) {
        this.rfqsService.getRfqBasicData(this.rfqId).subscribe(data => {
          let rfqDetails = data[0];
          let statuses = data[1];
          let currencies = data[2];
          this.currencyId.emit(rfqDetails.currencyId);
          this.RetrieveAccountContacts(rfqDetails.supplierId, false);
          this.rfqsService.getVendorRfqObjectTypeId().subscribe(data => {
            this.objectTypeIdForRfq = data;
            this.sharedService.getAccountsByObjectType(this.objectTypeIdForRfq, rfqDetails.supplierId).subscribe(data => {
              this.accountsByObjectType = data;
              this.rfqDetails = rfqDetails;
              this.statuses = statuses;
              this.currencies = currencies;
              this.setSelectedSupplier(rfqDetails.supplierId);
              this.accountString = this.selectedSupplier.accountName;
              this.onContactChange(rfqDetails.contactId);
            });
          });
        });
      }else if (rfqIdProp && rfqIdProp.currentValue == 0 ){
        this.onReadonly = false;
        this.rfqsService.getRfqCreationData().subscribe(
          data => {

            this.statuses = data[0];
            this.currencies = data[1];
            let rfqDetails: RfqDetails;
            rfqDetails = {
              supplierId: 0,
              contactId: 0,
              statusId: this.statuses.find(x => x.isDefault).id,
              currencyId: 'USD',
            }
            this.rfqsService.getVendorRfqObjectTypeId().subscribe(data => {
              this.objectTypeIdForRfq = data;
              this.sharedService.getAccountsByObjectType(this.objectTypeIdForRfq, rfqDetails.supplierId).subscribe(suppliers => {
                this.accountsByObjectType = suppliers;
                this.rfqDetails = rfqDetails;
                this.rfqDetails = rfqDetails;
              // this.rfqDetails.supplierId = suppliers[0].id

                this.RetrieveAccountContacts(rfqDetails.supplierId, true, true);
                this.setSelectedSupplier(rfqDetails.supplierId);
              })
            })
          }
        );

      }

    }

    //used to toggle data-field-name on on ng2-completer and allow edit (since we cannot add a datafield to that component directly)
    setTimeout(() => {
      jQuery(".Supplier-Input").attr('data-field-name', 'Supplier');
    }, 1000);
  }

  RetrieveAccountContacts(accountId, onChange, selectFirst = false) {
    this.contactsService.getAccountContacts(accountId)
      .subscribe(
      data => {
        this.accountContacts = data;
        if (onChange && !selectFirst) {
          //Sets the first contact as the contact
          this.onContactChange(data[0].contactId);
        }
      }
      )
  }

  onSupplierChange($event) {
    if ($event) {
      var supplierSelected = $event.originalObject;
      this.setSelectedSupplier(supplierSelected.accountId)
      this.onAccountVendorChange(supplierSelected.accountId);
    }
  }

  focusLost(){
      setTimeout(() => {
      this.accountString = this.selectedSupplier.accountName;
      },500);
  }

  onAccountVendorChange(supplierId: number) {
    this.rfqDetails.supplierId = supplierId;
    this.contactDetails = new ContactDetails();
    this.setSelectedSupplier(supplierId);
    this.RetrieveAccountContacts(supplierId, true);
  }

  onContactChange(contactId) {
    this.rfqDetails.contactId = contactId;
    this.sharedService.getContactBasicInfo(contactId)
      .subscribe(
      data => {
        this.contactDetails.email = data.email;
        this.contactDetails.officePhone = data.officePhone;
      }
      )
  }

  setSelectedSupplier(supplierId: number) {
    this.selectedSupplier = this.accountsByObjectType.find(x => x.accountId == supplierId);
    //this.accountString = this.selectedSupplier? this.selectedSupplier.accountName: '';  //expression changed error - (ngModel) already sets this
    this.rfqDetails.supplierId = supplierId;
  }

  onFormStatusChange(event: string) {
    if (event == 'edit') {
      this.onReadonly = false;
    }
    else if (event == 'cancel') {
      //editing existing rfq
      if (this.rfqId > 0) {
        this.onReadonly = true;
        this.rfqsService.getRfqDetails(this.rfqId)
          .takeUntil(this.ngUnsubscribe.asObservable())
          .subscribe(data => {
            this.rfqDetails = data;
            this.onAccountVendorChange(this.rfqDetails.supplierId)
            this.onContactChange(this.rfqDetails.contactId);
          });
      }

      //creating new rfq
      else
        this.router.navigate(['pages/rfqs']);
    }
    else if (event == 'save') {
      if (!this.Validated()) {
        this._notificationsService.error('Warning', "Please enter all required fields", true);
      }
      else {
        this.onReadonly = true;
        this.saveRfqDetails();
      }
    }
  }
  Validated() {
     return (this.rfqDetails.supplierId > 0 && this.accountString && this.rfqDetails.contactId > 0
     && this.rfqDetails.statusId > 0 && this.rfqDetails.currencyId.length > 0)
  }

  saveRfqDetails() {

    this.rfqsService.saveRfqDetails(this.rfqId, this.rfqDetails.supplierId, this.rfqDetails.contactId, this.rfqDetails.statusId, this.rfqDetails.currencyId).subscribe(
      rfqId => {
        this.rfqId = rfqId;
        this.newRfqId.emit(rfqId);

      },
      error => { }
    );
  }

  onOwnershipClick() {
    jQuery('#ownershipModal').modal('toggle');
  }
  documentCountChanged(e) {
    this.documentCount.emit(e);

  }
  documentsClick() {
    jQuery('#rfqDetailsDocModal .mdl-documents').modal('show');
  }
}
