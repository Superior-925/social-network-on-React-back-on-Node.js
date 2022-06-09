const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
            commentText: String,
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post'
            }
    },
    {
        timestamps: true
    });

mongoose.model('Post', PostSchema);
