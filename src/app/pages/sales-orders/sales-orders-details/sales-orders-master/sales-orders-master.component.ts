import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { SalesOrdersDetailsComponent } from './../sales-orders-details/sales-orders-details.component';
import { SalesOrdersService } from './../../../../_services/sales-orders.service';
import { PermissionService } from './../../../../_services/permissions.service';
import { FieldPermission } from './../../../../_models/permission/FieldPermission';
import { NgxPermissionsService } from 'ngx-permissions';
import { PoSoUtilities } from './../../../../_utilities/po-so-utilities/po-so-utilities'; 
import { Subject } from 'rxjs/Subject';
import * as _ from 'lodash';
import { SharedService } from './../../../../_services/shared.service';
import { default as swal } from 'sweetalert2';

@Component({
  selector: 'az-sales-orders-master',
  templateUrl: './sales-orders-master.component.html',
  styleUrls: ['./sales-orders-master.component.scss']
})
export class SalesOrdersMasterComponent implements OnInit {
  @ViewChild(SalesOrdersDetailsComponent) details;
  private soId:number;
  private soVersionId:number;
  private selectedSOLineId: number;
  private selectedSOExtraId: number;
  private externalId: string;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private objectTypeId : number;
  private message= [];
  private salesOrderObjectTypeId: number;
  private soLineObjectTypeId: number;
  private soExtraObjectTypeId: number;
  private soCommentTypeMap: Array<Object>;


  private partObjectInfo: string;
  private extraObjectInfo: string;
  private documentCount = 0;
  private deliveryRuleId;

  private soPermissions: Array<FieldPermission>;
  private objectPermissionList: Array<any>;
  private generalPermission = 'generalPermission';

  constructor(
    private sharedService: SharedService,
    private activatedRoute:ActivatedRoute, 
    private permissionsService: PermissionService,
    private salesOrdersService: SalesOrdersService,
    private sopoUtilities : PoSoUtilities,
    private ngxPermissionsService: NgxPermissionsService) {
    this.salesOrdersService.getSalesOrderObjectTypeId().takeUntil(this.ngUnsubscribe.asObservable()).subscribe((objectTypeId) => {
      this.salesOrderObjectTypeId = objectTypeId;
      if (this.salesOrderObjectTypeId) {
        const objectId = this.soId || 0;
        this.permissionsService.getFieldPermissions(objectId, this.salesOrderObjectTypeId).subscribe(data => {
          this.soPermissions = data.fieldPermissionList;
          this.objectPermissionList = data.objectPermissionList;
          this.ngxPermissionsService.loadPermissions(data.objectPermissionList);
        });
      }
    });
    this.salesOrdersService.getSOLinesObjectTypeId().takeUntil(this.ngUnsubscribe.asObservable()).subscribe((objectTypeId) => {
      this.soLineObjectTypeId = objectTypeId;
    });
    this.salesOrdersService.getSOExtraObjectTypeId().takeUntil(this.ngUnsubscribe.asObservable()).subscribe((objectTypeId) => {
      this.soExtraObjectTypeId = objectTypeId;
    });
    this.salesOrdersService.getSalesOrderCommentTypeId().takeUntil(this.ngUnsubscribe.asObservable()).subscribe((commentTypeMap) => {
      this.soCommentTypeMap = commentTypeMap;
    });

    if (localStorage.getItem(this.generalPermission)){
      this.ngxPermissionsService.flushPermissions();
      const permissionList = JSON.parse(localStorage.getItem(this.generalPermission));
      this.ngxPermissionsService.loadPermissions(permissionList);
    }

    this.validatePrintingRule();
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params:Params)=>{
      this.soId = params['soId'];
      this.soVersionId = params['soVersionId'];
    }); 
  }

  detailsChanged(data) {
    this.externalId = data.externalId;
    this.deliveryRuleId = data.deliveryRuleId;
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSOLineCommentSaved(){
    this.salesOrdersService.partCommentIncrement();
  }

  onSelectedPartInfo(e){
    this.partObjectInfo = e;
  }

  onSOExtraCommentSaved(){
    this.salesOrdersService.extraCommentIncrement();
  }

  onSelectedExtraInfo(e){
    this.extraObjectInfo = e;
  }
  documentCountChanged(e) {
    this.documentCount = e;
  }
  documentsClick() {
    jQuery('#salesOrderDocuments .mdl-documents').modal('show');
  }

  ValidateStateEngineRule(cssSelector){
    if(this.message.length > 0){
      swal({
        title: "Validate Rule Error",
        html: this.message.join('<br>'),
        type: 'error',
      });
    }else{
      jQuery(cssSelector).modal('show');
    }
  }

  toConfirmationPdf(){
    this.ValidateStateEngineRule('.so-confirmation .mdlReportViewer')
  }

  toInternalPdf(){
    this.ValidateStateEngineRule('.so-internal .mdlReportViewer')
  }

  toProFormaPdf(){
    this.ValidateStateEngineRule('.so-proforma .mdlReportViewer')
  }

  hasPermission(permissionNames: Array<string>){
    return _.some(permissionNames, (name) => {
      return _.includes(this.objectPermissionList, name);
    });
  }

  validatePrintingRule(){
    var _self = this;
    this.sharedService.validatePrintRule(this.salesOrderObjectTypeId, this.soId).subscribe(data => {
      if(data.messagesToShow.length > 0){
        _self.message =  data.messagesToShow;
      }
    }); 
  }
}
