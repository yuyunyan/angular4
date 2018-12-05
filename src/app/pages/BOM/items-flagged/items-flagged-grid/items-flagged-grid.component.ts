import { Component, ViewEncapsulation, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { BOMsService } from './../../../../_services/boms.service';
import { Contacts } from './../../../../_models/contactsAccount/contacts';
import { Customers } from './../../../../_models/quotes/quoteOptions';
import { GridOptions } from "ag-grid";
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import * as _ from 'lodash';

@Component({
    selector: 'az-items-flagged-grid',
    templateUrl: './items-flagged-grid.component.html',
    styleUrls: ['./items-flagged-grid.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ItemsFlaggedGridComponent {
  @Input() itemsFlagged;
  @Input() itemIdRequired;
  @Output() onGridValuesUpdated = new EventEmitter<any>();
  private agGridOptions: GridOptions;
  private rowHeight: number;
  private _itemsFlagged;

  constructor() {
    const _self = this;
    this.rowHeight = 30;
    this.agGridOptions = {
      animateRows:true,
      suppressContextMenu:true,
      toolPanelSuppressSideButtons:true,
      onViewportChanged: function() {
        _self.agGridOptions.api.sizeColumnsToFit();
      },
      enableGroupEdit: true,
      onRowEditingStopped: function(event){_self.updateItemsFlagged(event)},
			singleClickEdit: true,
      editType: 'fullRow',
      getRowStyle: function(params) {
        if (_self.itemIdRequired && params.data.itemId == 0) {
          return { background: '#ffb3b3' }
        }
      }
    };
    this.createGrid();
  }

  ngOnChanges(changes: SimpleChanges) {
		if (changes.itemsFlagged && changes.itemsFlagged.currentValue){
      this._itemsFlagged = this.itemsFlagged;
			this.populateGrid();
		}
  }
  
  createGrid(){
    let _self = this;
    let columnDefs =  [
      {
        headerName: 'Part Number',
				field: 'partNumber',
				headerClass:"grid-header",
        minWidth: 255,
        width: 255
      },
      {
        headerName: 'Manufacturer',
				field: 'manufacturer',
        headerClass:"grid-header",
        editable: true,
        minWidth: 254,
        width: 254
      },
      {
        headerName: 'Price',
				field: 'price',
        headerClass:"grid-header",
        editable: true,
        minWidth: 254,
        width: 254
      },
      {
        headerName: 'Cost',
				field: 'cost',
        headerClass:"grid-header",
        editable: true,
        minWidth: 254,
        width: 254
      },
      {
        headerName: 'Qty',
				field: 'qty',
        headerClass:"grid-header",
        editable: true,
        minWidth: 254,
        width: 254
      }
    ];
    this.agGridOptions.columnDefs = columnDefs;
  }

  populateGrid(){
    const _self = this;
    let rowData = [];
    let itemsFlagged = _.concat([], _self.itemsFlagged);
    for(let i=0; i< itemsFlagged.length; i++)
    {
      let row = _self.createRow(itemsFlagged[i]);
      rowData.push(row);
    }
    this.agGridOptions.api.setRowData(rowData);
    this.agGridOptions.rowHeight = this.rowHeight; 
    this.setHeightOfGrid(_self.itemsFlagged.length);
    this.agGridOptions.api.sizeColumnsToFit();
  }


  createRow(itemFlagged) {
    var retValue = {
      partNumber:itemFlagged.partNumber,
      manufacturer:itemFlagged.manufacturer,
      qty: itemFlagged.qty,
      price:itemFlagged.price,
      cost:itemFlagged.cost,
      itemId: itemFlagged.itemId
    }
    return retValue;
  }

  updateItemsFlagged(row){
    this._itemsFlagged[row.node.rowIndex] = row.node.data;
    const updatedItemsFlagged = _.concat(_.slice(this._itemsFlagged, 0, row.node.rowIndex),
      [row.node.data],
      _.slice(this._itemsFlagged, row.node.rowIndex + 1));
    this.onGridValuesUpdated.emit(updatedItemsFlagged);
  }

  setHeightOfGrid(recordsCount) {
    recordsCount = recordsCount >=10 ? 10 : recordsCount;
    let height = this.getHeight(recordsCount + 2);
    var girds = jQuery('.itemsFlaggedGrid').height(height);
  }

  getHeight(count: number) {
    return count * this.rowHeight + 40;
  }
}
