import { Component, OnInit,ViewEncapsulation,OnDestroy,  ViewChild, ElementRef} from '@angular/core';
import { ContactsService } from './../../../_services/contacts.service';
import { ObjectTypeService } from './../../../_services/object-type.service';
import { ContactDetails, ContactDetailsOptions, Owner, Status, Location, PreferredContactMethods, ContactJobFunction } from './../../../_models/contactsAccount/contactDetails';
import { ListContact } from './../../../_models/contactsAccount/contacts';
import { FormGroup, AbstractControl, NgForm} from '@angular/forms';
import { NotificationsService } from 'angular2-notifications';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { OwnershipTypes  } from './../../../_models/shared/ownershipTypes';
import { Subject } from 'rxjs/Subject';
import { FieldPermission } from './../../../_models/permission/FieldPermission';
import { PermissionService } from './../../../_services/permissions.service';
import { OwnershipService } from './../../../_services/ownership.service';
import { NgxPermissionsService } from 'ngx-permissions';
import * as _ from 'lodash';
import { default as swal } from 'sweetalert2';
import { Location as RouterLocation } from '@angular/common';
import { EmailUtil } from '../../../_utilities/email/emailUtil';

@Component({
  selector: 'az-contact-details',
  templateUrl: './contact-details.component.html',
  styleUrls: ['./contact-details.component.scss'],
  encapsulation:ViewEncapsulation.None,
  providers: [ObjectTypeService]
})
export class ContactDetailsComponent implements OnInit,OnDestroy {
  private contactDetails: ContactDetails;
  private contactDetailsOptions: ContactDetailsOptions;
  private form: FormGroup;
  private firstName: AbstractControl;
  private statuses: Status[];
  private locations: Array<Location>;
  private addressId: number;
  private preferredContactMethods: PreferredContactMethods[];
  private locationsBoundArrayData: Location[];
  private jobFunctions: ContactJobFunction[];
  private address: Location;
  private contactId: number;
  private objectTypeId: number;
  private accountId:number;
  private contacts:ListContact[];
  private owners: Owner[];
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private onReadonly: boolean = true;
  private contactPermissions: Array<FieldPermission>;
  private contactObjectTypeId = 2;
  private objectPermissionList: Array<any>;
  private birthDateCopy;
  // private btnExtraText = 'New Account';
  private CANEDITOWNERSHIP = 'CanEditOwnership';
  private generalPermission = 'generalPermission';  
  private nameMaxLength = '50';
  @ViewChild('contactDetailForm') contactDetailFormRef: NgForm;

  public notifyOptions = {
    position: ["top", "right"],
    timeOut: 3000,
    lastOnBottom: true
  }
  private menuType: string = 'Contact';
  private contactCommentTypeMap: Array<Object> = new Array<Object>();
  public emailRegExp = EmailUtil.EMAIL_REG_EXP;

  constructor(private contactsService: ContactsService, 
    private ownershipService : OwnershipService,
    private permissionsService: PermissionService,
    private ngxPermissionsService: NgxPermissionsService,
    private notificationsService: NotificationsService,
    private objectTypeService : ObjectTypeService,
    private activatedRoute:ActivatedRoute,
    private router: Router,

    private routeLocataion: RouterLocation) {
      this.contactDetails = new ContactDetails();
      this.contactDetailsOptions = new ContactDetailsOptions();
      this.statuses = new Array<Status>();
      this.locationsBoundArrayData = new Array<Location>();
      this.preferredContactMethods = new Array<PreferredContactMethods>();
      this.address = new Location();
      this.owners = new Array<Owner>();
      this.objectTypeId = OwnershipTypes.Contact;


      this.contactsService.getContactCommentTypeId()
        .takeUntil(this.ngUnsubscribe.asObservable())
        .subscribe((commentTypeMap) => {
          this.contactCommentTypeMap = commentTypeMap;
      });
    }

  ngOnInit() {
    this.activatedRoute.params
    .takeUntil(this.ngUnsubscribe.asObservable())
    .subscribe((params:Params)=>{
      this.contactId = params['contactId'];
      this.accountId = params['accountId'];

      if(this.contactId && this.accountId){
        this.contactsService.getAccountContactDetailsData(this.contactId, this.accountId)
          .takeUntil(this.ngUnsubscribe.asObservable())
          .subscribe(data => {
            this.contactDetails = data[0];
            this.setUpData(data[1]);
            this.address = _.find(this.locations, x => this.contactDetails.locationId == x.locationId);
        });
      }
      else{
        this.contactsService.getContactBasicDetailOptions(this.accountId)
          .takeUntil(this.ngUnsubscribe.asObservable())
          .subscribe(data => {
            this.setUpData(data);
        });
      }
      const objectId  = this.contactId || 0;
      this.permissionsService.getFieldPermissions(objectId, this.contactObjectTypeId).subscribe(data => {
        let permissionList;
        this.ngxPermissionsService.flushPermissions();
        if (localStorage.getItem(this.generalPermission)){
          permissionList = JSON.parse(localStorage.getItem(this.generalPermission));
          this.ngxPermissionsService.loadPermissions(permissionList);
        }
        this.contactPermissions = data.fieldPermissionList;
        this.objectPermissionList = data.objectPermissionList;
        this.ngxPermissionsService.loadPermissions(data.objectPermissionList);
        if (objectId == 0){
          this.onReadonly = false;
        }
      });
    });
   
  }

  setUpData(data){
    this.statuses = data.statuses;
    this.locations = data.locations;
    this.preferredContactMethods = data.preferredContactMethods;
    this.locationsBoundArrayData = _.map(this.locations, l => l);
    this.jobFunctions = data.jobFunctions;
    if(this.contactDetails.owners){
      this.owners = this.contactDetails.owners.slice();
    }
    else{
      this.objectTypeService.getAccountObjectTypeId()
      .takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe((objectTypeId) => {
        this.ownershipService.GetObjectOwnership(this.accountId , objectTypeId)
        .takeUntil(this.ngUnsubscribe.asObservable())
        .subscribe(data => {
          this.owners = data.slice();
        })
      });
    }
  }

  onLocationChange(value) {
    this.address = _.find(this.locations, x => value == x.locationId);
  }

  getLocationFullAddress(location: Location){
    return `${location.houseNo} ${location.street} \n ${location.city? location.city + ', ': ''}
     ${location.stateCode} ${location.postalCode? location.postalCode + ', ': ''} ${location.countryCode}`
  }

  onUpdateSubmit() {
    const contactDetails  = this.contactDetails;
    this.contactDetailFormRef.ngSubmit.emit();
    if (!contactDetails.firstName || !contactDetails.lastName || contactDetails.email && !EmailUtil.isValid(contactDetails.email)){
      return;
    }
    this.onReadonly = true;
    const payload = {
      ContactId: this.contactId,
      AccountId: this.accountId,
      OwnerList: _.map(this.owners, element =>{
        return {UserId: element.id, percentage: +element.percentage }
      }),
      IsActive: this.contactDetails.isActive? 1: 0,
      FirstName: contactDetails.firstName,
      LastName: contactDetails.lastName,
      Title: contactDetails.title,
      LocationId: contactDetails.locationId,
      OfficePhone: contactDetails.officePhone,
      MobilePhone: contactDetails.mobilePhone,
      Fax: contactDetails.fax,
      Email: contactDetails.email,
      PreferredContactMethodId: contactDetails.preferredContactId,
      ExternalId: contactDetails.externalId,
      Note: contactDetails.note,
      Department: contactDetails.department,
      JobFunctionID: contactDetails.jobFunctionId,
      Birthdate: this.birthDateCopy,
      Gender: contactDetails.gender,
      Salutation: contactDetails.salutation,
      MaritalStatus: contactDetails.maritalStatus,
      KidsNames: contactDetails.kidsNames,
      ReportsTo: contactDetails.reportsTo
    };
    this.contactsService.setContactDetails(payload)
      .takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(data => {
      this.notificationsService.success(
        'Good Job',
        'Successfully saved the contact details',
        {
          pauseOnHover: false,
          clickToClose: false
        }
      )
      let res = data.json();
      if(res.contactId) this.contactId = res.contactId;
      if(!this.contactDetails.externalId){
        this.contactDetails.externalId = res.externalId;
      }
      if(this.contactId  !== undefined){
        this.router.navigate(['pages/accounts/contact-details',{contactId: this.contactId, accountId: this.accountId}]);
      }
    });
  }

  newOwnersAdded(owners){
    this.owners = owners;
  }

  AccountSave($savedAccount){
    jQuery('#mdlCreateAccount').modal('toggle');
    this.router.navigate(['pages/contacts/account-details', { accountId: $savedAccount.accountId}]);
  }

  cancelClicked(){
    jQuery('#mdlCreateAccount').modal('toggle');
  }

   ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onOwnershipClick() {
    if (_.includes(this.objectPermissionList, this.CANEDITOWNERSHIP)){
      jQuery('#ownershipModal').modal('toggle');
    } else {
      this.notificationsService.alert(
        'Permission Required',
        'Permission for editing owernship is required.',
        {
          pauseOnHover: false,
          clickToClose: false
        }
      )
    }
  }

  onFormStatusChange(event: string) {
    if (event == 'edit') {
      this.onReadonly = false;
    } else if (event == 'cancel') {
      this.onReadonly = true;

      //Cancel toggled on existing contact, get contact details
      if (this.contactId) {
        this.contactsService.getAccountContactDetailsData(this.contactId, this.accountId)
          .takeUntil(this.ngUnsubscribe.asObservable())
          .subscribe(data => {
            this.contactDetails = data[0];
          });
      }
            
      //Cancel toggled on new contact, redirect to account details
      else {
        this.router.navigate(['/pages/accounts/account-details', { accountId: this.accountId }]);
      }

    } else if (event == 'save') {
      this.onUpdateSubmit();
    }
  }

  showProjectGrid(){
    return _.includes(this.contactDetails.accountTypeIds, 4);
  }

  showFocusGrid(){
    return _.includes(this.contactDetails.accountTypeIds, 1);
  }

  onDeleteClick(){
    const _self = this;
    if (_self.contactId){
      const payload = {
        ContactId: _self.contactId,
        AccountId: _self.accountId,
        IsDeleted: true
      };
      swal({
        title: 'Are you sure?',
        text: "Are you sure you want to delete this contact?",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel'
      }).then(() => {
        _self.contactsService.setContactDetails(payload)
        .takeUntil(_self.ngUnsubscribe.asObservable())
        .subscribe(data => {
          _self.routeLocataion.back();
        });
      }).catch(swal.noop);
    }
  }

  backToAccountParent(){
    this.router.navigate(['pages/accounts/account-details',{accountId: this.accountId}]);
  }

}
