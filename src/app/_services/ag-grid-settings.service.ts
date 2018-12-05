import { Injectable } from '@angular/core';
import { HttpService } from './httpService';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { XLSDataMap, XLSDataMapObject } from './../_models/upload/xlsDataMap';
import { GridOptions, ColumnApi, IDatasource, RowNode } from 'ag-grid';
import { GridSettings } from './../_models/common/GridSettings';
import { ExportResponse } from './../_models/common/exportResponse'
import { environment } from './../../environments/environment';
import { PapaParseService } from 'ngx-papaparse';
 
@Injectable()
export class AGGridSettingsService {
    constructor(private httpService: HttpService,private papa: PapaParseService) {

    }

    parseGridData(grid: GridOptions, gridName: string) {
        var rowData = [];
        var colDisplayOrder = [];
        var colIdOrder = [];
        var sortModel =  grid.columnApi.getColumnState();

        //Get column header info
        for (var i = 0; i < sortModel.length; i++) {
            var makeCol = grid.columnApi.getColumn(sortModel[i].colId)
            var colHeader = makeCol.getColDef();
            if (colHeader.headerName) {
              colDisplayOrder.push(colHeader.headerName);   
              colIdOrder.push(colHeader.field);
            }
          }
          
        //get grid data (with order)
        grid.api.forEachNode(function (node) {
           
        
            var data = {};
            for (var i = 0; i < colIdOrder.length; i++) {
                var currentColumn = colIdOrder[i];
                var currentHeader = colDisplayOrder[i];

                //Check for nested property value
                if (node.data[currentColumn].name || node.data[currentColumn].name == '')
                    data[currentHeader] = node.data[currentColumn].name
                //Use default property value
                else
                    data[currentHeader] = node.data[currentColumn]
            }

            rowData.push(data);
        });
        // console.log('export data',rowData);  //Data in raw format
        
        //Reorganize grid data into CSV
        var csv = this.papa.unparse({
            fields: colDisplayOrder, // ["ID", "OrderNumber", "OrderStatus", "StartTime", "FinishTime", "canOp", "OpDesc", "UOM"],
            data: rowData
          });
        //Download file as CSV
        var blob = new Blob([csv], {type: "application/vnd.ms-excel"});
        var fileName = this.GetDateStamp() + '_' + gridName + ".csv"
        if (window.navigator.msSaveOrOpenBlob)  // IE hack; see http://msdn.microsoft.com/en-us/library/ie/hh779016.aspx
            window.navigator.msSaveBlob(blob, fileName);
        else
        {
                var a = window.document.createElement("a");
                a.hidden = true;
                a.href = window.URL.createObjectURL(blob);
                a.download = fileName;
                document.body.appendChild(a);
                a.click();  // IE: "Access is denied"; see: https://connect.microsoft.com/IE/feedback/details/797361/ie-10-treats-blob-url-as-cross-origin-and-denies-access
                document.body.removeChild(a);
        }
        //Set new column headers to friendly namnes
        //newData.data[0] = colDisplayOrder;
        //   console.log('Parse Grid data', newData.data);
    }
    resetGridColumns(agGridOptions: GridOptions) {
        agGridOptions.api.sizeColumnsToFit();
    }

    saveGridState(gridName, agGridOptions: GridOptions) {
        var colState = JSON.stringify(agGridOptions.columnApi.getColumnState());
        var sortState = JSON.stringify(agGridOptions.api.getSortModel());
        var filterState = JSON.stringify(agGridOptions.api.getFilterModel());

        let url = 'api/common/setGridSettings';
        let body = {
            GridName: gridName,
            ColumnDef: colState,
            SortDef: sortState,
            FilterDef: filterState
        }
        return this.httpService.Post(url, body);
        //console.log(this.partsGrid.columnApi.getColumnState())
    }

    loadGridState(gridName) {
        let url = 'api/common/getGridSettings?gridName=' + gridName;
        return this.httpService.Get(url).map(
            data => {
                let res = data.json();
                var settings = new GridSettings();
                //Get Settings here
                settings.ColumnDef = res.columnDef;
                settings.SortDef = res.sortDef
                settings.FilterDef = res.filterDef
               
                return settings;
            }
        )
    }

    GetGridExport(url) {
        return this.httpService.Get(url).map(
            data => {
                let res = data.json();
                let exportData = new ExportResponse();
                exportData = {
                    downloadUrl: environment.apiEndPoint + res.downloadUrl,
                    success: res.success,
                    errorMsg: res.errorMsg
                };

                if (exportData.success)
                    window.location.href = exportData.downloadUrl;
                return exportData;
            }, error => {
                console.log("Grid Export failed");
            })
    }

    GetDateStamp() {
        return new Date().toLocaleString().split(', ')[0].replace('/','-').replace('/','-');
    }
}
