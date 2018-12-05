import { Component, OnInit, OnDestroy, Input, Output, OnChanges, SimpleChange, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { InspectionService } from './../../../../_services/inspection.service';
import { InspectionDetails } from './../../../../_models/quality-control/inspection/inspectionDetails';
import { environment } from './../../../../../environments/environment';
import { Router } from '@angular/router';
import { ItemsService} from './../../../../_services/items.service';
import { ItemDetails } from './../../../../_models/Items/itemdetails';
import { PoSoUtilities } from './../../../../_utilities/po-so-utilities/po-so-utilities'; 

@Component({
  selector: 'az-inspection-details',
  templateUrl: './inspection-details.component.html',
  styleUrls: ['./inspection-details.component.scss']
})
export class InspectionDetailsComponent implements OnInit, OnDestroy {
  @Input() inspectionId:number = 0;
  @Input() quanityPassed: number = 0;
  @Input() acceptedDiscrepant: number = 0;
  @Input() rejectedDiscrepant: number = 0;
  @Input() conclusionDataInput: any[];

  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private inspDetails: InspectionDetails;
  private inspectionReportUrl: string;
  private identifiedStockReportUrl: string;
  private discrepantStockReportUrl: string;
  private itemDetails:ItemDetails;

  private inspectionReportClass = 'inspection-report';
  private identifiedStockReportClass = 'identified-stock-report';
  private discrepantStockReportClass = 'discrepant-identified-stock-report';
  private landscape = 'landscape';
  @Output() documentCount = new EventEmitter();
  @Output() poQuantity = new EventEmitter();
  @Output() resultIdEmitter= new EventEmitter<number>();
  @Output() completed= new EventEmitter<boolean>();
  constructor(private _inspectionService: InspectionService, private router: Router,private _itemsService: ItemsService, private sopoUtilities: PoSoUtilities) { }

  ngOnInit() {
    this.inspDetails = new InspectionDetails(); //New instance prevents initial "undefined" value
    this.itemDetails = new ItemDetails();
  }

  ngOnChanges(changes:{[propKey:string]:SimpleChange})
  {
    let idProp = changes["inspectionId"];
    if (idProp) {
      this.inspectionId = idProp.currentValue;
      this.GetInspectionDetails(this.inspectionId);
    }

    let totalQtyPassedProp = changes["quanityPassed"];
    let totalQtyAcceptedProp = changes["acceptedDiscrepant"];
    let totalQtyRejectedProp = changes["rejectedDiscrepant"];
    let qtyFailedConclusionProp = changes["conclusionDataInput"];

    if (qtyFailedConclusionProp) {
      this.conclusionDataInput = qtyFailedConclusionProp.currentValue;
    }
    if (totalQtyPassedProp && totalQtyPassedProp.currentValue) {
      this.quanityPassed = totalQtyPassedProp.currentValue;
    }
    if (totalQtyAcceptedProp && totalQtyAcceptedProp.currentValue) {
      this.acceptedDiscrepant = totalQtyAcceptedProp.currentValue;
    }
    if (totalQtyRejectedProp && totalQtyRejectedProp.currentValue) {
      this.rejectedDiscrepant = totalQtyRejectedProp.currentValue;
    }
      this.setReportUrl();
    
  }

GetInspectionDetails(inspectionId){

  this._inspectionService.GetInspectionDetails(this.inspectionId).takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
    data => {
      this.inspDetails = data;
      this.poQuantity.emit(data.ItemQty);
      this.resultIdEmitter.emit(data.ResultID);
      this.completed.emit(data.CompletedByUser? true : false)
      this.setReportUrl();
      this._itemsService.GetItemDetails(this.inspDetails.ItemID).subscribe(data=>{
        this.itemDetails = data.results;
      })
      console.log("inspectionDetails",this.inspDetails);
    },
    error => { }
  );
}


setReportUrl() {
  if (this.inspDetails) {
    var _self = this;
    var today = new Date();
    var qtyFailedCount = 0;
    var qtyPassedCount = this.quanityPassed? this.quanityPassed : 0;
    var discrepantAcceptedCount = this.acceptedDiscrepant? this.acceptedDiscrepant : 0;
    var discrepantRejectedCount = this.rejectedDiscrepant? this.rejectedDiscrepant : 0;
    var showFooter = ((this.inspDetails.additionalPhotoCount == 0 && this.inspDetails.answerPhotoCount == 0)? false : true);
    //generate datecode
    var dateString = today.getFullYear() + '/' + (today.getMonth() + 1) + '/' + today.getDate();
    let userId = this.inspDetails.UserID
    
    //Sum up qtyFailed from array
    if (_self.conclusionDataInput)
      for (var i = 0; i < _self.conclusionDataInput.length; i++) {
        qtyFailedCount += _self.conclusionDataInput[i].qtyFailed;
      }

    //set report URL's
    this.inspectionReportUrl = '/ReportViewer/inspection.html?inspectionId=' + this.inspectionId + '&userId=' + userId + '&acceptedDiscrepant=' + discrepantAcceptedCount + '&rejectedDiscrepant=' + discrepantRejectedCount + '&qtyFailed=' + qtyFailedCount + '&qtyPassed='+ qtyPassedCount + '&showFooter=' + showFooter + '&apiUrl=' + environment.apiEndPoint
    this.identifiedStockReportUrl = '/ReportViewer/inspectionidentifiedstock_container.html?inspectionId=' + this.inspectionId;
    // this.identifiedStockReportUrl = '/ReportViewer/identifiedstock.html?inspectionId=' + this.inspectionId;
    // this.discrepantStockReportUrl = '/ReportViewer/discrepantidentifiedstock.html?inspectionId=' + this.inspectionId;
  }
}


documentCountChanged(e) {
  if (e)
  this.documentCount.emit(e);
}

onOwnershipClick(event){
  jQuery('#inspectionDocModal').modal('toggle');
}

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }


  routeItem() {
    this.router.navigate(['pages/items/items/item-details',{itemId: this.inspDetails.ItemID }]);
  }

  routeCustomer() {
    this.router.navigate(['pages/accounts/account-details',{accountId: this.inspDetails.CustomerAccountID }]);
  }

  routeVendor() {
    this.router.navigate(['pages/accounts/account-details',{accountId: this.inspDetails.VendorAccountID }]);
  }
  routePO(){
    var url=  `/pages/purchase-orders/purchase-order-details;purchaseOrderId=${this.inspDetails.PurchaseOrderID };versionId=${this.inspDetails.POVersionID}`;
    var newWindow= window.open(url,"_blank");
  }

  routeSO(){
    var url= `/pages/sales-orders/sales-order-details;soId=${this.inspDetails.SalesOrderID };soVersionId=${this.inspDetails.SOVersionID}`;
    //var url= `/pages/sales-orders/sales-order-details;soId=100007;soVersionId=2`;
    var newWindow = window.open(url,"_blank");
  }


}