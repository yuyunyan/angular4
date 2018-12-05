import { Component, OnInit, OnDestroy } from '@angular/core';
import { ICellRendererAngularComp } from "ag-grid-angular/main";
import { RadioSelectService } from './radio-select.service';

@Component({
  selector: 'az-radio-select',
	template: `
		<div style="display: block; flex-flow: row; justify-content: center; align-items: center; height: 100%;">
			<input style="height: 60%; position:absolute; top:20%" type="radio" class="form-control" [name]="radioName"
				[value]="columnId" [(ngModel)]="radioStatus" (change)="onRadioValueChanges($event)"
				[ngStyle]="{'display': !labelField? 'block': 'none'}"/>
		</div>
	`
})
export class RadioSelectComponent implements OnInit, ICellRendererAngularComp, OnDestroy {

  private radioName: string;
	private columnId: string;
	private radioStatus: string;
  constructor(private radioSelectService: RadioSelectService) { }
	private params:any;
	private labelField: boolean = false;

  ngOnInit() {}
  
  agInit(params: any): void {
		this.radioName = params.data.fieldId;
		this.columnId = params.column.colId;
		this.params = params;

		let data = params.data;
		if (data.invisible){
			this.radioStatus = 'invisible';
		} else if (data.visible){
			this.radioStatus = 'visible';
		} else {
			this.radioStatus = 'canEdit';
		}

		if (data.labelField && this.columnId == 'canEdit'){
			this.labelField = true;
		}
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

	}

	onRadioValueChanges(value){
		// console.log(value);
		// console.log('colId', this.columnId);
		// console.log('colId', this.radioName);	
		this.radioSelectService.radioStatusChanges(parseInt(this.radioName), this.columnId);	
	}

  ngOnDestroy(): void {
    
  }
}
