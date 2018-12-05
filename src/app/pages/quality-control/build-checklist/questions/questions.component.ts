import { Component, OnInit, Input, OnChanges, SimpleChange, ViewEncapsulation,OnDestroy,AfterViewInit} from '@angular/core';
import { GridOptions, ColumnApi, IDatasource } from "ag-grid";
import { BuildCheckListService } from './../../../../_services/build-checklist.service';
import { Question } from './../../../../_models/quality-control/buildCheckList/question';
import { AnswerType } from './../../../../_models/quality-control/buildCheckList/answerType';
import { NotificationsService } from 'angular2-notifications';
import { Subject } from 'rxjs/Subject';
 import { AGGridSettingsService } from './../../../../_services/ag-grid-settings.service';
 import { ColumnFilterComponent } from './../../../_sharedComponent/column-filter/column-filter.component';
 import { GridSettings } from './../../../../_models/common/GridSettings';


@Component({
  selector: 'az-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class QuestionsComponent implements OnInit, OnChanges,OnDestroy,AfterViewInit {
  @Input() checkListId;
  private gridName = 'questions';
  private questionGrid: GridOptions;
  private glbDataSource: IDatasource;
  private questionData = [];
  private question: Question;
  private answerTypes: AnswerType[];
  private questionId: number;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private rowLimit: number = 25;
  private rowOffset: number = 0;
  private totalRowCount: number = 1000;
  private defaultGridSettings: GridSettings;
  private questionInvalid: boolean = false;
  private sortInvalid: boolean = false;
  private answerType: boolean = false;

  public notifyOptions = {
    position: ["top", "right"],
    timeOut: 3000,
    lastOnBottom: true
  }


  constructor(
    private agGridSettings : AGGridSettingsService,
    private checkListService: BuildCheckListService, 
    private _notificationsService: NotificationsService) {
      this.questionGrid = {
        paginationPageSize:25,
        suppressContextMenu:true,
        toolPanelSuppressSideButtons:true,
        defaultColDef:{suppressMenu:true}
      };
    this.question = new Question();
    this.defaultGridSettings = new GridSettings();
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    jQuery(".questionGridOuter .quotePartsButton").appendTo(".questionGridOuter .ag-paging-panel");
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    let checkListIdProp = changes['checkListId'];
    this.checkListId = checkListIdProp.currentValue;
    this.createAgGrid();
    this.populateGrid();
  }

  loadGridState() {
    this.defaultGridSettings.ColumnDef = this.questionGrid.columnApi.getColumnState();
    this.defaultGridSettings.SortDef = this.questionGrid.api.getSortModel();
    this.defaultGridSettings.FilterDef = this.questionGrid.api.getFilterModel();
    this.agGridSettings.loadGridState(this.gridName).subscribe(
      data => {
        if (data.ColumnDef != null)
          this.questionGrid.columnApi.setColumnState(JSON.parse(data.ColumnDef));

        if (data.SortDef != null)
          this.questionGrid.api.setSortModel(JSON.parse(data.SortDef));

        if (data.FilterDef != null)
          this.questionGrid.api.setFilterModel(JSON.parse(data.FilterDef));
    })
  }

  createAgGrid() {
    let _self = this;
    this.questionGrid.enableColResize = true;
    // this.questionGrid = {
    //   enableServerSideSorting: true,
    //   enableColResize: true,
    //   rowSelection: 'single',
    //   rowDeselection: true,
    //   rowModelType: 'pagination',
    //   paginationPageSize: 10,
      // onGridReady: e => {
      //   setTimeout( () => {
      //       _self.loadGridState();
      //   }, 0)
      // }
    
    this.questionGrid.columnDefs = [
      {
        headerName: "Sort",
        field: "sort",
        headerClass: "grid-header",
        width: 50
      },
      {
        headerName: "Question Text",
        field: "text",
        headerClass: "grid-header",
        width: 388
      },
      {
        headerName: "Question Subtext",
        field: "subText",
        headerClass: "grid-header",
        width: 388
      },
      {
        headerName: "Type",
        field: "type",
        headerClass: "grid-header",
        width: 125
      },
      // {
      //   headerName: "",
      //   field: "",
      //   headerClass: "grid-header",
      //   cellRenderer: function (params) {
      //     return _self.editClick(_self, params, params.data.questionId);
      //   },
      //   width: 30
      // },
      {
        headerName: "",
        field: "",
        headerClass: "grid-header",
        cellRenderer: function (params) {
          return _self.deleteClick(_self, params, params.data.questionId);
        },
        width: 30,
        // lockPinned: true,
        pinned: "right"
      }
    ]

  }
  onRowDoubleClicked(event) {
    var _self = this;
    this.questionId = event.data.questionId;
    this.checkListService.getQuestionDetailsData(this.questionId).takeUntil(_self.ngUnsubscribe.asObservable())
    .subscribe(data => {
      if(data[0].inspection){
        jQuery('input[name="email"]').show();
        }
      console.log(data);
      _self.question = data[0];
        _self.answerTypes = data[1];
        jQuery('#mdlAddQuestion').modal('show');
      })
  }

  editClick(_self, params, questionId) {
    let anchor = document.createElement('a');
    let i = document.createElement('i');
    i.setAttribute('aria-hidden', 'true');
    i.setAttribute('data-toggle', 'modal');
    i.setAttribute('data-target', '#mdlAddQuestion');
    i.className = 'fas fa-pen-square';
    i.id = 'pencilBtn';
    anchor.appendChild(i);
    anchor.addEventListener("click", function () {
      _self.questionId = questionId;
      _self.checkListService.getQuestionDetailsData(questionId).takeUntil(_self.ngUnsubscribe.asObservable())
      .subscribe(data => {
        _self.question = data[0];
        _self.answerTypes = data[1];
      })
    })
    return anchor;
  }

  deleteClick(_self, params, questionId) {
    let anchor = document.createElement('a');
    let i = document.createElement('i');
    i.setAttribute('aria-hidden', 'true');
    i.setAttribute('data-toggle', 'modal');
    i.setAttribute('data-target', '#mdlDeleteQuestion');
    i.className = 'fas fa-times';
    i.id = 'pencilBtn';
    anchor.appendChild(i);
    anchor.addEventListener("click", function () {
      _self.questionId = questionId;
    })
    return anchor;
  }

  // saveGridState_Click($event){
  //     this.agGridSettings.saveGridState(this.gridName, this.questionGrid).subscribe(
  //       data => {
  //         console.log(data);
  //         var alertEl = jQuery(event.target).parent('.ag-grid-sort').find('.grid-Alert');
  //         jQuery(alertEl).fadeIn("slow");
  //         jQuery(alertEl).delay(5000).fadeOut( "slow", function() {
  //           // Animation complete.
  //         });
  //       });
  //   }

//   exportGrid_Click(event) {
//     let url = 'api/qc-checklist/getQuestionExportList?checkListId=' + this.checkListId;
//     var senderEl = event.currentTarget;
//     //Button disabled/text change
//     jQuery(senderEl).attr('disabled','')
//     jQuery(senderEl).find('span').text('Exporting...');

//     this.agGridSettings.GetGridExport(url).subscribe(
//       data => {
//         if (data.success) {
//           console.log("success");
//           //Button enabled/text change
//          jQuery(senderEl).removeAttr('disabled');
//          jQuery(senderEl).find('span').text('Export');
//          //Alert Animation
//          var alertEl = jQuery(senderEl).parent('.ag-grid-sort').find('.grid-Download');
//          jQuery(alertEl).fadeIn("slow");
//          jQuery(alertEl).delay(5000).fadeOut( "slow", function() {
//            // Animation complete.
//          });
//         }
//       })
//  }

  populateGrid() {
    this.checkListService.getQuestionsByCheckListId(this.checkListId).takeUntil(this.ngUnsubscribe.asObservable())
    .subscribe(questions => {
      let dataSource = [];
      questions.forEach(element => {
        dataSource.push({
          sort: element.sort,
          text: element.questionText,
          subText: element.questionSubText,
          type: element.answerTypeName,
          questionId: element.questionId,
          comment: element.canComment,
          inspection: element.printOnInspectReport,
          signature: element.requireSignature,
          picture: element.requiresPicture,
          rejectReport: element.printOnRejectReport
        })
      });
      this.questionData = dataSource;
      //this.questionGrid.api.set(dataSource);
    })
  }

  // resetGridColumns_Click(){
  //     if (this.questionGrid.columnApi && this.questionGrid.columnDefs){
  //       this.questionGrid.columnApi.resetColumnState();
  //     }
  //     if (this.questionGrid.api){
  //       this.questionGrid.api.sizeColumnsToFit();
  //     }
    
  // }

  refreshGrid(){
    this.populateGrid();
  }

  onKeydown($event){
    if($event.key){
      this.questionInvalid = false;
    }
  }

  changeViewType($event){
    if($event.returnValue){
      this.answerType = false;
    }
  }

  sortNumber(){
    if(this.question.sort){
      this.sortInvalid = false;
    }
  }

  addQuestion() {
    this.questionInvalid= false;
    this.answerType = false;
    this.sortInvalid  = false;
    this.question = new Question();
    this.question.checkListId = this.checkListId;
    this.checkListService.getAnswerTypes().takeUntil(this.ngUnsubscribe.asObservable())
    .subscribe(data => {
      this.answerTypes = data;
    })
  }

  deleteQuestion() {
    this.checkListService.deleteQuestion(this.questionId).takeUntil(this.ngUnsubscribe.asObservable())
    .subscribe(data => {
      this._notificationsService.success(
        'Deleted!',
        'Question deleted!',
        {
          pauseOnHover: false,
          clickToClose: false
        }
      )
      jQuery('#mdlDeleteQuestion').modal('hide');
      this.populateGrid();
    });
  }

  returnFirstInvalidField() {
    if (!this.question.questionText){
      return "Question Text";
    }
   if(!this.question.sort){
      return "Sort";
    }
    if(!this.question.answerTypeId){
      return "Answer Type";
    }
  }

  saveQuestion() {
    if (!this.question.questionText){
      this.questionInvalid = true;
    }
    if(!this.question.sort){
      this.sortInvalid = true;
    }
    if(!this.question.answerTypeId){
      this.answerType = true;
    }

    var firstInvalidField = this.returnFirstInvalidField();
    if (firstInvalidField) {
      this._notificationsService.error(
        'Error!',
        'You are missing ' + firstInvalidField + '.',
        {
          pauseOnHover: false,
          clickToClose: false
        }
      )
      return;
    } 

    this.checkListService.setQuestion(this.question.checkListId, this.question.questionId,
      this.question.versionId, this.question.answerTypeId, this.question.questionText, this.question.questionSubText,
      this.question.questionHelpText, this.question.sort, this.question.comment, this.question.picture,
      this.question.signature, this.question.inspection, this.question.rejectReport).takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(data => {
        let res = data.json();
        if (res) {
          this.questionInvalid= false;
          this.answerType = false;
          this.sortInvalid  = false;
          jQuery('#mdlAddQuestion').modal('hide');
          this._notificationsService.success(
            'Good Job',
            'Successfully saved the question',
            {
              pauseOnHover: false,
              clickToClose: false
            }
          )
          this.populateGrid();
        } else {
          this._notificationsService.error(
            'Error occurred when saving checkList details'
          )
        }
      })
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
   }
}
