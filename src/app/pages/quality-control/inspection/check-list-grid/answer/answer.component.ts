import { Component, OnInit, OnDestroy } from '@angular/core';
import {ICellRendererAngularComp} from "ag-grid-angular/main";
import { AgEditorComponent } from "ag-grid-angular/dist/interfaces";
@Component({
  selector: 'az-answer',
  templateUrl: './answer.component.html',
  styleUrls: ['./answer.component.scss']
})
export class AnswerComponent implements OnInit, ICellRendererAngularComp, OnDestroy {
 

  private answerTypeId:number;
  private answer:string;
  private controlName:string;
  constructor() { }
  private params:any;

  ngOnInit() {}
  
  agInit(params: any): void {
    
    this.answerTypeId = params.data.answerTypeId;
    this.answer = params.data.answer;
    this.controlName = "controlName" + params.data.id;
    this.params = params;
  }

  refresh(params: any): boolean {
    return true;
  }
  
  onKeyDown(event):void {
        let key = event.which || event.keyCode;
        if (key == 37 ||  // left
            key == 39 ||  // left
            key == 38||  // up
            key == 40) {  // down
            event.stopPropagation();
        }
    }

    onChange(event){
      this.params.data.answer = event.currentTarget.value;
      this.params.context.parentComponent.save(this.params.data.id);
      this.params.api.refreshView();
    }


  ngOnDestroy(): void {
    
  }

}
