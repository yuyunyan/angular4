import { Component, OnInit, SimpleChanges, Input, ViewEncapsulation, OnChanges, ComponentFactoryResolver, ViewChildren, ViewContainerRef, QueryList
    , Output, EventEmitter } from '@angular/core';
import { CommentsService } from './../../../_services/comments.service';
import { CommentsReplyComponent } from './comments-reply/comments-reply.component';
import { Comment } from './../../../_models/shared/comment';
import * as _ from 'lodash';

@Component({
  selector: 'az-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CommentsComponent implements OnChanges {
	@Input() objectTypeId;
	@Input() objectId;
	@Input() commentTitle: string = 'Line Comments';
	@Input() objectInfo;
	@Input() modalMode: boolean = true;
	@Output() onCommentSaved = new EventEmitter();

	private comments: Array<Comment>;
	private replyCommentComponent = [];
	private searchString: string = '';
	private searchParamter: string = '';

	@ViewChildren("replyTo", {read: ViewContainerRef}) commentList: QueryList<ViewContainerRef>; 

	constructor(private commentsService: CommentsService, private compiler: ComponentFactoryResolver) {
	}

	ngOnChanges(changes: SimpleChanges){
		if (this.objectId && this.objectTypeId) {
			this.searchString = '';
			this.getComments();
		} else if(changes.objectId && !changes.objectId.currentValue) {
			this.comments = [];
		}
	}

	getComments(){
		this.commentsService.getComments(this.objectId, this.objectTypeId, this.searchString).subscribe(
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
			}
		);
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
			commentComponent.instance.hideCommentType = true;
			commentComponent.instance.objectId = this.objectId;
			commentComponent.instance.objectTypeId = this.objectTypeId;
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

		commentComponent.instance.hideCommentType = true;
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
		this.onCommentSaved.emit();
	}

	searchComment(){
		console.log('Before trim: ', this.searchParamter);
		const searchTerm = this.searchParamter
		let trimedTerm = _.trim(searchTerm.replace(/[^a-zA-Z0-9]/g, ''));
		console.log('After trim: ', trimedTerm);
		this.searchString = trimedTerm;
		this.getComments();
	}
}
