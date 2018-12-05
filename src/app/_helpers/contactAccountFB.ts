import { Http, BaseRequestOptions, Response, ResponseOptions, RequestMethod, XHRBackend, RequestOptions } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';

export function contactAccountFBFactory(backend: MockBackend, options: BaseRequestOptions, realBackEnd: XHRBackend) {

    let accountBasicOptions: any[] = [];

    backend.connections.subscribe((connection: MockConnection) => {
        setTimeout(()=> {
        // if (connection.request.url.endsWith('api/account/getBasicDetails?accountId=1') && connection.request.method == RequestMethod.Get) {
        //     connection.mockRespond(new Response(new ResponseOptions({
        //         status: 200,
        //         body: {
        //             isSuccess: true,
        //             errorMessage: "",
        //             number: 123,
        //             name: "heyJoe",
        //             website: "www.123.com",
        //             vendorNumber: "12346",
        //             statusId: 2,
        //             accountTypeIds: [2, 3],
        //             companyTypeId: 2
        //         }
        //     })))
        //     return;

        // }
        // if (connection.request.url.endsWith('api/account/getBasicDetailsOptions') && connection.request.method == RequestMethod.Get) {
        //     connection.mockRespond(new Response(new ResponseOptions({
        //         status: 200,
        //         body: {
        //             isSuccess: true,
        //             errorMessage: "",
        //             statusList:
        //             [
        //                 {
        //                     id: 1,
        //                     name: "Active"
        //                 },
        //                 {
        //                     id: 2,
        //                     name: "NotActive"
        //                 }
        //             ],
        //             accountTypes:
        //             [
        //                 {
        //                     id: 1,
        //                     name: "Vendor"
        //                 },
        //                 {
        //                     id: 2,
        //                     name: "Customer"
        //                 },
        //                 {
        //                     id: 3,
        //                     name: "Supplier"
        //                 }

        //             ],
        //             companyTypes:
        //             [
        //                 {
        //                     id: 1,
        //                     name: "OEM"
        //                 },
        //                 {
        //                     id: 2,
        //                     name: "Manufacturer"
        //                 }
        //             ]

        //         }
        //     })))
        //     return;
        // }

        // if (connection.request.url.endsWith('api/account/SetBasicDetails') && connection.request.method === RequestMethod.Post) {
        //     let newAccountBasicOptions = JSON.parse(connection.request.getBody());
        //     var requestBoby = connection.request.json();

        //     accountBasicOptions.push(newAccountBasicOptions);

        //     connection.mockRespond(new Response(new ResponseOptions({
        //         status: 200,
        //         body: {
        //             success: true,
        //             failureMessage: '',
        //             number: 12300009,
        //             name: "heyJoe",
        //             website: "www.123.com",
        //             vendorNumber: "12346",
        //             status: 1,
        //             accountTypes: [2, 3],
        //             companyType: 1
        //         }
        //     })));
        //     return;

        // }

        // if (connection.request.url.endsWith('api/account/getContacts?accountId=1') && connection.request.method === RequestMethod.Get) {
        //     connection.mockRespond(new Response(new ResponseOptions({
        //         status: 200,
        //         body: {
        //             isSuccess: true,
        //             errorMessage: '',
        //             Contacts:
        //             [
        //                 {
        //                     id: 123,
        //                     firstName: 'Joe',
        //                     lastName: 'Contact',
        //                     account: 'Account1',
        //                     title: 'Purchasing Manager',
        //                     phone: '123-456-789',
        //                     email: 'joe@gmal.com',
        //                     owner: 'Julia'

        //                 },
        //                 {
        //                     id: 456,
        //                     firstName: 'Tim',
        //                     lastName: 'Smith',
        //                     title: 'Buyer',
        //                     account: 'Account1',
        //                     phone: '455-343-782',
        //                     email: 'Tim@gmal.com',
        //                     owner: 'Manuka'

        //                 },
        //                 {
        //                     id: 123,
        //                     firstName: 'Joe',
        //                     lastName: 'Contact',
        //                     account: 'Account1',
        //                     title: 'Purchasing Manager',
        //                     phone: '123-456-789',
        //                     email: 'joe@gmal.com',
        //                     owner: 'Julia'

        //                 },
        //             ]

        //         }

        //     })))
        // }

        // if (connection.request.url.endsWith('api/account/getContactDetails?contactId=1') && connection.request.method === RequestMethod.Post) {
        //     let newAccountBasicOptions = JSON.parse(connection.request.getBody());
        //     var requestBoby = connection.request.json();

        //     accountBasicOptions.push(newAccountBasicOptions);

        //     connection.mockRespond(new Response(new ResponseOptions({
        //         status: 200,
        //         body: {
        //             success: true,
        //             failureMessage: '',
        //             statusId: 1,
        //             firstName: 'Joe',
        //             lastName: 'Contact',
        //             title: 'Sales',
        //             locationId: 123,
        //             officePhone: '1233454677',
        //             mobilePhone: '212345433',
        //             fax: '212345433',
        //             email: 'hey@gmail.com'
        //         }
        //     })));
        //     return;

        // }

        // if (connection.request.url.endsWith('api/account/getContactDetails?contactId=1') && connection.request.method === RequestMethod.Get) {
        //     connection.mockRespond(new Response(new ResponseOptions({
        //         status: 200,
        //         body: {
        //             isSuccess: true,
        //             errorMessage: '',
        //             contactId: 123,
        //             statusId: 0,
        //             firstName: 'Joe',
        //             lastName: 'Contact 123',
        //             title: 'Sales',
        //             shippingLocationId: 123,
        //             officePhone: '1233454677',    
        //             mobilePhone: '212345433',
        //             fax: '212345433',
        //             preferredContactMethodId: 0,
        //             email: 'hey@gmail.com',
        //             locationId: 0,
        //             owners: [
        //                 {
        //                     "name": "Aaron Rodecker",
        //                     "id": "1",
        //                     "percentage": 0
        //                 },
        //                  {
        //                     "name": "Julia Thomas",
        //                     "id": "2",
        //                     "percentage": 0
        //                 }
        //             ]

        //         }
        //     })));
        //     return;
        // }

        // if (connection.request.url.endsWith('api/account/getContactDetailsOptions?contactId=1') && connection.request.method === RequestMethod.Get) {
        //     connection.mockRespond(new Response(new ResponseOptions({
        //         status: 200,
        //         body: {
        //             isSuccess: true,
        //             errorMessage: '',
        //             statuses:  [
        //                 {
        //                     Id: 1,
        //                     name: "Active"
        //                 },
        //                 {
        //                     Id: 1,
        //                     name: "Inactive"
        //                 }
        //             ],
        //             locations: [
        //                 {

        //                     locationId: 123,
        //                     name: "Best shipping address",
        //                     formattedAddress: "123, lake forest, irvine",
        //                     typeId: 1,
        //                     countryId: 1,
        //                     addressLine1: "test street",
        //                     addressLine2: "test street 2",
        //                     houseNo: "123",
        //                     street: "hey st",
        //                     addressLine4: "",
        //                     city: "test city",
        //                     stateId: 1,
        //                     postalCode: "1234567",
        //                     district: "test district",
        //                     isDeleted: false

        //                 }
        //             ],
        //             preferredContactMethods:  [
        //                 {
        //                     id: 1,
        //                     name: "aaa"
        //                 }
        //             ]


        //         }
        //     })));
        //     return;
        // };


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
    useFactory: contactAccountFBFactory,
    deps: [MockBackend, BaseRequestOptions, XHRBackend]
};