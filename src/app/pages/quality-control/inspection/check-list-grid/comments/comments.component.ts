import { Component, OnInit, OnDestroy } from '@angular/core';
import {ICellRendererAngularComp} from "ag-grid-angular/main";
import { AgEditorComponent } from "ag-grid-angular/dist/interfaces";


@Component({
  selector: 'az-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit, ICellRendererAngularComp, OnDestroy {

  private params:any;

  constructor() { }

  ngOnInit() {}
  
  agInit(params: any): void {
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

    onFocusOut(event){
      this.params.context.parentComponent.save(this.params.data.id,false,true);
    }

  ngOnDestroy(): void {
    
  }

}
