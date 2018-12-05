import { StateEngineRuleGroup } from './stateEngineRuleGroup';
export class StateEngineRule{
	ruleId: number;
	triggerId: number;
	objectTypeId: number;
	ruleName: string;
	ruleOrder: number;
};

export class StateEngineRuleDetail extends StateEngineRule{
	conditions: StateEngineRuleGroup[] = new Array<StateEngineRuleGroup>();
}
