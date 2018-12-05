import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SourcingService } from './../../../../_services/sourcing.service';
import { RfqsService } from './../../../../_services/rfqs.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { PermissionService } from './../../../../_services/permissions.service';
import { FieldPermission } from './../../../../_models/permission/FieldPermission';
import * as _ from 'lodash';

@Component({
  selector: 'az-rfq-details-master',
  templateUrl: './rfq-details-master.component.html',
  styleUrls: ['./rfq-details-master.component.scss']
})
export class RfqDetailsMasterComponent implements OnInit {

  private rfqId: number;
  private rfqLineId: number;
  private rfqLinePartNumber: string;
  private rfqLineManufacturer: string;
  private rfqLineItemId: number;

  private rfqLineObjectTypeId: number;
  private sourcesJoinObjectTypeId: number;
  private selectedResponseId: number;
  private selectedResponseInfo: string;
  private sourcesJoinCommentUId: number;
  private rfqObjectTypeId: number;
  private rfqCommentTypeMap: Array<object>;
  private onNewRfq: boolean = false;
  private documentCount: number = 0;
  private rfqPermissions: Array<FieldPermission>;
  private objectPermissionList: Array<any>;
  private generalPermission = 'generalPermission';
  private currencyId = 'USD';
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sourcingService: SourcingService,
    private rfqsService: RfqsService,
    private permissionsService: PermissionService,
    private ngxPermissionsService: NgxPermissionsService
    ){ 
    const _self = this;
    this.sourcingService.getSourcesJoinObjectTypeId().subscribe((objectTypeId) => {
      this.sourcesJoinObjectTypeId = objectTypeId;
    });
    this.rfqsService.getVendorRfqLineObjectTypeId().subscribe((objectTypeId) => {
      this.rfqLineObjectTypeId = objectTypeId;
    });
    this.rfqsService.getVendorRfqObjectTypeId().subscribe((objectTypeId) => {
      this.rfqObjectTypeId = objectTypeId;
      if (this.rfqObjectTypeId) {
        const objectId = this.rfqId || 0;
        this.onNewRfq = !this.rfqId;
        this.permissionsService.getFieldPermissions(objectId, this.rfqObjectTypeId).subscribe(data => {
          _self.rfqPermissions = data.fieldPermissionList;
          _self.objectPermissionList = data.objectPermissionList;
          _self.ngxPermissionsService.loadPermissions(data.objectPermissionList);
          console.log('rfqPermissions',this.rfqPermissions);
        });
      }
    });
    this.rfqsService.getRfqCommentTypeId().subscribe((commentTypeMap) => {
      this.rfqCommentTypeMap = commentTypeMap;
    });

    if (localStorage.getItem(this.generalPermission)){
      const permissionList = JSON.parse(localStorage.getItem(this.generalPermission));
      this.ngxPermissionsService.loadPermissions(permissionList);
    }
  }

  ngOnInit() {

    this.route.params.subscribe(params => {
      this.rfqId = +params['rfqId'];
    });

  }

  onRfqLineIdChanged($event){
    if ($event) {

      this.rfqLineId = $event.rfqLineId;
      this.rfqLinePartNumber = $event.partNumber;
      this.rfqLineManufacturer = $event.manufacturer;
      this.rfqLineItemId = $event.itemId;
      //selected mfr/part number
      this.selectedResponseId = undefined;
      this.selectedResponseInfo = undefined;
      this.sourcesJoinCommentUId = undefined;
      this.getSourcesJoinCommentUId();
    }
  }

  onResponseClicked(e){
    this.selectedResponseId = e;
    this.getSourcesJoinCommentUId();
  }

  onObjectInfoChanged(e){
    this.selectedResponseInfo = e;
  }

  getSourcesJoinCommentUId(){
    const _self = this;
    if (_self.rfqLineId && _self.selectedResponseId && _self.rfqLineObjectTypeId) {
      _self.sourcingService.getSourcesJoinCommentUId(_self.rfqLineId, _self.rfqLineObjectTypeId, _self.selectedResponseId).subscribe(
        data => {
          _self.sourcesJoinCommentUId = data > 0 ? data : undefined;
        }
      )
    }
  }

  onResponseCommentSaved(){
    this.rfqsService.partCommentIncrement();
  }

  onNewRfqAdded($newRfqId)
  {
    this.rfqId = $newRfqId;
    if(this.rfqId){
      this.router.navigate(['pages/rfqs/rfq-details', { rfqId: this.rfqId }]);
    }
  }

  onCurrencyIdReturned(currencyValue) {
    if (currencyValue)
      this.currencyId = currencyValue;
  }
  documentCountChanged(e) {
    this.documentCount = e;
  }
  documentsClick() {
    jQuery('#rfqDetailsDocModal .mdl-documents').modal('show');
  }
}
