export class MenuItem{
	title: string;
	routerLink: string;
	icon?: string;
	selected: boolean = false;
	expanded: boolean = false;
	order: number;
	subMenu?: Array<SubMenu>;
};

export class SubMenu{
	title: string;
	routerLink: string;
	icon?: string;
};
