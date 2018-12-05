import { Http, BaseRequestOptions, Response, ResponseOptions, RequestMethod, XHRBackend, RequestOptions } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';

export function orderFulfillmentFBFactory(backend: MockBackend, options: BaseRequestOptions, realBackEnd: XHRBackend) {

    let accountBasicOptions: any[] = [];

    backend.connections.subscribe((connection: MockConnection) => {
        setTimeout(() => {

            // if (connection.request.url.includes('api/order-fulfillment/getPoAndInventoryAvailability') && connection.request.method == RequestMethod.Get) {

            //     let parts = new Array();

            //     let total = 2;
            //     for (let i = 1; i <= total; i++) {
            //         let part = {
            //             type: i % 2 == 0 ? 'Inventory' : 'Po',
            //             id: i + 1,
            //             partNumber: 'Part' + i.toString(),
            //             manufacturer: 'Part ' + i.toString() + ' manuf',
            //             commodityName: 'Com' + i.toString(),
            //             supplier: 'supplier' + i.toString(),
            //             originalQty: 2000,
            //             availableQty: 1000,
            //             cost: 14.00,
            //             dateCode: '1210123',
            //             packagingName: 'packaging' + i.toString(),
            //             delivery: '03/07/2017',
            //             buyer: 'buyer' + i.toString(),
            //             itemId: i,
            //             allocations: 
            //             [
            //                 {
            //                 orderNo:1+i,
            //                 lineNo:1+i,
            //                 customer:'cust '+ i.toString(),
            //                 salesPerson: 'sales'+ i.toString(),
            //                 orderQty: 150,
            //                 resv: 100,
            //                 orderDate: '12/15/2017'
            //                 },
            //             {
            //                 orderNo:2+i,
            //                 lineNo:2+i,
            //                 customer:'cust '+ i.toString(),
            //                 salesPerson: 'sales'+ i.toString(),
            //                 orderQty: 200,
            //                 resv: 75,
            //                 orderDate: '12/15/2017'
            //                 }
            //             ]
            //         }

            //         parts.push(part);
            //     }
            //     connection.mockRespond(new Response(new ResponseOptions({
            //         status: 200,
            //         body:
            //         {
            //             availableLines: parts
            //         }
            //     })));
            //     return;
            // }

            // if (connection.request.url.includes('api/order-fulfillment/orderGrid') && connection.request.method == RequestMethod.Get) {
            //     let orders = new Array();
            //     let total = 155;
            //     for (let i = 1; i <= total; i++) {
            //         let order = {
            //             orderNo: '10001'+i.toString(),
            //             customers: 'Julia' + i.toString(),
            //             partNumber: 'MPN1224ER' + i.toString(),
            //             mfr: 'IBM' + i.toString(),
            //             commodity: 'hello' + i.toString(),
            //             orderQty: '1000'+i.toString(),
            //             reservedQty: '235'+i.toString(),
            //             price: '1.0525'+i.toString(),
            //             packaging: 'packaging' + i.toString(),
            //             dateCode: '4455455'+i.toString(),
            //             shipDate: '1122'+i.toString(),
            //             shipPerson: 'Jim' + i.toString()
            //         }
            //         orders.push(order);
            //     }
            //     connection.mockRespond(new Response(new ResponseOptions({
            //         status: 200,
            //         body: {
            //             ordersList: orders
            //         }
            //     })));
            //     return;
            // }
            
            // if (connection.request.url.includes('api/orderFulfillment/setOrderFulfillmentQty') && connection.request.method == RequestMethod.Post) {
                
            //     connection.mockRespond(new Response(new ResponseOptions({
            //         status: 200,
            //         body: {
            //             errorMessage: null
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

    return new Http(backend, options);

}

export let fakeBackEndProvider = {
    provide: Http,
    useFactory: orderFulfillmentFBFactory,
    deps: [MockBackend, BaseRequestOptions, XHRBackend]
};