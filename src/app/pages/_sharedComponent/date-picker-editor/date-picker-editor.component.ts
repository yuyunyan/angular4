import { Component, OnInit,AfterViewInit,ViewChild,ViewContainerRef, OnDestroy, ViewEncapsulation} from '@angular/core';
import { AgEditorComponent } from "ag-grid-angular";

@Component({
  selector: 'az-date-picker-editor',
  template: `<input #container class="date-picker" type="date" [(ngModel)]="dateValue" style="width:145px"/>`,
})

export class DatePickerEditorComponent implements AgEditorComponent, AfterViewInit, OnDestroy {
  constructor() { }

  ngOnDestroy(): void {
        this.container.element.nativeElement.remove();
    }
    private params: any;
    private options: any[];
    private selectedValue:any;
    private dateValue:string;
    private preformattedDate: boolean = false;
    @ViewChild('container', {read: ViewContainerRef}) container;
    
    // dont use afterGuiAttached for post gui events - hook into ngAfterViewInit instead for this
    ngAfterViewInit() {}

    agInit(params:any):void {
      let date;
      if(params.value)
      {
        date = params.value;
      }
      else
      {
          date = "";
      }

      //date seems acceptable, do not format it
      if ((Date.parse(date) > 0 && date.indexOf('-') != -1)) {
        this.dateValue = date;
      }

      //format the date
      else {
        let dateArray = date.split("/");
        let month = dateArray[0];
        let day = dateArray[1];
        let year = dateArray[2]; 
        this.dateValue =   year+"-"+month+"-"+day;
      }
    }

    getNewDate()
    {
        let newDate = new Date();
        let month = (newDate.getMonth() + 1);
        

        return "07" + "/" + newDate.getDate() + "/" + newDate.getFullYear();
    }
    

    getValue():any {
      let value = this.dateValue;
      if(value =='' || value.includes('undefined'))
      {
        return null;
      }

      let dateArray = value.split("-");
      let year = dateArray[0];
      let month = dateArray[1];
      let day = dateArray[2]; 
         
      return month+"/"+day+"/"+year;
    }

    isPopup():boolean {
        return false;
    }

    focusIn()
    {
      this.container.element.nativeElement.focus();
      this.container.element.nativeElement.select();
    }

}
