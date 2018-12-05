import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter, SimpleChanges,OnChanges } from '@angular/core';
import { PurchaseOrder } from './../../../../_models/purchase-orders/purchaseOrder';
import { SalesOrdersService } from './../../../../_services/sales-orders.service';
import { PurchaseOrdersService } from './../../../../_services/purchase-orders.service';
import { ContactsService } from './../../../../_services/contacts.service';
import { NotificationsService } from 'angular2-notifications';
import { Subject } from 'rxjs/Subject';
import { Contacts } from './../../../../_models/contactsAccount/contacts';
import { PaymentTerm } from './../../../../_models/shared/paymentTerm';
import { Currency } from './../../../../_models/shared/currency';
import { LocationService } from './../../../../_services/locations.service';
import { Locations } from './../../../../_models/contactsAccount/locations';
import { ContactDetails } from './../../../../_models/contactsAccount/contactDetails';
import { DatePickerEditorComponent } from './../../../_sharedComponent/date-picker-editor/date-picker-editor.component';
import { SharedService } from './../../../../_services/shared.service';
import { AccountByObjectType } from './../../../../_models/common/accountByObjectType';
import { FieldPermission } from './../../../../_models/permission/FieldPermission';
import { NgxPermissionsService } from 'ngx-permissions';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { RemoteData, CompleterService } from "ng2-completer";
import { environment } from './../../../../../environments/environment';
import {Loading} from './../../../_sharedComponent/loading/loading';
import {SapSyncNotifier} from './../../../../_utilities/sap-sync/sap-sync-notifier';
import { default as swal } from 'sweetalert2';

@Component({
  selector: 'az-purchase-order-details',
  templateUrl: './purchase-order-details.component.html',
  styleUrls: ['./purchase-order-details.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PurchaseOrderDetailsComponent implements OnInit{
  @Input() poId;
  @Input() poVersionId;
  @Input() purchaseOrderPermissions: Array<FieldPermission>;
  public poDetails: PurchaseOrder;
  @Output() newDetails = new EventEmitter();
  private tabKey = 9;
  private enterKey = 13;
  private accountsByObjectType: AccountByObjectType[];
  private objectTypeIdForPo: number = 22;
  private accountContacts: Contacts[];
  private paymentTerms: PaymentTerm[];
  private currencyList: Currency[];
  private nonBillingLocations: Locations[];
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private incotermList: Array<any>;
  private organizationList: Array<any>;
  private orgName: string;
  private onReadonly: boolean = true;
  private shippingMethods: Array<any>;
  private statusList: Array<any>;
  private warehouseList: Array<any>;
  private shipToLocation: Locations;
  private selected:boolean = false;
  private vendorLocation: Locations;
  private shipFromLocation: Locations;
  // private shipToLocationList: Locations[] = new Array<Locations>();
  private isDropShip: boolean = false;
  private hideAfterSync: boolean = false;
  private dataRemote: RemoteData;
  private selectedAccountName: string;
  private loading: Loading;
  private busyConfig: any;
  private poNotesUpdated : string;
  private afterViewChecked: boolean = false;
  private sapSyncNotifier:SapSyncNotifier;
  private reportUrl: string;
  private warehouseToDisplayName: string;

  public notifyOptions = {
    position: ['top', 'right'],
    timeOut: 3000,
    lastOnBottom: true
  };
  
  constructor(
    private router: Router,
    private purchaseOrderService: PurchaseOrdersService,
    private _notificationsService: NotificationsService,
    private contactsService: ContactsService,
    private locationService: LocationService,
    private sharedService: SharedService,
    private permissionsService: NgxPermissionsService,
    private completerService: CompleterService
    ) {
    this.poDetails = new PurchaseOrder();
    this.accountsByObjectType = new Array<AccountByObjectType>();
    this.accountContacts = new Array<Contacts>();
    this.paymentTerms = new Array<PaymentTerm>();
    this.currencyList = new Array<Currency>();
    this.nonBillingLocations = new Array<Locations>();
    this.shipFromLocation = new Locations();
    this.vendorLocation = new Locations();
    this.shippingMethods = new Array();
    this.statusList = new Array();
    this.warehouseList = new Array();
    this.shipToLocation = new Locations();
    this.loading = new Loading(true);
    this.busyConfig = this.loading.busyConfig;
    this.sapSyncNotifier = new SapSyncNotifier(_notificationsService);
    this.RetrieveSuppliersVendors();
    this.RetrievePaymentTerms();
    this.RetrieveCurrencies();
    this.RetrieveIncoterms();
    this.RetrieveOrganizations(this.objectTypeIdForPo);
    this.RetrieveShippingMethods();
    this.RetrieveStatusList();
    //this.RetrieveShipToLocations();

    this.dataRemote = completerService.remote(
			null,
			"accountNameAndNum",
			"accountNameAndNum"
		);
		this.dataRemote.urlFormater(term => {
			return environment.apiEndPoint + '/api/accounts/getAccountsByNameNum?searchString='+ term + '&objectTypeId=' + this.objectTypeIdForPo 
		});
    this.dataRemote.dataField("accounts");
    
    
  }

  ngOnInit() {
    if(this.poId){
      this.RetrieveDetails();
    }else{
      this.onReadonly = false;
      this.setDefaultOrderDate();
    }
    setTimeout(() => {
      jQuery(".Vendor-Input").attr('data-field-name', 'Vendor');
    }, 2000);
  }

  onAccountSelected($event){
		if($event != null){
      this.selected = true;
      this.poDetails.accountId = $event.originalObject.accountId;
      //this.selectedAccountName = $event.originalObject.accountName;
			this.onAccountVendorChange($event.originalObject.accountId, false);
		}
  }
  
  setReportUrl(headerData) {  
    let organizationHtml =  headerData.organization.organizationName
      + '<br>' + headerData.organization.houseNumber + ' ' + headerData.organization.street
      + '<br>' + headerData.organization.city + ', ' + headerData.organization.stateName + ' ' + headerData.organization.postalCode
      + (headerData.organization.officePhone? '<br>' + 'Phone - ' + headerData.organization.officePhone: '')
      + (headerData.organization.fax? '<br>' + 'Fax - ' + headerData.organization.fax: '')
      + (headerData.organization.email? '<br>' + 'Email - ' + headerData.organization.email: '');

    this.reportUrl = '/ReportViewer/purchaseorder.html?purchaseOrderId=' +  headerData.purchaseOrderId + '&versionId=' + headerData.versionId + '&userId=' + headerData.userId + '&organizationHtml=' + organizationHtml ;
  }

	isAccountSelected(){
		if(this.poDetails.accountId === undefined)
			return false;

		return true;
	}

  RetrieveNonBillingAddresses(accountId) {
    this.locationService.getAccountNonBillingLocations(this.poDetails.accountId)
      .takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(data => {
        this.nonBillingLocations = data;
        this.shipFromLocation = _.find(this.nonBillingLocations, (bl: Locations) => bl.LocationID == this.poDetails.shipFromLocationId);
    });
  }

  RetrieveCurrencies() {
    this.sharedService.getAllCurrencies()
      .takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(data => {
        this.currencyList = data;
    });
  }

  RetrievePaymentTerms() {
    this.purchaseOrderService.GetPaymentTerms()
      .takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(data => {
        this.paymentTerms = data;
    });
  }

  RetrieveStatusList(){
    this.purchaseOrderService.getStatusList()
      .takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(data => {
      this.statusList = data;

      //set default status ID
      if (!this.poDetails.statusId)
        this.setDefaultStatusId();
    });
  }

  RetrieveIncoterms(){
    this.sharedService.getAllIncoterms()
      .takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(data => {
        this.incotermList = data;
    });
  }

  RetrieveShippingMethods(){
    this.sharedService.getAllShippingMethods()
      .takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(data => {
        this.shippingMethods = data;
    });
  }

  // RetrieveShipToLocations(){
  //   this.locationService.GetShipToLocations(this.isDropShip, true)
  //     .takeUntil(this.ngUnsubscribe.asObservable())
  //     .subscribe(data => {
  //       this.shipToLocationList = data;
  //       this.afterViewChecked = false;
  //   });
  // }

  RetrieveWarehouseLocations(organizationId: number,toWarehouseId?: number) {
    this.sharedService.getWarehouses(organizationId)
      .takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(data => {
        this.warehouseList = data;
        this.afterViewChecked = false;
        if( toWarehouseId ){
          let wareHouseFound = data.find(x=>x.warehouseId == toWarehouseId);
          if(wareHouseFound){
            this.warehouseToDisplayName = wareHouseFound.warehouseName;
          }
        }
      });
  }

  RetrieveOrganizations(objectTypeId:number){
    this.sharedService.getAllOrganizations(objectTypeId)
      .takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(data => {
        this.organizationList = data;
    });
  }

  RetrieveDetails() {
    this.purchaseOrderService.getPurchaseOrderDetails(this.poId, this.poVersionId)
      .takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(data => {
        this.poDetails = data;
        this.selectedAccountName = data.vendor;
        this.poNotesUpdated = data.poNotes;
        this.SetSelectedAccountName();

        this.RetrieveWarehouseLocations(this.poDetails.organizationId, this.poDetails.toWarehouseId);
        //Set default date to today if null
        if (!this.poDetails.orderDate)
          this.setDefaultOrderDate();

        //Set default statusID
        if (!this.poDetails.statusId) {
            this.setDefaultStatusId();
        }
        var _self = this;
        let orgMatch = this.organizationList.find(x => x.id === _self.poDetails.organizationId);
        this.orgName = orgMatch ? orgMatch.name : null;

        this.newDetails.emit(this.poDetails);
        if (this.poDetails.accountId > 0) {
          this.onAccountVendorChange(this.poDetails.accountId, true)
          this.RetrieveNonBillingAddresses(this.poDetails.accountId);
          this.RetrieveVendorAddress(this.poDetails.accountId);
        }
        
        // const sblocationIds = _.map(this.shipToLocationList, stl => stl.LocationID);
        // if (_.includes(sblocationIds, this.poDetails.shipToLocationId)){
        //   this.shipToLocation = _.find(this.shipToLocationList, stl => stl.LocationID == this.poDetails.shipToLocationId);
        // } else {
        //   this.isDropShip = true;
        //   this.locationService.GetShipToLocations(this.isDropShip, true)
        //   .takeUntil(this.ngUnsubscribe.asObservable())
        //   .subscribe(data => {
        //     this.shipToLocationList = data;
        //     this.shipToLocation =  _.find(this.shipToLocationList, stl => stl.LocationID == this.poDetails.shipToLocationId);
        //   });
        // }

        //Set report URL
        this.setReportUrl(data);
    });
  }

  setDefaultStatusId() {
    this.poDetails.statusId = this.statusList.filter(status => status.isDefault == true)[0].id;
  }
setDefaultOrderDate(){
  var today = new Date();
  var dd = today.getDate().toString();
  var mm = today.getMonth()+1;
  var mmS = mm.toString();
  var yyyy = today.getFullYear();

  if (dd.length == 1)
    dd = '0' + dd;
  if (mmS.length == 1)
    mmS = '0' + mm;

  var dateCode = yyyy + '-' + mmS + '-' + dd;
  this.poDetails.orderDate = dateCode;
}
  RetrieveVendorAddress(accountId){
    this.locationService.getAccountBillingAddress(accountId)
      .takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(data => {
        this.vendorLocation = data;
    });
  }


  onContactChange(value) {
    this.sharedService.getContactBasicInfo(value)
      .takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(data => {
        const res: ContactDetails = data;
        if (res) {
          this.poDetails.contactEmail = res.email;
          this.poDetails.contactPhone = res.officePhone;
        }
    });
  }

  onAccountVendorChange(value, firstLoad) {
    this.RetrieveAccountContacts(value);
    this.RetrieveNonBillingAddresses(value);
    this.RetrieveVendorAddress(value);
    if (!firstLoad)
      this.RetrieveAccountDefaults(value);
    if(this.poNotesUpdated == null)
      this.RetrievePONotes(value);
    }

  onSupplierTyping(event){
      if(event.keyCode == this.tabKey || event.keyCode == this.enterKey){
        return;
      }else{
        this.poDetails.accountId = null;
      }
  }

  onInputFocusLost(){
    setTimeout(() => {
      this.runValidation();
    }, 200);
  }

  runValidation(){
    if(this.selected){
    }else{
      this.selectedAccountName = "";
    }
  }
  
  RetrieveAccountDefaults(accountId) {
   this.purchaseOrderService.GetAccountDetails(accountId).takeUntil(this.ngUnsubscribe.asObservable())
   .subscribe(
     data => {
       let res = data;
        this.poDetails.currencyId = res.currencyId;
        this.poDetails.paymentTermId = res.paymentTermId;
     }); 
  }

  onNonBillingChange(value) {
    this.shipFromLocation = _.find(this.nonBillingLocations, (bl: Locations) => bl.LocationID == this.poDetails.shipFromLocationId);
  }

  RetrievePONotes(accountId){
    if(this)
    this.contactsService.getaccountBasicDetailsData(accountId).takeUntil(this.ngUnsubscribe.asObservable())
    .subscribe(
      data => {
        this.poDetails.poNotes = data[0].poNotes;
      });
  }
  RetrieveAccountContacts(accountId) {
    this.contactsService.getAccountContacts(accountId)
      .takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe( data => {
        this.accountContacts = data;
        this.poDetails.contactId = data[0].contactId;
        this.onContactChange(this.poDetails.contactId)
    });
  }

  RetrieveSuppliersVendors() {
    this.purchaseOrderService.getPoObjectTypeId()
      .takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(dataForPoObjectType => {
        this.objectTypeIdForPo = dataForPoObjectType;
        this.sharedService.getAccountsByObjectType(this.objectTypeIdForPo)
          .takeUntil(this.ngUnsubscribe.asObservable())
          .subscribe(data => {
            this.accountsByObjectType = data;
            this.SetSelectedAccountName();
            jQuery(".Vendor-Input").attr('data-field-name', 'Vendor')
        });
    });
  }

  SetSelectedAccountName() {
    if (this.poDetails.accountId > 0) {
      let accountData =  this.accountsByObjectType.find(x => x.accountId == this.poDetails.accountId);
      if (accountData != undefined)
        this.selectedAccountName = accountData.accountName;
    }
  }

  onShipToChange(value){
    // this.shipToLocation = _.find(this.shipToLocationList, stl => stl.LocationID == value);
  }

  onDropShipToggle(value){
    this.locationService.GetShipToLocations(this.isDropShip, true)
      .takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(data => {
        // this.shipToLocationList = data;
        this.shipToLocation = new Locations();
        // this.poDetails.shipToLocationId = undefined;
        this.afterViewChecked = false;
      });
  }

  onFormStatusChange(event: string) {
    if (event == 'edit') {
      this.onReadonly = false;
    } else if (event == 'cancel') {

      //Cancel editing an existing purchase order
      if (this.poId > 0) {
        this.onReadonly = true;
        this.RetrieveDetails();
      }
      
      //Cancel editing a new purchase order
      else {
        this.router.navigate(['pages/purchase-orders'])
      }
    } else if (event == 'save') {
      this.savePurchaseOrderDetails();
    } 
    else if (event == 'sync') {
      this.onReadonly = true;
      this.syncPurchaseOrder();
    }
  }

  syncPurchaseOrder(){
    this.getSyncStatus();
  }

  validatePoSync(_self, status:string){
    if(status == "InValid"){
      swal({
        title: 'All PO lines must either be allocated or marked spec buy to sync this PO.',
        type: 'warning',
        showCancelButton: false,
        confirmButtonText: 'OK'
      })
    }else{
      _self.busyConfig.busy =_self.purchaseOrderService.syncPurchaseOrder(_self.poId, _self.poVersionId).takeUntil(_self.ngUnsubscribe.asObservable()).subscribe(
        data => {
          _self.hideAfterSync = true;
          _self.sapSyncNotifier.showNotification(data);
        }
      );
    }
  }

  getSyncStatus(){
    this.purchaseOrderService.getPurchaseOrderSyncStatus(this.poId, this.poVersionId).takeUntil(this.ngUnsubscribe.asObservable())
    .subscribe(
      data => {
        this.validatePoSync(this, data);
        }      
    )
  }
  
  formNotComplete(){
    return !this.poDetails.accountId ||  !this.poDetails.contactId || !this.poDetails.currencyId ||
    !this.poDetails.statusId ||  !this.poDetails.organizationId ||!this.poDetails.paymentTermId || !this.poDetails.orderDate || !this.poDetails.toWarehouseId
  }

  savePurchaseOrderDetails(){

    if (this.formNotComplete()){
      this._notificationsService.error(
        'Missing Field in Purchase Order!',
        'Please fill out the form',
        {
          timeOut: 3000,
          pauseOnHover: false,
          clickToClose: false
        }
      )
      this.onReadonly = false;
      return;
    }
    this.purchaseOrderService.SavePurchaseOrder(this.poDetails).subscribe(data => {
      this._notificationsService.success(
        'Saved!',
        'Purchase order saved!',
        {
          timeOut: 3000,
          pauseOnHover: false,
          clickToClose: false
        }
      );
      if (!this.poId){
        this.router.navigate(['pages/purchase-orders/purchase-order-details', 
          { purchaseOrderId: data.purchaseOrderId, versionId: data.versionId }]);
          this.updateFieldsAfterCreate();
      }

      this.onReadonly = true;
    });
  }

  onOwnershipClick(event){
    const permissions = this.permissionsService.getPermissions();
    if (!permissions['CanEditOwnership']){
      return;
    }
    jQuery('#ownershipModal').modal('toggle');
  }

  onOrganizationChange(organizationId){
    this.RetrieveWarehouseLocations(organizationId);
  }

  updateFieldsAfterCreate(){
    let organization = this.organizationList.find(rs => {
      return rs.id == this.poDetails.organizationId
    });
    if( organization ){
      this.orgName = organization.name;
    }

    let warehouse = this.warehouseList.find(rs => {
      return rs.warehouseId == this.poDetails.toWarehouseId
    });
    if( warehouse ){
      this.warehouseToDisplayName = warehouse.warehouseName;
    }

  }
}
