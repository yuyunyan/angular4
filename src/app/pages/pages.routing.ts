import { Routes, RouterModule, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { PagesComponent } from './pages.component';
import { AuthGuard } from './../_guards/auth.guard';
import { NgxPermissionsGuard } from 'ngx-permissions';

export const routes: Routes = [
	{
		path: '', 
		component: PagesComponent,
		canActivate: [AuthGuard],
		canActivateChild: [NgxPermissionsGuard],
		children:[
			{ path: '', redirectTo:'dashboard', pathMatch:'full' },
			{	path: 'dashboard', 
				loadChildren: 'app/pages/dashboard/dashboard.module#DashboardModule',
				data: {
					breadcrumb: 'Dashboard',
					permissions: { 
						only: 'dashboard'
					}
				}
			},
			{	path: 'items', 
				loadChildren: 'app/pages/BOM/bom.module#BomModule', 
				data: {
					breadcrumb: 'BOM',
					permissions: { only: ['items/search', 'items/lists','items/part-search'] }
				}
			},
			{	path: 'users',
				loadChildren: 'app/pages/users/users.module#UsersModule',
				data: {
					breadcrumb: 'Users',
					permissions: { only: ['users'] }
				}
			},
			{	path: 'users/user-detail',
				loadChildren:'app/pages/users/users.module#UsersModule',
				data: {
					breadcrumb: 'User-Detail',
					permissions: { only: ['users'] }
				}
			},
			{	path: 'users/user-profile',
			loadChildren:'app/pages/users/users.module#UsersModule',
			data: {
				breadcrumb: 'User-Profile',
				permissions: { only: ['users'] }
			}
			},
			{	path: 'roles',
				loadChildren:'app/pages/roles/roles.module#RolesModule',
				data: {
					breadcrumb: 'Roles',
					permissions: { only: ['roles'] }
				}
			},
			{ path: 'accounts',
				loadChildren:'app/pages/accounts-contacts/accounts-contacts.module#AccountsContactsModule',
				data: {
					permissions: { only: ['accounts/customers', 'accounts/suppliers'] }
				}
			},
			{ path: 'contacts',
				loadChildren:'app/pages/contacts/contacts.module#ContactsModule',
				data: {
					breadcrumb:'contacts'
				}
			},
			{ path: 'items/items', 
				loadChildren:'app/pages/items/items.module#ItemsModule', 
				data: {
					breadcrumb:'items',
					permissions: { only: ['items/items'] }
				}
			},
			{ path: 'quotes',
				loadChildren:'app/pages/quotes/quotes.module#QuotesModule',
				data: {
					breadcrumb:'quotes',
					permissions: { only: ['quotes'] }
				}
			},
			{ path: 'sourcing', 
				loadChildren:'app/pages/sourcing/sourcing.module#SourcingModule', 
				data: {
					breadcrumb: 'sourcing',
					permissions: { only: ['sourcing'] }
				}
			},
			{ path: 'sales-orders', 
				loadChildren:'app/pages/sales-orders/sales-orders.module#SalesOrdersModule', 
				data: {
					breadcrumb: 'sales-orders',
					permissions: { only: ['sales-orders'] }
				}
			},
			{ path: 'purchase-orders',
				loadChildren:'app/pages/purchase-orders/purchase-orders.module#PurchaseOrdersModule', 
				data: {
					breadcrumb: 'purchase-orders',
					permissions: { only: ['purchase-orders'] },
				}
			},
			{ path: 'order-fulfillment', 
				loadChildren:'app/pages/order-fulfillment/order-fulfillment.module#OrderFulfillmentModule', 
				data: {
					breadcrumb: 'order-fulfillment',
					permissions: { only: ['order-fulfillment'] },
				}
			},
			{ path: 'request-to-purchase', 
				loadChildren:'app/pages/request-to-purchase/request-to-purchase.module#RequestToPurchaseModule', 
				data: {
					breadcrumb: 'request-to-purchase',
					permissions: { only: ['request-to-purchase'] },
				}
			},
			{ path: 'quality-control', 
				loadChildren:'app/pages/quality-control/quality-control.module#QualityControlModule',
				data: {
					breadcrumb:'quality-control',
					permissions: { only: ['quality-control/inspections', 'quality-control/checklist'] },
				}
			},
			{ path: 'rfqs',
				loadChildren:'app/pages/rfqs/rfqs.module#RFQsModule',
				data: {
					breadcrumb:'rfqs',
					permissions: { only: ['rfqs'] }
				}
			},
			{ path: 'error-monitor',
				loadChildren:'app/pages/error-monitor/error-monitor.module#ErrorMonitorModule',
				data: {
					breadcrumb: 'error-monitor',
					permissions: { only: ['error-monitor'] }
				}
			},
			{ path: 'workflow-management',
				loadChildren:'app/pages/workflow-management/workflow-management.module#WorkflowManagementModule',
				data: {
					breadcrumb: 'workflow-management',
					permissions: { only: ['workflow-management'] }
				}
			},

			{ path: 'unauthorized',
				loadChildren:'app/pages/unathorized/unathorized.module#UnathorizedModule',
				data: {
					breadcrumb: 'unauthorized'
				}
			},

			{ path: 'Transactions',
				loadChildren:'app/pages/transactions/transactions.module#TransactionsModule',
				data: {
					breadcrumb: 'workflow-management',
					permissions: { only: ['Transactions'] }
				}
			},
			{ path: 'register',
				loadChildren:'app/pages/users/users.module#UsersModule',
				data: {
					breadcrumb: 'register'
				}
			}
		]
	}
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
