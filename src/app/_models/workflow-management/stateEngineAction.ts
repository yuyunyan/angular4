import { DynamicValue } from './stateEngineCondition';
export class StateEngineAction{
	actionId: number;
	actionName: string;
	objectTypeId: number;
	dynamicValues: Array<DynamicValue>;
};
