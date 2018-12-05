export class StateEngineColumn {
	tempId?: string;
};

export class StateEngineRuleGroup extends StateEngineColumn{
	isAll: boolean;
	objectTypeId: number;
	parentGroupId?: number;
	ruleGroupId: number;
	ruleId: number;
	type: string;
	columns: Array<StateEngineColumn>;
};

export class StateEngineRuleCondition extends StateEngineColumn{
	comparison: string;
	comparisonName: string;
	comparisonType: string;
	conditionId: number;
	conditionName: string;
	objectTypeId: number;
	ruleConditionId: number;
	ruleGroupId: number;
	staticValue: string;
	type: string;
	valueId?: number;
	valueName?: string;
};

