import { Component, OnInit, Input, OnChanges, SimpleChange, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { InspectionService } from './../../../../_services/inspection.service';
import { Subject } from 'rxjs/Subject';
import { CheckList } from './../../../../_models/quality-control/inspection/checkList';
import { GridOptions } from "ag-grid";
import { AnswerComponent } from './answer/answer.component';
import { CommentsComponent } from './comments/comments.component';
import { QtyFailedComponent } from './qty-failed/qty-failed.component';
import { InspectedComponent } from './inspected/inspected.component';
import { ImagesComponent } from './inspected/images/images.component';
import { QuestionComponent } from './question/question.component';
import { NotificationsService } from 'angular2-notifications';
import { Button } from 'protractor';
import { NgModel } from '@angular/forms';
import { default as swal } from 'sweetalert2';
import { style } from '@angular/core/src/animation/dsl';

@Component({
  selector: 'az-check-list-grid',
  templateUrl: './check-list-grid.component.html',
  styleUrls: ['./check-list-grid.component.scss']
})
export class CheckListGridComponent implements OnInit, OnDestroy {

  @Input() inspectionId: number;
  @Input() insIsComplete: boolean;
  private checkLists: CheckList[];
  private availableCheckLists: CheckList[];
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private checkListGrid: GridOptions;
  public insComplete:boolean = false;
  private rowData: any[];
  private selectedCheckListId: number;
  private checkListIdArray = [];
  private addedByUser: boolean;
  private checkListId: number;
  private selectedQuestionParams: any;
  @Output() conclusionEmitterData = new EventEmitter();



  public notifyOptions = {
    position: ["top", "right"],
    timeOut: 3000,
    lastOnBottom: true
  }

  ngForFinished(last) {
    if (last) {
      console.log(last);
    }
  }
  constructor(private inspectionService: InspectionService, private notificationService: NotificationsService) {
    let _self = this;
    this.checkListGrid = {
      animateRows: true,
      enableColResize: true,
      suppressScrollOnNewData: true,
      rowHeight: 85,
      suppressContextMenu:true,
      paginationPageSize:25,
      toolPanelSuppressSideButtons:true,
      defaultColDef:{suppressMenu:true},
      localeText: { noRowsToShow: 'No Failed Qty to this Inspection...' },
      context: {
        parentComponent: this
      },
      columnDefs: [
        {
          headerName: "Num",
          field: "number",
          headerClass: "grid-header",
          width: 40,
          cellClass: 'center-content'
        },
        {
          headerName: "Question",
          field: "text",
          cellRendererFramework: QuestionComponent,
          headerClass: "grid-header",
          width: 350
        },
        {
          headerName: "Answer",
          field: "answer",
          headerClass: "grid-header",
          cellRendererFramework: AnswerComponent,
          width: 115,
          cellClass: 'center-content'
        },

        {
          headerName: "Qty Discrepant",
          field: "qtyFailed",
          headerClass: "grid-header",
          cellRendererFramework: QtyFailedComponent,
          width: 100,
          cellClass: 'center-content'
        },
        {
          headerName: "Pictures",
          field: "",
          headerClass: "grid-header",
          cellRenderer: function (params) {
            return _self.imagesCellRenderer(_self, params);
          },//ImagesComponent,
          width: 50,
          cellClass: 'center-content'
        },
        {
          headerName: "Comments",
          field: "comments",
          headerClass: "grid-header",
          cellRendererFramework: CommentsComponent,
          width: 304

        },
        {
          headerName: "Inspected",
          field: "inspected",
          headerClass: "grid-header",
          cellRendererFramework: InspectedComponent,
          width: 70,
          cellClass: 'center-content',
          // lockPinned: true,
          pinned: "right"
        },
      ]
    };

  }

imagesCellRenderer(self, params) {
  var imageCount = params.data.imageCount;
  var btnEl = document.createElement('button');
  btnEl.dataset.toggle = 'modal';
  btnEl.dataset.target = '#mdlImagesComponent' + params.data.id;

  var i = document.createElement('i');
  i.className = 'fas fa-plus';
  btnEl.appendChild(i);

  if (imageCount > 0) {
    var imageCountEl = document.createElement('p');
    imageCountEl.className = 'image-count';
    imageCountEl.style.marginBottom = '0px';
    imageCountEl.innerHTML = '&nbsp;(' + imageCount + ')';
    btnEl.appendChild(imageCountEl);
  }

  btnEl.addEventListener("click", function(){
    self.selectedQuestionParams = params;
  });
  return btnEl;
  
}

  ngOnInit() {
    jQuery('#checkListGrid').resizable({ grid: [10000, 1] });
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    this.insComplete = false;
    let isComplete = changes["insIsComplete"]
    if(isComplete.currentValue){
      this.insComplete = true;
    }
    let idProp = changes["inspectionId"];
    if(idProp){
    this.inspectionId = idProp.currentValue;
    this.loadChecklistsQuestions();
    }
  }

  loadChecklistsQuestions() {
      
    this.inspectionService.getCheckLists(this.inspectionId).takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
      checkLists => {
        this.checkLists = checkLists;
         //use selected checklistID if present, or else use first ID
        var selectedChecklistID = (this.selectedCheckListId? this.selectedCheckListId : this.checkLists[0].id)
       
        if (this.checkLists && this.checkLists.length > 0) {

          this.populateGrid(selectedChecklistID);
          this.getDropdownChecklists();
          this.getConclusionData();

        }
        else {
          this.checkListGrid.api.setRowData([]);
        }
      },
      error => { }
    )
  }

  onCheckListChange(checkListId: number) {
    this.refreshGrid(checkListId);
  }

  populateGrid(checkListId) {
    this.checkListId = checkListId;
    this.selectedCheckListId = checkListId;
    let checkList = this.checkLists.find(x => x.id == checkListId);
    this.rowData = checkList.questions.map(question => {

      return {
        id: question.id,
        answerId: question.answerId,
        number: question.number,
        text: question.text,
        subtext: question.subText,
        answer: question.answer,
        answerTypeId: question.answerTypeId,
        qtyFailed: question.qtyFailed ? question.qtyFailed : 0,
        showQtyFailed: question.showQtyFailed,
        //images:images,
        comments: question.comments,
        inspected: question.inspected,
        inspectionId: this.inspectionId,
        imageCount: question.imageCount,
        canComment: question.canComment,
        completedDate: question.completedDate,
        requiresPicture: question.requiresPicture
      }

    });
    this.checkListGrid.api.setRowData(this.rowData);
    this.checkListGrid.api.sizeColumnsToFit();
    if(this.insComplete){
      jQuery("#checkListGrid textarea, #checkListGrid input, #checkListGrid radio,#checkListGrid button,#checkListGrid span").attr('disabled', true)
      jQuery('.inspected').css("pointer-events", "none");
   }
  }

  save(questionId, qtyFailed: boolean,comments:boolean) {
    let dataToSave = this.rowData.find(x => x.id == questionId);
    this.inspectionService.saveAnswer(dataToSave.answerId, dataToSave.answer, dataToSave.qtyFailed, dataToSave.comments, dataToSave.inspected)
      .takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(
        data => {
          var checklist = this.checkLists.find(x => x.id == this.checkListId);
          var question = checklist.questions.find(x => x.id == questionId);
          if (qtyFailed) {          
            question.qtyFailed = dataToSave.qtyFailed;
            this.getConclusionData();
          }
          if(comments){
            question.comments = dataToSave.comments;
            this.getConclusionData();
          }

        },
        error => { }
      );
  }

  promptImageRequired(message) {
    this.notificationService.error(
      'Warning',
      message,
      {
        pauseOnHover: false,
        clickToClose: false
      }
    )
  }

  insertCheckList(checkListId) {
    console.log("checkList Added id", checkListId);
    this.checkListId = checkListId;
    this.inspectionService.saveChecklistForInspection(this.inspectionId, checkListId).subscribe(data => {
      if (data.isSuccess) {
        this.addedByUser = data.addedByUser;
        console.log("addedByUser", this.addedByUser);
        this.refreshGrid(checkListId);
        this.updateDropdownList(checkListId);
        this.addRemoveBtn(this.addedByUser);
        this.notificationService.success(
          'Good Job',
          'Successfully added the checkList',
        );

      }
    })
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getDropdownChecklists() {
    this.inspectionService.getAvailableCheckLists(this.inspectionId).subscribe(data => {
      this.availableCheckLists = data;
      console.log("availableCheckLists", this.availableCheckLists);
    })
  }

  refreshGrid(checklistId) {
    this.inspectionService.getCheckLists(this.inspectionId).takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
      checkLists => {
        this.checkLists = checkLists;
        if(checklistId){
          this.populateGrid(checklistId);
        }else{
        this.populateGrid(this.checkLists[0].id);
        }
      }
    )
  }

  updateDropdownList(checkListId) {
    for (let i = 0; i < this.availableCheckLists.length; i++) {
      if (this.availableCheckLists[i].id == checkListId) {
        this.availableCheckLists.splice(i, 1);
        break;
      }
    }
  }

  addRemoveBtn(addedByUser) {
    this.checkListIdArray.push(addedByUser);
  };

  removeAvaCheckList(checkListId) {
    const _self = this;
    swal({
      title: 'Are you sure you want to remove this Checklist?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel'

    }).then(function () {
      _self.inspectionService.deleteChecklistForInspection(_self.inspectionId, checkListId).subscribe(data => {
        if (data.isSuccess) {
          // for (let i = 0; i < _self.checkLists.length; i++) {
          //   if (_self.checkLists[i].id == checkListId) {
          //     _self.checkLists.splice(i, 1);
          //     _self.getConclusionData();
          //   }
          // }
          _self.refreshGrid(checkListId);
          _self.updateDropdownListAfterDelete(checkListId);
        }
      })
    }, function () { })

  }

  updateDropdownListAfterDelete(checkListId) {
    let removeCheckListObj = this.checkLists.find(x => x.id == checkListId);
    this.availableCheckLists.push(removeCheckListObj);
  }

  getConclusionData() {
    var conclusionData = new Array();
    this.checkLists.map(checkListData => {
      let questionsData = checkListData.questions;
      questionsData.map(question => {
        if (question.qtyFailed > 0) {
          conclusionData.push({
            checkListName: checkListData.name,
            questionText: question.text,
            comments: question.comments,
            qtyFailed: question.qtyFailed
          })
        }
      })
    })
    this.conclusionEmitterData.emit(conclusionData);
  }



}
