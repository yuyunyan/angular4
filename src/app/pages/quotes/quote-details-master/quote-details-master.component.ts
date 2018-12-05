import { QuoteDetailsComponent } from './../quote-details/quote-details.component';
import { PartSourcesComponent } from './../../_sharedComponent/part-sources/part-sources.component';
import { Component, OnInit, ViewEncapsulation, EventEmitter, Renderer, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { SourcingService } from './../../../_services/sourcing.service';
import { AGGridSettingsService } from './../../../_services/ag-grid-settings.service';
import { QuoteService } from './../../../_services/quotes.service';
import { SalesOrdersService } from './../../../_services/sales-orders.service';
import { GridOptions } from "ag-grid";
import { Subject } from 'rxjs/Subject';
import { NotificationsService } from 'angular2-notifications';
import { PermissionService } from './../../../_services/permissions.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { FieldPermission } from './../../../_models/permission/FieldPermission';
import * as _ from 'lodash';
import { SharedService } from './../../../_services/shared.service';
import { CommaThousandSeparator } from './../../../_utilities/CommaThousandSeparator/commaThousandSeparator';
import { DocumentsService } from './../../../_services/documents.service';
import { default as swal } from 'sweetalert2';
import {ObjectTypeEnum} from './../../../_models/shared/objectTypeEnum';

@Component({
  selector: 'az-quote-details-master',
  templateUrl: './quote-details-master.component.html',
  styleUrls: ['./quote-details-master.component.scss'],
  providers: [AGGridSettingsService],
  encapsulation: ViewEncapsulation.None
})
export class QuoteDetailsMasterComponent implements OnInit, OnDestroy {

  isSelected: boolean = false;
  public files: any;
  private quoteId: number;
  private quoteVersionId: number;
  private fileName: string;
  private message: string;
  private userId: number;
  private objectId: number;
  private objectTypeId : number;
  private fileSizeTooLarge: boolean;
  private bodyHeight: number;
  private commaThousandSeparator = new CommaThousandSeparator();

  private linesGrid: GridOptions;
  //private extrasGrid: GridOptions;
  private rowHeight = 30;
  private headerHeight = 30;
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  public partsSelections: Array<Object> = [];
  private extraSelections: Array<Object> = [];
  public customerPO: string;
  private quoteDetailsNotifyOptions = {
    position: ['top', 'right'],
    timeOut: 90000,
    pauseOnHover: true,
    lastOnBottom: true
  };

  private quoteObjectTypeId: number;
  private quoteLineObjectTypeId: number;
  private quoteExtraObjectTypeId: number;
  private sourceObjectTypeId: number;

  private quoteCommentTypeMap: Array<Object>;

  private selectedSourceId: number;
  private selectedQuoteLineId: number;
  private selectedQuoteExtraId: number;
  private selectedQuoteObjectInfo: string;
  private selectedSourceObjectInfo: string;
  private selectedExtraObjectInfo: string;

  private quotePermissions: Array<FieldPermission>;
  private objectPermissionList: Array<any>;
  private totalDocumentsCount = 0;
  private quoteHeader: any;
  private canCreateSalesOrder: boolean = false;
  private generalPermission = 'generalPermission';
  private createSODisabled: boolean = false;
  constructor(
  private DocumentsService: DocumentsService,
    private sharedService: SharedService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private quoteService: QuoteService,
    private renderer: Renderer,
    private notificationsService: NotificationsService,
    private permissionsService: PermissionService,
    private ngxPermissionsService: NgxPermissionsService,
    private sourcingService: SourcingService,
    private salesOrdersService: SalesOrdersService,
    ) {

    if (localStorage.getItem(this.generalPermission)) {
      const permissionList = JSON.parse(localStorage.getItem(this.generalPermission));
      this.ngxPermissionsService.loadPermissions(permissionList);
    }
    this.linesGrid = {
      animateRows: true,
      suppressContextMenu: true,
      enableColResize: true,
      toolPanelSuppressSideButtons: true,
      defaultColDef: { suppressMenu: true }
    };
    // this.extrasGrid = {
    //     animateRows:true,
    //     enableColResize: true
    // };
    this.customerPO = "";

    this.quoteService.getQuoteObjectTypeId().takeUntil(this.ngUnsubscribe.asObservable()).subscribe((objectTypeId) => {
      this.quoteObjectTypeId = objectTypeId;
      if (this.quoteObjectTypeId) {
        this.getTypes();
        const objectId = this.quoteId || 0;
        this.permissionsService.getFieldPermissions(objectId, this.quoteObjectTypeId).subscribe(data => {
          this.quotePermissions = data.fieldPermissionList;
          this.objectPermissionList = data.objectPermissionList;
          this.ngxPermissionsService.loadPermissions(data.objectPermissionList);
        });
      }
    });

  }

  getTypes() {
    this.quoteService.getQuotePartObjectTypeId().takeUntil(this.ngUnsubscribe.asObservable()).subscribe((objectTypeId) => {
      this.quoteLineObjectTypeId = objectTypeId;
    });
    this.quoteService.getQuoteExtraObjectTypeId().takeUntil(this.ngUnsubscribe.asObservable()).subscribe((objectTypeId) => {
      this.quoteExtraObjectTypeId = objectTypeId;
    });
    this.quoteService.getQuoteCommentTypeId().takeUntil(this.ngUnsubscribe.asObservable()).subscribe((commentTypeMap) => {
      this.quoteCommentTypeMap = commentTypeMap;
    });

    this.sourcingService.getSourceObjectTypeId().subscribe((objectTypeId) => {
      this.sourceObjectTypeId = objectTypeId;
    });
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.quoteId = params['quoteId'];
      this.quoteVersionId = params['quoteVersionId'];

    });
  }

  Clicked() {
    this.quoteId++;
    this.quoteVersionId++;
  }

  ngAfterViewInit() {
    this.createLinesGrid();
    // this.createExtrasGrid();

    this.linesGrid.api.showNoRowsOverlay();
    // this.extrasGrid.api.showNoRowsOverlay();
  }

  itemsChanged(event: boolean) {
    this.message = "child items changed";
  }

  contentChange(event: number) {
    this.bodyHeight = event;
  }

  totalDocuments(e) {
    if (e)
      this.totalDocumentsCount = e;
  }

  quoteHeaderChanged(e) {
    if (e)
      this.quoteHeader = e;
  }

  toPdf() {
  this.objectTypeId = ObjectTypeEnum.quoteObjectTypeId;
    this.sharedService.validatePrintRule(this.objectTypeId,this.quoteId).subscribe(data => {
      if(data.messagesToShow && data.messagesToShow.length > 0){
        swal({
          title: "Validate Rule Error",
          html: data.messagesToShow.join('<br>'),
          type: 'error',
        });
      }else{
        jQuery('.mdlReportViewer').modal('show');
      }
    }); 
  }

  documentsClick() {
    jQuery('#quoteDetailsDocModal .mdl-documents').modal('show');
  }
  toSalesOrder() {
    this.fileSizeTooLarge = false;
    console.log("To sales order");
    if (this.partsSelections && this.partsSelections.length === 0) {
      //window.alert("Please select one or more quote lines to add to a new sales order");
      this.notificationsService.alert('Please select one or more quote lines to add to a new sales order');
      // document.getElementById('btnCloseModal').click();
    }
    else {
      jQuery(document.querySelector('#mdlToSalesOrder')).modal('toggle');
      // let lineGridElement = document.querySelector('#linesToSalesOrderGrid').querySelector('.ag-bl');
      // this.renderer.setElementStyle(lineGridElement, 'height', '300px');
      //let extraGridElement = document.querySelector('#extrasToSalesOrderGrid').querySelector('.ag-bl');
      //this.renderer.setElementStyle(extraGridElement, 'height', '300px');
    }

  }
  missingItemId(params) {
    return !params.data.itemId;
  }

  sourceNotMatched(params) {
    return params.data.sourceMatchStatus != "1";
  }

  sourceQty(params) {
    return (params.data.sourceMatchStatus == "1" && params.data.quantity > params.data.sourceMatchQty)
  }
  createLinesGrid() {
    let _self = this;
    let columnDefs = [
      {
        headerName: "Ln",
        field: "lineNo",
        headerClass: "grid-header",
        width: 30,
        minWidth: 30
      },
      {
        headerName: "Part Number",
        field: "partNumber",
        headerClass: "grid-header",
        cellClassRules: { 'required': _self.missingItemId },
        width: 145,
        minWidth: 145
      },
      {
        headerName: "Manufacturer",
        field: "manufacturer",
        headerClass: "grid-header",
        cellClassRules: { 'required': _self.missingItemId },
        width: 155,
        minWidth: 155
      },
      {
        headerName: "Order Qty",
        field: "quantity",
        headerClass: "grid-header",
        cellClassRules: { 'required': _self.sourceNotMatched },
        width: 70,

        minWidth: 70
      },
      {
        headerName: "Sources Qty",
        field: "sourceMatchQty",
        headerClass: "grid-header",
        cellClassRules: { 'required': _self.sourceNotMatched, 'highlight': _self.sourceQty },
        width: 95,
        minWidth: 95
      },
      {
        headerName: "Source",
        field: "sourceType",
        headerClass: "grid-header",
        cellClassRules: { 'required': _self.sourceNotMatched },
        width: 85,
        minWidth: 85
      },
      {
        headerName: "",
        field: "",
        headerClass: "grid-header",
        cellRenderer: function (params) {
          return _self.renderDelete(params, _self);
        },
        width: 35,
        minWidth: 35
      }
    ];

    _self.linesGrid.api.setColumnDefs(columnDefs);
    _self.linesGrid.rowHeight = this.rowHeight;
    _self.linesGrid.headerHeight = this.headerHeight;

  }
  // createExtrasGrid(){
  //   let _self = this;
  //   let columnDefs =  [
  //     {
  //       headerName:"Ln",
  //       field:"lineNum",
  //       headerClass:"grid-header",
  //       width: 35,
  //       minWidth: 35
  //     },
  //     {
  //       headerName:"Extra Name",
  //       field:"extraName",
  //       headerClass:"grid-header",
  //       width: 135,
  //       minWidth: 135
  //     },
  //      {
  //       headerName:"Note",
  //       field:"note",
  //       headerClass:"grid-header",
  //       width: 165,
  //       minWidth: 165
  //     },
  //     {
  //       headerName:"Quantity",
  //       field: "qty",
  //       headerClass:"grid-header",
  //       width: 130,
  //       minWidth: 130
  //     }
  //   ];

  //   this.extrasGrid.api.setColumnDefs(columnDefs);
  //   this.extrasGrid.rowHeight = this.rowHeight;
  //   this.extrasGrid.headerHeight = this.headerHeight;
  // }

  renderDelete(params, _self) {
    let a = document.createElement('a');
    let i = document.createElement('i');
    a.title = 'Remove';
    a.style.cursor = 'pointer';
    i.className = 'fa fas fa-times';
    i.setAttribute('aria-hidden', 'true');
    i.style.color = '#da0303';
    a.style.fontSize = '17pt';
    a.onclick = function () {
      let filteredRows = _self.partsSelections.filter(x => x.quoteLineId != params.data.quoteLineId)
      _self.partsSelections = filteredRows;
      _self.linesGrid.api.setRowData(filteredRows);

      //Check if Create btn should be disabled/enabled
      let disallowedRows = _self.partsSelections.filter(x => x.itemId == 0 || x.itemId == null || x.sourceMatchStatus != "1")
      _self.createSODisabled = (disallowedRows.length > 0);
    }
    a.appendChild(i);
    return a;
  }
  onPartsSelectionChanges(rows) {
    const _self = this;
    _self.partsSelections = [];
    this.createSODisabled = false;
    rows.forEach(part => {
      //Disable Accept button if one part doesnt have an itemId
      if (!part.itemId || part.sourceMatchStatus != "1")
        _self.createSODisabled = true;

      //push to sales order modal
      _self.partsSelections.push({
        quoteLineId: part.quoteLineId,
        lineNo: part.lineNo,
        partNumber: part.partNumber,
        manufacturer: part.manufacturer,
        quantity: part.quantity,
        itemId: part.itemId,
        sourceMatchStatus: part.sourceMatchStatus,
        sourceMatchCount: part.sourceMatchCount,
        sourceMatchQty: part.sourceMatchQty,
        sourceType: part.sourceType
      });
    });
    this.linesGrid.api.setRowData(this.partsSelections);
    (this.partsSelections && this.partsSelections.length > 0) ? this.isSelected = true : this.isSelected = false;
  }

  // onExtrasSelectionChanges(rows){
  //   const _self = this;
  //   _self.extraSelections = [];
  //   rows.forEach(extra => {
  //     _self.extraSelections.push({
  //       quoteExtraId: extra.quoteExtraId,
  //       lineNum: extra.lineNum,
  //       extraName: extra.extraObject.name,
  //       note: extra.note,
  //       qty: extra.qty,
  //     });
  //   });
  //   this.extrasGrid.api.setRowData(this.extraSelections);
  // }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  createSalesOrder() {
    this.quoteService.convertQuoteToSalesOrder(this.quoteId, {
      linesToCopy: this.partsSelections,
      extrasToCopy: this.extraSelections,
      customerPO: this.customerPO
    }).subscribe(response => {
      const self = this;
      if (response.isSuccess) {
        this.objectId = response.soId;
        if(this.files){
        self.DocumentsService.saveDocument(this.objectId, this.objectTypeId, this.files).subscribe(data => {
          let res = data.json();
          if (!res.isSuccess) {
            console.log("error");
          } else {
            jQuery('#mdlToSalesOrder').modal('hide');
            this.router.navigate(['pages/sales-orders/sales-order-details', { soId: response.soId, soVersionId: response.soVersionId }]);
            console.log("success"); 
          }
        })
      }else{
        jQuery('#mdlToSalesOrder').modal('hide');
        this.router.navigate(['pages/sales-orders/sales-order-details', { soId: response.soId, soVersionId: response.soVersionId }]);
      }
      }
    });
  }

  fileChange(event) {
    this.fileSizeTooLarge = false;
		let fileList: FileList = event.target.files;
		if (fileList.length > 0) {
      let file: File = fileList[0];
      if(file.size > 26214400 ){
        this.fileSizeTooLarge = true;
      }else{
      this.files = file;
      this.fileName = file.name;      
      }
    }
	}
	
  onQuotePartCommentSaved() {
    this.quoteService.partCommentIncrement();
  }

  onQuoteExtraCommentSaved() {
    this.quoteService.extraCommentIncrement();
  }

  hasPermission(permissionNames: Array<string>) {
    return _.some(permissionNames, (name) => {
      return _.includes(this.objectPermissionList, name);
    });
  }

  disableDocuments() {
    if (typeof this.quoteId === 'undefined' || this.quoteId == 0) {
      return true;
    }
  }
}
