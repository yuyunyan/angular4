import { Component, ViewEncapsulation, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { GridOptions } from "ag-grid";
import * as XLSX from 'xlsx';
import * as _ from 'lodash';
import { Subject } from 'rxjs/Subject';
import { BOMsService } from './../../../../_services/boms.service';
import { UploadService } from './../../../../_services/upload-service';
import { XLSDataMap, XLSDataMapObject } from './../../../../_models/upload/xlsDataMap';
import { SelectEditorComponent } from './../../../_sharedComponent/select-editor/select-editor.component';

@Component({
	selector: 'az-bom-upload-preview',
	templateUrl: './upload-preview.component.html',
	styleUrls: ['./upload-preview.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class UploadPreviewComponent implements OnChanges, OnDestroy {
	@Input() userUpload;
	@Input() accountMaps: Array<XLSDataMapObject>;
	@Input() itemListTypeId;
	data;
	private dropdownOptions: Array<XLSDataMap>;
	private tableColumnKeys = [];
	private agGridOptions: GridOptions;
	private gridDropdownRequiredMap;
	private dataMapArray: Array<number>;
	private ngUnsubscribe: Subject<void> = new Subject<void>();

	constructor(private uploadService: UploadService,
		private bomsService: BOMsService) {
		const _self = this;
		this.agGridOptions = {
			animateRows: true,
			enableGroupEdit: true,
			onRowEditingStopped: function (event) { _self.updateDataMap(event) },
			singleClickEdit: true,
			suppressRowClickSelection: true,
			editType: 'fullRow',
			pagination: true,
			paginationPageSize: 16,
			onViewportChanged: function () {
				_self.agGridOptions.api.sizeColumnsToFit();
			}
		};
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.itemListTypeId && changes.itemListTypeId.currentValue && changes.itemListTypeId.currentValue > 0) {
			this.itemListTypeId = changes.itemListTypeId.currentValue;
			this.uploadService.getXLSDataMaps(this.itemListTypeId).takeUntil(this.ngUnsubscribe.asObservable()).subscribe(options => {
				// //Try File
				// if (changes.userUpload && changes.userUpload.currentValue) {
				// 	const file = changes.userUpload.currentValue;
				// 	this.parsePreview(file);
					
				// }
				
				//Set default order for Excess type
				// if (this.itemListTypeId == 2)
				// 	this.tableColumnKeys =  [8, 9, 10, 11, 12, 13, 14];
				
				//Set New Columns
				this.dropdownOptions = options;
				 let columnDefs = this.returnEditColumns(this);
				 this.agGridOptions.api.setRowData([]);
				 this.agGridOptions.api.setColumnDefs(columnDefs);
				 this.setDefaultDataMap();
			});
		}
		if (changes.userUpload && changes.userUpload.currentValue) {
			const file = changes.userUpload.currentValue;
			this.parsePreview(file);
			
		}
		if (changes.accountMaps && changes.accountMaps.currentValue) {
			if (this.dataMapArray) {
				this.dataMapArray = this.uploadService.mappingAccountDataMaps(this.dataMapArray, this.accountMaps);
			}
		}
	}

	parsePreview(file) {
		const reader = new FileReader();
		reader.onload = (e: any) => {
			const bstr = e.target.result;
			const wb = XLSX.read(bstr, { type: 'binary', sheetRows: 16 });

			const wsname = wb.SheetNames[0];
			const ws = wb.Sheets[wsname];
			const tempData = XLSX.utils.sheet_to_json(ws, { header: 1, range: "A1:T16" });
			this.aoaToAoO(tempData);
		};
		reader.onloadend = (e: any) => {
			if (this.data && this.data.length > 0) {
				this.tableColumnKeys = _.keys(this.data[0]).map((columnKeys: string) => {
					var re = /[^a-zA-Z0-9\s]/g;
					return columnKeys.replace(re, "")
				});
				this.setDefaultDataMap();
				if (this.accountMaps) {
					this.dataMapArray = this.uploadService.mappingAccountDataMaps(this.dataMapArray, this.accountMaps);
					this.bomsService.setDataMapIdList(this.dataMapArray);
				}
			}
			this.createGrid();
		}
		reader.readAsBinaryString(file);
	}

	aoaToAoO(data) {
		const keys = data.shift();
		let bomEntities = [];
		_.forEach(data, (dataLine, dataIndex) => {
			let bomEntity = {};
			if (dataLine.length > 0) {
				_.forEach(keys, (key, keyIndex) => {
					var re = /[^a-zA-Z0-9\s]/g;
					var searchKey = keys[keyIndex].replace(re, "");
					bomEntity[searchKey] = data[dataIndex][keyIndex];
				});
				bomEntities.push(bomEntity);
			}
		});
		this.data = bomEntities;
	}

	createGrid() {
		let _self = this;
		let columnDefs = this.returnEditColumns(_self);
		this.agGridOptions.api.setRowData([]);
		this.agGridOptions.api.setColumnDefs(columnDefs);
		this.populateGrid();
	}
	returnEditColumns(_self) {
		
		let columnDefs = [
		];
		_.forEach(_self.tableColumnKeys, (key, keyIndex) => {
			let columnItem = {
				headerName: `Excel Col ${keyIndex + 1}`,
				field: key,
				headerClass: "grid-header",
				editable: _self.cellEditable,
				cellRenderer: _self.selectCellRenderer,
				cellEditorFramework: SelectEditorComponent,
				cellEditorParams: {
					values: _self.dropdownOptions.map(x => { return { id: x.id, name: x.name } })
				},
				minWidth: 170
			};
			columnDefs.push(columnItem);
		});

		return columnDefs;
	}
	cellEditable(params) {
		return params.node.rowIndex < 1;
	}

	selectCellRenderer(params) {
		return (params.node.rowIndex < 1)
			? `<div class="preview-header-display">${params.value ? params.value.name : ''}</div>`
			: (params.value ? params.value : '');
	}

	populateGrid() {
		let _self = this;
		let rowData = this.data.map(x => this.createDataRow(x));

		let dropdownRow = {};
		_.forEach(this.tableColumnKeys, (columnKey, keyIndex) => {
			const option = _.find(_self.dropdownOptions, (o) => (o.id) == _self.dataMapArray[keyIndex]);
			dropdownRow[columnKey] = {
				id: option.id,
				name: option.name
			};
		});

		rowData = _.concat([], [dropdownRow], rowData)
		this.agGridOptions.api.setRowData(rowData);
	}

	createDataRow(row) {
		let retValue = {};
		_.forEach(this.tableColumnKeys, (columnKey) => {
			retValue[columnKey] = row[columnKey];
		});
		return retValue;
	}

	setDefaultDataMap() {
		
		let startIndex = 1;
		if (this.itemListTypeId == 2)
			startIndex = 8;
		if (this.dropdownOptions.length - 1 >= this.tableColumnKeys.length) {
			this.dataMapArray = _.range(startIndex, this.tableColumnKeys.length + startIndex);
		} else {
			this.dataMapArray = _.concat([],
				_.range(startIndex, this.dropdownOptions.length),
				_.range(0, this.tableColumnKeys.length - this.dropdownOptions.length + startIndex, 0));
		}
		this.bomsService.setDataMapIdList(this.dataMapArray);
	}

	updateDataMap(row) {
		if (row.node.rowIndex !== 0) {
			return;
		}
		
		const _self = this;
		const newDataMap = _.map(_self.tableColumnKeys, (columnKey: string) => {
			if (row.node.data[columnKey] != undefined)
				return row.node.data[columnKey].id

		});
		_self.dataMapArray = _.concat([], newDataMap);
		_self.validateGridDropdownValues();
	}

	validateGridDropdownValues() {
		const _self = this;
		const requiredColumnIds = _.filter(_self.dropdownOptions, (o) => o.isRequired).map(o => o.id);
		const nonZeroMap = _.filter(_self.dataMapArray, el => el > 0);
		const hasNoneDupe = _self.checkArrayIsUnique(nonZeroMap);
		const requiredMap = _.map(requiredColumnIds, (requiredId) => {
			return {
				id: requiredId,
				matchRequired: _.some(nonZeroMap, el => el === requiredId)
			}
		});
		_self.gridDropdownRequiredMap = requiredMap;
		const hasAllRequired = _.every(requiredMap, rm => rm.matchRequired);

		// console.log(hasNoneDupe);
		// console.log(hasAllRequired);
		// console.log('The map', _self.dataMapArray);
		if (hasNoneDupe && hasAllRequired) {
			_self.bomsService.setDataMapIdList(_self.dataMapArray);
		} else {
			_self.bomsService.setDataMapIdList(undefined);
		}
	}

	checkArrayIsUnique(targetArray) {
		return targetArray.length === new Set(targetArray).size;
	}

	ngOnDestroy() {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}
}
