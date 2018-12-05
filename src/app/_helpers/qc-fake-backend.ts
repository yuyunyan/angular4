import { Http, BaseRequestOptions, Response, ResponseOptions, RequestMethod, XHRBackend, RequestOptions } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';

export function qcFBFactory(backend: MockBackend, options: BaseRequestOptions, realBackEnd: XHRBackend) {

    let accountBasicOptions: any[] = [];

    backend.connections.subscribe((connection: MockConnection) => {
        setTimeout(() => {

            // if (connection.request.url.includes('api/inspection/getCheckLists') && connection.request.method == RequestMethod.Get) {
            
            //     let checkLists = 
            //     [
            //         {
            //             id:1,
            //             name:'level 01',
            //             questions:
            //             [
            //                 {   id:1,
            //                     answerId:1,
            //                     number:1,
            //                     text: 'aaa',
            //                     subText: 'sub text',
            //                     answer:'yes',
            //                     answerTypeId: 1,
            //                     qtyFailed: 0,
            //                     images:
            //                     [
            //                         {
            //                             id:1,
            //                             url: '/images/xx/xxx/1223sdfadfa.jpg'
            //                         },
            //                         {
            //                             id:2,
            //                             url: '/images/xx/xxx/sdfasdfa.jpg'
            //                         }
            //                     ],
            //                     comments: 'comment 1',
            //                     inspected: false
            //                 },
            //                 {
            //                     id:2,
            //                     answerId:2,
            //                     number:2,
            //                     text: 'asdf',
            //                     subText: 'sub text 2',
            //                     answer:'hey text',
            //                     answerTypeId: 7,
            //                     qtyFailed: 0,
            //                     images:
            //                     [
            //                         {
            //                             id:1,
            //                             url: '/images/xx/xxx/1223sdfadfa.jpg'
            //                         },
            //                         {
            //                             id:2,
            //                             url: '/images/xx/xxx/sdfasdfa.jpg'
            //                         }
            //                     ],
            //                     comments: 'comment 2',
            //                     inspected: true
            //                 }
            //             ]
            //         },
            //         {
            //             id:2,
            //             name:'level 02',
            //             questions:
            //             [
            //                 {
            //                     id:3,
            //                     answerId:3,
            //                     number:1,
            //                     text: '2 aaa',
            //                     subText: '2 sub text',
            //                     answerTypeId: 7,
            //                     answer:'hey text 2',
            //                     qtyFailed: 0,
            //                     images:
            //                     [
            //                         {
            //                             id:1,
            //                             url: '/images/xx/xxx/1223sdfadfa.jpg'
            //                         },
            //                         {
            //                             id:2,
            //                             url: '/images/xx/xxx/sdfasdfa.jpg'
            //                         }
            //                     ],
            //                     comments: 'comment 3',
            //                     inspected: true
            //                 },
            //                 {
            //                     id:4,
            //                     answerId:4,
            //                     number:2,
            //                     text: '2 asdf',
            //                     subText: '2 sub text 2',
            //                     answerTypeId: 1,
            //                     answer:'no',
            //                     qtyFailed: 0,
            //                     images:
            //                     [
            //                         {
            //                             id:1,
            //                             url: '/images/xx/xxx/1223sdfadfa.jpg'
            //                         },
            //                         {
            //                             id:2,
            //                             url: '/images/xx/xxx/sdfasdfa.jpg'
            //                         }
            //                     ],
            //                     comments: 'comment 4',
            //                     inspected: false
            //                 }
            //             ]
            //         }	
            //     ]


            //     connection.mockRespond(new Response(new ResponseOptions({
            //         status: 200,
            //         body: 
            //         {
            //             checkLists: checkLists
            //         }})));       
            //     return;
            // }
            
            // if (connection.request.url.includes('api/images/getAnswerImages') && connection.request.method == RequestMethod.Get) {
            
            //     let imageList = {
            //         images:
            //                     [
            //                         {
            //                             id:1,
            //                             url: 'Images/Inspections/1/Answers/1/945d4b42-cff6-492e-891e-12618dc83911.jpg'
            //                         },
            //                         {
            //                             id:2,
            //                             url: 'Images/Inspections/1/Answers/1/945d4b42-cff6-492e-891e-12618dc83911.jpg'
            //                         }
            //                     ]
            //                 }
                        
            //     connection.mockRespond(new Response(new ResponseOptions({
            //         status: 200,
            //         body: 
            //         {
            //             imageList: imageList
            //         }})));       
            //     return;
            // }

            if(connection.request.url.includes('api/quality-control/getBuildCheckLists')&& connection.request.method == RequestMethod.Get){
                let checkLists=[
                    {
                        parentCheckListId:1,
                        checkListName:"Standard CheckList",
                        Type:"Incoming",
                        childCheckList:[
                            {
                                id:101,
                                name:"Level 01"
                            },
                             {
                                id:102,
                                name:"Level 02"
                            },
                            {
                                id:103,
                                name:"Level 03"
                            }
                        ]

                    },
                    {
                        parentCheckListId:2,
                        checkListName:"Level 2 Only",
                        Type:"Incoming",
                        childCheckList:[
                            {
                                id:104,
                                name:"Level 01"
                            },
                             {
                                id:105,
                                name:"Level 02"
                            },
                            {
                                id:106,
                                name:"Level 03"
                            }
                        ]

                    }


                ]
                 connection.mockRespond(new Response(new ResponseOptions({
                    status: 200,
                    body: 
                    {
                        checkLists: checkLists
                    }})));       
                return;
            }
            
               if(connection.request.url.includes('api/quality-control/getQuestions')&& connection.request.method == RequestMethod.Get){
                let questions=[
                    {
                        questionId:1,
                        checkListId:1,
                        sort:9,
                        questionText:"Standard CheckList",
                        questionSubText:"hinde",
                        type:'Yes/No',
                        questionHelpText:"help text",
                        comment:true,
                        inspection:true,
                        signature:true,
                        picture:true,
                        rejection:true

                        
                    },
                     {
                        questionId:2,
                        checkListId:1,
                        sort:29,
                        questionText:" CheckList",
                        questionSubText:"hinde ggg",
                        type:'Yes/No',
                        questionHelpText:"help text",
                        comment:true,
                        inspection:true,
                        signature:true,
                        picture:true,
                        rejection:true
                        
                    },
                    {
                        questionId:3,
                        checkListId:1,
                        sort:59,
                        questionText:"CheckList 3",
                        questionSubText:"hinde ggg 3",
                        type:'Pass/Fail',
                        questionHelpText:"help text",
                        comment:true,
                        inspection:true,
                        signature:true,
                        picture:true,
                        rejection:true,
                        
                    }
                ]
                 connection.mockRespond(new Response(new ResponseOptions({
                    status: 200,
                    body: 
                    {
                        list: questions
                    }})));       
                return;
            }

             if(connection.request.url.includes('api/quality-control/getQuestionDetailById?questionId=1')&& connection.request.method == RequestMethod.Get){
                let question=
                    {
                        questionId:1,
                        checkListId:1,
                        sort:9,
                        questionText:"Standard CheckList",
                        questionSubText:"hinde",
                        type:'Yes/No',
                        questionHelpText:"help text",
                        comment:false,
                        inspection:true,
                        signature:true,
                        picture:true,
                        rejection:false,
                    }
                
                 connection.mockRespond(new Response(new ResponseOptions({
                    status: 200,
                    body: 
                    {
                        question: question
                    }})));       
                return;
            }


            //  if(connection.request.url.includes('api/qc-checklist/getLinkTypes')&& connection.request.method == RequestMethod.Get){
            //     let linkTypes=[
            //         {
            //             name:"Account"
                        
            //         },
            //          {
            //             name:"Item"
                        
            //         },

            //     ]
            //      connection.mockRespond(new Response(new ResponseOptions({
            //         status: 200,
            //         body: 
            //         {
            //             list: linkTypes
            //         }})));       
            //     return;
            // }

            //    if(connection.request.url.includes('api/qc-checklist/getLinkTypeValues')&& connection.request.method == RequestMethod.Get){
            //     let linkTypes=[
            //         {
            //             name:"Hp Inc."
                        
            //         },
            //          {
            //             name:"Fijiyama Supreme Taco"
                        
            //         },

            //     ]
            //      connection.mockRespond(new Response(new ResponseOptions({
            //         status: 200,
            //         body: 
            //         {
            //             list: linkTypes
            //         }})));       
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
    useFactory: qcFBFactory,
    deps: [MockBackend, BaseRequestOptions, XHRBackend]
};
