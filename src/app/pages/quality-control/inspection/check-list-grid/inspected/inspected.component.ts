import { Component, OnInit, OnDestroy, ViewChild, ViewContainerRef } from '@angular/core';
import {ICellRendererAngularComp} from "ag-grid-angular/main";
import { AgEditorComponent } from "ag-grid-angular/dist/interfaces";
import { TEMPLATE_TRANSFORMS } from '@angular/compiler';

@Component({
  selector: 'az-inspected',
  templateUrl: './inspected.component.html',
  styleUrls: ['./inspected.component.scss']
})
export class InspectedComponent implements OnInit {

  private params:any;
  private disabled: boolean = false;

	@ViewChild('switch', {read: ViewContainerRef}) switchEl;
  constructor() {
  }

  ngOnInit() {}
  
  agInit(params: any): void {
    this.enableDisableSwitch(params)

  }

  enableDisableSwitch(params){
    this.params = params;

    //if there is an anser, enable the UI switch
    if (params.data.answer || params.data.answerTypeId == 6) {
      this.disabled = false;
    }
    //disable the switch
    else {
      this.disabled = true;
    }
    
  }
  
  refresh?(params: any): void {
    this.enableDisableSwitch(params)
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
      let requiresPicture = this.params.data.requiresPicture;
      let imageCount = this.params.data.imageCount;
      let answerType = this.params.data.answerTypeId ;
      let answerText = this.params.data.answer;
      let commentText = this.params.data.comments;
      
      if(event == false) {
        this.params.data.inspected = event;
        this.params.context.parentComponent.save(this.params.data.id);
      }
      //true boolean
      else{
        //picture check
        if (requiresPicture && (!(imageCount > 0))) {
          jQuery(this.switchEl.element.nativeElement).click();
          this.params.context.parentComponent.promptImageRequired('Please add a picture');
          console.log('Inspection complete not allowed with RequiresPicture = 1 until image added');
        }

        //Custom answer check
        else if ((answerType == 7 || answerType == 5) && !answerText) {
          jQuery(this.switchEl.element.nativeElement).click();
          this.params.context.parentComponent.promptImageRequired('Please enter an answer');
          console.log('Inspection complete not allowed with answerType = 5 or 7 until custom answer made');
        }

        //comment only check
        else if (answerType == 6 && !commentText) {
          jQuery(this.switchEl.element.nativeElement).click();
          this.params.context.parentComponent.promptImageRequired('Please enter a comment');
          console.log('Inspection complete not allowed with answerType = 6 until comment made');
        }

        else{
          this.params.data.inspected = event;
          this.params.context.parentComponent.save(this.params.data.id);
        };

        //no error, save

      }
    }

  ngOnDestroy(): void {
    
  }

}
