export class StateEngineCondition{
	conditionId: number;
	conditionName: string;
	objectTypeId: number;
	comparisonType: string;
	dynamicValues: Array<DynamicValue>;
};

export class DynamicValue{
	valueId: number;
	valueName: string;
};
