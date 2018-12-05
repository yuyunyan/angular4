import { Component, OnInit, Input, OnDestroy, AfterViewInit } from '@angular/core';
import { GridOptions, ColumnApi, IDatasource, IServerSideCache, IServerSideDatasource } from 'ag-grid';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { HttpService } from './../../../_services/httpService';
import { Observable } from 'rxjs';

@Component({
  selector: 'az-error-monitor-grid',
  templateUrl: './error-monitor-grid.component.html',
  styleUrls: ['./error-monitor-grid.component.scss']
})
export class ErrorMonitorGridComponent implements OnInit, AfterViewInit{
  private searchString: string = '';
  private rowData = [];

  private agGridOptions: GridOptions;
  private rowLimit: number = 25;
  private rowOffset: number = 0;
  private totalRowCount: number = 1000;
  private sortBy: string = '';
  private glbDataSource: IServerSideDatasource;

  private startDate: Date;
  private endDate: Date;
  private startDateCopy: string = '';
  private endDateCopy: string = '';

  private application: string = '0';

  private startTime: string = '00:00:00';
  private startTimeString : string = '';
  private endTime: string = '00:00:00';
  private endTimeString : string = '';

  constructor(private router: Router, private httpService: HttpService) {
    this.agGridOptions = {
      enableServerSideSorting: true,
      enableColResize: true,
      rowSelection: 'single',
      rowDeselection: true,
      suppressContextMenu:true,
      rowModelType: 'serverSide',
      pagination:true,
      paginationPageSize: this.rowLimit,
      cacheBlockSize: this.rowLimit,
      maxBlocksInCache:1,
      maxConcurrentDatasourceRequests: 2,
      toolPanelSuppressSideButtons:true,
      defaultColDef:{suppressMenu:true}
    };
  }

  ngOnInit() {
    this.startDate = this.addDays(new Date(), 0);
    this.endDate = this.addDays(new Date(), 1);
    this.startDateCopy = this.convertDate(this.startDate);
    this.endDateCopy = this.convertDate(this.endDate);
    this.populateGridDataSource(this.searchString);
    this.createAGGrid();
  }

  ngAfterViewInit() {
    const _self = this;
    jQuery('#startTime').timepicker({
      timeFormat: 'HH:mm:ss',
      dropdown: true,
      defaultTime: '0',
      interval: 60,
      scrollbar: true,
      change: function(time){
        let h = time.getHours();
        if (h < 10) h = '0' + h;
        const timeString = `${h}:00:00`;
        _self.startTimeString = timeString;
      }
    });
    jQuery('#endTime').timepicker({
      timeFormat: 'HH:mm:ss',
      dropdown: true,
      defaultTime: '0',
      interval: 60,
      scrollbar: true,
      change: function(time){
        let h = time.getHours();
        if (h < 10) h = '0' + h;
        const timeString = `${h}:00:00`;
        _self.endTimeString = timeString;
      }
    });
  }

  addMonths(date, months) {
    date.setMonth(date.getMonth() + months);
    return date;
  }

  addDays(date, days){
    let resultDate =  new Date();
    resultDate.setDate(date.getDate() + days);
    return resultDate;
  }

  convertDate(date) {
    var yyyy = date.getFullYear().toString();
    var mm = (date.getMonth() + 1).toString();
    var dd = date.getDate().toString();
    var mmChars = mm.split('');
    var ddChars = dd.split('');
    return yyyy + '-' + (mmChars[1] ? mm : "0" + mmChars[0]) + '-' + (ddChars[1] ? dd : "0" + ddChars[0]);
  }

  searchErrorLogs(){
    this.populateGridDataSource(this.searchString);
    this.agGridOptions.api.setServerSideDatasource(this.glbDataSource);
  }

  onCellClicked(event) {
    let colId = event.column.colId;
    let errorId = event.data.errorId;

    if (colId == 'errorId')
      this.router.navigate(['pages/error-monitor/error-log-detail', { errorId }]);
  }

  createAGGrid(){
    this.agGridOptions.columnDefs = [
      {
        headerName: "Error #",
        field: "errorId",
        headerClass: "grid-header",
        width: 100
      },
      {
        headerName: "Application",
        field: "application",
        headerClass: "grid-header",
        width: 100
      },
      {
        headerName: "Request Url",
        field: "url",
        headerClass: "grid-header",
        width: 300
      },
      {
        headerName: "Error Message",
        field: "errorMessage",
        headerClass: "grid-header",
        width: 400
      },
      {
        headerName: "Exception Type",
        field: "exceptionType",
        headerClass: "grid-header",
        width: 250
      },
      {
        headerName: "Username",
        field: "user",
        headerClass: "grid-header",
        width: 175
      },
      {
        headerName: "Timestamp",
        field: "timestamp",
        headerClass: "grid-header",
        width: 125
      }
    ];

    this.agGridOptions.serverSideDatasource = this.glbDataSource;
  }

  populateGridDataSource(searchString: string){
    const _self = this;

    let dataSource = {
      getRows: function (params) {
        //Declare rowLimit/rowOffset for API
        let rowLimit = params.request.endRow - params.request.startRow;
        let rowOffset = params.request.startRow;

        let sortCol = '';
        let sortOrder = '';
        let descSort = false;
        //Sort detected
        if (params.request.sortModel[0]) {
          sortCol = params.request.sortModel[0].colId;
          sortOrder = params.request.sortModel[0].sort;
          switch (sortOrder) {
            case "asc":
              descSort = false;
              break;

            case "desc":
              descSort = true;
              break;
          }
        }
        let appId = _self.application === '0' ? '' : _self.application
        
        let url = 'api/error-logging/errorLogList?searchString=' + searchString + '&rowLimit=' + rowLimit + '&rowOffset=' + rowOffset + '&sortBy=' 
          + sortCol + '&descSort=' + descSort + '&dateStart=' + _self.startDateCopy + ' ' + _self.startTimeString  + '&dateEnd=' 
          + _self.endDateCopy + ' ' + _self.endTimeString + '&appId=' + appId;
        _self.httpService.Get(url).map(res => res.json()).subscribe(data => {
          let errorLogList = data.errorLogList;
          _self.totalRowCount = data.totalRowCount;
          let errorLogDataService = [];
          errorLogList.forEach(element => {
            errorLogDataService.push({
              errorId: element.errorId,
              application: element.application,
              url: element.url,
              exceptionType: element.exceptionType,
              errorMessage: element.errorMessage,
              user: element.user,
              timestamp: element.timestamp
            })
          });
            //Callback return total row count
            params.successCallback(errorLogDataService, data.totalRowCount);
      
        });
      }
    };
    this.glbDataSource = dataSource;
  }
}
