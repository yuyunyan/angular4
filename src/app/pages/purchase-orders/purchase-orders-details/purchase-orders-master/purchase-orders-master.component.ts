import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PurchaseOrdersService } from './../../../../_services/purchase-orders.service';
import { Subject } from 'rxjs/Subject';
import { PermissionService } from './../../../../_services/permissions.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { FieldPermission } from './../../../../_models/permission/FieldPermission';
import { PoSoUtilities } from './../../../../_utilities/po-so-utilities/po-so-utilities';
import * as _ from 'lodash';

@Component({
  selector: 'az-purchase-orders-master',
  templateUrl: `./purchase-orders-master.component.html`,
  styleUrls: [`./purchase-orders-master.component.scss`],
  encapsulation: ViewEncapsulation.None
})
export class PurchaseOrdersMasterComponent {
  
  private poId: number ;
  private poVersionId: number;
  private currencyId: string;
  private externalId: string;

  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private purchaseOrderObjectTypeId: number;
  private poLineObjectTypeId: number;
  private poExtraObjectTypeId: number;
  private poCommentTypeMap: number;

  private partObjectInfo: string;
  private extraObjectInfo: string;
  private purchaseOrderPermissions: Array<FieldPermission>;
  private objectPermissionList: Array<any>;
  private onNewPurchase: boolean = false;
  private documentCount = 0;
  constructor(
    private route: ActivatedRoute,
    private purchaseOrdersService: PurchaseOrdersService,
    private permissionsService: PermissionService,
    private ngxPermissionsService: NgxPermissionsService,
    private posoUtilities: PoSoUtilities
    ) {
    const _self = this;
    this.purchaseOrdersService.getPurchaseOrderObjectTypeId()
      .takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe((objectTypeId) => {
      this.purchaseOrderObjectTypeId = objectTypeId;
      if (this.purchaseOrderObjectTypeId) {
        const objectId = this.poId || 0;
        this.onNewPurchase = !this.poId;
        this.permissionsService.getFieldPermissions(objectId, this.purchaseOrderObjectTypeId).subscribe(data => {
          _self.purchaseOrderPermissions = data.fieldPermissionList;
          _self.objectPermissionList = data.objectPermissionList;
          _self.ngxPermissionsService.loadPermissions(data.objectPermissionList);
        });
      }
    });
    this.purchaseOrdersService.getPOLinesObjectTypeId().takeUntil(this.ngUnsubscribe.asObservable()).subscribe((objectTypeId) => {
      this.poLineObjectTypeId = objectTypeId;
    });
    this.purchaseOrdersService.getPOExtraObjectTypeId()
      .takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe((objectTypeId) => {
      this.poExtraObjectTypeId = objectTypeId;
    });
    this.purchaseOrdersService.getPurchaseOrderCommentTypeId().takeUntil(this.ngUnsubscribe.asObservable()).subscribe((commentTypeMap) => {
      this.poCommentTypeMap = commentTypeMap;
    });
  }



  toPdf(){
    console.log("pdf clicked");
    //targets report-modal.component nested in purchase-order-details.component
    jQuery('.mdlReportViewer').modal('show');
  }
  ngOnInit(){
    this.route.params.subscribe(params => {
      this.poId = +params['purchaseOrderId'];
      this.poVersionId = +params['versionId'];
    });
  }

  newDetails(e){
    this.externalId = e.externalId;
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onPOLineCommentSaved(){
    this.purchaseOrdersService.partCommentIncrement();
  }

  onPOExtraCommentSaved(){
    this.purchaseOrdersService.extraCommentIncrement();
  }

  onPartObjectInfo(e){
    this.partObjectInfo = e;
  }

  onExtraObjectInfo(e){
    this.extraObjectInfo = e;
  }

  hasPermission(permissionNames: Array<string>){
    return _.some(permissionNames, (name) => {
      return _.includes(this.objectPermissionList, name);
    });
  }

  documentsCountChanged(e){
    this.documentCount = e;
  }
  documentsClick() {
    jQuery('#purchaseOrderDocModal .mdl-documents').modal('show');
  }

}
