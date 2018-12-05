export const menuItems = [
  {
    title: 'Dashboard',
    routerLink: 'dashboard',
    icon: 'fa-home',
    selected: false,
    expanded: false,
    order: 0
  },
  {
    title: 'Users & Security',
    routerLink: 'pages',
    icon: 'fa fa-user',
    selected: false,
    expanded: false,
    order: 650,
    subMenu: [
      {
        title: 'Login',
        routerLink: '/login'
      },
      {
        title: 'Register',
        routerLink: '/register'
      },
      {
        title:'Users',
        routerLink:'users'
      },
      {
        title:'Roles',
        routerLink:'roles'
      },
    ]
  },
  {
    title: 'Accounts',
    routerLink: 'accounts',
    icon: 'fa-vcard-o',
    selected: false,
    expanded: true,
    order: 450,
    subMenu: [
      // {
      //   title: 'contacts',
      //   routerLink: 'contacts'
      // },
      {
        title: 'accounts',
        routerLink: 'accounts'
      }
    ]
  },
  {
    title: 'Quotes',
    routerLink: 'quotes',
    icon: 'fa-id-card-o',
    selected: false,
    expanded: false,
    order: 450,
    subMenu: [
      {
        title: 'Quotes List',
        routerLink: 'quotes'
      }
    ]
  },
  {
    title: 'Sourcing',
    routerLink: 'sourcing',
    icon: 'fa-id-card-o',
    selected: false,
    expanded: false,
    order: 450,
  },
  {
    title: 'Sales Orders',
    routerLink: 'sales-orders',
    icon: 'fa-id-card-o',
    selected: false,
    expanded: false,
    order: 450,
    subMenu: [
      {
        title: 'Sales Orders List',
        routerLink: 'sales-orders'
      }
    ]
  },
   {
    title: 'Purchase Orders',
    routerLink: 'purchase-orders',
    icon: 'fa-id-card-o',
    selected: false,
    expanded: false,
    order: 450,
    subMenu: [
      {
        title: 'Purchase Orders List',
        routerLink: 'purchase-orders'
      }
    ]
  },
  {
    title: 'Order Fulfilment',
    routerLink: 'order-fulfillment',
    icon: 'fa-tasks',
    selected: false,
    expanded: false,
    order: 450
  },
  {
    title: 'Quality Control',
    routerLink: 'quality-control',
    icon: 'fa-id-card-o',
    selected: false,
    expanded: false,
    order: 450,
    subMenu: [
      {
        title: 'Inspections',
        routerLink: 'quality-control/inspections'
      },
      {
        title: 'Build CheckLists',
        routerLink: 'quality-control/checklist'
      }
    ]
  },
  {
    title: 'BOM',
    routerLink: 'bom',
    icon: 'fa-table',
    selected: false,
    expanded: false,
    order: 900,
    subMenu: [
      {
        title: 'Items',
        icon: 'fa-microchip',
        routerLink: 'bom/items'
      },
      {
        title: 'Lists',
        routerLink: 'bom/lists'
      },
      {
        title: 'Search',
        routerLink: 'bom/search'
      }
    ]
  },
  {
    title: 'RFQs',
    routerLink: 'rfq',
    icon: 'fa-table',
    selected: false,
    expanded: false,
    order: 900,
    subMenu: [
      {
        title: 'RFQ List',
        routerLink: 'rfqs'
      }
    ]
  },
  {
    title: 'Travel',
    routerLink: 'travel',
    icon: 'fas fa-pen-square',
    selected: false,
    expanded: false,
    order: 950,
    subMenu: [
      {
        title: 'Travel Lists',
        routerLink: 'travel/travel-lists'
      },
      {
        title: 'Travel Report',
        routerLink: 'travel/travel-report'
      }
    ]
  },
  {
    title: 'Error Monitor',
    routerLink: 'error-monitor',
    icon: 'fa-exclamation-circle',
    selected: false,
    expanded: false,
    order: 1000,
  },
   
  
];
