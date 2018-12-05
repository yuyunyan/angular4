import { Component, Input, SimpleChange, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { GridOptions, ColumnApi, RowNode } from "ag-grid";
import { Observable } from 'rxjs';
import { SalesOrderExtra } from './../../../../_models/sales-orders/salesOrderExtra';
import { ItemExtra } from './../../../../_models/Items/itemExtra';
import { ItemsService } from './../../../../_services/items.service';
import { SalesOrdersService } from './../../../../_services/sales-orders.service';
import { SelectEditorComponent } from './../../../_sharedComponent/select-editor/select-editor.component';
import { CustomHeaderComponent } from './../../../_sharedComponent/az-custom-header/az-custom-header.component';
import { AGGridSettingsService } from './../../../../_services/ag-grid-settings.service';
import { ErrorManagementService } from './../../../../_services/errorManagement.service';
import { NgxPermissionsService } from 'ngx-permissions';

@Component({
  selector: 'az-sales-orders-extra',
  templateUrl: './sales-orders-extra.component.html',
  styleUrls: ['./sales-orders-extra.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [AGGridSettingsService]
})
export class SalesOrdersExtraComponent {
  
  @Input() soId;
  @Input() soVersionId;
  @Output() onRowClicked = new EventEmitter<number>();
  @Output() objectInfo = new EventEmitter<string>();
  private rowHeight= 30;
  private headerHeight= 30;
  private rowDataSet =[];
  private soExtraItems: Array<SalesOrderExtra>;
  private itemExtras: Array<ItemExtra>;
  private agGridOptions: GridOptions;
  private AcData = [];

  private _selectedRowNode: RowNode;
  private gridName = 'sales-order-extra';

  private clickedSOExtraId: number;
  private clickedObjectInfo: string;
  private soExtraObjectTypeId: number;
  private hoverObjectInfo: string;
  private hoverObjectId: number;

  constructor(
    private salesOrdersService: SalesOrdersService,
    private itemsService: ItemsService,
    private agGridSettings: AGGridSettingsService,
    private errorManagementService: ErrorManagementService,
    private ngxPermissionsService: NgxPermissionsService) {
    const _self = this;
    this.agGridOptions = {
      animateRows:true,
      enableGroupEdit:true,
      onRowEditingStopped: (event) => {
        _self.onEditCell(event.node.data);
      },
      enableColResize: true,
      editType: 'fullRow',
      singleClickEdit: false,
      suppressRowClickSelection: true,
      suppressDragLeaveHidesColumns: true,
      toolPanelSuppressSideButtons:true,
      suppressContextMenu:true,
      headerHeight: 30,
      rowHeight: 30,
      pagination: true,
      paginationPageSize:20,
      rowSelection: 'multiple',
      onViewportChanged: function() {
        _self.agGridOptions.api.sizeColumnsToFit();
      }
    };
    this.salesOrdersService.getExtraCommentStatus().subscribe(data => {
      if (data.increment){
        _self.commentCountIncrement()
      }
    });

    this.salesOrdersService.getSOExtraObjectTypeId().subscribe((objectTypeId) => {
      this.soExtraObjectTypeId = objectTypeId;
    });

    this.ngxPermissionsService.permissions$.subscribe((permissions) => {
      const canEditExtra = permissions['CanEditExtras'];
      if (canEditExtra) {
        _self.createACGrid(_self.soExtraItems, _self.itemExtras, true);
        _self.populateGrid(_self.soExtraItems);
      }
    });
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange })
  {
    let soIdProp = changes['soId'];
    let soVersionIdProp = changes['soVersionId'];

    this.soId = soIdProp.currentValue;
    this.soVersionId = soVersionIdProp.currentValue;
    
    if(this.soId && this.soVersionId)
    {
      this.getSOExtraItems();
    }
  }

  getSOExtraItems(){
    this.salesOrdersService.getSalesOrderExtraData(this.soId, this.soVersionId, 0, 50).subscribe(
      data => {
        const permissions = this.ngxPermissionsService.getPermissions();
        let editable = false;
        if (permissions['CanEditExtras']) {
          editable = true;
        }
        this.soExtraItems = data[0];
        this.itemExtras = data[1].itemExtras;
        let height = data[0].length < this.agGridOptions.paginationPageSize ? data[0].length: this.agGridOptions.paginationPageSize;
        this.setHeightOfGrid(height + 1);
        this.createACGrid(data[0], data[1].itemExtras, editable);
        this.populateGrid(data[0]);
        this.loadGridState();
      }
    )
  }

  setHeightOfGrid(count)
  { 
    let height ;
    if(count <= 5 ){
      height = this.getHeight(5); //Minimum 5 rows tall
    }
    else if(count > 25){
      height = this.getHeight(25);
    }
    else{
      height = this.getHeight(count);
    }
    jQuery('#salesOrderExtraGrid').css('height', height + 'px');
  }

  getHeight(count:number)
  {
    return (count * (this.rowHeight )) + this.headerHeight;
  }

  onEditCell(data){
    const _self = this;
    const soExtraId = data.soExtraId;
    const payload: SalesOrderExtra = {
      soExtraId: data.soExtraId,
      lineNum: data.lineNum,
      refLineNum: _self.typeToNumber(data.refLineNum),
      extraName: data.extraObject.name,
      itemExtraId: data.extraObject.id,
      note: data.note,
      qty: _self.typeToNumber(data.qty),
      price: _self.typeToNumber(data.price),
      cost: _self.typeToNumber(data.cost),
      gpm: _self.calGPM(data.price, data.qty, data.cost),
      printOnSO: data.printOnSO
    };
    this.salesOrdersService.setSalesOrderExtra(payload, _self.soId, _self.soVersionId).subscribe(
      data => {
        let newCreatedRow = _self.rowDataSet.find(row => row.soExtraId === undefined);
        if (newCreatedRow) {
          newCreatedRow.soExtraId = data;
        }
        _self.agGridOptions.api.setRowData(_self.rowDataSet);
      },
      error => {
        let newCreatedRow = _self.rowDataSet.findIndex(row => row.soExtraId === undefined);
        if (!newCreatedRow || newCreatedRow < 0 ) {
          newCreatedRow = _self.rowDataSet.findIndex(row => row.soExtraId == soExtraId);
        }
        this.handleAlert(newCreatedRow);
      });
  }

  createACGrid(soExtraItems, itemExtras, editable){
    const _self = this;
    const columnDefs = [
      {
        headerName: "",
        field: null,
        headerClass: "grid-header",
        checkboxSelection: true,
        width: 50,
        minWidth: 50,
        maxWidth: 50
      },
      {
        headerName: "Ln",
        field: "lineNum",
        headerClass: "grid-header",
        width: 50,
        minWidth: 50
      },
      {
        headerName: "Ref Ln",
        field: "refLineNum",
        headerClass: "grid-header",
        editable: editable,
        width: 50,
        minWidth: 50,
        maxWidth: 50
      },
      {
        headerName: "Extra Item",
        field: "extraObject",
        headerClass: "grid-header",
        editable: editable,
        minWidth: 200,
        cellEditorFramework: SelectEditorComponent,
        cellRenderer: function(params) {
          return params.value.name
        },
        cellEditorParams: {
          values: itemExtras.map(x => {
            return {id:x.itemExtraId, name:x.extraName}
          })
        }
      },
      {
        headerName: "Note",
        field: "note",
        minWidth: 200,
        headerClass: "grid-header",
        editable: editable
      },
      {
        headerName: "Quantity",
        field: "qty",
        minWidth: 200,
        headerClass: "grid-header",
        editable: editable,
        newValueHandler:function(params){
          if(!isNaN(params.newValue))
            {
              params.data["qty"] = parseInt(params.newValue).toLocaleString(); //thousands comma seperator
              return true;
            }
            else{
              alert("invalid input for quantity");
              return false;
            }

        },
        cellStyle: {'text-align':'right'}
      },
      {
        headerName: "Price (USD)",
        field: "price",
        minWidth: 200,
        headerClass: "grid-header",
        editable: editable,
        cellStyle: {'text-align':'right'}
      },
      {
        headerName: "Cost (USD)",
        field: "cost",
        minWidth: 200,
        headerClass: "grid-header",
        editable: editable,
        cellStyle: {'text-align':'right'}
      },
      {
        headerName: "GPM",
        headerClass: "grid-header",
        volatile: editable,
        minWidth: 200,
        valueGetter: 'Math.floor((data.price - data.cost) / data.price * 100).toFixed(2)+"%"',
        cellStyle: {'text-align':'right'}
      },
      {
        headerName:"Comments",
        field: 'comments',
        headerClass:"grid-header",
        cellRenderer: function(params){return _self.commentsRenderer(params, _self)},
        headerComponentFramework: <{new(): CustomHeaderComponent}> CustomHeaderComponent,
        headerComponentParams: { menuIcon: 'fa-comment' },
        cellStyle: {'text-align':'center'},
        width: 40,
        minWidth: 40
      },
      {
        headerName: "",
        field: "printOnSO",
        headerClass: "grid-header",
        headerComponentFramework: <{new(): CustomHeaderComponent}> CustomHeaderComponent,
        headerComponentParams: { menuIcon: 'fa-print' },
        cellRenderer: function (params) {
          return _self.printOnSORenderer(params, _self);
        },
        cellStyle: {'text-align':'center'},
        width: 40,
        minWidth: 40
      }
    ];
    this.agGridOptions.columnDefs = columnDefs;
    if (this.agGridOptions.api){
      this.agGridOptions.api.setColumnDefs(columnDefs);
    }
  }

  printOnSORenderer(params, _self)
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
    
    btn.className = params.data.printOnSO? baseClass + ' ' + checkedClass: baseClass + ' ' + unCheckedClass
    
    ix.title = 'Disable print';
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

        params.node.setDataValue('printOnSO', !params.data.printOnSO);
        
        //enabled
        if (params.data.printOnSO) {
          btn.className += ' ' + checkedClass;

        //disabled
        } else {
          btn.className += ' ' + unCheckedClass;
        }
        if (params.data.soExtraId) {
          _self.onEditCell(params.data);
        }
      }
    );

    return btn;
  }

  populateGrid(soExtras: SalesOrderExtra[])
  {
    
    let rowData=[];
    for(let i=0; i< soExtras.length; i++)
    {
      let row = this.createRow(soExtras[i]);
      rowData.push(row);
    }
    
    this.rowDataSet = rowData;
    if (this.agGridOptions.api){
      this.agGridOptions.api.setRowData(rowData);
      this.agGridOptions.api.sizeColumnsToFit();
    }
  }

  handleAlert(rowIndex) {
    this.errorManagementService.getApiError().subscribe((dismiss)=>{
      if (!dismiss) {
        if (rowIndex >= 0) {
          this.startEditingRow(rowIndex); 
        }
      } else {
        this.getSOExtraItems();
      }
    });
  }

  createRow(soExtra: SalesOrderExtra)
  {
    let itemExtra = this.itemExtras.find(x => x.itemExtraId == soExtra.itemExtraId);
    var retValue= {
      soExtraId: soExtra.soExtraId,
      lineNum: soExtra.lineNum,    
      refLineNum: soExtra.refLineNum,
      extraObject: {
        id: soExtra.itemExtraId,
        name: soExtra.extraName
      },
      note: soExtra.note,
      qty: soExtra.qty,
      price: soExtra.price,
      cost: soExtra.cost,
      gpm: soExtra.gpm,
      printOnSO: soExtra.printOnSO,
      comments: soExtra.comments
    }
    
    return retValue;
  }

  craeteNewSOExtra(){
    let soExtra = new SalesOrderExtra();
        
    soExtra.itemExtraId = this.itemExtras[0].itemExtraId;
    soExtra.lineNum = this.soExtraItems.length + 1;
    soExtra.refLineNum = 0;
    soExtra.qty = 10;
    soExtra.price = 10;
    soExtra.cost = 10;
    soExtra.printOnSO = false;
    soExtra.gpm = this.calGPM(soExtra.price, soExtra.qty, soExtra.cost);
    
    return soExtra;
  }

  onAddRow(){
    var newItem = this.createRow(this.craeteNewSOExtra());
    
    this.rowDataSet.push(newItem);
    this.agGridOptions.api.setRowData(this.rowDataSet);

    let rowIndex = this.rowDataSet.length - 1;
    this.startEditingRow(rowIndex); 
  }

  deleteSelectedRows(){
    let rows = this.agGridOptions.api.getSelectedRows();
    let soExtrasToDelete = rows.map(x => x.soExtraId);
    let _self = this;
    this.salesOrdersService.deleteSalesOrderExtra(soExtrasToDelete).subscribe(
      success => {
          if(success)
          {
            soExtrasToDelete.forEach(itemToDelete =>
            {
              let indexOfItem = _self.rowDataSet.findIndex(x => x.soExtraId == itemToDelete);
              _self.rowDataSet.splice(indexOfItem, 1);
            });
          };
          _self.agGridOptions.api.setRowData(_self.rowDataSet);
      }
    );
  }

  startEditingRow(rowIndex)
  {
    this.agGridOptions.api.setFocusedCell(rowIndex, 'refLineNum');
    
    this.agGridOptions.api.startEditingCell({
        rowIndex: rowIndex,
        colKey: 'refLineNum',
        keyPress: null,
        charPress: '0'
    });
  }

  calGPM(price: number, quantity: number, cost: number): number {
    return ((quantity * price) - (quantity * cost)) / (quantity * price) * 100
  }

  typeToNumber(value: any):number  {
    return typeof value === 'string'
      ? parseInt(value)
      : value
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
      _self.clickedSOExtraId = params.data.soExtraId;
      _self.clickedObjectInfo = `Line ${params.data.lineNum} - ${params.data.extraObject.name}`;
      jQuery("#so-extra-comment-modal").modal('toggle');
    });

    if (params.data.comments < 1){
      return anchor;
    }
    let div = document.createElement('div');
    div.className = 'comment-col-div';
    div.innerHTML = params.data.comments > 0 ? ('' + params.data.comments) : '';
    div.addEventListener('mouseenter', (e) => {
      _self.hoverObjectInfo = `Line ${params.data.lineNum} - ${params.data.extraObject.name}`;
      _self.hoverObjectId = params.data.soExtraId;
      jQuery('#so-extra-comment-preview').find('.modal-content').css('display', 'block');
      jQuery('#so-extra-comment-preview').find('.modal-content').css('position', 'fixed');
      jQuery('#so-extra-comment-preview').find('.modal-content').css('top', (e.y - 150) + 'px');
      jQuery('#so-extra-comment-preview').find('.modal-content').css('left', (e.x - 500) + 'px');
    });
    div.addEventListener('mouseleave', function(){
      jQuery('#so-extra-comment-preview').find('.modal-content').css('display', 'none');
      _self.hoverObjectId = undefined;
    });
    div.addEventListener('click', function(){
      _self.clickedSOExtraId = params.data.soExtraId;
      _self.clickedObjectInfo = `Line ${params.data.lineNum} - ${params.data.extraObject.name}`;
      jQuery("#so-extra-comment-modal").modal('toggle');
    });
    return div;
  }

  onCellClicked(e){
    // this.onRowClicked.emit(e.data.soExtraId);
    // this.objectInfo.emit(`Line ${e.data.lineNum} - ${e.data.extraObject.name}`);
    let allRowElements2 = jQuery("#salesOrderExtraGrid").find(`.ag-row`);
    let rowElement2 = jQuery("#salesOrderExtraGrid").find(`[row=${e.node.rowIndex}]`);
    allRowElements2.removeClass('highlight-row');
    rowElement2.addClass('highlight-row')
    this._selectedRowNode = e.node;
  }

  commentCountIncrement(){
    const commentCount = this._selectedRowNode.data.comments;
    this._selectedRowNode.setDataValue('comments', commentCount + 1);
  }

  resetGridColumns_Click() {
    if (this.agGridOptions.columnApi && this.agGridOptions.columnDefs){
      this.agGridOptions.columnApi.resetColumnState();
    }
    if (this.agGridOptions.api){
      this.agGridOptions.api.sizeColumnsToFit();
    }
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
        console.log('Load Grid Settings: ')
        console.log(data);
        if (data.ColumnDef != null && this.agGridOptions.columnApi)
          this.agGridOptions.columnApi.setColumnState(JSON.parse(data.ColumnDef));

        if (data.SortDef != null && this.agGridOptions.api)
          this.agGridOptions.api.setSortModel(JSON.parse(data.SortDef));

        if (data.FilterDef != null && this.agGridOptions.api)
          this.agGridOptions.api.setFilterModel(JSON.parse(data.FilterDef));
    })
  }

  
  exportGrid_Click(event) {
    let url = 'api/sales-order/getSalesOrderExtraExport?soId='+this.soId+'&soVersionId='+this.soVersionId
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

  onSOExtraCommentSaved(){
    this.salesOrdersService.extraCommentIncrement();
  }
}
