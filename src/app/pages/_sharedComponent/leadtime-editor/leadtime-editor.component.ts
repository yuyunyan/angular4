import { Component, OnInit, AfterViewInit, ViewChild , ElementRef, OnDestroy } from '@angular/core';
import { AgEditorComponent } from "ag-grid-angular";
@Component({
  selector: 'az-numeric-input',
  templateUrl: '/leadtime-editor.component.html',
  styles: []
})
export class LeadtimeEditorComponent implements OnInit, AgEditorComponent, AfterViewInit, OnDestroy {


  ngOnDestroy(): void {
		//this.container.element.nativeElement.remove();
	}
	public params: any;
  private colName: string;
  private colValue : number ;
  private integerOnly: boolean;
	private periodChar = 190;
	private options = [
		{id: 'DAYS', name: 'days'},
		{id: 'WEEKS', name: 'weeks'}
  ];
  
  private selectedValue: string;

  private decimalChar = 110;
  private allowedKeys= [46, 8, 9, 27, 13, this.decimalChar, this.periodChar]; // Allow: backspace, delete, tab, escape, enter and .

    constructor(private el: ElementRef) { }

    ngOnInit() {}

    ngAfterViewInit() {
      
      let _self = this;
      this.el.nativeElement.focus();
      this.el.nativeElement.addEventListener("keydown", (event) =>  {this.onKeyDown(event, _self)}, false);
    }
    
    agInit(params: any): void {
      
      this.params = params;
      this.colName = this.params.column.colId;
      this.colValue = this.params.value;

      if(params.integerOnly){
        let fullStopIndex = this.allowedKeys.indexOf(this.periodChar);
        let decimalIndex = this.allowedKeys.indexOf(this.decimalChar);
        this.allowedKeys.splice(fullStopIndex, 1);
        this.allowedKeys.splice(decimalIndex, 1);
      }

      if(!this.colValue && this.colValue == 0){
        this.selectedValue = 'DAYS';
      }else if(this.colValue && this.colValue % 7 == 0){
        this.selectedValue = 'WEEKS';
        this.colValue /= 7;
      } else{
        this.selectedValue = 'DAYS';
      }
    }

    onKeyDown(e, _self): void {
      
      // Allow: backspace, delete, tab, escape, enter and .
      if (jQuery.inArray(e.keyCode, _self.allowedKeys) !== -1 ||
      // Allow: Ctrl+A, Command+A
      (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) || 
      // Allow: home, end, left, right, down, up
      (e.keyCode >= 35 && e.keyCode <= 40)) {
          // let it happen, don't do anything
          return;
      }
      // Ensure that it is a number and stop the keypress
      if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
        e.preventDefault();
      }
    }

    getValue(){

      if(!this.colValue){
        return this.colValue;
      }
      if(this.selectedValue == 'DAYS'){
        return this.colValue;
      } else{
        return this.colValue * 7;
      }
    }

    isPopup():boolean {
      return false;
    }
  
    focusIn()
    {
      this.el.nativeElement.firstElementChild.focus();
    }
   
    
}
