import { Component, Input, SimpleChange, ViewEncapsulation, Output, EventEmitter,OnDestroy,AfterViewInit } from '@angular/core';
import { GridOptions, ColumnApi, RowNode } from "ag-grid";
import { Observable } from 'rxjs';
import { PurchaseOrderExtra } from './../../../../_models/purchase-orders/purchaseOrderExtra';
import { ItemExtra } from './../../../../_models/Items/itemExtra';
import { ItemsService } from './../../../../_services/items.service';
import { PurchaseOrdersService } from './../../../../_services/purchase-orders.service';
import { SelectEditorComponent } from './../../../_sharedComponent/select-editor/select-editor.component';
import { CustomHeaderComponent } from './../../../_sharedComponent/az-custom-header/az-custom-header.component';
import { Subject } from 'rxjs/Subject';
import { AGGridSettingsService } from './../../../../_services/ag-grid-settings.service';
import { ErrorManagementService } from './../../../../_services/errorManagement.service';
import { NgxPermissionsService } from 'ngx-permissions';

@Component({
  selector: 'az-purchase-orders-extra',
  templateUrl: './purchase-orders-extra.component.html',
  styleUrls: ['./purchase-orders-extra.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [AGGridSettingsService]
})
export class PurchaseOrdersExtraComponent implements OnDestroy,AfterViewInit {
  
  @Input() poId;
  @Input() poVersionId;
  @Output() onRowClicked = new EventEmitter<number>();
  @Output() objectInfo = new EventEmitter<string>();
  private rowDataSet =[];
  private poExtraItems: Array<PurchaseOrderExtra>;
  private itemExtras: Array<ItemExtra>;
  private agGridOptions: GridOptions;
  private AcData = [];
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private gridName = 'purchase-order-extra';
  private rowHeight = 30;
  private headerHeight = 30;
  private _rowCount: number = 0;

  private _selectedRowNode: RowNode;
  private poExtraObjectTypeId: number;
  private hoverObjectInfo: string;
  private hoverObjectId: number;
  private clickedPOExtraId: number;
  private clickedObjectInfo: string;

  constructor(
    private purchaseOrdersService: PurchaseOrdersService, 
    private agGridSettings: AGGridSettingsService, 
    private errorManagementService: ErrorManagementService,
    private ngxPermissionsService: NgxPermissionsService
  ) {
    const _self = this;
    this.agGridOptions = {
      enableColResize: true,
      onRowEditingStopped: (event) => {
        _self.onEditCell(event.node.data);
      },
      editType: 'fullRow',
      singleClickEdit: false,
      suppressRowClickSelection: true,
      pagination: true,
      paginationPageSize: 25,
      toolPanelSuppressSideButtons:true,
      suppressContextMenu:true,
      rowSelection: 'multiple',
      onViewportChanged: function() {
        _self.agGridOptions.api.sizeColumnsToFit();
      },
      headerHeight: 30,
      rowHeight: 30
    };
    this.purchaseOrdersService.getExtraCommentStatus().subscribe(
      data => {
        if (data.increment){
          _self.commentCountIncrement()
        }
      }
    )

    this.purchaseOrdersService.getPOExtraObjectTypeId()
      .takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe((objectTypeId) => {
      this.poExtraObjectTypeId = objectTypeId;
    });

    this.ngxPermissionsService.permissions$.subscribe((permissions) => {
      const canEditExtra = permissions['CanEditExtras'];
      if (canEditExtra) {
        _self.createACGrid(_self.poExtraItems, _self.itemExtras, true);
        _self.populateGrid(_self.poExtraItems);
      }
    });
  }

  onAddRow(){
    var newItem = this.createRow(this.craeteNewPOExtra());
    
    this.rowDataSet.push(newItem);
    this.agGridOptions.api.setRowData(this.rowDataSet);

    let rowIndex = this.rowDataSet.length - 1;
    this.startEditingRow(rowIndex);
    this._rowCount += 1;
    this.setHeightOfGrid(this._rowCount);
  }

  ngAfterViewInit(): void {
    jQuery(".purchaseExtraGridOuter .quotePartsButton").appendTo(".purchaseExtraGridOuter .ag-paging-panel");
  }

  deleteSelectedRows(){
    let rows = this.agGridOptions.api.getSelectedRows();
    let poExtrasToDelete = rows.map(x => x.poExtraId);
    let _self = this;
    this.purchaseOrdersService.deletePurchaseOrderExtra(poExtrasToDelete).takeUntil(this.ngUnsubscribe.asObservable())
    .subscribe(
      success => {
          if(success)
          {
            poExtrasToDelete.forEach(itemToDelete =>
            {
              let indexOfItem = _self.rowDataSet.findIndex(x => x.poExtraId == itemToDelete);
              _self.rowDataSet.splice(indexOfItem, 1);
            });
          };
          _self.agGridOptions.api.setRowData(_self.rowDataSet);
      },
      error => {
        this.handleAlert(-1);
      }
    );
    this.purchaseOrdersService.getExtraCommentStatus().subscribe(
      data => {
        if (data.increment){
          _self.commentCountIncrement()
        }
      }
    )
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange })
  {
    let poIdProp = changes['poId'];
    let poVersionIdProp = changes['poVersionId'];

    this.poId = poIdProp.currentValue;
    this.poVersionId = poVersionIdProp.currentValue;
    
    if(this.poId && this.poVersionId)
    {
      this.getPOExtraItems();
    }
  }
  
  getPOExtraItems(){
    this.purchaseOrdersService.getPurchaseOrderExtraData(this.poId, this.poVersionId, 0, 25).takeUntil(this.ngUnsubscribe.asObservable())
    .subscribe(
      data => {
        const permissions = this.ngxPermissionsService.getPermissions();
        let editable = false;
        if (permissions['CanEditExtras']) {
          editable = true;
        }
        let height = data[0].length < this.agGridOptions.paginationPageSize ? data[0].length: this.agGridOptions.paginationPageSize;
        this._rowCount = height == 0 ? 7: height + 4;
        this.setHeightOfGrid(this._rowCount);

        this.poExtraItems = data[0];
        this.itemExtras = data[1].itemExtras;
        this.createACGrid(data[0], this.itemExtras, editable);
        this.populateGrid(data[0]);
        this.loadGridState();
      }
    )
  }

  createACGrid(poExtraItems: PurchaseOrderExtra[], itemExtras: ItemExtra[], editable: boolean){
    const _self = this;
    const columnDefs = [
      {
        headerName: "",
        field: null,
        headerClass: "grid-header",
        checkboxSelection: true,
        width: 40,
        lockPinned: true,
        pinned: "left"
      },
      {
        headerName: "Ln",
        field: "lineNum",
        headerClass: "grid-header",
        width: 40
      },
      {
        headerName: "Ref Ln",
        field: "refLineNum",
        headerClass: "grid-header",
        editable: editable,
        width: 50,
      },
      {
        headerName: "Extra Item",
        field: "extraObject",
        headerClass: "grid-header",
        editable: editable,
        cellEditorFramework: SelectEditorComponent,
        cellRenderer: function(params) {
          return params.value.name
        },
        cellEditorParams: {
          values: itemExtras.map(x => {
            return {id:x.itemExtraId, name:x.extraName}
          })
        },
        width: 195
      },
      {
        headerName: "Note",
        field: "note",
        headerClass: "grid-header",
        editable: editable,
        width: 185
      },
      {
        headerName: "Quantity",
        field: "qty",
        headerClass: "grid-header",
        editable: editable,
        cellClass: 'text-right',
        width: 40
      },
      {
        headerName: "Cost (USD)",
        field: "cost",
        headerClass: "grid-header",
        editable: editable,
        cellClass: 'text-right',
        width: 100

      },
      {
        headerName: "",
        field: "printOnPO",
        headerClass: "grid-header",
        headerComponentFramework: <{new(): CustomHeaderComponent}> CustomHeaderComponent,
        headerComponentParams: { menuIcon: 'fa-print' },
        cellRenderer: function (params) {
          return _self.printOnPORenderer(params, _self);
        },
        cellClass: ['ag-icon-cell'],
        maxWidth: 40,
        width: 40,
        hide: !editable
      },
      {
        headerName:"Comments",
        field: 'comments',
        headerClass:"grid-header",
        headerComponentFramework: <{new(): CustomHeaderComponent}> CustomHeaderComponent,
        headerComponentParams: { menuIcon: 'fa-comment' },
        cellRenderer: function(params){return _self.commentsRenderer(params, _self)},
        cellStyle: {'text-align':'center'},
        maxWidth: 40,
        width: 40,
        lockPinned: true,
        pinned: "right"
      }
    ];
    this.agGridOptions.api.setColumnDefs(columnDefs);
  }

  onEditCell(data) {
    const _self = this;
    const poExtraId = data.poExtraId;
    const payload: PurchaseOrderExtra = {
      poExtraId: data.poExtraId,
      lineNum: data.lineNum,
      refLineNum: _self.typeToNumber(data.refLineNum),
      extraName: data.extraObject.name,
      itemExtraId: data.extraObject.id,
      note: data.note,
      qty: _self.typeToNumber(data.qty),
      cost: _self.typeToNumber(data.cost),
      printOnPO: data.printOnPO
    };
    this.purchaseOrdersService.setPurchaseOrderExtra(payload, _self.poId, _self.poVersionId).takeUntil(this.ngUnsubscribe.asObservable())
    .subscribe(
      data => {
        let newCreatedRow = _self.rowDataSet.find(row => row.poExtraId === undefined);
        if (newCreatedRow) {
          newCreatedRow.poExtraId = data.poExtraId;
          newCreatedRow.lineNum = data.lineNum;
        }
        _self.agGridOptions.api.setRowData(_self.rowDataSet);
      },
      error => {
        let newCreatedRow = _self.rowDataSet.findIndex(row => row.poExtraId === undefined);
        if (!newCreatedRow || newCreatedRow < 0 ) {
          newCreatedRow = _self.rowDataSet.findIndex(row => row.poExtraId == poExtraId);
        }
        this.handleAlert(newCreatedRow);
      });
  }

  populateGrid(poExtras: PurchaseOrderExtra[])
  {
    let rowData=[];
    for(let i = 0; i < poExtras.length; i++)
    {
      let row = this.createRow(poExtras[i]);
      rowData.push(row);
    }
    this.rowDataSet = rowData;
    this.agGridOptions.api.setRowData(rowData);
    this.agGridOptions.api.sizeColumnsToFit();
  }

  createRow(poExtra: PurchaseOrderExtra) {
    let itemExtra = this.itemExtras.find(x => x.itemExtraId == poExtra.itemExtraId);
    var retValue= {
      poExtraId: poExtra.poExtraId,
      lineNum: poExtra.lineNum,    
      refLineNum: poExtra.refLineNum ? poExtra.refLineNum : null,
      extraObject: {
        id: poExtra.itemExtraId,
        name: poExtra.extraName
      },
      note: poExtra.note,
      qty: poExtra.qty? poExtra.qty.toLocaleString(): '',
      cost: poExtra.cost? poExtra.cost.toFixed(2): '0.00',
      printOnPO: poExtra.printOnPO,
      comments: poExtra.comments
    }
  
    return retValue;
  }

  craeteNewPOExtra(){
    let poExtra = new PurchaseOrderExtra();
        
    poExtra.itemExtraId = this.itemExtras[0].itemExtraId;
    poExtra.qty = 0;
    poExtra.cost = 0;
    poExtra.printOnPO = false;
    poExtra.comments = 0;
    
    return poExtra;
  }

  handleAlert(rowIndex) {
    this.errorManagementService.getApiError().subscribe((dismiss)=>{
      if (!dismiss) {
        if (rowIndex >= 0) {
          this.startEditingRow(rowIndex); 
        }
      } else {
        this.getPOExtraItems();
      }
    });
  }

  startEditingRow(rowIndex)
  {
    this.agGridOptions.api.setFocusedCell(rowIndex, 'refLineNum');
    
    this.agGridOptions.api.startEditingCell({
        rowIndex: rowIndex,
        colKey: 'refLineNum',
        keyPress: null,
        charPress: ''
    });

  }

  printOnPORenderer(params, _self)
  {
    let btn = document.createElement('button');
    let i = document.createElement('i');
    let ix = document.createElement('i');
    let ic = document.createElement('i');
    let unCheckedClass = 'btn-unchecked'; //CSS in pags.component.scss
    let checkedClass = 'btn-checked';     //CSS in pags.component.scss
    let baseClass = 'btn btn-xs btn-default';

    btn.type = 'button';
    btn.className = baseClass;
    
    btn.className = params.data.printOnPO? baseClass + ' ' + checkedClass: baseClass + ' ' + unCheckedClass

    
    ix.title = 'Disable print';;
    ic.title = 'Enable print';

    i.className = 'fas fa-print';
    ix.className = 'fas fa-times';
    ic.className = 'fas fa-check fa-2x';

    i.setAttribute('aria-hidden', 'true');
    ix.setAttribute('aria-hidden', 'true');
    ic.setAttribute('aria-hidden', 'true');
    btn.appendChild(i);
    btn.appendChild(ix);
    btn.appendChild(ic);
    //anchor.href = "javascript:void(0)";
    
    btn.addEventListener("click",function(){

        params.node.setDataValue('printOnPO', !params.data.printOnPO);
        
        if (params.data.printOnPO) {
          btn.className += ' ' + checkedClass;
        } else {
          btn.className += ' ' + checkedClass;
        }
        if (params.data.poExtraId) {
          _self.onEditCell(params.data);
        }
      }
    );

    return btn;
  }

  typeToNumber(value){
    return typeof value === 'string'
      ? parseInt(value)
      : value
  }

  onCellClicked(e){
    // this.onRowClicked.emit(e.data.poExtraId);
    // this.objectInfo.emit(`Line ${e.data.lineNum} - ${e.data.extraObject.name}`);
    let allRowElements2 = jQuery("#purchaseOrderExtraGrid").find(`.ag-row`);
    let rowElement2 = jQuery("#purchaseOrderExtraGrid").find(`[row=${e.node.rowIndex}]`);
    allRowElements2.removeClass('highlight-row');
    rowElement2.addClass('highlight-row');
    this._selectedRowNode = e.node;
  }

  commentsRenderer(params, _self){
    let anchor = document.createElement('a');
    let i = document.createElement('i');
    i.className = 'fas fa-comments';
    i.title = "Add Comments";
    i.setAttribute('aria-hidden', 'true');
    i.style.color = 'black';
    anchor.appendChild(i);
    anchor.href = "javascript:void(0)";

    anchor.addEventListener('click', function(){
      _self.clickedPOExtraId = params.data.poExtraId;
      _self.clickedObjectInfo = `Line ${params.data.lineNum} - ${params.data.extraObject.name}`;
      jQuery("#po-extra-comment-modal").modal('toggle');
    });

    if (params.data.comments < 1){
      return anchor;
    }
    let div = document.createElement('div');
    div.className = 'comment-col-div';
    div.innerHTML = params.data.comments > 0 ? ('' + params.data.comments) : '';
    div.addEventListener('mouseenter', (e) => {
      _self.hoverObjectInfo = `Line ${params.data.lineNum} - ${params.data.extraObject.name}`;
      _self.hoverObjectId = params.data.poExtraId;
      jQuery('#po-extra-comment-preview').find('.modal-content').css('display', 'block');
      jQuery('#po-extra-comment-preview').find('.modal-content').css('position', 'fixed');
      jQuery('#po-extra-comment-preview').find('.modal-content').css('top', (e.y - 150) + 'px');
      jQuery('#po-extra-comment-preview').find('.modal-content').css('left', (e.x - 500) + 'px');
    });
    div.addEventListener('mouseleave', function(){
      jQuery('#po-extra-comment-preview').find('.modal-content').css('display', 'none');
      _self.hoverObjectId = undefined;
    });
    div.addEventListener('click', function(){
      _self.clickedPOExtraId = params.data.poExtraId;
      _self.clickedObjectInfo = `Line ${params.data.lineNum} - ${params.data.extraObject.name}`;
      jQuery("#po-extra-comment-modal").modal('toggle');
    });
    return div;
  }

  commentCountIncrement(){
    const commentCount = this._selectedRowNode.data.comments;
    console.log(this._selectedRowNode)
    this._selectedRowNode.setDataValue('comments', commentCount + 1);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
   }
 

   resetGridColumns_Click() {
    this.agGridOptions.api.sizeColumnsToFit();
  }

  saveGridState_Click(event) {
    this.agGridSettings.saveGridState(this.gridName, this.agGridOptions).subscribe(
      data => {
        var alertEl = jQuery(event.target).parent('.ag-grid-sort').find('.grid-Alert');
        jQuery(alertEl).fadeIn("slow");
        jQuery(alertEl).delay(5000).fadeOut( "slow", function() {
          // Animation complete.
        });
      });
  }

  loadGridState() {
    this.agGridSettings.loadGridState(this.gridName).subscribe(
      data => {
        // console.log('Load Grid Settings: ', data)
        if (data.ColumnDef != null)
          this.agGridOptions.columnApi.setColumnState(JSON.parse(data.ColumnDef));

        if (data.SortDef != null)
          this.agGridOptions.api.setSortModel(JSON.parse(data.SortDef));

        if (data.FilterDef != null)
          this.agGridOptions.api.setFilterModel(JSON.parse(data.FilterDef));
    })
  }

  setHeightOfGrid(count){ 
    let height = this.getHeight(count);
    document.getElementById('purchaseOrderExtraGrid').style.height = height+'px';
  }

  getHeight(count:number){
    return (count * (this.rowHeight )) + this.headerHeight;
  }

  exportGrid_Click(event) {
    let url = 'api/purchase-order/getPurchaseOrderExtrasExport?PurchaseOrderId=' + this.poId + '&POVersionId=' + this.poVersionId;
    var senderEl = event.currentTarget;

    //Button disabled/text change
    jQuery(senderEl).attr('disabled','')
    jQuery(senderEl).find('span').text('Exporting...');

    this.agGridSettings.GetGridExport(url).subscribe(
      data => {
        if (data.success) {
          //Button enabled/text change
         jQuery(senderEl).removeAttr('disabled');
         jQuery(senderEl).find('span').text('Export');
         //Alert Animation
         var alertEl = jQuery(senderEl).parent('.ag-grid-sort').find('.grid-Download');
         jQuery(alertEl).fadeIn("slow");
         jQuery(alertEl).delay(5000).fadeOut( "slow", function() {
           // Animation complete.
         });
        }
      })
  }

  onPOExtraCommentSaved(){
    this.purchaseOrdersService.extraCommentIncrement();
  }
}
