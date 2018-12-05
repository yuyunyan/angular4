import { Http, BaseRequestOptions, Response, ResponseOptions, RequestMethod, XHRBackend, RequestOptions } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';

export function bomResuleFBFactory(backend: MockBackend, options: BaseRequestOptions, realBackEnd: XHRBackend) {

    let accountBasicOptions: any[] = [];

    backend.connections.subscribe((connection: MockConnection) => {
        setTimeout(()=> {
            // if (connection.request.url.includes('api/bom-result/salesOrder') && connection.request.method == RequestMethod.Get) {
            //     let orders = new Array();
            //     let total = 155;
            //     for (let i = 1; i <= total; i++) {
            //         let order = {
            //             soId:1+i.toString(),
            //             orderNo: '10001'+i.toString(),
            //             customer: 'Julia' + i.toString(),
            //             partNumber: 'MPN1224ER' + i.toString(),
            //             mfr: 'IBM' + i.toString(),
            //             bomQty:'100'+i.toString(),
            //             qtySold: '1000'+i.toString(),
            //             bomPrice:'1.68'+i.toString(),
            //             soldPrice:'6.32'+i.toString(),
            //             priceDelta:'4.64'+i.toString(),
            //             unitCost:'1.2'+i.toString(),
            //             gp:'100',
            //             dueDate:'07/11/2017',
            //             shipQty:'200'+i.toString(),
            //             orderStatus:'closed',
            //             saleePerson:'JDoe'+i.toString(),
            //             dateCode: '4455455'+i.toString(),
            //             soDate: '1122'+i.toString(),
            //             shipPerson: 'Jim' + i.toString(),
            //             potential:'15000'+i.toString()
            //         }
            //         orders.push(order);
            //     }
            //     connection.mockRespond(new Response(new ResponseOptions({
            //         status: 200,
            //         body: {
            //             salesOrder: orders
            //         }
            //     })));
            //     return;
            // }
       
            // if (connection.request.url.includes('api/bom-result/summary') && connection.request.method == RequestMethod.Get) {
            //     let results = new Array();
            //     let total = 50;
            //     for (let i = 1; i <= total; i++) {
            //         let result = {
            //             resultId: 1+i.toString(),
            //             partNumber: 'MPN1224ER' + i.toString(),
            //             mfr: 'IBM' + i.toString(),
            //             salesOrder: 135+i.toString(),
            //             inventory: 58+i.toString(),
            //             purchaseOrders:298+i.toString(),
            //             vendorQuotes:97+i.toString(),
            //             customerRfqs:898+i.toString(),
            //             customerQuotes:562+i.toString(), 
            //             outsideOffer:61+i.toString(),
            //             bomEms:575+ i.toString()
            //         }
            //         results.push(result);
            //     }
            //     connection.mockRespond(new Response(new ResponseOptions({
            //         status: 200,
            //         body: {
            //             results: results,
                        
            //         }
            //     })));
            //     return;
            // }

            // if (connection.request.url.includes('api/bom-result/purchaseOrder') && connection.request.method == RequestMethod.Get) {
            //     let orders = new Array();
            //     let total = 155;
            //     for (let i = 1; i <= total; i++) {
            //         let order = {
            //             orderNumber: '10001'+i.toString(),
            //             poLine:1+i.toString(),
            //             vendor: 'Julia' + i.toString(),
            //             poDate:'07/11/2017',
            //             partNumber: 'MPN1224ER' + i.toString(),
            //             mfr: 'IBM' + i.toString(),
            //             bomQty:'100'+i.toString(),
            //             qtyOrdered: '1000'+i.toString(),
            //             bomPrice:'1.68'+i.toString(),
            //             poCost:'6.32'+i.toString(),
            //             priceDelta:'4.64'+i.toString(),
            //             potential:'15000'+i.toString(),
            //             dateCode: '4455455'+i.toString(),
            //             owners:'JDoe'+i.toString(),
            //             unitCost:'1.2'+i.toString(),
            //             receivedDate:'07/11/2017',
            //             receivedQty: 1 + i,
            //             orderStatus:'closed',
            //         }
            //         orders.push(order);
            //     }
            //     connection.mockRespond(new Response(new ResponseOptions({
            //         status: 200,
            //         body: {
            //             purchaseOrder: orders
            //         }
            //     })));
            //     return;
            // }

            // if (connection.request.url.includes('api/bom-result/inventory') && connection.request.method == RequestMethod.Get) {
            //     let orders = new Array();
            //     let total = 155;
            //     for (let i = 1; i <= total; i++) {
            //         let order = {
            //             warehouseId: 10001 + i,
            //             mfgPartNumber:1+i.toString(),
            //             mfg: 'Julia' + i.toString(),
            //             inventoryQty:2+i,
            //             cost: 9.99+i*2.9,
            //             reservedQty: 42+i*21,
            //             availableQty: 42+i*97,
            //             purchaseOrder: 1000+i*2,
            //             dateCode: '20170919' + i.toString(),
            //             priceDelta: 4.64+i,
            //             potential: 15000 +i,
            //             bomPartNumber: '4455455'+i.toString(),
            //             bomIntPartNumber:'JDoe'+i.toString(),
            //             bomMfg:'1.2'+i.toString(),
            //             bomQty:207+i+i,
            //             bomPrice: 1.68 +i,
            //         }
            //         orders.push(order);
            //     }
            //     connection.mockRespond(new Response(new ResponseOptions({
            //         status: 200,
            //         body: {
            //             inventoryLines: orders
            //         }
            //     })));
            //     return;
            // }

            // if (connection.request.url.includes('api/bom-result/outsideOffers') && connection.request.method == RequestMethod.Get) {
            //     let orders = new Array();
            //     let total = 155;
            //     for (let i = 1; i <= total; i++) {
            //         let order = {
            //             offerDate: '9-' + i.toString() + '-17',
            //             vendorName:'Vendor ' + i.toString(),
            //             partNumber:'2'+i.toString(),
            //             mfg: 'mfg' + i.toString(),
            //             qty: 42+i*97,
            //             cost:1.68 +i*12.34/i*67,
            //             bomPartNumber: 'bomPartNumber ' + i.toString(),
            //             bomIntPartNumber: 'bomIntPartNumber ' + i.toString(),
            //             bomMfg: 'bomMfg ' + i.toString(),
            //             bomQty: 42+i*21,
            //             bomPrice: 1000+i*2,
            //             priceDelta: 4.64+i,
            //             potential: 15000 +i,
            //             dateCode: '4455455'+i.toString(),
            //             leadTimeDays: i*2,
            //             buyer:'Buyer '+i.toString()
            //         }
            //         orders.push(order);
            //     }
            //     connection.mockRespond(new Response(new ResponseOptions({
            //         status: 200,
            //         body: {
            //             inventoryLines: orders
            //         }
            //     })));
            //     return;
            // }

            // if ((connection.request.url.includes('api/bom-result/customer-rfqs') || (connection.request.url.includes('api/bom-result/customer-quotes'))) && connection.request.method == RequestMethod.Get) {
            //     let customerRfqs= new Array();
            //     let total = 155;
            //     for (let i = 1; i <= total; i++) {
            //         let rfq = {
            //             quoteDate: '07/11/2017',
            //             customer: 'Julia' + i.toString(),
            //             contact: 'Julia' + i.toString(),
            //             itemId: i,
            //             owners: 'Sales reps',
            //             dateCode: '2014' + i.toString(),
            //             partNumber: 'MPN1224ER' + i.toString(),
            //             customerPartNum: 'MPN1224ER' + i.toString(),
            //             manufacturer: 'IBM' + i.toString(),
            //             qty: '1000'+i.toString(),
            //             targetPrice: '1.68'+i.toString(),
            //             priceDelta: '4.64'+i.toString(),
            //             potential: '15000'+i.toString(),
            //             bomPartNumber: 'MPN1224ER' + i.toString(),
            //             bomIntPartNumber: 'MPN1224ER' + i.toString(),
            //             bomMfg: 'IBM' + i.toString(),
            //             bomQty: '1.68'+i.toString(),
            //             bomPrice: '1.68'+i.toString(),
            //         }
            //         customerRfqs.push(rfq);
            //     }
            //     connection.mockRespond(new Response(new ResponseOptions({
            //         status: 200,
            //         body: {
            //             customerRfqs
            //         }
            //     })));
            //     return;
            // }

            // if (connection.request.url.includes('api/bom-result/ems') && connection.request.method == RequestMethod.Get) {
            //     let emses= new Array();
            //     let total = 155;
            //     for (let i = 1; i <= total; i++) {
            //         let ems = {
            //             created: '07/11/2017',
            //             itemId: i,
            //             customerName: 'Julia' + i.toString(),
            //             partNumber: 'MPN1224ER' + i.toString(),
            //             manufacturer: 'IBM' + i.toString(),
            //             qty: '1000'+i.toString(),
            //             targetPrice: '1.68'+i.toString(),
            //             createdBy: 'User A',
            //             customerPartNum: 'IBM' + i.toString(),
            //             priceDelta: '4.64'+i.toString(),
            //             potential: '15000'+i.toString(),
            //             bomPartNumber: 'MPN1224ER' + i.toString(),
            //             bomIntPartNumber: 'MPN1224ER' + i.toString(),
            //             bomMfg: 'IBM' + i.toString(),
            //             bomQty: '1.68'+i.toString(),
            //             bomPrice: '1.68'+i.toString(),
            //         }
            //         emses.push(ems);
            //     }
            //     connection.mockRespond(new Response(new ResponseOptions({
            //         status: 200,
            //         body: {
            //             emses
            //         }
            //     })));
            //     return;
            // }
       
      


        let realHttp = new Http(realBackEnd, options);
        let requestOptions = new RequestOptions({
            method: connection.request.method,
            headers: connection.request.headers,
            body: connection.request.getBody(),
            url: connection.request.url,
            withCredentials: connection.request.withCredentials,
            responseType: connection.request.responseType
        });
        realHttp.request(connection.request.url, requestOptions)
            .subscribe((response: Response) => {
                connection.mockRespond(response);
            },
            (error: any) => {
                connection.mockError(error);
            });
    }, 0);

});

    console.log('returns bom result fake backend');
    return new Http(backend, options);
   
}

export let fakeBackEndProvider = {
    provide: Http,
    useFactory: bomResuleFBFactory,
    deps: [MockBackend, BaseRequestOptions, XHRBackend]
};
