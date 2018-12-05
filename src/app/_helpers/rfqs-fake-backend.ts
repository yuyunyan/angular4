import { Http, BaseRequestOptions, Response, ResponseOptions, RequestMethod, XHRBackend, RequestOptions } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';

export function RfqsFBFactory(backend: MockBackend, options: BaseRequestOptions, realBackEnd: XHRBackend) {

    let accountBasicOptions: any[] = [];

    backend.connections.subscribe((connection: MockConnection) => {
        setTimeout(()=> {
        
        // if (connection.request.url.includes('api/rfqs/getBasicDetails') && connection.request.method == RequestMethod.Get) {
        //     connection.mockRespond(new Response(new ResponseOptions({
        //         status: 200,
        //         body: {
        //             supplierId:52,
        //             contactId: 270,
        //             statusId: 2
        //         }
        //     })))
        //     return;
        // }

        // if (connection.request.url.includes('api/rfqs/getRFQStatuses') && connection.request.method == RequestMethod.Get) {
        //     connection.mockRespond(new Response(new ResponseOptions({
        //         status: 200,
        //         body: {
        //             rfqStatusList: [
        //                 {
        //                     name: 'Active',
        //                     id:1,
        //                     isDefault:true
        //                 },
        //                 {
        //                     name: 'Hold',
        //                     id:2,
        //                     isDefault:false
        //                 },
        //             ]
        //         }
        //     })))
        //     return;
        // }

        //  if (connection.request.url.includes('api/rfqs/getRFQLines') && connection.request.method == RequestMethod.Get) {
        //     connection.mockRespond(new Response(new ResponseOptions({
        //         status: 200,
        //         body: {
        //             totalRowCount:50,
        //             rfqLines: [
        //                 {
        //                     rfqLineID:123,
        //                     lineNum: 1,
        //                     partNumber: 12,
        //                     manufacturer: 'aaa',
        //                     commodityID: 1,
        //                     commodityName: 'xx',
        //                     qty:123,
        //                     targetCost:12.50,
        //                     dateCode:'121212',
        //                     packagingID:1,
        //                     packagingName:'xx',
        //                     note:'xx xx xx',
        //                     sourcesTotalQty:100,
        //                     statusID: 2,
        //                     itemID:123,
        //                     partNumberStrip: 'xxaa',
        //                     hasNoStock:false
        //                 },
        //                 {
        //                     rfqLineID:333,
        //                     lineNum: 2,
        //                     partNumber: 12,
        //                     manufacturer: 'bb',
        //                     commodityID: 1,
        //                     commodityName: 'aa',
        //                     qty:123,
        //                     targetCost:10.50,
        //                     dateCode:'1231',
        //                     packagingID:1,
        //                     packagingName:'aa',
        //                     note:'hey',
        //                     sourcesTotalQty:200,
        //                     statusID: 3,
        //                     itemID:111,
        //                     partNumberStrip: 'bbb',
        //                     hasNoStock:false
        //                 }
        //             ]
        //         }
        //     })))
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

    console.log('returns contactAccount backend');
    return new Http(backend, options);
   
}

export let fakeBackEndProvider = {
    provide: Http,
    useFactory: RfqsFBFactory,
    deps: [MockBackend, BaseRequestOptions, XHRBackend]
};