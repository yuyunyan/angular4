import { Component, ViewEncapsulation, OnDestroy, Input,
	Output, EventEmitter, SimpleChanges } from '@angular/core';
import { GridOptions, ColumnApi } from "ag-grid";
import { default as swal } from 'sweetalert2';
import { NotificationsService } from 'angular2-notifications';
import { WorkflowManagementService } from './../../../_services/workflow-management.service';
import { Subject } from 'rxjs/Subject';
import { StateEngineRule } from '../../../_models/workflow-management/stateEngineRule';
import * as _ from 'lodash';
import { StateEngineRuleAction } from '../../../_models/workflow-management/stateEngineRuleAction';
import { StateEngineAction } from '../../../_models/workflow-management/stateEngineAction';
import { RuleActionEditorComponent } from './../rule-action-editor/rule-action-editor.component';
import { RuleTargetEditorComponent } from './../rule-target-editor/rule-target-editor.component';

@Component({
	selector: 'az-rule-actions',
	templateUrl: './rule-actions.component.html',
	styleUrls: ['rule-actions.component.scss'],
	encapsulation: ViewEncapsulation.None
})

export class RuleActionsComponent implements OnDestroy {
	private ruleActionsData;
	private gridOptions: GridOptions;
	private ngUnsubscribe: Subject<void> = new Subject<void>();
	private actionOptions: StateEngineAction[];
	private rowHeight = 30;
	private headerHeight = 30;
	private _rule;

	@Input() onReadonly;
	@Output() onActionGridChanged: EventEmitter<any>;
	constructor(
		private workflowManagementService: WorkflowManagementService, 
		private _notificationsService: NotificationsService) {
		const _self = this;
		_self.onActionGridChanged = new EventEmitter<any>();
		_self.gridOptions = {
			enableColResize: false,
			rowHeight: _self.rowHeight,
			headerHeight: _self.headerHeight,
			editType: 'fullRow',
			toolPanelSuppressSideButtons:true,
			defaultColDef:{suppressMenu:true},
            onRowEditingStopped: function(event){
				_self.SyncActionsList(event,_self)
			},
			pagination: true,
			suppressContextMenu:true,
			paginationPageSize: 10
		};
		_self.actionOptions = new Array<StateEngineAction>();
		_self.workflowManagementService.GetRuleSelectionStatus()
      .takeUntil(_self.ngUnsubscribe.asObservable())
      .subscribe(rule => {
        if (rule && rule.ruleId == -1){
          _self.ClearRuleActionList();
        } else if (rule && rule.ruleId){
          _self.SetupSelectedRuleActions(rule);
        } else if (rule && rule.ruleId == 0){
          _self.SetupNewActionList(rule);
        }
    });
	}

	ngOnChanges(changes: SimpleChanges){
		const _self = this;
		let onReadonlyChanges = changes['onReadonly'];
		if (onReadonlyChanges){
			if (_self.gridOptions && _self.gridOptions.api){
				_self.CreateRuleActionGrid();
				_self.gridOptions.api.setRowData(_self.ruleActionsData);
				_self.gridOptions.api.sizeColumnsToFit();
			}
		}
	}

	ngAfterViewInit(){
		const _self = this;
		_self.CreateRuleActionGrid();
		_self.gridOptions.api.setRowData(_self.ruleActionsData);
		_self.gridOptions.api.sizeColumnsToFit();
	}

	private CreateRuleActionGrid(){
    var _self = this;
    let columnDefs = [
      {
        headerName: 'Action',
				field: 'action',
				width: 185,
				editable: !_self.onReadonly,
				headerClass: "grid-header",
				cellEditorFramework: RuleActionEditorComponent,
				cellRenderer: _self.selectCellRenderer,
				cellEditorParams: {
					values: _self.actionOptions
						.map(x => {return {
							id: x.actionId,
							name:x.actionName,
							dynamicValues: x.dynamicValues
						}})
				}
      },
      {
        headerName: 'Target',
				field: 'target',
				editable: !_self.onReadonly,
				width: 195,
				headerClass: "grid-header",
				cellEditorFramework: RuleTargetEditorComponent,
				cellRenderer: _self.selectCellRenderer,
				cellStyle: { 'overflow': 'visible' },
				cellClassRules: {
          'invalid-target-input': function(params){
            return params.data.target.name == "" || !params.data.target.name;
          }
        }
      },
			{
        headerName: "",
        field: "",
				headerClass: "grid-header",
        cellRenderer: function (params) {
          return _self.deleteCellRenderer(_self, params.data);
				},
				hide: _self.onReadonly,
				width: 30,
				maxWidth: 30,
      }
		];
		this.gridOptions.api.setColumnDefs(columnDefs);
	}

	private SyncActionsList(event, _self){
		_self.onActionGridChanged.emit(_self.ruleActionsData);
	}

	private PopulateGrid(rule){
		const _self = this;
		_self.workflowManagementService.StateEngineRuleActionData(rule)
			.takeUntil(_self.ngUnsubscribe.asObservable())
			.subscribe(data => {
				_self.setHeightOfGrid(data[0].length);
				_self.actionOptions = data[1];
				_self.ruleActionsData = _.map(data[0], (ruleAction) => {
					return _self.CreateRowData(ruleAction);
				});
				_self.SyncActionsList(null, _self);
				_self.CreateRuleActionGrid();
				_self.gridOptions.api.setRowData(_self.ruleActionsData);
				_self.workflowManagementService.DelayAsyncObservable(600)
					.takeUntil(_self.ngUnsubscribe.asObservable())
					.subscribe(() => {
						_self.gridOptions.api.sizeColumnsToFit();
				});
		});
	}

	private ClearRuleActionList(){
		const _self = this;
		_self.ruleActionsData = new Array<any>();
		_self.setHeightOfGrid(0);
		_self.gridOptions.api.setRowData(_self.ruleActionsData);
		_self.gridOptions.api.sizeColumnsToFit();
	}

	private CreateRowData(ruleAction: StateEngineRuleAction){
		const _self = this;
		let selectedAction = new StateEngineAction();
		let row = {
			target: {
				id: ruleAction.valueId,
				name: ruleAction.valueId? ruleAction.valueName: ruleAction.staticValue
			},
			action: {
				id: ruleAction.actionId,
				name: ruleAction.actionName
			},
			dynamicValues: [],
			ruleId: ruleAction.ruleId,
			objectTypeId: ruleAction.objectTypeId,
			ruleActionId: ruleAction.ruleActionId
		};

		if (row.action.id){
			selectedAction = _.find(_self.actionOptions, action => action.actionId == row.action.id);
		}

		_.forEach(selectedAction.dynamicValues, dv => {
			row.dynamicValues.push({
				valueId: dv.valueId,
				valueName: dv.valueName
			});
		});

		return row;
	}

	private SetupSelectedRuleActions(rule){
		this._rule = rule;
		this.PopulateGrid(rule);
	}

	private SetupNewActionList(rule){
		const _self = this;
		_self._rule = rule;
		_self.ruleActionsData = [];
		_self.setHeightOfGrid(0);
		_self.workflowManagementService.StateEngineActionListGet(rule.objectTypeId)
			.takeUntil(_self.ngUnsubscribe.asObservable())
			.subscribe(data => {
				_self.actionOptions = data
		});
		_self.gridOptions.api.setRowData(_self.ruleActionsData);
		_self.gridOptions.api.sizeColumnsToFit();
	}

	private onAddAction(){
		const _self = this;
		_self.setHeightOfGrid(_self.ruleActionsData.length + 1);
		let newRuleAction = new StateEngineRuleAction();
		newRuleAction.objectTypeId = _self._rule.objectTypeId;
		newRuleAction.ruleId = _self._rule.ruleId;
		newRuleAction.actionName = "";
		newRuleAction.staticValue = "";
		_self.ruleActionsData.push(_self.CreateRowData(newRuleAction));
		_self.gridOptions.api.setRowData(_self.ruleActionsData);
		let rowIndex = this.ruleActionsData.length - 1;
    this.startEditingRow(rowIndex);  
	}

	private startEditingRow(rowIndex){
    this.gridOptions.api.setFocusedCell(rowIndex, 'action');
    this.gridOptions.api.startEditingCell({
      rowIndex: rowIndex,
      colKey: 'action',
      keyPress: null,
    });
  }

	private selectCellRenderer(params) {
		return params.value? params.value.name: '';
	}
	
	private deleteCellRenderer(_self, rowData){
		let div = document.createElement('div');
		div.className += 'deleteCellAnchor';
		jQuery(div).css({"text-align": "center", "padding-right": "2px"});
		let anchor = document.createElement('a');
		anchor.href = 'javascript:void(0)';
		let i = document.createElement('i');
		i.className = 'fa fas fa-times';
		anchor.appendChild(i);
		anchor.addEventListener("click", function (e) {
			swal({
				title: 'Are you sure you want to delete this action?',
				type: 'warning',
				showCancelButton: true,
				confirmButtonText: 'Confirm',
				cancelButtonText: 'Cancel'
			}).then(function() {
				_self.onDeleteClicked(_self, rowData);
			}, function(){
				
			});
		})
		div.appendChild(anchor);
		return div;
	}

	private onDeleteClicked(_self, rowData){
		_self.ruleActionsData = _.without(_self.ruleActionsData, rowData);
		_self.gridOptions.api.setRowData(_self.ruleActionsData);
		// Sync 
		_self.SyncActionsList(null, _self);
	}

	ngOnDestroy() {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

	setHeightOfGrid(recordsCount){
		let count = (recordsCount < this.gridOptions.paginationPageSize)
			? recordsCount
			: this.gridOptions.paginationPageSize;
		
		if (count == 0){
			count = 4;
		}
    let height = this.getHeight(count + 6);
    document.getElementById('ruleActionsGrid').style.height = height+'px';
	}
	
	getHeight(count:number){
    return (count * (this.rowHeight )) + this.headerHeight;
  }
}
