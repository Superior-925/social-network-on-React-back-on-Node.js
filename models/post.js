const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    postText: { type: String, required: true },
    userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
},
    {
        timestamps: true
    });

mongoose.model('Post', PostSchema);

// const mongoose = require('mongoose');
//
// const PostSchema = new mongoose.Schema({
//         postText: { type: String, required: true },
//         postedBy: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'User'
//         },
//         comments: [{
//             text: String,
//             postedBy: {
//                 type: mongoose.Schema.Types.ObjectId,
//                 ref: 'User'
//             }
//         }]
//     },
//     {
//         timestamps: true
//     });
//
// mongoose.model('Post', PostSchema);
