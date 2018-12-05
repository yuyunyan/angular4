import { Component, OnDestroy, ViewEncapsulation} from '@angular/core';
import { NotificationsService } from 'angular2-notifications';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import { Guid } from './../../../_utilities/Guid/Guid';
import { WorkflowManagementService } from './../../../_services/workflow-management.service';
import { DynamicValue, StateEngineCondition } from './../../../_models/workflow-management/stateEngineCondition';
import { StateEngineRuleCondition, StateEngineColumn, StateEngineRuleGroup } from './../../../_models/workflow-management/stateEngineRuleGroup';
import * as _ from 'lodash';
import * as pluralize from 'pluralize';
 
@Component({
	selector: 'condition-editor',
	templateUrl: './condition-editor.component.html',
	styleUrls: ['./condition-editor.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class ConditionEditorComponent implements OnDestroy {
	private formError:string;
	private ngUnsubscribe: Subject<void> = new Subject<void>();
	private condition: StateEngineRuleCondition;

	private stateEngineConditions: Array<StateEngineCondition>;
	private stateEngineDynamicValues: Array<DynamicValue>;
	private comparisonData: Array<Object>;

	private newRuleCondition: boolean = false;
	private clearInputObject: Object;
	private _StateEngineRuleGroupRef: StateEngineRuleGroup;
	private _StateEngineRuleConditionRef: StateEngineRuleCondition;
	private preSelectedValue;

	constructor(
		private _notificationsService: NotificationsService,
		private workflowManagementService: WorkflowManagementService,
		private guid: Guid) {

		this.condition = new StateEngineRuleCondition();
		this.stateEngineConditions = new Array<StateEngineCondition>();
		this.stateEngineDynamicValues = new Array<DynamicValue>();

		this.workflowManagementService.GetConditionEditorStatus().subscribe(data =>{
			if (data && data.modalOpen){
				let ruleCondition = data.ruleCondition;
				if (ruleCondition && ruleCondition.type === 'ruleGroup'){
					this.clearDropdownData();
					this.onCreateNewCondition(ruleCondition);
					this._StateEngineRuleGroupRef = ruleCondition;
				} else if (ruleCondition && ruleCondition.type === 'ruleCondition') {
					// Edit ruleCondition
					this.clearDropdownData();
					this.onEditingCondition(ruleCondition);
					this._StateEngineRuleConditionRef = ruleCondition;
				}
			}
		});
	}

	ngOnDestroy() {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

	conditionSaveClicked(){
		const _self = this;
		// Check rule condition validation
		if (_self.ConditionValidation()){
			_self._notificationsService.alert("Invalid Inputs in Condition Editor", "Please fill all the required fields.")
		
			return;
		}
		if (_self.newRuleCondition){
			_self._StateEngineRuleGroupRef.columns.push(this.condition);
		} else {
			_self._StateEngineRuleConditionRef.valueId = this.condition.valueId;
			_self._StateEngineRuleConditionRef.valueName = this.condition.valueName;
			_self._StateEngineRuleConditionRef.staticValue = this.condition.staticValue;
			_self._StateEngineRuleConditionRef.conditionId = this.condition.conditionId;
			_self._StateEngineRuleConditionRef.conditionName = this.condition.conditionName;
			_self._StateEngineRuleConditionRef.comparison = this.condition.comparison;
			_self._StateEngineRuleConditionRef.comparisonName = this.condition.comparisonName;
		}
		_self.workflowManagementService.EmitConditionModalClose();
	}

	private ConditionValidation(){
		const _self = this;
		let invalidCondition: boolean;
		if (!_self.condition.conditionId || !_self.condition.comparison || (
			!_self.condition.staticValue && !_self.condition.valueId)){
				invalidCondition = true;
		}
		return invalidCondition;
	}

	onEditingCondition(ruleCondition: StateEngineRuleCondition){
		const _self = this;
		_self.newRuleCondition = false;
		_self.condition = new StateEngineRuleCondition();
		_self.condition.type = "ruleCondition";
		_self.condition.ruleGroupId = ruleCondition.ruleGroupId
		_self.condition.objectTypeId = ruleCondition.objectTypeId;
		_self.condition.comparison = ruleCondition.comparison;
		_self.condition.comparisonName = ruleCondition.comparisonName;
		_self.condition.valueId = ruleCondition.valueId;
		_self.condition.valueName = ruleCondition.valueName;
		_self.condition.staticValue = ruleCondition.staticValue;
		_self.condition.conditionId = ruleCondition.conditionId;
		_self.condition.conditionName = ruleCondition.conditionName;
		_self.condition.ruleConditionId = ruleCondition.ruleConditionId;
			
		_self.getCondtionsOptions(ruleCondition.objectTypeId);
	}

	onCreateNewCondition(ruleGroup: StateEngineRuleGroup){
		const _self = this;
		_self.newRuleCondition = true;
		_self.condition = new StateEngineRuleCondition();
		_self.condition.tempId = _self.guid.newGuid();
		_self.condition.type = "ruleCondition";
		_self.condition.ruleGroupId = ruleGroup.ruleGroupId
		_self.condition.objectTypeId = ruleGroup.objectTypeId;
			
		_self.getCondtionsOptions(ruleGroup.objectTypeId);
	};

	onConditionChanged(newCondtionId: number){
		const _self = this;
		const newCondtion = _.find(_self.stateEngineConditions, sec => sec.conditionId == newCondtionId);
		_self.comparisonData = _.filter(this.workflowManagementService.GetComparisonData(), compData => compData.comparisonType == newCondtion.comparisonType);
		_self.stateEngineDynamicValues = _.map(newCondtion.dynamicValues, dv => dv);
		_self.condition.conditionName = newCondtion.conditionName;
	};

	getCondtionsOptions(objectTypeId: number){
		const _self = this;
		_self.workflowManagementService.StateEngineConditionsGet(objectTypeId).subscribe(data => {
			_self.stateEngineConditions = data;
			if (!_self.newRuleCondition){
				_self.onConditionChanged(_self.condition.conditionId);
				_self.preSelectedValue = {
					inputName: _self.condition.valueId? _self.condition.valueName: _self.condition.staticValue,
					inputId: _self.condition.valueId,
					isStatic: !!_self.condition.staticValue
				};
			}
		});
	};

	onValueUpdated(value){
		if (!this.condition || !this.condition.conditionId){
			return;
		}
		if (value.isStatic){
			this.condition.staticValue = value.inputName;
			this.condition.valueName = undefined;
			this.condition.valueId = undefined;
		} else{
			this.condition.valueName = value.inputName;
			this.condition.valueId = value.inputId;
			this.condition.staticValue = undefined;
		}
	};

	onComparisonChanged(comparison){
		let comparisonObject = _.find(this.comparisonData, cd => cd.id == comparison);
		this.condition.comparisonName = comparisonObject.value;
	}

	private clearDropdownData(){
		const _self = this;
		_self.comparisonData = [];
		_self.stateEngineDynamicValues = [];
		_self.clearInputObject = {clearObjectState: true};
	}
}
