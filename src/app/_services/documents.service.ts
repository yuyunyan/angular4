import { Injectable } from '@angular/core';
import { HttpService } from './httpService';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Document } from './../_models/common/document';
import { DocumentDownload } from './../_models/common/documentDownload';
import { MenuItem } from './../_models/shared/menuItem';
import { FileDropModule, UploadFile, UploadEvent } from 'ngx-file-drop/lib/ngx-drop';
import * as _ from 'lodash';

@Injectable()
export class DocumentsService {
    constructor(private httpService: HttpService) {

    }

    saveDocument(objectId, objectTypeId, file:File)
    {
        let url = 'api/documents/saveDocuments?objectId=' + objectId + '&objectTypeId=' + objectTypeId;
        let formData: FormData = new FormData();
        formData.append(file.name, file, file.name); 

        return this.httpService.PostImage(url, formData)
    }
    saveDocuments(objectId, objectTypeId, files:UploadFile[])
    {
        let url = 'api/documents/saveDocuments?objectId=' + objectId + '&objectTypeId=' + objectTypeId;
        let formData: FormData = new FormData();
        for (var file of files) {
            file.fileEntry.file(info => {
                console.log(info);
                formData.append(info.name, info, info.name);
            });
        }

        return this.httpService.PostImage(url, formData)
    }

    downloadDocument(path, fileName)
    {
        let url = 'api/documents/downloadDocument?path=' + path + '&filename=' + fileName;
        return this.httpService.Get(url).map(
            data => {
                let doc = new DocumentDownload();
                let res = data.json();
                doc.downloadName = res.DownloadName;
                doc.success = res.Success;
                return { doc };
            })
    }

    getDocuments(objectId, objectTypeId, rowLimit, rowOffset, sortColumn, descSort) {
        let url = 'api/documents/getObjectDocuments?objectId=' + objectId + '&objectTypeId=' + objectTypeId + '&rowLimit=' + rowLimit + '&rowOffset=' + rowOffset + '&sortCol=' + sortColumn + '&descSort=' + descSort;
        return this.httpService.Get(url).map(
            data => {
                let res = data.json();
                let docs = res.documents;;
                let documentsResponse = new Array<Document>();
                docs.forEach(element => {
                    let doc = new Document();
                    doc.documentId = element.DocumentID;
                    doc.objectTypeId = element.ObjectTypeID;
                    doc.objectId = element.ObjectID;
                    doc.docName = element.DocName;
                    doc.fileNameOriginal = element.FileNameOriginal;
                    doc.fileNameStored = element.FileNameStored;
                    doc.FolderPath = element.FolderPath;
                    doc.fileMimeType = element.FileMimeType;
                    doc.created = element.Created;

                    documentsResponse.push(doc);
                });
                return { results: documentsResponse, totalRowCount: res.totalRowCount, error: null };
            }
        )

    }

    saveDocumentName(documentId, documentName) {
        let url = 'api/documents/saveDocumentName?documentId=' + documentId + '&documentName=' + documentName;
        return this.httpService.Post(url, null);
    }
    deleteDocument(documentId) {
        let url = 'api/documents/deleteDocument?documentId=' + documentId;
        return this.httpService.Post(url, null);
    }
}