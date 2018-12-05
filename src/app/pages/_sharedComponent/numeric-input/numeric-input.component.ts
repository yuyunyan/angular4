import { Component, OnInit, AfterViewInit, ViewChild , ElementRef, OnDestroy } from '@angular/core';
import { AgEditorComponent } from "ag-grid-angular";
@Component({
  selector: 'az-numeric-input',
  template: `
  <input style="width: 100%; min-width:50px; max-width: 100px; height:30px; text-align:left;" type="number" min="0" class="small-number-input" [(ngModel)]="colValue"	/>
  `,
  styles: []
})
export class NumericInputComponent implements OnInit, AgEditorComponent, AfterViewInit, OnDestroy {


  ngOnDestroy(): void {
		//this.container.element.nativeElement.remove();
	}
	public params: any;
  private colName: string;
  private colValue : number ;
  private integerOnly: boolean;
  private periodChar = 190;
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
      this.colValue = params.readFromProperty ? params.node.data[params.readFromProperty] : this.params.value;
      
      if(params.integerOnly){
        let fullStopIndex = this.allowedKeys.indexOf(this.periodChar);
        let decimalIndex = this.allowedKeys.indexOf(this.decimalChar);
        this.allowedKeys.splice(fullStopIndex, 1);
        this.allowedKeys.splice(decimalIndex, 1);
      }


      
      if(this.colName == "allocatedQty"){
        const regex = /[^0-9]/g;

        let allocated = parseInt(String(params.node.data.allocatedQty).replace(regex, ''))
        let poLineAvailableQty = parseInt(String(params.node.data.poLineQtyAvailableToAllocate).replace(regex,''));
        let needed = parseInt(String(params.node.data.reserceQty).replace(regex, ''))
        
        if(allocated == 0){
          let qty = (poLineAvailableQty >= needed ? needed : poLineAvailableQty);    
          allocated = qty ;
          this.colValue = qty;
        }
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
      return this.colValue;
    }

    isPopup():boolean {
      return false;
    }
  
    focusIn()
    {
      this.el.nativeElement.firstElementChild.focus();
    }
   
    
}
