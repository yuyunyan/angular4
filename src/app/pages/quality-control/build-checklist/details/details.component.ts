import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChange } from '@angular/core';
import { BuildCheckListService } from './../../../../_services/build-checklist.service';
import { CheckList } from './../../../../_models/quality-control/buildCheckList/checkList';
import { CheckListType } from './../../../../_models/quality-control/buildCheckList/checkListType'
import { NotificationsService } from 'angular2-notifications';
import { CheckListParent } from '../../../../_models/quality-control/buildCheckList/checkListParent';

@Component({
  selector: 'az-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit, OnChanges {
  @Input() checkListId;
  @Output() saveTriggered = new EventEmitter<number>();
  @Output() parentSelected = new EventEmitter<boolean>();
  private checkList: CheckList;
  private checkListType: CheckListType[];
  private parentCheckListOptions: CheckListParent[];
  private checkListArray: Array<any>;
  private showParent : boolean = true;
  private disabledType: boolean = false;

  public notifyOptions = {
    position: ["top", "right"],
    timeOut: 3000,
    lastOnBottom: true
  }


  constructor(private checkListService: BuildCheckListService, private _notificationsService: NotificationsService) {
    this.checkList = new CheckList();
    this.checkListType = new Array<CheckListType>();
    this.parentCheckListOptions = new Array<CheckListParent>();
  }

  ngOnInit() {

  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    this.showParent = false;
    let checkListIdProp = changes['checkListId'];
    this.checkListId = checkListIdProp.currentValue;
    if(this.checkListId){
      this.checkListService.getBuildCheckLists().subscribe(
        checkLists => {
          this.checkListArray = checkLists;
          const v = this.checkListArray.find(x => x.id === this.checkListId );
          if(v){
            this.parentChecklistValidate(v)
          }else{
            this.populateDetailsData();
            this.showParent = true;
          }
        });
    }else{
         this.populateOptionsToAddNewCheckList();
    }
  }

  parentChecklistValidate(v){
    if(v.childCheckLists.length > 0){
      this.showParent = false;
    }else{
      this.showParent = true;
    }
  this.populateDetailsData();

}

  populateDetailsData() {
    this.checkListService.getCheckListData(this.checkListId).subscribe(data => {
      this.checkList = data[0];
      this.checkListType = data[1];
      this.parentCheckListOptions = data[2];
      const a = this.parentCheckListOptions.findIndex(x => x.id == this.checkListId);
      if(a > -1){
        this.parentCheckListOptions.splice(a,1);  
      }
      var dateFormatted = this.checkList.effectiveStartDate.split('/');
      if (dateFormatted[0].length == 1)
        dateFormatted[0] =  '0' + dateFormatted[0];
      if (dateFormatted[1].length == 1)
        dateFormatted[1] =  '0' + dateFormatted[1];
      this.checkList.effectiveStartDate = dateFormatted[2] + '-' + dateFormatted[0]  + '-' + dateFormatted[1]
      
      this.onParentChange(this.checkList.parentCheckListId);
    })
  }

  populateOptionsToAddNewCheckList(){
    this.showParent = true;
    this.checkList = new CheckList();
    this.checkListService.getCheckListTypes().subscribe(data=>{
      this.checkListType = data;
    })
    this.checkListService.getParentCheckListOptions().subscribe(data=>{
      this.parentCheckListOptions = data;
    });
  }

  saveCheckListDetails() {
    //Missing fields
    if (this.returnFirstInvalidField()) {
      this._notificationsService.error(
        'Error',
        'You are missing required fields.',
        {
          pauseOnHover: false,
          clickToClose: false
        }
      )
      return;
    }

    //Validated
    this.checkListService.setCheckList(this.checkList)
      .subscribe(data => {
        let res = data.json();
        if (res) {
          //Clear value and hide pane
          this.checkListId = null;
          this.saveTriggered.emit(this.notifyOptions.timeOut);  //emit timeout duration so parent component can use it for a delay before this component
          
          //Notification
          this._notificationsService.success(
            'Good Job',
            'Successfully saved the checklist details',
            {
              pauseOnHover: false,
              clickToClose: false
            }
          )
        }else{
           this._notificationsService.error(
             'Error occurred when saving checkList details'
           )
        }
      })
  }
  returnFirstInvalidField() {
    if (!this.checkList.name)
      return 'Name';

    if (!this.checkList.checklistTypeId)
      return 'Name';

    if (!this.checkList.sortOrder)
      return 'Name';

    if (!this.checkList.effectiveStartDate)
      return 'Name';
    return null;
  }

  onParentChange(value){

    this.disabledType = false;

    if(value){

      let selectedParent = this.parentCheckListOptions.find(rs=>{
        return rs.id == value;
      });

      if( selectedParent ){
        this.disabledType = true;
        this.checkList.checklistTypeId = selectedParent.checklistTypeId;
      }
    }

    this.parentSelected.emit(this.disabledType);

  }

}
