import { Component, OnInit } from '@angular/core';
import { AgEditorComponent } from "ag-grid-angular/dist/interfaces";

@Component({
  selector: 'az-is-default-checkbox',
  templateUrl: './is-default-checkbox.component.html',
  styleUrls: ['./is-default-checkbox.component.scss']
})
export class IsDefaultCheckboxComponent implements OnInit, AgEditorComponent {
  
  private selectedValue:boolean;

  getValue() {
    return this.selectedValue;
  }
  
  constructor() { }

  ngOnInit() {
  }
  agInit(params: any): void {
   this.selectedValue = params.value;
  }

}
