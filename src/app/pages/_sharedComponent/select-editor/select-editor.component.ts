import { Component, OnInit,AfterViewInit,ViewChild,ViewContainerRef, OnDestroy} from '@angular/core';
import { AgEditorComponent } from "ag-grid-angular";
import { PurchaseOrdersService } from './../../../_services/purchase-orders.service';

@Component({
    selector: 'editor-cell',
    template: `
    <select #container class="form-control" type="number" [(ngModel)]="selectedValue" name="statusDropDown">
              <option *ngFor="let option of options" [value]="option.id">{{option.name}}</option>
            </select>
    `,
		styles: []
})
export class SelectEditorComponent implements AgEditorComponent, AfterViewInit, OnDestroy {
    
	ngOnDestroy(): void {
		this.container.element.nativeElement.remove();
	}
	private params: any;
	private _params;
	private options: any[];
	private selectedValue:any;

	constructor(private purchaseService: PurchaseOrdersService) {	}

	@ViewChild('container', {read: ViewContainerRef}) container;
	
	// dont use afterGuiAttached for post gui events - hook into ngAfterViewInit instead for this
	ngAfterViewInit() {}

	agInit(params:any):void {
		this._params = params;
		const objectTypeId = params.node.data.objectTypeId;
		this.selectedValue = params.value.id;
		this.options = params.values;
	}

	getValue():any {
		if (this.selectedValue == 'true')
			this.selectedValue = true;
		else if (this.selectedValue == 'false')
			this.selectedValue = false;
		let selectedObject = this.options.find(x => x.id == +this.selectedValue);
		this._params.value = selectedObject; 
		return selectedObject;
	}

	isPopup():boolean {
		return false;
	}

	focusIn()
	{
		this.container.element.nativeElement.focus();
	}

	onKeyDown(event):void {
		let key = event.which || event.keyCode;

		if (key == 13)
		{
				event.stopPropagation();
		}

		if (key == 37 ||  // left
			key == 39) {  // right

			event.stopPropagation();


		}
	}
}
