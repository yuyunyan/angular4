export class RoleDetails{
	roleId: number;
	roleName: string;
	objectTypeId: number;
	permissions: Permission[];
	fields: Field[];
	navigationLinks: NavTree[];
}

export class Permission{
	permissionId: number;
	permName: string;
	description: string;
	selectedForRole: boolean;
	roleId: number;
}

export class Field{
    fieldId: number;
    fieldName: string;
    selectedForRole: boolean;
	isEditable: boolean;
	fieldType: string;
}

export class NavigationLink{
    navId: Number;
	navName: string;
	roleId: number;
    selectedForRole:boolean;
    isLink: boolean;
    childNodes: NavigationLink[];
}

export class NavTree{
	id: number;
	name: string;
	isExpanded?: boolean;
	checked?: boolean;
	children: NavTree[];
	roleId: number;
	indeterminate?: boolean;
};

