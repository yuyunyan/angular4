import {Component, ViewChild, ViewContainerRef} from "@angular/core";
import {IAfterGuiAttachedParams, IDoesFilterPassParams, IFilterParams, RowNode} from "ag-grid";
import {IFilterAngularComp} from "ag-grid-angular/main";

@Component({
    selector: 'filter-cell',
    templateUrl: './column-filter.component.html',
    styleUrls: ['./column-filter.component.scss'],
   
})
export class ColumnFilterComponent implements IFilterAngularComp {
	private params: IFilterParams;
	private valueGetter: (rowNode: RowNode) => any;
	public filterText: string = '';

	@ViewChild('input', {read: ViewContainerRef}) public input;

	agInit(params: IFilterParams): void { 
		this.params = params;
		this.valueGetter = params.valueGetter;
	}

	isFilterActive(): boolean {
		return this.filterText !== null && this.filterText !== undefined && this.filterText !== '';
	}

	doesFilterPass(params: IDoesFilterPassParams): boolean {
		const _self = this;
		return this.filterText.toLowerCase()
			.split(" ")
			.every((filterWord) => {
				return _self.valueGetter(params.node)? 
					_self.valueGetter(params.node).toString().toLowerCase().indexOf(filterWord) >= 0
					: false;
			});
	}

	getModel(): any {
		return {value: this.filterText};
	}

	setModel(model: any): void {
		this.filterText = model ? model.value : '';
	}

	ngAfterViewInit(params: IAfterGuiAttachedParams): void {
		setTimeout(() => {
				this.input.element.nativeElement.focus();
		})
	}

	// noinspection JSMethodCanBeStatic
	componentMethod(message: string): void {
		alert(`Alert from ColumnFilterComponent ${message}`);
	}

	applyFilter(event): void {
		// console.log('apply filter ', event.target.value);
		const gridOptions = this.params.rowModel['gridOptionsWrapper'].gridOptions;
		const filterModel = gridOptions.api.getFilterModel();
		if (gridOptions && gridOptions.api){
			gridOptions.api.setFilterModel({
				[this.params.colDef.field]: {
					value: filterModel[this.params.colDef.field].value
				}
			});
		}
		this.params.filterChangedCallback();
	}
	ClearFilter(): void{
		this.filterText = "";
		this.params.filterChangedCallback();
	}
}
