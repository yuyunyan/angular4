import { Injectable } from '@angular/core';
import { HttpService } from './httpService';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Comment } from './../_models/shared/comment';
import { MenuItem } from './../_models/shared/menuItem';
import * as _ from 'lodash';

@Injectable()
export class CommentsService {
    constructor(private httpService: HttpService) {

    }

    getComments(objectId: number, objectTypeId: number, searchString?: string) {
        let url = 'api/comment/getComments?objectId=' + objectId + '&objectTypeId=' + objectTypeId + '&searchString=' + encodeURIComponent(searchString);
        
        return this.httpService.Get(url).map(
            data => {
                let res = data.json();
                let comments = res.comments;

                let commentsResponse = new Array<Comment>();

                comments.forEach(element => {
                    let comment = new Comment();
                    comment.commentId = element.commentId;
                    comment.commentTypeId = element.commentTypeId;
                    comment.authorName = element.authorName;
                    comment.comment = element.comment;
                    comment.created = element.created;
                    comment.createdBy = element.createdBy;
                    comment.replyTo = element.replyTo;
                    comment.typeName = element.typeName;
                    comment.replyToId = element.replyToId === 0 ? null: element.replyToId;
                    comment.child = [];

                    commentsResponse.push(comment);
                });
                return commentsResponse;
            }
        )
    }

    getCommentFullNavItems(){
        let menuItems = new Array<MenuItem>();
        menuItems = [
            {
                title: "All",
                value: 0,
                menuType: "All"
            },
            {
                title: 'Sales',
                value: 1,
                menuType: "General Order"
            },
            {
                title: 'Purchasing',
                value: 2,
                menuType: "General Order"
            },
            {
                title: 'Warehouse',
                value: 3,
                menuType: "General Order"
            },
            {
                title: 'Financial',
                value: 4,
                menuType: "Account"
            },
            {
                title: 'Account',
                value: 5,
                menuType: "Account"
            },
            {
                title: 'Comment',
                value: 6,
                menuType: "Contact"
            }
        ]
        return menuItems
    }

    setComment(comment){
        let url = 'api/comment/setComment';
        let requestBody = {
            CommentTypeID: comment.commentTypeId,
            Comment: comment.comment,
            ObjectID: comment.objectId,
            ObjectTypeID: comment.objectTypeId,
            ReplyToID: comment.replyToId,
            IsDeleted: comment.isDeleted ? 1 : 0
        };
        return this.httpService.Post(url, requestBody).map(
            data => {
                let res = data.json();
                let commentResponse = new Comment();
                commentResponse.commentId = res.commentId;
                commentResponse.commentTypeId = res.commentTypeId;
                commentResponse.authorName = res.authorName;
                commentResponse.comment = res.comment;
                commentResponse.created = res.created;
                commentResponse.createdBy = res.createdBy;
                commentResponse.replyTo = res.replyTo;
                commentResponse.typeName = res.typeName;
                commentResponse.replyToId = res.replyToId === 0 ? null: res.replyToId

                return commentResponse;
            }
        )
    }

}
