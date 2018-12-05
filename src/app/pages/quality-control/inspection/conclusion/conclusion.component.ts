import { Component, OnInit, Input, OnChanges, SimpleChange, Pipe, PipeTransform } from '@angular/core';
import { InspectionService } from './../../../../_services/inspection.service';
import { Conclusion } from './../../../../_models/quality-control/inspection/conclusion';
import { NotificationsService } from 'angular2-notifications';
import { Subject } from 'rxjs/Subject';
import { GridOptions } from "ag-grid";
import { QCResult } from './../../../../_models/quality-control/inspection/qcResult';
import { default as swal } from 'sweetalert2';
import { Loading } from './../../../_sharedComponent/loading/loading';
import { InspectionDetails } from './../../../../_models/quality-control/inspection/inspectionDetails';
import { CheckList } from './../../../../_models/quality-control/inspection/checkList';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import { environment } from './../../../../../environments/environment';

@Component({
  selector: 'az-conclusion',
  templateUrl: './conclusion.component.html',
  styleUrls: ['./conclusion.component.scss']
})
export class ConclusionComponent implements OnInit {

  @Input() inspectionId: number;
  @Input() conclusionDataInput: any[];
  @Input() selectedResultId: number;
  @Input() quanityPassed: number;
  @Input() acceptedDiscrepant: number;
  @Input() rejectedDiscrepant: number;
  @Input() poQuantity:number;
  @Input() warehouseBinId: number;
  @Input() stockDetails: any;
  @Input() itemBreakdownComponent:any;

  private conc: Conclusion;
  private insBtnDisabled : boolean;
  private notInpsected: boolean;
  private rowData: any[];
  private checkLists: CheckList[];
  public inspDetails: InspectionDetails;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private conclusionGrid: GridOptions;
  private quantityScoreOptions: QCResult[];
  private resultIdStatus: boolean;
  private defaultResultOption: number = 999;
  private totalInspected: number;
  private totalInspectedMatch: boolean;
  private loading: Loading;
  private busyConfig: any;
  private inspectionReportDownloadUrl: string = '';
  private identifiedStockReportDownloadUrl: string = '';
  private finalInspectionReportDownloadUrl: string = '';
  private inspectionReportParam = {};
  public notifyOptions = {
    position: ['top', 'right'],
    timeout: 3000,
    lastOnBottom: true
  }

  constructor(private router: Router,private inspectionService: InspectionService, private _notificationsService: NotificationsService) {
    this.loading = new Loading(true);
    this.busyConfig = this.loading.busyConfig;
    
    this.conclusionGrid = {
      animateRows: true,
      enableColResize: true,
      rowHeight: 35,
      suppressContextMenu:true,
      paginationPageSize:5,
      toolPanelSuppressSideButtons:true,
      defaultColDef:{
        suppressMenu:true
      },
      localeText: { noRowsToShow: 'No Rows to Show' },
      columnDefs: [
        {
          headerName: "Checklist",
          field: "checkListName",
          headerClass: "grid-header",
          width: 150,
          cellClass: 'center-content'
        },
        {
          headerName: "Question",
          field: "questionText",
          headerClass: "grid-header",
          width: 400
        },
        {
          headerName: "Qty Failed",
          field: "qtyFailed",
          headerClass: "grid-header",
          width: 150
        },
        {
          headerName: "Comments",
          field: "comments",
          headerClass: "grid-header",
          width: 450
        }
      ]
    }
  }

  ngOnInit() {
    this.conc = new Conclusion();
    this.getConclusion();
    this.getInspectionDetails();
    this.bindModalCloseRoute();
  };
  bindModalCloseRoute() {
    var _self = this;
    jQuery('#mdlShowConclusionDocuments').on('hidden.bs.modal', function () {
      _self.router.navigate(['pages/quality-control/inspections']);
    })
  }

  getInspectionDetails(){
    this.insBtnDisabled = false;
    this.inspectionService.GetInspectionDetails(this.inspectionId).takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
      data => {
        this.inspDetails = data;
        if(this.inspDetails.CompletedDate){
         this.insBtnDisabled = true;
        }
      })
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    let idProp = changes["inspectionId"];
    let qtyFailedConclusionProp = changes["qtyFailedConclusion"];
    let resultIdProp = changes["resultId"];
    let poQuantityProp = changes["poQuantity"];
    let warehouseBinProp = changes["warehouseBinId"];
    let stockDetailsProp = changes["stockDetails"];

    if (idProp && idProp.currentValue) {
      this.inspectionId = idProp.currentValue;
    }
    if (qtyFailedConclusionProp && qtyFailedConclusionProp.currentValue) {
      this.conclusionDataInput = qtyFailedConclusionProp.currentValue;
    }
    if (resultIdProp && resultIdProp.currentValue) {
      this.selectedResultId = resultIdProp.currentValue;
    }
    if (this.selectedResultId) {
      this.resultIdStatus = true;
    }
   
    if(poQuantityProp && poQuantityProp.currentValue){
      this.poQuantity = poQuantityProp.currentValue;
    }

    if(warehouseBinProp && warehouseBinProp.currentValue){
      this.warehouseBinId = warehouseBinProp.currentValue;
    }

    if(stockDetailsProp && stockDetailsProp.currentValue){
      this.stockDetails = stockDetailsProp.currentValue;
      console.log(this.stockDetails);
    }

    
    if (this.conclusionDataInput) {
      this.populateGrid();
    }

    this.getQualityScoreOptions();
    let quanityPassed = +(this.quanityPassed ? this.quanityPassed : 0);
    let rejectedDiscrepant = +(this.rejectedDiscrepant ? this.rejectedDiscrepant : 0);
    let acceptedDiscrepant = +(this.acceptedDiscrepant ? this.acceptedDiscrepant : 0);
    this.totalInspected = quanityPassed + rejectedDiscrepant + acceptedDiscrepant;
    if (this.totalInspected == this.poQuantity) {
      this.totalInspectedMatch = true;
    }
    else{ this.totalInspectedMatch = false}
   
  }

  populateGrid() {
    this.rowData = this.conclusionDataInput.map(data => {
      return {
        checkListName: data.checkListName,
        questionText: data.questionText,
        qtyFailed: data.qtyFailed,
        comments: data.comments
      }

    })
    this.conclusionGrid.api.setRowData(this.rowData);
  }

  getConclusion() {

    this.inspectionService.GetInspectionConclusion(this.inspectionId).takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
      data => {
        this.conc = data;
        console.log('Inpspection Conclusion :', this.conc);
      },
      error => { }
    )
  }

  saveConclusion(isSync:any) {
    var isItemBreakDownValid= this.itemBreakdownComponent.checkTabAndGridValidation();
    console.log('isItemBreakDownValid save and hold',isItemBreakDownValid);
    this.inspectionService.SetInspectionConclusion(this.inspectionId,this.conc.Conclusion, this.stockDetails).takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
      data => {
        if (data.json() == 0) {
          if(isSync){
           this.completeInspectionIfAllInspected();
          }
        }
      },
      error => { }
    )
    console.log("conclusion saved");
  }

  completeInspectionIfAllInspected(){
    var isItemBreakDownValid= this.itemBreakdownComponent.checkTabAndGridValidation();
    console.log('isItemBreakDownValid',isItemBreakDownValid);
   
    this.inspectionService.getCheckLists(this.inspectionId).takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
        checkLists => {
            let removedAddedByUser = checkLists.filter(e => e.addedByUser == false)
            let questions = _.flatten(_.map(removedAddedByUser, (checklist) => {return checklist.questions;}));
            let unInspectedQuestions = questions.some((question => question.inspected == false)); 
            if(unInspectedQuestions){
              this.notInpsected = true;
            }
            if(unInspectedQuestions){
              swal({
                title: 'Please complete all checklist questions before completing the inspection.',
                type: 'warning',
                showCancelButton: false,
                confirmButtonText: 'OK'
              });
            }
            else if(isItemBreakDownValid==false){
              swal({
                title: 'One or more stocks have no item breakdown lines or are missing a DateCode. Please add a line or delete the stock before completing.',
                type: 'warning',
                showCancelButton: false,
                confirmButtonText: 'OK'
              })
            }
          else{    
            this.completeInspection();
          }
        })
  }

  completeInspection() {
    const _self = this;
    if (this.totalInspectedMatch && this.resultIdStatus) {
      this.synacToSAP(_self);
    }
    else if(this.resultIdStatus) {
      swal({
        title: 'Total Inspected does not match Inspection Quantity. Please adjust Item Breakdown lines.',
        type: 'warning',
        showCancelButton: false,
        confirmButtonText: 'OK'
      })
    }    
    else if(this.totalInspectedMatch) {
      swal({
        title: 'Quality Score has not been set.  A value must be set before completing the inspection.',
        type: 'warning',
        showCancelButton: false,
        confirmButtonText: 'OK'
      })
    }
    else{
      swal({
        title: 'Quality Score has not been set; Total Inspected does not match Inspection Quantity; These issues must be fixed before completing.',
        type: 'warning',
        showCancelButton: false,
        confirmButtonText: 'OK'
      })
    }
  }

  getQualityScoreOptions() {
    this.inspectionService.getQuantityScore().subscribe(data => {
      this.quantityScoreOptions = data;
    })
  }
  onScoreOptionChange(e) {
    this.selectedResultId = e.target.value;
    this.inspectionService.updateQuantityScore(this.inspectionId, this.selectedResultId).subscribe(data => {
      if (data.isSuccess) {
        this.resultIdStatus = true;
      }
    })
  }
  synacToSAP(_self) {
    swal({
      title: 'Are you sure you want to complete this inspection and submit it to SAP? You cannot make any changes once completed.',
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
    }).then(function () {
      swal('Completing inspection...');
      swal.showLoading()
      _self.busyConfig.busy = _self.inspectionService.syncInspectionToSap(_self.inspectionId).takeUntil(_self.ngUnsubscribe.asObservable()).subscribe(
        data => {
          _self.exportMergedInspectionReport();
        },
        (dismiss) => {
        });
    },
      function () {
        //cancel
      });
  }

  exportMergedInspectionReport(){
    var _self = this;
    var inspectionReportExportdata = {
      acceptedDiscrepant: _self.acceptedDiscrepant | 0,
      rejectedDiscrepant: _self.rejectedDiscrepant | 0,
      qtyFailed: _self.totalInspected - _self.quanityPassed | 0,
      qtyPassed: _self.quanityPassed | 0,
      apiUrl:  environment.apiEndPoint
    }
    _self.inspectionService.exportFinalInspectionReport(_self.inspectionId, inspectionReportExportdata).takeUntil(_self.ngUnsubscribe.asObservable()).subscribe(
      data => {
        if (data) {
          _self.finalInspectionReportDownloadUrl = data;
          jQuery('#mdlShowConclusionDocuments').modal('show');
          swal.close()
        }
        else {
          console.log('Inspection Report for inspection ' + _self.inspectionId + ' failed to load')
        }
      },
      error => { }
    )
  }

  exportInspectionReport() {

    var _self = this;
    var inspectionReportExportdata = {
      acceptedDiscrepant: _self.acceptedDiscrepant | 0,
      rejectedDiscrepant: _self.rejectedDiscrepant | 0,
      qtyFailed: _self.totalInspected - _self.quanityPassed | 0,
      qtyPassed: _self.quanityPassed | 0,
      apiUrl:  environment.apiEndPoint
    }
    _self.inspectionService.exportInspectionReport(_self.inspectionId, inspectionReportExportdata).takeUntil(_self.ngUnsubscribe.asObservable()).subscribe(
      data => {
        if (data) {
        _self.inspectionReportDownloadUrl = environment.apiEndPoint.replace(/\/$/, "") + '/' + data;
        _self.exportConclusionReport();
        }
        else {
          console.log('Inspection Report for inspection ' + _self.inspectionId + ' failed to load')
        }
      },
      error => { }
    )
  }
  

  exportConclusionReport() {

    var _self = this;
    _self.inspectionService.exportConclusionReport(_self.inspectionId).takeUntil(_self.ngUnsubscribe.asObservable()).subscribe(
      data => {
        if (data) {
        _self.identifiedStockReportDownloadUrl = environment.apiEndPoint.replace(/\/$/, "") + '/' + data;
        jQuery('#mdlShowConclusionDocuments').modal('show');
        swal.close()
        }
        else {
          console.log('Conclusion Report for inspection ' + _self.inspectionId + ' failed to load')
        }
      },
      error => { }
    )
  }
  
  printMergedReport(){
    var _self = this;
    var printWindow = window.open(environment.apiEndPoint.replace(/\/$/, "") + '/ReportViewer/reportprinter.html?reportUrl=' + _self.finalInspectionReportDownloadUrl);
  }
  downloadReports(){
    var _self = this;
    var inspectionFileName = 'Inspection_' + _self.inspectionId + '_Overview.pdf';
    var identifiedStockFileName = 'Inspection_' + _self.inspectionId + '_Identified_Stock.pdf';
    //Inspection report
    if (this.inspectionReportDownloadUrl) {
      _self.inspectionService.downloadFile(this.inspectionReportDownloadUrl, inspectionFileName);
    }

    //Identified stock report
    if (this.identifiedStockReportDownloadUrl) {
      _self.inspectionService.downloadFile(this.identifiedStockReportDownloadUrl, identifiedStockFileName);
    }
  }
}
