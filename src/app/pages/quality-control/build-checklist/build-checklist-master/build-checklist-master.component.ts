import { Component, OnInit, SimpleChange, ViewEncapsulation, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { GridOptions, ColumnApi, IDatasource } from "ag-grid";
import { BuildCheckListService } from './../../../../_services/build-checklist.service';
import { CheckList } from './../../../../_models/quality-control/buildCheckList/checkList';

@Component({
  selector: 'az-build-checklist-master',
  templateUrl: './build-checklist-master.component.html',
  styleUrls: ['./build-checklist-master.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BuildChecklistMasterComponent implements OnInit {
  private checkListId: number;
  private gridOptions: GridOptions;
  private showMessage: boolean;
  private showAddNewCheckList: boolean;
  private isChildCheckList: boolean;


  constructor(private checkListService: BuildCheckListService, private router: Router) {
    this.gridOptions = {
      paginationPageSize: 25,
      suppressContextMenu:true,
      getNodeChildDetails: this.getNodeChildDetails,
      toolPanelSuppressSideButtons:true,
      defaultColDef:{suppressMenu:true}
    }
  }
  getNodeChildDetails(rowItem) {
    if (rowItem.children && rowItem.children.length > 0) {
      return {
        group: true,
        children: rowItem.children,
        key: rowItem.name
      }
    }
    else {
      return null;
    }
  }

  onSaveTriggered(e) {
    this.pupulateGridData();
    if (e > 0) {  //if > 0, hide child components and use event value as timeout duration to account for toast message
      setTimeout(() => {
        this.showMessage = true;
        this.checkListId = null;
        this.showAddNewCheckList = false;
      }, e)
    }
  }
  
  ngOnInit() {
    //this.checkListId = 102;
    this.createAgGrid();
    this.pupulateGridData();
    if (!this.checkListId) {
      this.showMessage = true;
    }
  }
  createAgGrid() {
    this.gridOptions.columnDefs = [
      {
        headerName: "Checklist Name",
        field: "name",
        headerClass: "grid-header",
        cellRenderer: 'group',
        cellRendererParams: {
          suppressCount: true,
        },
        width: 287
      },
      {
        headerName: "Type",
        field: "type",
        headerClass: "grid-header",
        width: 287
      }
    ]
  }

  pupulateGridData() {
    this.checkListService.getBuildCheckLists().subscribe(
      checkLists => {
        let dataSource = checkLists.map(checkList => {
          return this.createRow(checkList);
        });

        this.gridOptions.api.setRowData(dataSource);

      });
  }

  createRow(checkList: CheckList) {
    return {
      id: checkList.id,
      name: checkList.name,
      children: checkList.childCheckLists ? checkList.childCheckLists.map(x => { return this.createRow(x) }) : null,
      type: checkList.type ? checkList.type : null,
      isChild: checkList.parentCheckListId ? true : false
    }
  }

  onRowDoubleClicked(event) {
    this.checkListId = event.data.id;
    this.showMessage = false;
    this.showAddNewCheckList   = false;
    this.isChildCheckList = event.data.isChild;
  }

  AddCheckList() {
    this.checkListId = null;
    this.showAddNewCheckList = true;

    //Set new model
  }

  onParentSelected($event){    
      this.isChildCheckList = $event;
  }

}
