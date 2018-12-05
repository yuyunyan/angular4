import { Component, OnInit, ViewEncapsulation, Input, Output,EventEmitter, OnChanges, SimpleChange } from '@angular/core';
import { Router, ActivatedRoute, Params  } from '@angular/router';
import { GridOptions, ColumnApi, IDatasource } from 'ag-grid';
import { DocumentsService } from './../../../_services/documents.service';
import { FileDropModule, UploadFile, UploadEvent } from 'ngx-file-drop/lib/ngx-drop';
import { environment } from './../../../../environments/environment';
import { NotificationsService } from 'angular2-notifications';

@Component({
  selector: 'documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class DocumentsComponent implements OnInit {
  private AcData = [];
  private agGridOptions: GridOptions;
  private columnDefs: any;
  private showToast: boolean = true;
  public rowOffset: number = 0;
  public rowLimit: number = 25;
  public totalRowCount: number = 0;
  public sortBy: string = '';
  private glbDataSource : IDatasource;
  public files: UploadFile[] = [];
  @Input() objectTypeId;
  @Input() objectId: number;
  @Input() disableToast: boolean;
  @Output() count = new EventEmitter();
  
  public documentNotifyOptions = {
    position: ["top", "right"],
    timeOut: 3000,
    lastOnBottom: true
  }

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private DocumentsService: DocumentsService, private notificationService: NotificationsService) {
    this.agGridOptions = {
      debug: true,
      enableServerSideSorting: true,
      toolPanelSuppressSideButtons:true,
      suppressContextMenu:true,
      enableColResize: true,
      rowSelection: 'single',
      rowDeselection: true,
      rowModelType: 'serverSide',
      paginationPageSize: this.rowLimit,
      maxConcurrentDatasourceRequests: 2,
      cacheBlockSize: this.rowLimit,
      maxBlocksInCache:1,
      
    };
  }

  ngOnInit() {
    this.CreateAGGrid();
    this.disableToast = false;
    this.activatedRoute.params.subscribe((Params: Params) => {
    })
  }

  ngAfterViewInit(): void {
    this.agGridOptions.api.setServerSideDatasource(this.PopulateGridDataSource());
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    let idProp = changes["objectId"];
    let typeIdProp = changes["objectTypeId"];
    let disallowToast = changes["disableToast"];
    // this.objectId = idProp.currentValue;
    // this.objectTypeId = typeIdProp.currentValue;
    if (disallowToast && disallowToast.currentValue)
      if (disallowToast.currentValue == true)    
        this.showToast = false;

    if (idProp && idProp.currentValue && this.objectTypeId) {
      this.agGridOptions.datasource = this.PopulateGridDataSource();
      console.log('documents loaded for objectTypeId: ' + this.objectTypeId + ', object ID ' + this.objectId)
    }
    else
      console.log('documents not loaded, objectTypeId or objectId not supplied');
  }
 
CreateAGGrid() {
  let _self = this;
  this.agGridOptions.columnDefs = [
    {
      headerName: "Name",
      field: "docName",
      headerClass: "grid-header",
      width: 258,
      cellRenderer: function (params) {
        return _self.editName(_self, params);
      },
    },
    
    {
      headerName: "File",
      field: "fileNameOriginal",
      headerClass: "grid-header",
      width: 250
    },
    {
      headerName: "Uploaded",
      field: "created",
      headerClass: "grid-header",
      width: 203
    },
    {
      headerName: "",
      field: "",
      headerClass: "grid-header",
      cellRenderer: function (params) {
        return _self.download(_self, params);
      },
      width: 30
    },
    {
      headerName: "",
      field: "",
      headerClass: "grid-header",
      cellRenderer: function (params) {
        return _self.delete(_self, params);
      },
      width: 30
    }
  ]

  }
  delete(_self, params){
    let self = this;
    let documentId = params.data.documentId;
    let anchor = document.createElement('a');
    anchor.href = "javascript:void(0)";
    anchor.title = "Delete";
    let i = document.createElement('i');
    i.className = 'fas fa-trash-alt-o';
    anchor.appendChild(i);

    anchor.addEventListener("click", function(){
      self.DocumentsService.deleteDocument(documentId).subscribe(
        data => {
          console.log('document: ' + documentId + ' delete  success');
          self.notificationService.success(
            'Success',
            'Document deleted',
            {
              pauseOnHover: false,
              clickToClose: false
            }
          )
          self.agGridOptions.api.setServerSideDatasource(self.PopulateGridDataSource());
        }
      )
    })

    return anchor;
  }
  editName(_self, params) {
    let documentId = params.data.documentId;
    let input = document.createElement('input');
    input.placeholder = " Enter a file name...";
    input.title = "Name";
    input.className = "document-editable";
    input.value = params.data.docName;
    input.onblur = function () { return _self.saveName(_self, documentId, input.value)}

    return input;
  }

  saveName(_self, documentId, documentName) {
    _self.DocumentsService.saveDocumentName(documentId,  encodeURIComponent(documentName));
  }

  downloadFile(_self, documentLink, fileNameOriginal) {
    _self.DocumentsService.downloadDocument(documentLink, fileNameOriginal).subscribe(
      data => {
        let res = data.doc;
        if (res.success) {
          //Create temp link to "click"
          let url = environment.apiEndPoint + '/Documents/Downloads/' + res.downloadName;
          var element = document.createElement('a');
          element.href = url;
          element.download = res.downloadFile;
          element.style.display = 'none';
          document.body.appendChild(element);
          element.click();   
          document.body.removeChild(element);
        }
    });
  }

  download(_self, params){
    let documentId = params.data.documentId;
    let documentLink = '/Documents/Uploaded/' + params.data.objectTypeId + '/' + params.data.objectId + '/' + params.data.fileNameStored;
    let anchor = document.createElement('a');
    anchor.title = "Download";
    anchor.target = '_blank';
    anchor.className = 'download-link';
    //anchor.download = params.data.fileNameOriginal;

    let i = document.createElement('i');
    i.className = 'fas fa-download';
    anchor.appendChild(i);

    anchor.onclick = function (e) {
      return _self.downloadFile(_self, documentLink, params.data.fileNameOriginal)
    };

    return anchor;
  }

  PopulateGridDataSource() {
    let _self = this;
    var dataSource = {
      getRows: function (params) {
        //Declare rowLimit/rowOffset for API
        let rowLimit = params.request.endRow - params.request.startRow;
        let rowOffset = params.request.startRow;
        
        let sortCol = '';
        let sortOrder = '';
        let DescSort = false;
        //Sort detected
        if (params.request.sortModel[0]) {
          sortCol = params.request.sortModel[0].colId;
          sortOrder = params.request.sortModel[0].sort;
          switch (sortOrder) {
              case "asc":
                  DescSort = false;
                  break;
  
              case "desc":
                  DescSort = true;
                  break;
          }
          if (sortCol == "Status" || sortCol == "Description") {
            console.log('Documents Grid - sort column not supported: ' + sortCol)
          }
  
          else {
            console.log('Documents Grid - sort by: ' + sortCol + ', ' + sortOrder);
          }
        }
        console.log('Documents grid asking for rows  ' + params.startRow + ' to ' + params.endRow);
        if(typeof _self.objectId !== 'undefined' && _self.objectId > 0){
          _self.DocumentsService.getDocuments(_self.objectId, _self.objectTypeId, rowLimit, rowOffset, sortCol, DescSort).subscribe(
            data => {
              let docs = data.results;
      
              //Total Rows
              _self.totalRowCount = data.totalRowCount;
              _self.count.emit(data.totalRowCount);
              console.log('Documents grid total rows: ' + _self.totalRowCount);

              let docService = [];
              console.log(docs);
              docs.forEach(element => {
                docService.push({
                  documentId: element.documentId, 
                  docName: element.docName,
                  fileNameOriginal: element.fileNameOriginal,
                  fileNameStored: element.fileNameStored,
                  created: element.created,
                  objectId: element.objectId,
                  objectTypeId: element.objectTypeId
                })
              })
              if(docService.length==0){
                docService.push({
                  documentId:'',
                  docName:''
                })
                if(_self.agGridOptions.api){
                _self.agGridOptions.api.showNoRowsOverlay();
                }
              }
              params.successCallback(docService, data.totalRowCount);
            }) 
        }
      }
    }
    return dataSource;

  }
  public droppedInput(e) {
    var filesInput = jQuery('#inputDocumentFile')[0].files[0];
    console.log('documents', filesInput);
    console.log('dropped input documents',this.files);
    console.log(this.objectId);
    console.log(this.objectTypeId);
    let self = this;
    self.DocumentsService.saveDocument(this.objectId, this.objectTypeId, filesInput).subscribe(data => {
      let res = data.json();
      if (!res.isSuccess) {                      
        this.notificationService.error(
          'Error',
          `There was an error with your file upload.
           Make sure the file is 3MB or less and does not contain any special characters or symbols.`,
          {
            pauseOnHover: false,
            clickToClose: false
          })
      }
      else {
        //Check if success = true {isSuccess, errorMessage}
        console.log('document upload', data);
        //Successs - reload datasource
        self.agGridOptions.api.setServerSideDatasource(self.PopulateGridDataSource());  
      }
    });
  }    

   public dropped(event: UploadEvent) {
     this.files = event.files;

     let self = this;   
     console.log('dropped documents',this.files);
     self.DocumentsService.saveDocuments(this.objectId, this.objectTypeId, this.files).subscribe(data => {
      let res = data.json();
      if (!res.isSuccess) {
                        
        this.notificationService.error(
          'Error',
          `There was an error with your file upload.
           Make sure the file is 3MB or less and does not contain any special characters or symbols.`,
          {
            pauseOnHover: false,
            clickToClose: false
          })

      }
      else {
        //Check if success = true {isSuccess, errorMessage}

        console.log('document upload', data);
        //Successs - reload datasource
        self.agGridOptions.api.setServerSideDatasource(self.PopulateGridDataSource());     
      }
     });
  }    
  
   public fileOver(event){
     console.log(event);
   }
  
   public fileLeave(event){
     console.log(event);
   }
}
