import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { PermissionService } from './../../../_services/permissions.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { AccountsContactsService } from './../../../_services/accountsContacts.service';
import { FieldPermission } from './../../../_models/permission/FieldPermission';
import * as _ from 'lodash';
import { Subject } from 'rxjs/Subject';


@Component({
  selector: 'az-account-details',
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AccountDetailsComponent implements OnInit {
  private accountId: number;
  private objectId: number;
  private menuType: string = 'Account';
  private accountObjectTypeId = 1;
  private accountPermissions: Array<FieldPermission>;
  private objectPermissionList: Array<any>;
  private generalPermission = 'generalPermission';  
  public isSupplier : boolean;
  public isCustomer : boolean;
  private accountNumber : string;
  private documentCount = 0;
  private accountCommentTypeMap: Array<Object> = new Array<Object>();
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  constructor( private activatedRoute: ActivatedRoute,
    private accountsContactsService: AccountsContactsService,
    private permissionsService: PermissionService,
    private ngxPermissionsService: NgxPermissionsService) {
      this.activatedRoute.params
      .subscribe((params: Params) => {
        //Set page paramaters
        this.accountId = +params['accountId'];
        this.objectId  = this.accountId || 0;
    });
  }

  ngOnInit() {
          this.accountsContactsService.getAccountCommentTypeId()
            .takeUntil(this.ngUnsubscribe.asObservable())
            .subscribe((commentTypeMap) => {
              this.accountCommentTypeMap = commentTypeMap;
            });
          this.permissionsService.getFieldPermissions(this.objectId, this.accountObjectTypeId).subscribe(data => {
            this.ngxPermissionsService.flushPermissions();
            if (localStorage.getItem(this.generalPermission)) {
              const permissionList = JSON.parse(localStorage.getItem(this.generalPermission));
              this.ngxPermissionsService.loadPermissions(permissionList);
            }
            this.accountPermissions = data.fieldPermissionList;
            this.objectPermissionList = data.objectPermissionList;
            this.ngxPermissionsService.loadPermissions(data.objectPermissionList);
          });
  }
  documentCountChanged(e) {
    this.documentCount = e;
  }
  documentsClick() {
    jQuery('#accountsDocModal .mdl-documents').modal('show');
  }
  isSupplierChecked($event){
    this.isSupplier = $event;
  }

  isCustomerChecked($event){
    this.isCustomer = $event;
  }

  accountNumberEvent($event){
    this.accountNumber = $event;
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
   }

}
