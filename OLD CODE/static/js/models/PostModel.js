export const PostType = {audio: 'audio', video: 'video', blog: 'blog', poll: 'poll', image: 'image', userFeedback: 'userFeedback'};
export const PostTypeDefault = PostType.blog;

export const PostStatus = {active: 'active', deleted: 'deleted', deactivated: 'deactivated', paused: 'paused', draft: 'draft'};
export const PostStatusDefault = PostStatus.active;

class PostModel {
    header = '';
    description = '';
    audience = ['allSubscribers'];
    tags = [];
    postStatus = PostStatusDefault;
    postType = PostTypeDefault;
    attachment = '';
    urlName = '';
    likes = [];
    userVoted = [];
    pollOptions = [''];
    publishTime = Date.now();
    seen = [];
    attachmentsId = [];
    // in three days
    endTime = new Date(new Date().getTime()+(3*24*60*60*1000));
    reVote = false;
    coverImage = {};

    constructor(props) {
        if (props) {
            Object.keys(props).forEach(key => {
                this[key] = props[key];
            });
        }
    }
}

export default PostModel;
