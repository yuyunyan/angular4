import { Component, OnInit, OnDestroy } from '@angular/core';
import { ICellRendererAngularComp } from "ag-grid-angular/main";
import { CheckRowService } from './check-row.service';

@Component({
  selector: 'az-check-row',
	template: `
		<div style="display: block; flex-flow: row; justify-content: center; align-items: center; height: 100%;">
			<input data-field-name="Permissions" style="height: 60%; position: absolute; top: 20%;" type="checkbox" class="form-control" [disabled]="onReadonly" name="checked"
				[(ngModel)]="checked" (change)="onCheckboxStateChange($event)"/>
		</div>
	`
})
export class CheckRowComponent implements OnInit, ICellRendererAngularComp, OnDestroy {

  private checked: boolean;
	private onReadonly: boolean;
	private permissionId: number;
  constructor(private checkRowService: CheckRowService) { 
	}
  private params:any;

  ngOnInit() {}
  
  agInit(params: any): void {
		this.checked = params.data.checked;
		this.permissionId = params.data.permissionId;
    this.onReadonly = params.data.onReadonly;
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

	}

	onCheckboxStateChange(value){
		this.checkRowService.checkboxStatusChanges(this.permissionId, this.checked);
	}

  ngOnDestroy(): void {
    
  }
}
