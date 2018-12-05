import { Component, OnInit, OnDestroy } from '@angular/core';
import {ICellRendererAngularComp} from "ag-grid-angular/main";
import { AgEditorComponent } from "ag-grid-angular/dist/interfaces";


@Component({
  selector: 'az-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss']
})
export class QuestionComponent implements OnInit, OnDestroy {

  private question:string;
  private subText:string;

  constructor() { }

  ngOnInit() {}
  
  agInit(params: any): void {
    
    this.question = params.data.text;
    this.subText = params.data.subtext;
  }

  refresh?(params: any): boolean {
    return true;
  }
 
  ngOnDestroy(): void {
    
  }

}