import { Component, OnInit, Renderer} from '@angular/core';
import { Router } from '@angular/router';
import { Contacts } from './../../../_models/contactsAccount/contacts';
import { QuoteService } from './../../../_services/quotes.service'
import { ItemTypeaheadGridComponent } from './../../_sharedComponent/item-typeahead-in-grid/item-typeahead-grid.component';
import { Locations } from './../../../_models/contactsAccount/locations';
import { LocationService } from './../../../_services/locations.service';
import { SourceService } from './../../sourcing/source.service';
import { NotificationsService } from 'angular2-notifications';
import { RequestToPurchaseService } from './../../../_services/request-to-purchase.service';
import { NumericInputComponent } from './../numeric-input/numeric-input.component';
import { GridOptions } from "ag-grid";
import { Subject } from 'rxjs/Subject';
import { ContactsService } from './../../../_services/contacts.service';
import { SharedService } from './../../../_services/shared.service';
import { PurchaseOrdersService } from '../../../_services/purchase-orders.service';
import { ObjectTypeEnum } from '../../../_models/shared/objectTypeEnum';
@Component({
  selector: 'az-source-to-purchaseorder',
  templateUrl: './source-to-purchaseorder.component.html',
  styleUrls: ['./source-to-purchaseorder.component.scss']
})

/* NOTE: This will need to be put in whatever component uses this component
selectionChanges(){
  let rows = this.partsGrid.api.getSelectedRows();
  let emitData = 
  this.onPartsSelectionChanges.emit({rows: rows, accountId: 1 });
  this.getVendorContacts();
  this.getShipToLocations();
  this.getShipFromLocations();
}
*/

export class SourceToPurchaseorderComponent {
  private createPODisabled: boolean = false;
  private soLinesGrid: GridOptions;
  public partsSelections: Array<any> = [];
  private rowHeight= 30;
  private headerHeight= 30;
  private accountId: number = 0;
  private accountName: string = '';
  // private shipTo: number = 0;
  private warehouseTo: number = 0;
  private organizationId: number =0;
  private objectTypeIdForPo: number = 0;
  // private shipFrom: number = 0;
  private contactId: number = 0;
  private paymentTermId: number = 0;
  private incoTermId: number = 0;
  private buyerName: string = "";
  private buyerId: number = 0;
  private contactsByAccount: Contacts[] = new Array<Contacts>();
  private shipToLocations: Locations[] = new Array<Locations>();
  // private shipFromLocations: Locations[] = new Array<Locations>();
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private paymentTermList;
  private incoTermList;
  private warehouseList: Array<any> = new Array();
  private organizationList: Array<any> = new Array();
  constructor(
    private renderer: Renderer, 
    private quoteService: QuoteService, 
    private locationService: LocationService, 
    private sourcingService: SourceService, 
    private notificationsService: NotificationsService,
    private requestToPurchaseService: RequestToPurchaseService,
    private router: Router,
    private contactsService: ContactsService,
    private sharedService: SharedService,
    private purchaseOrderService:PurchaseOrdersService){

    const _self = this;
    this.soLinesGrid = {
      animateRows: true,
      enableColResize: true,
      toolPanelSuppressSideButtons:true,
      editType: 'fullRow',
      enableGroupEdit:true,
      suppressContextMenu:true,
      context: {
        parentComponent: this
      },
      onRowEditingStopped: function(event){_self.ValidateGridData(event,_self)}
    };

    _self.requestToPurchaseService.GetSourceSelection()
    .takeUntil(this.ngUnsubscribe.asObservable())
    .subscribe(sourcesSelection => {
      jQuery('#mdlToPurchaseOrder').modal('show');
      _self.accountId = sourcesSelection[0].vendorId;
      _self.accountName = sourcesSelection[0].vendorName;
      _self.buyerName = _self.requestToPurchaseService.buyerName;
      _self.buyerId = _self.requestToPurchaseService.buyerId;
      _self.populateDropdowns();
      _self.onPartsSelectionChanges(sourcesSelection)
      _self.soLinesGrid.api.sizeColumnsToFit();
    });

    this.objectTypeIdForPo = ObjectTypeEnum.purchaseOrderTypeId;
  }

  populateDropdowns(){
    const _self = this;
    _self.warehouseTo = 0;
    _self.contactId = 0;
    _self.paymentTermId = 0;
    _self.incoTermId = 0;
    _self.getVendorContacts();
    _self.getOrganizations();
    _self.getAccountInfo();
    _self.getPaymentTermList();
    _self.getIncoTermList();
  }

  getIncoTermList(){
    this.quoteService.getAllIncoterms()
    .takeUntil(this.ngUnsubscribe.asObservable())
    .subscribe(data => {
      this.incoTermList = data;
    });
  }

  getAccountInfo(){
    this.contactsService.getAccountDetails(this.accountId)
    .takeUntil(this.ngUnsubscribe.asObservable())
    .subscribe(data => {
      this.paymentTermId = data.paymentTermId == null? 0: data.paymentTermId;
    });
  }

  getPaymentTermList(){
    this.quoteService.getPaymentTerms()
    .takeUntil(this.ngUnsubscribe.asObservable())
    .subscribe(data => {
      this.paymentTermList = data;
    });
  }

  ngAfterViewInit(){
    this.createLinesGrid();
    this.soLinesGrid.api.showNoRowsOverlay();
  }

  getVendorContacts() {
    this.quoteService.getContactsByAccountId(this.accountId)
    .takeUntil(this.ngUnsubscribe.asObservable())
    .subscribe(data => {
      this.contactsByAccount = data;
    });
  }

  getWarehouseLocations(organizationId:number) {
    this.sharedService.getWarehouses(organizationId)
      .takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(data => {
        this.warehouseList = data;
      });
  }

  getOrganizations(){
    this.purchaseOrderService.getPoObjectTypeId()
      .takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(dataForPoObjectType => {
        this.objectTypeIdForPo = dataForPoObjectType;
        this.sharedService.getAllOrganizations(this.objectTypeIdForPo)
        .takeUntil(this.ngUnsubscribe.asObservable())
        .subscribe(data => {
          this.organizationList = data;
      });
    });
  }
  // getShipToLocations() {
  //   this.locationService.GetShipToLocations(false, true)
  //     .takeUntil(this.ngUnsubscribe.asObservable())
  //     .subscribe(data => {
  //       this.shipToLocations = data;
  //   });
  // }

  // getShipFromLocations() {
  //   this.locationService.getAccountNonBillingLocations(this.accountId)
  //   .takeUntil(this.ngUnsubscribe.asObservable())
  //   .subscribe(data => {
  //     this.shipFromLocations = data;
  //   });
  // }

  onPartsSelectionChanges(data){
    const _self = this;
    _self.partsSelections = [];
    this.createPODisabled = false;
    let idx = 1;
    data.forEach(part => {
      //Disable Accept button if one part doesnt have an itemId
      if (!part.itemId || part.itemId == 0)
        _self.createPODisabled = true;
      //push to sales order modal
      _self.partsSelections.push({
        idx: idx++,
        partNumber: part.partNumber,
        manufacturer: part.manufacturer,
        quantity: part.qty,
        itemId: part.itemId,
        sourceId: part.sourceId,
        soLineId: part.soLineId,
        isIhs: false
      });
    });

    this.soLinesGrid.api.setRowData(this.partsSelections);
    _self.ValidateGridData(null, _self);
  }

  missingItemId(params) {
    return !params.data.itemId;
  }

  qtyInvalid(params) {
    return !(params.data.quantity > 0);
  }

  ValidateGridData(event, _self){
    let disallowedRows = _self.partsSelections.filter(x => x.itemId == 0 || x.itemId == null || !(x.quantity > 0))
    _self.createPODisabled = (disallowedRows.length > 0 || _self.partsSelections.length  == 0);
  }

  triggerSave(){
    this.soLinesGrid.api.stopEditing();
  }

  createLinesGrid(){
    let _self = this;
    let columnDefs =  [
      {
        headerName:"Part Number",
        field:"partNumber",
        headerClass:"grid-header",
        cellClassRules: {'required': _self.missingItemId} ,
        cellEditorFramework: ItemTypeaheadGridComponent,
        cellEditorParams: { keepDisabled: true ,values: {parentClassName : ".poPartsContainer"}
        }, 
        editable: true,
        width: 145,
        minWidth: 145
      },
      {
        headerName:"Manufacturer",
        field:"manufacturer",
        headerClass:"grid-header",
        width: 155,
        minWidth: 155
      },
      {
        headerName:"Qty",
        field: "quantity",
        headerClass:"grid-header",
        editable: true,
        cellClassRules: {'required': _self.qtyInvalid},
        cellEditorFramework: NumericInputComponent,
        cellRenderer: function(params){
          return params.data.quantity? params.data.quantity.toLocaleString(): params.data.quantity
        },
        width: 70,
        minWidth: 70
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
   this.soLinesGrid.api.setColumnDefs(columnDefs);
   this.soLinesGrid.rowHeight = this.rowHeight;
   this.soLinesGrid.headerHeight = this.headerHeight;
  
  }

  renderDelete(params, _self) {
    let a = document.createElement('a');
    let i = document.createElement('i');
    a.title = 'Remove';
    i.className = 'fas fa-times';
    i.setAttribute('aria-hidden','true');
    i.style.color = '#da0303';
    a.className = 'create-po-column-remove';
    a.onclick = function () {
      let filteredRows = _self.partsSelections.filter(x => x.idx != params.data.idx);
      _self.partsSelections = filteredRows;
      _self.soLinesGrid.api.setRowData(filteredRows);
      
      //Check if Create btn should be disabled/enabled
      _self.ValidateGridData(null, _self);
    }
    a.appendChild(i);
    return a;
  }

  createPurchaseOrder(){
    if(this.createPODisabled){
      return;
    }
    this.sourcingService.convertSourceToPurchaseOrder(
      this.buyerId,
      this.accountId,
      this.contactId,
      this.warehouseTo,
      this.paymentTermId,
      this.incoTermId,
      {linesToCopy: this.partsSelections})

      .takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(response => {
      if (response.isSuccess) {
        this.notificationsService.success( 'Good Job', 'Successfully converted source to purchase order.');
        this.requestToPurchaseService.removeSourcesFromCart(this.partsSelections)
        this.router.navigate(['pages/purchase-orders/purchase-order-details', { purchaseOrderId: response.purchaseOrderId, versionId: response.versionId }]);
      } else{
        this.notificationsService.alert("PO Creation Failed", response.errorMessage);
      }
      jQuery('#mdlToPurchaseOrder').modal('hide');
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onOrganizationChange(organizationId){
    this.getWarehouseLocations(organizationId);
  }

}
