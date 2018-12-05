import { Component, OnInit, Input, Output, OnChanges, EventEmitter, SimpleChange, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { SalesOrdersService } from './../../../../_services/sales-orders.service';
import { SharedService } from './../../../../_services/shared.service';
import { SalesOrderDetails } from './../../../../_models/sales-orders/salesOrderDetails';
import { Customers } from './../../../../_models/quotes/quoteOptions';
import { Status } from './../../../../_models/shared/status';
import { CarrierList } from './../../../../_models/carrier/carrierList';
import { CarrierMethod } from './../../../../_models/shared/carrierMethod';
import { Countries } from './../../../../_models/Region/countries';
import { Contacts } from './../../../../_models/contactsAccount/contacts';
import { LocationsByAccount } from './../../../../_models/common/locationsByAccountId';
import { Subject } from 'rxjs/Subject';
import { NotificationsService } from 'angular2-notifications';
import { AccountByObjectType } from './../../../../_models/common/accountByObjectType';
import { RemoteData, CompleterService } from "ng2-completer";
import { environment } from './../../../../../environments/environment';
import { FieldPermission } from './../../../../_models/permission/FieldPermission';
import { NgxPermissionsService } from 'ngx-permissions';
import * as _ from 'lodash';
import { Loading } from './../../../_sharedComponent/loading/loading';
import { MyRequestOptions } from './../../../../_helpers/myRequestOptions';
import { Observable } from 'rxjs/Observable';
import { SapSyncNotifier } from './../../../../_utilities/sap-sync/sap-sync-notifier';
import { ContactsService } from './../../../../_services/contacts.service';


@Component({
  selector: 'az-sales-orders-details',
  templateUrl: './sales-orders-details.component.html',
  styleUrls: ['./sales-orders-details.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class SalesOrdersDetailsComponent implements OnInit, OnChanges, OnDestroy {

  @Input() soId;
  @Input() soVersionId;
  @Input() soPermissions: Array<FieldPermission>;
  @Output() detailsOutput = new EventEmitter<SalesOrderDetails>();
  public notifyOptions = {
    position: ["top", "right"],
    timeOut: 3000,
    lastOnBottom: true
  }
  @ViewChild('soForm') soFormRef: NgForm;
  public soDetails: SalesOrderDetails;
  private accountsByObjectType: AccountByObjectType[];
  private objectTypeIdForSo: number = 16;
  private status: Status[];
  private carrierId: number;
  private carriers: CarrierList[];
  private CarrierMethods: CarrierMethod[];
  private organizations: Array<any>;
  private countries: Countries[];
  private Locations: LocationsByAccount[];
  private shipLocations: LocationsByAccount[];
  private billLocation: LocationsByAccount;
  private shipAddress: LocationsByAccount;
  private contacts: Contacts[];
  private contact: Contacts;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private dataRemote: RemoteData;
  private useAccountNum;
  private shippingNotesReadOnly: boolean;
  private isDisabled: boolean = false;
  private confirmationReportUrl: string;
  private internalReportUrl: string;
  private proformaReportUrl: string;

  private projectList: Array<any>;
  private currencyList: Array<any>;
  private regionsList: Array<any>;
  private paymentTermList: Array<any>;
  private incotermList: Array<any>;
  private shippingMethodList: Array<any>;
  private freightPaymentMethodList: Array<any>;
  private deliveryRuleList: Array<any>;
  private onReadonly: boolean = true;
  private showSync: boolean = true;
  private loading: Loading;
  private busyConfig: any;
  private invalidCustomer: boolean;
  private _tempCustomerName;
  private sapSyncNotifier: SapSyncNotifier;
  private confirmationReportCssSelector = 'so-confirmation';
  private internalReportCSsSelector = 'so-internal';
  private proformaReportCSsSelector = 'so-proforma';
  private useFrightAccountSelected: boolean;

  constructor(
    private contactsService: ContactsService,
    private salesOrderService: SalesOrdersService,
    private sharedService: SharedService,
    private completerService: CompleterService,
    private _notificationsService: NotificationsService,
    private permissionsService: NgxPermissionsService) {
    this.soDetails = new SalesOrderDetails();
    this.accountsByObjectType = new Array<AccountByObjectType>();
    this.status = new Array<Status>();
    this.carriers = new Array<CarrierList>();
    this.CarrierMethods = new Array<CarrierMethod>();
    this.countries = new Array<Countries>();
    this.Locations = new Array<LocationsByAccount>();
    this.shipLocations = new Array<LocationsByAccount>();
    this.billLocation = new LocationsByAccount();
    this.shipAddress = new LocationsByAccount();
    this.contacts = new Array<Contacts>();
    this.contact = new Contacts();
    this.projectList = [];
    this.paymentTermList = [];
    this.currencyList = [];
    this.incotermList = [];
    this.shippingMethodList = [];
    this.freightPaymentMethodList = [];
    this.loading = new Loading(true);
    this.busyConfig = this.loading.busyConfig;
    this.sapSyncNotifier = new SapSyncNotifier(_notificationsService);

    this.salesOrderService.getSalesOrderObjectTypeId().takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(data => {
        this.objectTypeIdForSo = data;
      })
    let requestOptions = new MyRequestOptions();
    this.dataRemote = completerService.remote(
      null,
      "accountNameAndNum",
      "accountNameAndNum"
    );
    this.dataRemote.requestOptions(requestOptions);
    this.dataRemote.urlFormater(term => {
      return environment.apiEndPoint + '/api/accounts/getAccountsByNameNum?searchString=' + term + '&accountType=4';
    });
    this.dataRemote.dataField("accounts");
  }

  onAccountSelected($event) {
    if ($event != null) {
      this.soDetails.accountId = $event.originalObject.accountId;
      this.soDetails.contactId = null;
      this._tempCustomerName = $event.originalObject.accountNameAndNum;
      this.onCustomerChange($event.originalObject.accountId);

      this.salesOrderService.getAccountProjects(this.soDetails.accountId)
        .takeUntil(this.ngUnsubscribe.asObservable())
        .subscribe(data => {
          this.projectList = _.concat(_.map(data.contactProjectMaps, project => project),
            _.map(data.contactProjectOptions, project => project));
        });
    }
  };
  carrierSelectChange($event) {
    if ($event != null) {
      this.carrierId = $event.target.value;
      // make sure old value of carrierMethod will not be sent to saveSoDetail if carrierMetod is not selected
      this.soDetails.carrierMethodId = 0;
      this.salesOrderService.getCarrierMethods($event.target.value).subscribe(
        data => {
          this.CarrierMethods = data;
        }
      )
      //if dropdown is other; data added in c# not the table Carriers
      // check api/carrier/CarrierList for changes
      if ($event.target.value == 111) {
        this.isDisabled = true
      }
      else { this.isDisabled = false };

      if (this.useFrightAccountSelected == true) {
        this.overRideCustomerAccount();
      }
    }

  };

  freightBillingChange($event) {
    if ($event != null) {
      var freightPaymentMethodSingleObject = this.freightPaymentMethodList.find(x => x.freightPaymentMethodId == $event.target.value);
      if (freightPaymentMethodSingleObject.useAccountNum) {
          this.useFrightAccountSelected = true;
          if (this.carrierId) {
            this.overRideCustomerAccount();
          }
      }
      else {
        this.useFrightAccountSelected = false
      }
    }
  }
  customerValidation() {
    this.invalidCustomer = !this.soDetails.accountId
  };

  onCompleterBlur() {
    this.createObservable().takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(x => {
        if (this._tempCustomerName != this.soDetails.accountName) {
          this.soDetails.accountName = this._tempCustomerName;
        }
      });
  };

  createObservable(): Observable<boolean> {
    return Observable.of(true).delay(1000);
  };

  ngOnInit() {
    
  };

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    let soIdProp = changes['soId'];
    let soVersionIdProp = changes['soVersionId'];

    if (soIdProp && soIdProp.currentValue) {
      this.soId = soIdProp.currentValue;
      this.soVersionId = soVersionIdProp.currentValue;
      this.GetNonAccountIdRelateData();
    }
  };

  GetNonAccountIdRelateData() {
    this.salesOrderService.getSalesOrderDetailsData(this.objectTypeIdForSo,this.soId, this.soVersionId, 0)
      .takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(data => {
        this.soDetails = data[0];
        console.log("soDetails", this.soDetails);
        this._tempCustomerName = this.soDetails.accountName;
        this.incotermList = data[4];
        this.currencyList = data[5];
        this.shippingMethodList = data[6];
        this.paymentTermList = data[7];
        this.freightPaymentMethodList = data[8];
        this.deliveryRuleList = data[9];
        this.salesOrderService.getAccountProjects(this.soDetails.accountId)
          .takeUntil(this.ngUnsubscribe.asObservable())
          .subscribe(data => {
            this.projectList = _.concat(_.map(data.contactProjectMaps, project => project),
              _.map(data.contactProjectOptions, project => project));
          });
        this.salesOrderService.getSalesOrderObjectTypeId()
          .takeUntil(this.ngUnsubscribe.asObservable())
          .subscribe(data => {
            this.objectTypeIdForSo = data;
            this.sharedService.getAccountsByObjectType(this.objectTypeIdForSo, this.soDetails.accountId)
              .takeUntil(this.ngUnsubscribe.asObservable())
              .subscribe(data => {
                this.accountsByObjectType = data;
              });
          });
        this.status = data[2];
        this.countries = data[3];
        this.carriers = data[6];
        this.CarrierMethods = data[10];
        this.organizations = data[11];
        this.regionsList = data[12];
        this.showLocationsByAccountIdOnPageLoad(this.soDetails.accountId);
        this.showContactsByAccountIdOnPageLoad(this.soDetails.accountId);
        this.detailsOutput.emit(this.soDetails);
        //used to toggle data-field-name on on ng2-completer and allow edit (since we cannot add a datafield to that component directly)
        jQuery(".Customer-Input").attr('data-field-name', 'Customer');
        // if shipVia is 'Other' then greyed-out and ignore the option is from freightPaymentMethodList
        var freightPaymentMethodObject = this.freightPaymentMethodList.find(x => x.freightPaymentMethodId == this.soDetails.freightPaymentId);
        if (freightPaymentMethodObject != null) {
          if (freightPaymentMethodObject.useAccountNum == false) {
            this.isDisabled = true
          }
        }
        var carrierObject = this.carriers.find(x => x.carrierId == this.soDetails.carrierId);
        if (carrierObject != null) {
          if (carrierObject.carrierId == 111 && freightPaymentMethodObject.useAccountNum == false) {
            this.isDisabled = true;
          }
        }

        //Set report url
        this.setReportUrl(this.soDetails);
      });
  };
  setReportUrl(headerData) {
    //let organization = this.organizations.filter(x=> x.id == headerData.organizationId)
    let organizationHtml =  headerData.organization.organizationName
      + '<br>' + headerData.organization.houseNumber + ' ' + headerData.organization.street
      + '<br>' + headerData.organization.city + ', ' + headerData.organization.stateName + ' ' + headerData.organization.postalCode
      + (headerData.organization.officePhone? '<br>' + 'Phone - ' + headerData.organization.officePhone: '')
      + (headerData.organization.fax? '<br>' + 'Fax - ' + headerData.organization.fax: '')
      + (headerData.organization.email? '<br>' + 'Email - ' + headerData.organization.email: '');

    // console.log('ORG-THIS', organization);
    let bankHtml = headerData.organization.bank.bankName
     + '<br>' + headerData.organization.bank.branchName
     + (headerData.organization.bank.usdAccount? '<br>USD Acc: ' + headerData.organization.bank.usdAccount: '')
     + (headerData.organization.bank.eurAccount? '<br>EUR Acc: ' + headerData.organization.bank.eurAccount : '')
     + (headerData.organization.bank.swiftAccount? '<br>SWIFT: ' + headerData.organization.bank.swiftAccount : '')
     + (headerData.organization.bank.routingNumber? '<br>Routing: ' + headerData.organization.bank.routingNumber : '')

    let urlSuffix = '.html?salesOrderId=' + headerData.soId + '&versionId=' + headerData.soVersionId + '&userId=' + headerData.userId + '&organizationHtml=' + organizationHtml + '&bankHtml=' + bankHtml;
    let proformaOrgHtml = headerData.organization.organizationName
      + '<br>' + headerData.organization.houseNumber + ' ' + headerData.organization.street
      + '<br>' + headerData.organization.countryName + ' ' + headerData.organization.postalCode;
    this.confirmationReportUrl = '/ReportViewer/salesorderconfirmation' + urlSuffix;
    this.internalReportUrl = '/ReportViewer/internalsalesorder' + urlSuffix;
    this.proformaReportUrl = '/ReportViewer/proformainvoice.html?salesOrderId=' + headerData.soId + '&versionId=' + headerData.soVersionId + '&userId=' + headerData.userId + '&organizationHtml=' + proformaOrgHtml + '&bankHtml=' + bankHtml;
  }
  onCustomerChange(value) {
    this.getLocationsOnAccountIdChange(value);
    this.shipAddress = new LocationsByAccount();
    this.getContactsByAccountIdChange(value);
    this.contact = new Contacts();
    this.getIncotermAccountIdChange(value);
    this.getRegionAccountId(value);
  };

  getRegionAccountId(accountId){
    this.contactsService.getAccountDetails(accountId)
    .takeUntil(this.ngUnsubscribe.asObservable())
    .subscribe(data => {
      this.soDetails.shipFromRegionId = data.shipFromRegionId;
      this.soDetails.incotermId = data.incotermID;
    });  
  }

  onShipLocationChange(value) {
    this.shipAddress = this.shipLocations.find(x => x.locationId == +value);
  };

  onContactChange(value) {
    this.contact = this.contacts.find(x => x.contactId == value);
  };

  showLocationsByAccountIdOnPageLoad(accountId) {
    this.salesOrderService.getLocationsByAccountId(accountId).takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(
        data => {
          this.Locations = data;
          this.shipLocations = this.Locations.filter(x => x.typeId != 1);
          this.shipAddress = this.Locations.find(x => x.locationId == this.soDetails.shipLocationId);
        }
      )
    this.salesOrderService.getBillingLocation(accountId).takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(data => {
        this.billLocation = data;
      });
  };

  showContactsByAccountIdOnPageLoad(accountId) {
    this.salesOrderService.getContactsByAccountId(accountId, true).takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(
        data => {
          this.contacts = data;
          this.contact = this.contacts.find(x => x.contactId == this.soDetails.contactId);
        }
      )
  };

  getLocationsOnAccountIdChange(accountId) {
    this.salesOrderService.getLocationsByAccountId(accountId).takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(
        data => {
          this.Locations = data;
          this.shipLocations = this.Locations.filter(x => x.typeId != 1);
        }
      )
    this.salesOrderService.getBillingLocation(accountId).takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(data => {
        this.billLocation = data;
      });
  };

  getContactsByAccountIdChange(accountId) {
    this.salesOrderService.getContactsByAccountId(accountId, true).takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(
        data => {
          this.contacts = data;
        }
      )
  };

  getIncotermAccountIdChange(accountId) {
    this.sharedService.getIncotermOnAccount(accountId).takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(
        data => {
          this.soDetails.incotermId = data;
        }
      )
  };

  onSoUpdateClick() {
    const _self = this;
    this.salesOrderService.setSalesOrderDetails(this.soId, this.soVersionId, this.soDetails)
      .takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(data => {
        if (true) {
          this._notificationsService.success(
            'Good Job',
            'Successfully saved the sales order',
            {
              pauseOnHover: false,
              clickToClose: false
            }
          )
          _self.detailsOutput.emit(_self.soDetails);
        }
      });
  };

  onSubmit() {
    this.customerValidation();
    if (this.soFormRef.invalid || this.invalidCustomer) {
      this._notificationsService.warn('Please enter all required fields', null, {
        pauseOnHover: false,
        clickToClose: false
      });
      return;
    }
    this.onReadonly = true;
    this.onSoUpdateClick();
  };

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  };

  onOwnershipClick() {
    const permissions = this.permissionsService.getPermissions();
    if (!permissions['CanEditOwnership']) {
      return;
    }
    jQuery('#ownershipModal').modal('toggle');
  };

  onFormStatusChange(event: string) {
    if (event == 'edit') {
      this.onReadonly = false;
    } else if (event == 'cancel') {
      this.handleCancel()
      this.onReadonly = true;
      this.useFrightAccountSelected = false;
    } else if (event == 'sync') {
      this.onReadonly = true;
      this.syncSalesOrder();
    }
  };

  handleCancel() {
    const _self = this;
    if (_self.soVersionId && _self.soId) {
      _self.GetNonAccountIdRelateData();
    } else {
      _self.soFormRef.reset();
    }

  };

  syncSalesOrder() {
    this.busyConfig.busy = this.salesOrderService.syncSalesOrder(this.soId, this.soVersionId).takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
      data => {

        this.sapSyncNotifier.showNotification(data);
      }
    );
  };

  overRideCustomerAccount() {
    //overrides customer account value when useFrightAccountSelected is true
    this.salesOrderService.getAccountNumber(this.soDetails.accountId, this.carrierId).subscribe(data => {
      this.soDetails.freightAccount = data.accountNumber;
    })
  }

}
