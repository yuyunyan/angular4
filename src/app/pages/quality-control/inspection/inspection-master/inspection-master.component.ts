import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { PermissionService } from './../../../../_services/permissions.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { FieldPermission } from './../../../../_models/permission/FieldPermission';
import { CheckList } from './../../../../_models/quality-control/inspection/checkList';
import { InspectionService } from './../../../../_services/inspection.service';
import { Subject } from 'rxjs/Subject';
import * as _ from 'lodash'

@Component({
  selector: 'az-inspection-master',
  templateUrl: './inspection-master.component.html',
  styleUrls: ['./inspection-master.component.scss']
})
export class InspectionMasterComponent implements OnInit {

  private inspectionId:number;
  private totalDocumentsCount: number = 0;
  private inspectionComplete: boolean = false;
  private checklist:CheckList[];
  private conclusionData:any[];
  private insIsComplete : boolean;
  private resultId:number;
  private totalQtyPassed:number;
  private totalQtyAccepted:number;
  private totalQtyRejected:number;
  private warehouseBinId: number;
  private discrepantIdentifiedStockReportCssSelector: string = 'discrepant-identified-stock-report';
  private identifiedStockReportCssSelector: string = 'identified-stock-report';
  private inspectionReportCssSelector: string = 'inspection-report'
  private poQuantity:number;
  private stockDetails:any;
  private itemBreakdownComponent:any;
  private ngUnsubscribe: Subject<void> = new Subject<void>()

  constructor(private activatedRoute:ActivatedRoute, private inspectionService : InspectionService) {
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params:Params)=>{
    this.inspectionId = params['inspectionId'];
    this.disableOnCompleteInspection(this.inspectionId);
  });

  }


  disableOnCompleteInspection(inspectionId){
    this.insIsComplete = false;
          this.inspectionService.GetInspectionDetails(this.inspectionId).takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
            data => {
              if(data.CompletedBy > 0){
                this.insIsComplete = true;
                jQuery(".itemBreakDown input, .itemBreakDown select,.itemBreakDown button,.itemBreakDown span,.itemBreakDown .deleteStockBtn").attr('disabled', true)
                jQuery('#breakdownLines').css("pointer-events", "none");
                jQuery("image-upload input").attr('disabled', true)
              }
            })
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  qtyPassed(e) {
    if (e >= 0)
      this.totalQtyPassed= e;
  }
  qtyAccepted(e) {
    if (e>=0)
      this.totalQtyAccepted = e;
  }
  qtyRejected(e) {
   if (e>=0)
    this.totalQtyRejected = e; 
  }

  warehouseBin(e){
    if (e)
      this.warehouseBinId = e;
  }
  stockArray(e){
    if(e)
      this.stockDetails = e;
  }
  
  setItemBreakdownComponent(e){
    if(e){
     this.itemBreakdownComponent=e;
    }
  }

  totalDocuments(e) {
    if (e)
      this.totalDocumentsCount = e;
  }
  inspectionCompleted(e){
    if (e)
      this.inspectionComplete = e;
  }
  documentsClick() {
    jQuery('#inspectionDocModal .mdl-documents').modal('toggle');
  }
  toPdf(parentClass = ''){
    console.log("pdf clicked");
    //targets report-modal.component nested in quote-details.component
    jQuery('.' + parentClass + ' .mdlReportViewer').modal('show');
  }
  conclusionEmitterDataChange(conclusionData){
   this.conclusionData = conclusionData;
   console.log('Conclusion Daata', conclusionData)
  }
  resultIdEmitterChange(e){
   this.resultId = e;
  }
  poQuantityChange(e){
    this.poQuantity = e;
  }

}
