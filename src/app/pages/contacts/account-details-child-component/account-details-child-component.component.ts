
	 import { Component, OnInit ,ViewEncapsulation,Input, Output, OnDestroy, ViewChild, ElementRef, EventEmitter} from '@angular/core';
   import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators } from '@angular/forms';
   import { ContactsService } from './../../../_services/contacts.service';
   import { StatusList, AccountType, CompanyType } from './../../../_models/contactsAccount/accountOptions';
   import { AccountDetails } from './../../../_models/contactsAccount/accountDetails';
   import { AccountTypesEnum } from './../../../_models/contactsAccount/accountTypesEnum';
   import { NotificationsService } from 'angular2-notifications';
   import { List } from 'linqts';
   import { Location as RouterLocation } from '@angular/common';
   import { Router, ActivatedRoute, Params } from '@angular/router';
   import { Subject } from 'rxjs/Subject';
   import { NgxPermissionsService } from 'ngx-permissions';
   import _ from 'lodash';
   import { Loading } from './../../_sharedComponent/loading/loading';
   import { default as swal } from 'sweetalert2';
   import {SapSyncNotifier} from './../../../_utilities/sap-sync/sap-sync-notifier';
   import { element } from 'protractor';
   import { SharedService } from './../../../_services/shared.service';
   import { EmailUtil } from '../../../_utilities/email/emailUtil';
   
   @Component({
     selector: 'az-account-details-child-component',
     templateUrl: './account-details-child-component.component.html',
     styleUrls: ['./account-details-child-component.component.scss'],
     encapsulation:ViewEncapsulation.None
   })
   export class AccountDetailsChildComponentComponent implements OnInit,OnDestroy {
     private form: FormGroup;
     private accountDetails: AccountDetails;     
     private incotermList: Array<any>;
     //private statusList: StatusList[];
     private accountTypes: List<AccountType>;
     private regionsList: Array<any>;
     private accountTypesBoundData: AccountType[];
     private companyTypes: CompanyType[];
     private accountTypesEnum = AccountTypesEnum;
     private companyTypesCheck: boolean;
     private DBNumInvalid:boolean;
     private onReadonly: boolean = true;
     private newAccount: string;
     private ngUnsubscribe: Subject<void> = new Subject<void>();
     private formSubmitted: boolean;
     public accountTypesValid:boolean = false;
     private showSync: boolean = false;
     private organizationList: Array<any>;
     private currencyList: Array<any>;
     private accountHierarchies: Array<any>;
     private accountTypesData: Array<any>;
     private customerType: AccountType[];
     private vendorType: AccountType[];
     private regionOptions: Array<any>;
     private parentCompanyId: number;
     private isSupplierChecked = false;
     @Output() isSupplierCheckedEvent = new EventEmitter<boolean>();
     @Output() accountNumberEvent = new EventEmitter<string>();
     private isCustomerChecked = false;
     @Output() isCustomerCheckedEvent = new EventEmitter<boolean>();
     private accountId: number = undefined;
     private accountObjectTypeId;
     private accountHierarchyList: Array<any>;
     private newParentCompany: boolean = false;
     @Input() accountDetailPermissions;  
     @ViewChild("accountForm") accountForm;
     private loading: Loading;
     private busyConfig: any;
     private sapSyncNotifier:SapSyncNotifier;
     public emailRegExp = EmailUtil.EMAIL_REG_EXP;
   
     public notifyOptions = {
           position: ["top", "right"],
           timeOut: 3000,
           lastOnBottom: true
       }
   
     constructor(
       private contactsService: ContactsService, 
       private _notificationsService: NotificationsService,
       private router: Router,
       private ngxPermissionsService: NgxPermissionsService,
       private activatedRoute: ActivatedRoute,
       private routeLocation: RouterLocation,      
       private sharedService: SharedService,) 
     {
       this.accountDetails = new AccountDetails();       
       this.RetrieveIncoterms();
       this.RetrieveRegions()
       //this.statusList = new Array<StatusList>();
       this.accountTypes = new List<AccountType>();
       this.companyTypes = new Array<CompanyType>();
       this.currencyList = [];
       this.accountHierarchies = [];
       this.accountTypesData = [];
       this.regionOptions = [];
       this.newAccount = "New Account";
       this.organizationList = this.contactsService.setupOrganizations();
       this.loading = new Loading(true);
       this.busyConfig = this.loading.busyConfig;
       this.sapSyncNotifier = new SapSyncNotifier(_notificationsService);
     }
   
     ngOnInit() {
       this.activatedRoute.params.takeUntil(this.ngUnsubscribe.asObservable())
       .subscribe((params: Params) => {
         
         let accountId = params['accountId'];
         if(accountId && accountId != 0){
             this.populateData(accountId);
             this.accountId = accountId;
             this.accountObjectTypeId = 1;
             this.showSync = true;
         }else{
             this.onReadonly = false;
             this.populateOptionsData();
         }
       });
     }

     RetrieveRegions(){
      this.sharedService.getAllRegions().takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(data => {
        this.regionsList = data;
      })
     }

     RetrieveIncoterms(){
      this.sharedService.getAllIncoterms()
        .takeUntil(this.ngUnsubscribe.asObservable())
        .subscribe(data => {
          this.incotermList = data;
      });
    }
   
     populateData(accountId){
       this.contactsService.getaccountBasicDetailsData(accountId).takeUntil(this.ngUnsubscribe.asObservable())
       .subscribe(
         data => {
           this.accountDetails = data[0];
           //this.statusList = data[1].statuses;
           this.companyTypes = data[1].companyTypes;
           this.accountTypes = data[1].accountTypes;
           this.currencyList = data[2];
           this.accountHierarchyList = data[3];
           this.setupAccountHierarchy(data[3]);
           this.accountTypesData = data[4];
           //this.setupTypesData(data[3]);
           this.accountTypesData.forEach(element => {
             this.accountTypes.First(x => x.accountTypeId == element.accountTypeId).checked = true;
           });
           console.log("accountTypesData",this.accountTypesData);
           
           this.accountTypesBoundData = this.accountTypes.ToArray();
           //Join two dataSets: accountTypesBoundData and accountTypesData
           this.mapTwoDatasetsForAccountTypeData();
           this.customerType = this.accountTypesBoundData.filter(x => x.accountTypeName == 'Customer');
           this.vendorType = this.accountTypesBoundData.filter(x => x.accountTypeName == 'Supplier');
           console.log("customerType",this.customerType);
           console.log("vendorType",this.vendorType);
           this.isSupplierChecked = this.isAccountSupplier(this.accountTypesBoundData);
           this.isCustomerChecked = this.isAccountCustomer(this.accountTypesBoundData);
           this.isSupplierCheckedEvent.emit(this.isSupplierChecked) ;
           this.isCustomerCheckedEvent.emit(this.isCustomerChecked);
           this.accountNumberEvent.emit(this.accountDetails.number) ;
           
         });
     }
   
     mapTwoDatasetsForAccountTypeData(){
       this.accountTypesBoundData.forEach(element => {
         this.accountTypesData.forEach(type =>{
           if(element.accountTypeId == type.accountTypeId){
             element.paymentTermName = type.paymentTermName;
             element.statusName = type.statusName;
             element.epdsId= type.epdsId;
           }
         });
       });
     }
   
     isAccountSupplier(accountTypesData){
       let supplier = false;
       for(let i = 0 ; i < this.accountTypesBoundData.length ; i ++){
         if (this.accountTypesBoundData[i].accountTypeName == "Supplier" && this.accountTypesBoundData[i].checked == true){
           supplier = true;
           break;
         }
       }
   
       return supplier;
     }
   
     isAccountCustomer(accountTypesData){
       let customer = false;
       for(let i = 0 ; i < this.accountTypesBoundData.length ; i ++){
         if (this.accountTypesBoundData[i].accountTypeName == "Customer" && this.accountTypesBoundData[i].checked == true){
           customer = true;
           break;
         }
       }
   
       return customer;
     }
   
   
   
     populateOptionsData(){
       this.accountDetails = new AccountDetails();
       this.contactsService.getAccountDetailOptions().takeUntil(this.ngUnsubscribe.asObservable())
       .subscribe(
         data=>{
            //this.statusList = data.statuses;
            this.companyTypes = data.companyTypes;
            this.accountTypes = data.accountTypes;
            this.accountTypesBoundData = this.accountTypes.ToArray();
            this.isSupplierChecked = this.isAccountSupplier(this.accountTypesBoundData);
            this.isSupplierCheckedEvent.emit(this.isSupplierChecked);
   
         }
       )
     }
   
     onParentCompanyChanged(value){
       const _self = this;
       _self.regionOptions = _.filter(_self.accountHierarchyList, ah => ah.parentId == _self.parentCompanyId);
     }
   
     setupAccountHierarchy(accountHierarchyList: Array<any>){
       const _self = this;
       let parentCompanyId;
       _self.accountHierarchies = _.filter(accountHierarchyList, ah => !ah.parentId);
       const accountHierarchyId = _self.accountDetails.accountHierarchyId;
       if (accountHierarchyId){
         const region = _.find(accountHierarchyList, ah => ah.accountHierarchyId == accountHierarchyId);
         if (region){
           parentCompanyId = region.parentId;
           _self.parentCompanyId = parentCompanyId;
         }
         if (parentCompanyId){
           _self.regionOptions = _.filter(accountHierarchyList, ah => ah.parentId == parentCompanyId);
         }
       }
     }
   
     setupTypesData(typesDataList: Array<any>){
   
     }
   
     saveAccountDetails() {
      this.DBNumInvalid = false;
       if (this.accountForm.invalid){
         return;
       }
       if(this.accountDetails.DBNum){
       if(this.accountDetails.DBNum.length > 0){
          var isnum = /^\d+$/.test(this.accountDetails.DBNum);
          if(!isnum || this.accountDetails.DBNum.length !== 9){
            this.DBNumInvalid = true;
            this.onReadonly = false;
          }else{
            this.updateAccountDetails();
          }
       }
      }else{
        this.updateAccountDetails();
      }
    }

    updateAccountDetails(){
       let typesTosave = new Array<number>();
       this.accountTypesBoundData.forEach(element => {
         if(element.checked)
         {
           typesTosave.push(element.accountTypeId);
         }
       });
       this.isSupplierChecked = this.isAccountSupplier(this.accountTypesBoundData);
       this.isSupplierCheckedEvent.emit(this.isSupplierChecked);  
       this.isCustomerCheckedEvent.emit(this.isCustomerChecked); 
   
       let payload = {
         accountId: this.accountDetails.accountId,
         number: this.accountDetails.number,
         name: this.accountDetails.name,
         statusId: null,//this.accountDetails.statusId,
         accountTypeIds: typesTosave,
         companyTypeId: this.accountDetails.companyTypeId,
         externalId: this.accountDetails.externalId,
         statusExternalId: null, //this.accountDetails.statusExternalId,
         accountHierarchyId: this.accountDetails.accountHierarchyId,
         organizationId: this.accountDetails.organizationId,
         //currencyId: this.accountDetails.currencyId, READ ONLY
         SAPHierarchyID: null,
         SAPGroupID: null,
         regionId: null,
         hierarchyName: null,
         email: this.accountDetails.email,
         website: this.accountDetails.website,
         yearEstablished: this.accountDetails.yearEstablished == ""? null: this.accountDetails.yearEstablished,
         numOfEmployees: this.accountDetails.numOfEmployees,
         productFocus: this.accountDetails.productFocus,
         carryStock: this.accountDetails.carryStock,
         minimumPO: this.accountDetails.minimumPO,
         shippingInstructions: this.accountDetails.shippingInstructions,
         vendorNum: this.accountDetails.vendorNum,
         supplierRating: this.accountDetails.supplierRating,
         qcNotes : this.accountDetails.qcNotes,
         poNotes : this.accountDetails.poNotes,
         approvedVendor: this.accountDetails.approvedVendor,
         incotermID: this.accountDetails.incotermID,
         dbNum: this.accountDetails.DBNum,
         shipFromRegionId : this.accountDetails.shipFromRegionId

       };
       if (this.newParentCompany){
         payload.hierarchyName = this.accountDetails.hierarchyName;
       }
   
       //this.accountDetails.statusExternalId = this.statusList.find(x=> x.optionId == this.accountDetails.statusId).externalId;
       const region = _.find(this.accountHierarchyList, ah => ah.accountHierarchyId == this.accountDetails.accountHierarchyId);
       if (region){
         payload.SAPGroupID = region.SAPGroupID;
         payload.SAPHierarchyID = region.SAPHierarchyID;
         payload.regionId = region.regionId;
       }
       this.contactsService.updateAccountBasicDetailData(payload)
         .takeUntil(this.ngUnsubscribe.asObservable())                                 
         .subscribe(data => {
           let res = data.json();
           if(res.failureMessage){
             this._notificationsService.error(
               'Oops...',
               'Something went wrong!'
             );
           } else{
             this._notificationsService.success(
               'Good Job',
               'Successfully saved the account details',
               {
                 pauseOnHover: false,
                 clickToClose: false
               });
             this.router.navigate(['pages/accounts/account-details', { accountId: res.accountId}]);
             if (this.newParentCompany){
               this.reloadParentCompany(res.accountId);
             }
             this.newParentCompany = false;
             this.populateData(this.accountId)
           }
       });
     }
   
     reloadParentCompany(accountId){
       this.contactsService.getaccountBasicDetailsData(accountId)
       .takeUntil(this.ngUnsubscribe.asObservable())
       .subscribe(data => {
           const accountDetails = data[0];
           this.accountDetails.accountHierarchyId = accountDetails.accountHierarchyId;
           this.setupAccountHierarchy(data[3]);
       });
       
     }
   
     addNewAccount(){
       this.router.navigate(['/pages/contacts/account-details']);
       
     }
   
     onFormStatusChange(event: string){
       if (event == 'edit') {
         this.onReadonly = false;
       } else if(event == 'cancel') {
         this.onReadonly = true;
         this.newParentCompany = false;
         this.populateData(this.accountId); 
         // Logic to reset form?
       } else if (event == 'sync') {
         this.onReadonly = true;
         this.syncAccount();
       }
       // else if(event == 'save') {
     
       // }
     }
   
     syncAccount(){
   
       this.busyConfig.busy = this.contactsService.syncAccount(this.accountId).takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
         data => {
           this.sapSyncNotifier.showNotification(data);
         }
       );
     }
   
     onSubmit()
     { 
       
       if(!(this.AccountTypesValid() && this.accountForm.valid))
       {
         this.formSubmitted = true;
         return;
       }
       
       this.onReadonly = true;
       console.log('Account-detail-child-component, onFormStatusChange: saving form...');
       this.saveAccountDetails();
       this.formSubmitted = false;
     }
   
     ngOnDestroy() {
       this.ngUnsubscribe.next();
       this.ngUnsubscribe.complete();
     }
   
     AccountTypesValid()
     {
       if( this.accountTypesBoundData.filter(x => x.checked == true).length == 0 )
       {
         this.accountTypesValid = false;
         return false;
       }
       else{
         this.accountTypesValid = true;
         return true;
       }
     }
   
     accountTypeChanged($event, accountType)
     {
       accountType.checked = $event.target.checked;
       this.AccountTypesValid();
     }
   
     toggleParentCompanyField(){
       const _self = this;
       if (!_self.onReadonly){
         _self.newParentCompany = !_self.newParentCompany;
         if (_self.newParentCompany){
           _self.regionOptions = _.filter(_self.accountHierarchyList, ah => ah.parentId == 1);
         } else{
           _self.regionOptions = [];
           _self.setupAccountHierarchy(_self.accountHierarchyList)
         }
         _self.accountDetails.accountHierarchyId = _self.regionOptions[0]? _self.regionOptions[0].accountHierarchyId: null;
       }
     }
   
     isCustomer(){
       return _.includes(_.map(this.accountTypesBoundData, at => {
         return at.checked? at.accountTypeId: 0
       }), 4);
     }
   
     isSupplier(){
       return _.includes(_.map(this.accountTypesBoundData, at => {
         return at.checked? at.accountTypeId: 0
       }), 1);
     }
   
     canEditParentCompany(){
       const _self = this;
       let permission = false;
       const permissions = _.map(_.filter(_self.accountDetailPermissions, p => p.canEdit), permission => permission.name);
       if (permissions){
         permission = _.includes(permissions, 'Parent Company');
       }
       return permission;
     }
   
     onOwnershipClick() {
       const permissions = this.ngxPermissionsService.getPermissions();
       if (!permissions['CanEditOwnership']){
         return;
       }
       jQuery('#ownershipModal').modal('toggle');
     }
   
     onDeleteClick(){
       const _self = this;
       if (_self.accountId){
         let typesTosave = new Array<number>();
         _self.accountTypesBoundData.forEach(element => {
           if(element.checked){
             typesTosave.push(element.accountTypeId);
           }
         });
         let payload = {
           accountId: _self.accountId,
           accountTypeIds: typesTosave,
           isDeleted: 1
         };
         swal({
           title: 'Are you sure?',
           text: "Are you sure you want to delete this account?",
           type: 'warning',
           showCancelButton: true,
           confirmButtonColor: '#3085d6',
           cancelButtonColor: '#d33',
           confirmButtonText: 'Confirm',
           cancelButtonText: 'Cancel'
         }).then(() => {
           _self.contactsService.updateAccountBasicDetailData(payload)
             .takeUntil(_self.ngUnsubscribe.asObservable())
             .subscribe(data => {
             _self.routeLocation.back();
           });
         },function(){
       
         });
       }
     }
   
   }
   
   
   