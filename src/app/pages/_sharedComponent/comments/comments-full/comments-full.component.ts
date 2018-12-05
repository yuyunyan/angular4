import { Component, OnInit, SimpleChanges, Input, ViewEncapsulation, OnChanges, ComponentFactoryResolver, ViewChild, ViewChildren, ViewContainerRef, QueryList } from '@angular/core';
import { CommentsService } from './../../../../_services/comments.service';
import { Comment } from './../../../../_models/shared/comment';
import { MenuItem } from './../../../../_models/shared/menuItem';
import { CommentsReplyComponent } from './../comments-reply/comments-reply.component';
import { Subject } from 'rxjs/Subject';
import * as _ from 'lodash';

@Component({
  selector: 'az-comments-full',
  templateUrl: './comments-full.component.html',
  styleUrls: ['./comments-full.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CommentsFullComponent implements OnChanges {

    private menuItems: Array<MenuItem>;
    private itemActivated: number;
    private comments: Array<Comment>;
    private filteredComments:  Array<Comment>;
    private replyCommentComponent = [];
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    private searchParameter;
    @Input() objectId: number;
    @Input() objectTypeId: number;
    @Input() commentTypeMap: Array<Object>;
    @Input() menuType: string = 'General Order';

    @ViewChildren("replyTo", {read: ViewContainerRef}) commentList: QueryList<ViewContainerRef>; 

    constructor(private commentsService: CommentsService, private compiler: ComponentFactoryResolver) {
        this.menuItems = this.commentsService.getCommentFullNavItems();
        this.itemActivated = 0;
    }
    ngOnChanges(changes: SimpleChanges){
        if ((changes.objectId || changes.objectTypeId) && this.objectId && this.objectTypeId) {
            this.commentsService.getComments(this.objectId, this.objectTypeId, '').subscribe(
              data => {

                let reorderComments = _.filter(data, (comment) => !comment.replyToId);
                let replyComments = _.groupBy(_.filter(data, (comment) => comment.replyToId), (comment) => comment.replyToId);

                _.forEach(replyComments, (value, key) => {
                    const targetCommentIndex = _.findIndex(reorderComments, (comment) => comment.commentId == key);
                    reorderComments = _.concat([], _.slice(reorderComments, 0, targetCommentIndex),
                        _.assign({}, reorderComments[targetCommentIndex], {
                            child: value
                        }),
                        _.slice(reorderComments, targetCommentIndex + 1));
                })

                this.comments = reorderComments;
                this.populateComments();
                this.populateMenuItems();
              }
            );
        }
    }

    searchComments(){
        this.commentsService.getComments(this.objectId, this.objectTypeId, this.searchParameter)
            .takeUntil(this.ngUnsubscribe.asObservable())
            .subscribe(data => {
              let reorderComments = _.filter(data, (comment) => !comment.replyToId);
              let replyComments = _.groupBy(_.filter(data, (comment) => comment.replyToId), (comment) => comment.replyToId);

              _.forEach(replyComments, (value, key) => {
                  const targetCommentIndex = _.findIndex(reorderComments, (comment) => comment.commentId == key);
                  reorderComments = _.concat([], _.slice(reorderComments, 0, targetCommentIndex),
                      _.assign({}, reorderComments[targetCommentIndex], {
                          child: value
                      }),
                      _.slice(reorderComments, targetCommentIndex + 1));
              })

              this.comments = reorderComments;
              this.populateComments();
              this.populateMenuItems();
            }
        )
    }

    onItemClicked(e, value){
        this.itemActivated = value;
        this.populateComments();
        jQuery("li.comment-nav-item").removeClass('btn-outline-primary');
        jQuery("li.comment-nav-item").addClass('btn-secondary');
        jQuery(e.target).removeClass('btn-secondary');
        jQuery(e.target).addClass('btn-outline-primary');
        if (this.replyCommentComponent.length > 0) {
            this.onCommentRelplyClose();
        }
    }

    populateComments(){
        switch (this.itemActivated){
            case 0: 
                this.filteredComments = _.concat([], this.comments);
                break;
            case 1:
                
                this.filteredComments = _.filter(this.comments, (c: Comment) => (c.typeName === 'Sales'));
                break;
            case 2:
               
                this.filteredComments = _.filter(this.comments, (c: Comment) => (c.typeName === 'Purchasing'));
                break;
            case 3:
                
                this.filteredComments = _.filter(this.comments, (c: Comment) => (c.typeName === 'Warehouse'));
                break;

            case 4:
            
                this.filteredComments = _.filter(this.comments, (c: Comment) => (c.typeName === 'Financial'));
                break;
            case 5:
        
                this.filteredComments = _.filter(this.comments, (c: Comment) => (c.typeName === 'Account'));
                break;
            default:
                this.filteredComments = _.concat([], this.comments);
        }
    }

    populateMenuItems(){
        const _self = this;
        this.menuItems = _.map(this.menuItems, (item) => {
            const parentComments = _.filter(this.comments, (c: Comment) => (c.typeName === item.title && !c.replyToId));
            const parentCommentIds = _.map(parentComments, (comment) => comment.commentId);
            return _.assign({}, {
                title: item.title,
                value: item.value,
                menuType: item.menuType,
                commentsCount: _.filter(_self.comments, (c: Comment) => (c.typeName === item.title && !c.replyToId) || _.includes(parentCommentIds, c.replyToId)).length
            })
        });
    }

    onReplyCommentClicked(replyToId, commentIdx){
        const commentReplyComponentFactory = this.compiler.resolveComponentFactory(CommentsReplyComponent);

        if (this.replyCommentComponent.length > 0) {
            this.removeReplyComponent()
        }

        if (!replyToId) {
            const componentAtIndex = this.commentList.last;
            const commentComponent = componentAtIndex.createComponent(commentReplyComponentFactory);
            this.replyCommentComponent.push({
                component: commentComponent,
                index: this.commentList.length -1
            });
            commentComponent.instance.commentTypeMap = this.commentTypeMap;
            commentComponent.instance.objectId = this.objectId;
            commentComponent.instance.objectTypeId = this.objectTypeId;
            commentComponent.instance.hideCommentType = false;
            commentComponent.instance.onCommentSaved.subscribe((newComment) => {
                this.populateNewComment(newComment)
            });
            commentComponent.instance.onCommentReplyClosed.subscribe(()=>{
                this.onCommentRelplyClose();
            });
            return;
        }

        const componentAtIndex = this.commentList.find((item, index, array) => {
            return index == commentIdx
        });
        
        const commentComponent = componentAtIndex.createComponent(commentReplyComponentFactory);
        this.replyCommentComponent.push({
            component: commentComponent,
            index: commentIdx
        });

        commentComponent.instance.commentTypeMap = this.commentTypeMap;
        commentComponent.instance.objectId = this.objectId;
        commentComponent.instance.objectTypeId = this.objectTypeId;
        commentComponent.instance.replyToId = replyToId;
        commentComponent.instance.onCommentSaved.subscribe((newComment) => {
            this.populateNewComment(newComment)
        });
        commentComponent.instance.onCommentReplyClosed.subscribe(()=>{
            this.onCommentRelplyClose();
        });
    }

    removeReplyComponent(){
        const toRemove = this.replyCommentComponent.pop();
        const componentToRemoveAtIndex = this.commentList.find((item, index, array) => {
            return index == toRemove.index;
        });
        componentToRemoveAtIndex.remove();
    }

    onCommentRelplyClose(){
        this.removeReplyComponent();
    }

    populateNewComment(newComment: Comment) {
        const _self = this;
        if (newComment.replyToId > 0) {
            const targetCommentIndex = _.findIndex(_self.comments, (comment) => comment.commentId == newComment.replyToId);
            const reorderComments = _.concat([], _.slice(_self.comments, 0, targetCommentIndex),[
                _.assign({}, _self.comments[targetCommentIndex], {
                    child: _.concat([], _self.comments[targetCommentIndex].child, [newComment])
                })],
                _.slice(_self.comments, targetCommentIndex + 1));
            _self.comments = reorderComments;
        } else {
            const reorderComments = _.concat([], _self.comments,
                [_.assign({}, newComment, {
                    child: []
                })]);
            _self.comments = reorderComments
        }
        this.populateComments();
        this.updateMenuItemCount(newComment);
    }

    updateMenuItemCount(newComment: Comment){
        switch (newComment.typeName) {
            case 'Sales':
                this.menuItems[1].commentsCount += 1; 
                break;
            case 'Purchasing':
                this.menuItems[2].commentsCount += 1; 
                break;
            case 'Warehouse':
                this.menuItems[3].commentsCount += 1; 
                break;
            case 'Financial':
                this.menuItems[4].commentsCount += 1; 
                break;
            case 'Account':
                this.menuItems[5].commentsCount += 1; 
                break;
        }
    }
}
