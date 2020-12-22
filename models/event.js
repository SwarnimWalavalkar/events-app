const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
    name: String,
    description: String,
    image: String,
    startTime: Date,
    location: String,
    lat: Number,
    lng: Number,
    host: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
});

module.exports = mongoose.model("Event", eventSchema);
