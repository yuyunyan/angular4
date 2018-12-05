export class Comment
{
    commentId: number;
    commentTypeId: number;
    authorName: string;
    created: string;
    comment: string;
    replyTo: string;
    typeName: string;
    replyToId: number;
    createdBy: number;
    child? : Array<Comment>
}
