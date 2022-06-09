const mongoose = require('mongoose');

const AvatarSchema = new mongoose.Schema({
        imageName: { type: String, required: true },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
    },
    {
        timestamps: true
    });

mongoose.model('Avatar', AvatarSchema);
