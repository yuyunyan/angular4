import { Component, OnInit, Input, SimpleChange, OnDestroy, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { GridOptions, ColumnApi, RowNode } from "ag-grid";
import { QuoteExtraItem } from './../../../_models/quotes/quoteExtraItem';
import { ItemExtra } from './../../../_models/items/itemExtra';
import { QuoteService } from './../../../_services/quotes.service';
import { ItemsService } from './../../../_services/items.service';
import { SelectEditorComponent } from './../../_sharedComponent/select-editor/select-editor.component';
import { CustomHeaderComponent } from './../../_sharedComponent/az-custom-header/az-custom-header.component';
import { Subject } from 'rxjs/Subject';
import { AGGridSettingsService } from './../../../_services/ag-grid-settings.service';
import { ErrorManagementService } from './../../../_services/errorManagement.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { NotificationsService } from 'angular2-notifications';

@Component({
  selector: 'az-quote-extra-items',
  templateUrl: './quote-extra-items.component.html',
  styleUrls: ['./quote-extra-items.component.scss'],
 // encapsulation: ViewEncapsulation.None,
  providers: [AGGridSettingsService]
})
export class QuoteExtraItemsComponent implements OnInit,OnDestroy {

  @Input('quoteId') quoteId:number;
  @Input('quoteVersionId') quoteVersionId:number;
  @Output() onExtrasSelectionChanges = new EventEmitter<Array<Object>>();
  @Output() onRowClicked = new EventEmitter<number>();
  @Output() objectInfo = new EventEmitter<string>();
  private rowDataSet =[];
  private quoteExtraItems: Array<QuoteExtraItem>;
  private itemExtras: Array<ItemExtra>;
  private agGridOptions: GridOptions;
  private AcData = [];
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private gridName = 'quote-extra-items';

  private notifyOptions = {
    position: ['top', 'right'],
    timeOut: 90000,
    pauseOnHover: true,
    lastOnBottom: true
  };

  private _selectedRowNode: RowNode;
  private quoteExtraObjectTypeId;
  private hoverObjectInfo: number;
  private hoverObjectId: number;
  private clickedQuoteExtraId: number;
  private clickedObjectInfo: string;

  constructor(
    private notificationsService: NotificationsService,
    private quoteService: QuoteService,
    private itemsService: ItemsService, 
    private agGridSettings: AGGridSettingsService, 
    private errorManagementService: ErrorManagementService,
    private ngxPermissionsService: NgxPermissionsService
  ) {
    const _self = this;
    this.agGridOptions = {
      animateRows:true,
      enableGroupEdit:true,
      toolPanelSuppressSideButtons:true,
      suppressContextMenu:true,
      onRowEditingStopped: (event) => {
        _self.onEditCell(event.node.data);
      },
      onSelectionChanged: function(){_self.selectionChanges()},
      enableColResize: true,
      editType: 'fullRow',
      suppressRowClickSelection: true,
      headerHeight: 30,
      rowHeight: 30,
      pagination: true,
      paginationPageSize:20,
      rowSelection: 'multiple',
      onViewportChanged: function() {
        _self.agGridOptions.api.sizeColumnsToFit();
      }
    };
    this.quoteService.getExtraCommentStatus().subscribe(
      data => {
        if (data.increment){
          _self.commentCountIncrement()
        }
      }
    )

    this.quoteService.getQuoteExtraObjectTypeId().subscribe((objectTypeId) => {
      this.quoteExtraObjectTypeId = objectTypeId;
    });

    this.ngxPermissionsService.permissions$.subscribe((permissions) => {
      const canEditExtra = permissions['CanEditExtras'];
      if (canEditExtra) {
        _self.createACGrid(_self.quoteExtraItems, _self.itemExtras, true);
        _self.populateGrid(_self.quoteExtraItems);
      }
    });
  }

  ngOnChanges(changes: {[propKey: number]: SimpleChange}) {
    
    let quoteIdProp = changes['quoteId'];
    let quoteVersionIdProp = changes['quoteVersionId'];

    if (quoteIdProp && quoteIdProp.currentValue) {
      this.quoteId = quoteIdProp.currentValue;
      this.quoteVersionId = quoteVersionIdProp.currentValue;
      this.getQuoteExtraItems();
    }

  }
  stopEditing() {}

  getQuoteExtraItems(){
    this.quoteService.getQuoteExtraData(this.quoteId, this.quoteVersionId, 0, 20).takeUntil(this.ngUnsubscribe.asObservable())
    .subscribe(
      data => {
        const permissions = this.ngxPermissionsService.getPermissions();
        let editable = false;
        this.quoteExtraItems = data[0];
        this.itemExtras = data[1].itemExtras;
        if (permissions['CanEditExtras']) {
          editable = true;
        }
        this.createACGrid(data[0], data[1].itemExtras, editable);
        this.populateGrid(data[0]);
        this.loadGridState();
      }
    );
  }

  ngOnInit(){
  }

  createACGrid(quoteExtraItems, itemExtras, editable) {
    const _self = this;
    const columnDefs = [
      {
        headerName: "",
        field: null,
        headerClass: "grid-header",
        checkboxSelection: true,
        minWidth: 30,
        maxWidth: 30,
        lockPinned: true,
        pinned: "left"
      },
      {
        headerName: "Ln",
        field: "lineNum",
        headerClass: "grid-header",
        minWidth: 30,
        maxWidth: 30
      },
      {
        headerName: "Ref Ln",
        field: "refLineNum",
        headerClass: "grid-header",
        editable: editable,
        minWidth: 50,
        maxWidth: 50
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
        minWidth: 350
      },
      {
        headerName: "Note",
        field: "note",
        headerClass: "grid-header",
        editable: editable,
        minWidth: 250
      },
      {
        headerName: "Quantity",
        field: "qty",
        headerClass: "grid-header",
        editable: editable,
        minWidth: 100,
        newValueHandler :function(params){
          if(!isNaN(params.newValue))
            {
              params.data["qty"] = parseInt(params.newValue).toLocaleString();
              return true;
              
            }
            else{
            //  this.notificationsService.warn("invalid input for quantity");
            return false;
            }
        },
        cellStyle: {'text-align':'right'}
      },
      {
        headerName: "Price (USD)",
        field: "price",
        headerClass: "grid-header",
        editable: editable,
        minWidth: 100,
        cellStyle: {'text-align':'right'}
      },
      {
        headerName: "Cost (USD)",
        field: "cost",
        headerClass: "grid-header",
        editable: editable,
        minWidth: 100,
        cellStyle: {'text-align':'right'}
      },
      {
        headerName: "GPM",
        headerClass: "grid-header",
        volatile: true,
        valueGetter: 'Math.floor((data.price - data.cost) / data.price * 100).toFixed(2)+"%"',
        minWidth: 100,
        cellStyle: {'text-align':'right'}
      },
      {
        headerName:"Comments",
        field: 'comments',
        headerClass:"grid-header",
        headerComponentFramework: <{new(): CustomHeaderComponent}> CustomHeaderComponent,
        headerComponentParams: { menuIcon: 'fa-comment' },
        cellRenderer: function(params){return _self.commentsRenderer(params, _self)},
        cellStyle: {'text-align':'center'},
        minWidth: 40,
        lockPinned: true,
        pinned: "right"
      },
      {
        headerName: "",
        field: "printOnQuote",
        headerClass: "grid-header",
        headerComponentFramework: <{new(): CustomHeaderComponent}> CustomHeaderComponent,
        headerComponentParams: { menuIcon: 'fa-print' },
        cellRenderer: function (params) {
          return _self.printOnQuoteRenderer(params, _self);
        },
        cellStyle: {'text-align':'center'},
        minWidth: 40,
        lockPinned: true,
        pinned: "right"
      }
    ];
    this.agGridOptions.api.setColumnDefs(columnDefs);
  }
  
  populateGrid(quoteExtras: QuoteExtraItem[])
  {
    
    let rowData=[];
    for(let i=0; i< quoteExtras.length; i++)
    {
      let row = this.createRow(quoteExtras[i]);
      rowData.push(row);
    }
    
    this.rowDataSet = rowData;
    this.agGridOptions.api.setRowData(rowData);
    this.agGridOptions.api.sizeColumnsToFit();
  }


  createRow(quoteExtra: QuoteExtraItem)
  {
    let itemExtra = this.itemExtras.find(x => x.itemExtraId == quoteExtra.itemExtraId);
    var retValue= {
      quoteExtraId: quoteExtra.quoteExtraId,
      lineNum: quoteExtra.lineNum,    
      refLineNum: quoteExtra.refLineNum,
      extraObject: {
        id: quoteExtra.itemExtraId,
        name: quoteExtra.extraName
      },
      note: quoteExtra.note,
      qty: quoteExtra.qty,
      price: quoteExtra.price,
      cost: quoteExtra.cost,
      gpm: quoteExtra.gpm,
      comments: quoteExtra.comments,
      printOnQuote: quoteExtra.printOnQuote
    }
    
    return retValue;
  }

  calGPM(price: number, quantity: number, cost: number): number {
    return ((quantity * price) - (quantity * cost)) / (quantity * price) * 100
  }

  onEditCell(data) {
    const _self = this;
    const quoteExtraId = data.quoteExtraId;
    const payload: QuoteExtraItem = {
      quoteExtraId: data.quoteExtraId,
      lineNum: data.lineNum,
      refLineNum: this.typeToNumber(data.refLineNum),
      extraName: data.extraObject.name,
      itemExtraId: data.extraObject.id,
      note: data.note,
      qty: this.typeToNumber(data.qty),
      price: this.typeToNumber(data.price),
      cost: this.typeToNumber(data.cost),
      gpm: this.calGPM(data.price, data.qty, data.cost),
      printOnQuote: data.printOnQuote
    };
    this.quoteService.setQuoteExtraItems(payload, this.quoteId, this.quoteVersionId).takeUntil(this.ngUnsubscribe.asObservable())
    .subscribe(
      data => {
        let newCreatedRow = _self.rowDataSet.find(row => row.quoteExtraId === undefined);
        if (newCreatedRow){
          newCreatedRow.quoteExtraId = data;
          newCreatedRow.comments = 0;
        }
        _self.agGridOptions.api.setRowData(_self.rowDataSet);
      },
      error => {
        let newCreatedRow = _self.rowDataSet.findIndex(row => row.quoteExtraId === undefined);
        if (!newCreatedRow || newCreatedRow < 0 ) {
          newCreatedRow = _self.rowDataSet.findIndex(row => row.quoteExtraId == quoteExtraId);
        }
        this.handleAlert(newCreatedRow);
      }
    );
  }

  onAddRow() {

    var newItem = this.createRow(this.craeteNewQuoteExtra());
    
    this.rowDataSet.push(newItem);
    this.agGridOptions.api.setRowData(this.rowDataSet);
    //this.partsGrid.api.refreshView();

    let rowIndex = this.rowDataSet.length - 1;
    this.startEditingRow(rowIndex);  
  }

  deleteSelectedRow(){
    const _self = this;
    const selectedRows = this.agGridOptions.api.getSelectedRows();
    if (selectedRows.length === 1) {
      let payload = new QuoteExtraItem();
      payload.quoteExtraId = selectedRows[0].quoteExtraId;
      payload.isDeleted = true;
      payload.lineNum = selectedRows[0].lineNum;
      payload.itemExtraId = selectedRows[0].extraObject.id;
      this.quoteService.setQuoteExtraItems(payload, this.quoteId, this.quoteVersionId).subscribe(
        success => {
        let indexOfItem = _self.rowDataSet.findIndex(x => x.quoteExtraId === payload.quoteExtraId);
        _self.rowDataSet.splice(indexOfItem, 1);
        _self.agGridOptions.api.refreshView();
        _self.agGridOptions.api.sizeColumnsToFit();
        _self.agGridOptions.api.setRowData(_self.rowDataSet);
      });
    }
    _self.agGridOptions.api.refreshView();
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
      _self.clickedQuoteExtraId = params.data.quoteExtraId;
      _self.clickedObjectInfo = `Line ${params.data.lineNum} - ${params.data.extraObject.name}`;
      jQuery("#quote-extra-comment-modal").modal('toggle');
    });

    if (params.data.comments < 1){
      return anchor;
    }
    let div = document.createElement('div');
    div.className = 'comment-col-div';
    div.innerHTML = params.data.comments > 0 ? ('' + params.data.comments) : '';
    div.addEventListener('mouseenter', (e) => {
      _self.hoverObjectInfo = `Line ${params.data.lineNum} - ${params.data.extraObject.name}`;
      _self.hoverObjectId = params.data.quoteExtraId;
      jQuery('#quote-extra-comment-preview').find('.modal-content').css('display', 'block');
      jQuery('#quote-extra-comment-preview').find('.modal-content').css('position', 'fixed');
      jQuery('#quote-extra-comment-preview').find('.modal-content').css('top', (e.y - 150) + 'px');
      jQuery('#quote-extra-comment-preview').find('.modal-content').css('left', (e.x - 500) + 'px');
    });
    div.addEventListener('mouseleave', function(){
      jQuery('#quote-extra-comment-preview').find('.modal-content').css('display', 'none');
      _self.hoverObjectId = undefined;
    });
    div.addEventListener('click', function(){
      _self.clickedQuoteExtraId = params.data.quoteExtraId;
      _self.clickedObjectInfo = `Line ${params.data.lineNum} - ${params.data.extraObject.name}`;
      jQuery("#quote-extra-comment-modal").modal('toggle');
    });
    return div;
  }

  typeToNumber(value: any):number  {
    return typeof value === 'string'
      ? parseInt(value)
      : value
  }

  craeteNewQuoteExtra(){
    let quoteExtra = new QuoteExtraItem();
        
    quoteExtra.itemExtraId = this.itemExtras[0].itemExtraId;
    quoteExtra.lineNum = this.quoteExtraItems.length + 1;
    quoteExtra.refLineNum = 0;
    quoteExtra.qty = 10;
    quoteExtra.price = 10;
    quoteExtra.cost = 10;
    quoteExtra.printOnQuote = false;
    quoteExtra.gpm = this.calGPM(quoteExtra.price, quoteExtra.qty, quoteExtra.cost);
    
    return quoteExtra;
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

  handleAlert(rowIndex) {
    this.errorManagementService.getApiError().subscribe((dismiss)=>{
      if (!dismiss) {
        if (rowIndex >= 0) {
          this.startEditingRow(rowIndex); 
        }
      } else {
        this.getQuoteExtraItems();
      }
    });
  }

  printOnQuoteRenderer(params, _self)
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

    btn.className = params.data.printOnQuote? baseClass + ' ' + checkedClass: baseClass + ' ' + unCheckedClass

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

    //btn.href = "javascript:void(0)";
    
    btn.addEventListener("click",function(){

      params.node.setDataValue('printOnQuote', !params.data.printOnQuote);
      
      //enabled
      if (params.data.printOnQuote) {
        btn.className += ' ' + checkedClass;

      //disabled
      } else {
        btn.className += ' ' + unCheckedClass;
      }
    });

    return btn;
  }

  selectionChanges(){
    let rows = this.agGridOptions.api.getSelectedRows();
    this.onExtrasSelectionChanges.emit(rows);
  }

  onCellClicked(e){
    // this.onRowClicked.emit(e.data.quoteExtraId);
    // this.objectInfo.emit(`Line ${e.data.lineNum} - ${e.data.extraObject.name}`);
    let allRowElements2 = jQuery("#quoteExtraGrid").find(`.ag-row`);
    let rowElement2 = jQuery("#quoteExtraGrid").find(`[row=${e.node.rowIndex}]`);
    allRowElements2.removeClass('highlight-row');
    rowElement2.addClass('highlight-row')
    this._selectedRowNode = e.node;
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  commentCountIncrement(){
    const commentCount = this._selectedRowNode.data.comments;
    this._selectedRowNode.setDataValue('comments', commentCount + 1);
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
        if (data.ColumnDef != null)
          this.agGridOptions.columnApi.setColumnState(JSON.parse(data.ColumnDef));

        if (data.SortDef != null)
          this.agGridOptions.api.setSortModel(JSON.parse(data.SortDef));

        if (data.FilterDef != null)
          this.agGridOptions.api.setFilterModel(JSON.parse(data.FilterDef));
    })
  }

  exportGrid_Click(event) {
    let url = 'api/quote/getQuoteExtraExport?quoteId=' + this.quoteId + '&quoteVersionId=' + this.quoteVersionId;
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
  onQuoteExtraCommentSaved(){
    this.quoteService.extraCommentIncrement();
  }
}
