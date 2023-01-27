const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const videoSchema = new Schema({
    video_url: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    like_count: {
        type: Number,
        default: 0
    },
    comments: [
        {
            comment: {
                type: String
            },
            author: {
                type: String
            }
        }
    ],
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    likedBy: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
});

module.exports = videoSchema;
