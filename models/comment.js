var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

var commentSchema = mongoose.Schema({
    text: String,
    createdAt: {type: Date, default: Date.now },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
}, { usePushEach: true });

module.exports = mongoose.model("Comment", commentSchema);