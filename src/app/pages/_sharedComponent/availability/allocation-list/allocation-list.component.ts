import { Component, OnInit,AfterViewInit,ViewChild,ViewContainerRef, OnDestroy } from '@angular/core';
import { AgEditorComponent } from "ag-grid-angular";

@Component({
  selector: 'az-allocation-list',
  templateUrl: './allocation-list.component.html',
  styleUrls: ['./allocation-list.component.scss']
})
export class AllocationListComponent implements OnInit {

  constructor() { }
  private eGui:any;
  
  ngOnInit() {
    
  }

  private params: any;
   
     init(params){
      
     }

    getGui(){
      
      return this.eGui;
    }
}