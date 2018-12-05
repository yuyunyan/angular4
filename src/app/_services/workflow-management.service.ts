import { Injectable } from '@angular/core';
import { HttpService} from './httpService';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import * as _ from 'lodash';
import { FieldPermission } from '../_models/permission/FieldPermission';
import { DynamicValue, StateEngineCondition } from './../_models/workflow-management/stateEngineCondition';
import { StateEngineRuleGroup, StateEngineRuleCondition, StateEngineColumn } from './../_models/workflow-management/stateEngineRuleGroup'
import { StateEngineTrigger } from './../_models/workflow-management/stateEngineTrigger';
import { StateEngineRule, StateEngineRuleDetail } from './../_models/workflow-management/stateEngineRule';
import { StateEngineRuleAction } from './../_models/workflow-management/stateEngineRuleAction';
import { StateEngineAction } from './../_models/workflow-management/stateEngineAction';
import { RuleObjectType } from './../_models/workflow-management/ruleObjectType';

@Injectable()
export class WorkflowManagementService{
	private conditionEditorSubject = new Subject<any>();
	private ruleSelectionSubject = new Subject<any>();
	private ruleViewReloadSubject = new Subject<any>();
	private actionCellUpdateSubject = new Subject<any>();
	private ruleDetailEditingSubject = new Subject<boolean>();

	private ComparisonData = [
		{ id: '=', value: 'Equal To', comparisonType: 'N' }, 
		{ id: '!=', value: 'Not Equal To', comparisonType: 'N' }, 
		{ id: '>', value: 'Greater Than', comparisonType: 'N' }, 
		{ id: '>=', value: 'Greater Than or Equal to', comparisonType: 'N' },
		{ id: '<', value: 'Less Than', comparisonType: 'N' },
		{ id: '<=', value: 'Less Than or Equal To', comparisonType: 'N' },
		{ id: 'in', value: 'In', comparisonType: 'C' },
		{ id: 'not in', value: 'Not In', comparisonType: 'C' },
		{ id: 'True', value: 'is', comparisonType: 'B' },
		{ id: 'False', value: 'is not', comparisonType: 'B' }
	];

	constructor(private httpService: HttpService){

	}

	public EmitConditionModalOpen(ruleCondition): void{
		this.conditionEditorSubject.next({
			modalOpen: true,
			ruleCondition: ruleCondition
		});
	}

	public EmitConditionModalClose(): void{
		this.conditionEditorSubject.next({
			modalOpen: false
		});
	}

	public GetConditionEditorStatus(): Observable<any>{
		return this.conditionEditorSubject.asObservable();
	}

	public RuleSelected(rule): void{
		this.ruleSelectionSubject.next(rule);
	}

	public GetRuleSelectionStatus(): Observable<any>{
		return this.ruleSelectionSubject.asObservable();
	}

	public RuleViewOnReload(ruleId: number, objectTypeId: number,
		ruleName: string, ruleOrder: number, triggerId: number){
		this.ruleViewReloadSubject.next({ruleId, objectTypeId, ruleName, ruleOrder, triggerId});
	}

	public GetRuleViewStatus(): Observable<any>{
		return this.ruleViewReloadSubject.asObservable();
	}

	public ActionCellUpdated(dynamicValues): void{
		this.actionCellUpdateSubject.next(dynamicValues);
	};

	public GetActionCellStatus(): Observable<any>{
		return this.actionCellUpdateSubject.asObservable();
	}

	public RuleDetailIsEditing(isEditing:boolean) {
		this.ruleDetailEditingSubject.next(isEditing);
	}

	public RuleDetailEditingStatus(): Observable<boolean>{
		return this.ruleDetailEditingSubject.asObservable();
	}

	public StateEngineConditionsGet(objectTypeId: number): Observable<Array<StateEngineCondition>>{
		let url = 'api/workflow-management/stateEngineConditionsGet?objectTypeId=' + objectTypeId;
		return this.httpService.Get(url).map(res => {
			let data = res.json();
			let stateEngineConditions = new Array<StateEngineCondition>();
			_.forEach(data.stateEngineConditions, sec => {
				let condition = new StateEngineCondition();
				condition.conditionId = +sec.conditionId;
				condition.conditionName = sec.conditionName;
				condition.objectTypeId = +sec.objectTypeId;
				condition.comparisonType = sec.comparisonType;
				condition.dynamicValues = new Array<DynamicValue>();
				if (sec && sec.dynamicValues){
					_.forEach(sec.dynamicValues, dynamicValue => {
						let dm = new DynamicValue();
						dm.valueId = +dynamicValue.valueId;
						dm.valueName = dynamicValue.valueName;
						condition.dynamicValues.push(dm);
					})
				}
				stateEngineConditions.push(condition);
			});
			return stateEngineConditions;
		});
	}

	public StateEngineRuleGroupsGet(ruleId: number): Observable<StateEngineRuleGroup>{
		const _self = this;
		let url = 'api/workflow-management/stateEngineRuleGroupsGet?ruleId=' + ruleId;
		return this.httpService.Get(url).map(res => {
			// console.log(res.json())
			let data = res.json();
			let rootRuleGroup = new StateEngineRuleGroup();
			rootRuleGroup.columns = new Array<StateEngineColumn>();
			if (data && data.rootRuleGroup){
				let rootData = data.rootRuleGroup;
				rootRuleGroup.isAll = rootData.isAll == 1;
				rootRuleGroup.objectTypeId = rootData.objectTypeId;
				rootRuleGroup.parentGroupId = rootData.parentGroupId;
				rootRuleGroup.ruleGroupId = rootData.ruleGroupId;
				rootRuleGroup.ruleId = rootData.ruleId;
				rootRuleGroup.type = rootData.type;
				if (rootData.columns && rootData.columns.length > 0){
					rootRuleGroup.columns = _self.CreateChildNodes(rootData.columns)
				}
			}
			return rootRuleGroup;
		});
	}

	public StateEngineTriggersGet(objectTypeId: number): Observable<Array<StateEngineTrigger>>{
		let url = 'api/workflow-management/stateEngineTriggersGet?objectTypeId=' + objectTypeId;
		return this.httpService.Get(url).map(res => {
			let data = res.json();
			let triggerOptions = new Array<StateEngineTrigger>();
			_.forEach(data.stateEngineTriggers, triggerResponse => {
				let trigger = new StateEngineTrigger();
				trigger.triggerId = triggerResponse.triggerId;
				trigger.triggerName = triggerResponse.triggerName;
				trigger.objectTypeId = triggerResponse.objectTypeId;
				triggerOptions.push(trigger);
			});
			return triggerOptions;
		});
	}

	public StateEngineRulesGet(objectTypeId: number): Observable<Array<StateEngineRule>>{
		let url = 'api/workflow-management/stateEngineRulesGet?objectTypeId=' + objectTypeId;
		return this.httpService.Get(url).map(res => {
			let data = res.json();
			let ruleOptions = new Array<StateEngineRule>();
			_.forEach(data.stateEngineRuleList, ruleResponse => {
				let rule = new StateEngineRule();
				rule.objectTypeId = ruleResponse.objectTypeId;
				rule.ruleId = ruleResponse.ruleId;
				rule.ruleName = ruleResponse.ruleName;
				rule.ruleOrder = ruleResponse.ruleOrder;
				rule.triggerId = ruleResponse.triggerId;
				ruleOptions.push(rule);
			});
			return ruleOptions;
		});
	}

	public StateEngineRuleDetailSet(payload: StateEngineRuleDetail, ruleActions){
		let url = 'api/workflow-management/ruleDetailSet';
		let rootGroups = _.map(payload.conditions, condition => {
			return this.mapRuleDetailColumns(condition, null);
		});
		let ruleDetail = {
			RuleID: payload.ruleId,
			RuleName: payload.ruleName,
			RuleOrder: payload.ruleOrder,
			TriggerID: payload.triggerId,
			ObjectTypeID: payload.objectTypeId,
			IsDeleted: 0,
			Groups: rootGroups,
			Actions: ruleActions
		};
		// console.log(ruleDetail);
		console.log(JSON.stringify(ruleDetail));
		return this.httpService.Post(url, ruleDetail).map(res => res.json());
	}

	public StateEngineRuleDelete(ruleId: number){
		let url = 'api/workflow-management/ruleDelete';
		let payload = {
			RuleID: ruleId,
			IsDeleted: 1
		};
		return this.httpService.Post(url, payload).map(res => res.json());
	}

	public StateEngineRuleActionData(rule): Observable<[StateEngineRuleAction[], StateEngineAction[]]>{
		return Observable.forkJoin(this.StateEngineRuleActionsGet(rule.ruleId),
			this.StateEngineActionListGet(rule.objectTypeId))
	}

	public StateEngineRuleActionsGet(ruleId: number): Observable<Array<StateEngineRuleAction>>{
		const _self = this;
		let url = 'api/workflow-management/stateEngineRuleActionsGet?ruleId=' + ruleId;
		return this.httpService.Get(url).map(res => {
			let data = res.json();
			let ruleActions = new Array<StateEngineRuleAction>();
			if (data && data.ruleActions){
				_.forEach(data.ruleActions, actionMap => {
					ruleActions.push(_self.mapRuleAction(actionMap));
				});
			}
			return ruleActions;
		});
	}

	public StateEngineActionListGet(objectTypeId: number): Observable<Array<StateEngineAction>>{
		const _self = this;
		let url = 'api/workflow-management/stateEngineActionsGet?objectTypeId=' + objectTypeId;
		return this.httpService.Get(url).map(res => {
			let data = res.json();
			let stateEngineActions = new Array<StateEngineAction>();
			_.forEach(data.actionList, act => {
				let action = new StateEngineAction();
				action.actionId = +act.actionId;
				action.objectTypeId = +act.objectTypeId;
				action.actionName = act.actionName;
				action.dynamicValues = new Array<DynamicValue>();
				if (act && act.dynamicValues){
					_.forEach(act.dynamicValues, dynamicValue => {
						let dm = new DynamicValue();
						dm.valueId = +dynamicValue.valueId;
						dm.valueName = dynamicValue.valueName;
						action.dynamicValues.push(dm);
					})
				}
				stateEngineActions.push(action);
			});
			return stateEngineActions;
		});
	}

	public DelayAsyncObservable(ms: number): Observable<boolean>{
		return Observable.of(true).delay(ms);
  }

	private mapRuleAction(action): StateEngineRuleAction{
		let ruleAction = new StateEngineRuleAction();
		ruleAction.actionId = action.actionId;
		ruleAction.actionName = action.actionName;
		ruleAction.objectTypeId = action.objectTypeId;
		ruleAction.ruleActionId = action.ruleActionId;
		ruleAction.ruleId = action.ruleId;
		ruleAction.staticValue = action.staticValue;
		ruleAction.valueId = action.valueId;
		ruleAction.valueName = action.valueName;
		return ruleAction;
	}

	private mapRuleDetailColumns(ruleGroup: StateEngineRuleGroup, parentGroupId: number){
		const _self = this;
		let requestRuleGroup = {
			IsAll: ruleGroup.isAll,
			ParentGroupID: parentGroupId,
			RuleGroupID: ruleGroup.ruleGroupId,
			RuleID: ruleGroup.ruleId,
			Type: ruleGroup.type,
			Groups: [],
			Conditions: []
		};
		_.forEach(ruleGroup.columns, column => {
			if (column.type == 'ruleCondition'){
				requestRuleGroup.Conditions.push({
					Comparison: column.comparison,
					ConditionID: column.conditionId,
					RuleConditionID: column.ruleConditionId,
					RuleGroupID: column.ruleGroupId,
					StaticValue: column.staticValue,
					Type: column.type,
					ValueID: column.valueId
				});
			} else if (column.type == 'ruleGroup'){
				let group = _self.mapRuleDetailColumns(column, ruleGroup.ruleGroupId);
				requestRuleGroup.Groups.push(group);
			}
		});
		return requestRuleGroup;
	}

	private CreateChildNodes(childrenData):Array<StateEngineColumn>{
		const _self = this;
		let childNodes = new Array<StateEngineColumn>();
		_.forEach(childrenData, childData => {
			if (childData && childData.type == "ruleGroup"){
				let group = _self.CreateGroupObject(childData);
				group.columns = new Array<StateEngineColumn>();
				if (childData.columns && childData.columns.length > 0){
					let grandChildrenData = _self.CreateChildNodes(childData.columns);
					_.forEach(grandChildrenData, grandChildData => {
						group.columns.push(grandChildData);
					});
				}
				childNodes.push(group);
			} else if (childData && childData.type == "ruleCondition"){
				childNodes.push(_self.CreateConditionObject(childData))
			}
		});
		return childNodes;
	}

	private CreateGroupObject(nodeData): StateEngineRuleGroup{
		let group = new StateEngineRuleGroup();
		group.isAll = nodeData.isAll == 1;
		group.objectTypeId = nodeData.objectTypeId;
		group.parentGroupId = nodeData.parentGroupId;
		group.ruleGroupId = nodeData.ruleGroupId;
		group.ruleId = nodeData.ruleId;
		group.type = nodeData.type;
		return group;
	}

	private CreateConditionObject(nodeData): StateEngineRuleCondition{
		let condition = new StateEngineRuleCondition();
		condition.comparison = nodeData.comparison;
		condition.comparisonType = nodeData.comparisonType;
		condition.conditionId = nodeData.conditionId;
		condition.conditionName = nodeData.conditionName;
		condition.objectTypeId = nodeData.objectTypeId;
		condition.ruleConditionId = nodeData.ruleConditionId;
		condition.ruleGroupId = nodeData.ruleGroupId;
		condition.staticValue = nodeData.staticValue;
		condition.type = nodeData.type;
		condition.valueId = nodeData.valueId != 0 ? nodeData.valueId: null;
		condition.valueName= nodeData.valueName;
		condition.comparisonName = '';
		if (condition.comparison){
			let i = _.find(this.ComparisonData, comp => comp.id == condition.comparison);
			condition.comparisonName = i.value;
		}
		return condition;
	}

	public GetComparisonData(){
		return this.ComparisonData;
	}

	public GetRuleDetailPermissions(): Array<FieldPermission>{
		return [
			{
				name: "Rule Name",
				canEdit: true,
				fieldId: 0
			},
			{
				name: "Trigger",
				canEdit: true,
				fieldId: 0
			},
			{
				name: "Rule Order",
				canEdit: true,
				fieldId: 0
			},
			{
				name: "Is All",
				canEdit: true,
				fieldId: 0
			}
		];
	}

	public RuleObjectTypesGet(): Observable<Array<RuleObjectType>>{
		let url = 'api/workflow-management/stateEngineObjectTypesGet';
		return this.httpService.Get(url).map(res => {
			let data = res.json();
			let ruleObjectTypes = new Array<RuleObjectType>();
			_.forEach(data.ruleObjectTypes, ro => {
				let ruleObjectType = new RuleObjectType();
				ruleObjectType.name = ro.name;
				ruleObjectType.objectTypeId = ro.objectTypeId;
				ruleObjectTypes.push(ruleObjectType);
			})
			return ruleObjectTypes;
		})
	}
}
