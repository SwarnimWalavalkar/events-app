var mongoose = require("mongoose");
var Event = require("./models/event");
var Comment = require("./models/comment");

var seeds = [
    {
        name: "Javascript Meetup Mumbai",
        image:
            "https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=600",
        description:
            "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
        startTime: "2019-12-10",
        location: "Mumbai",
        lat: 19.076,
        lng: 72.8777,
        host: {
            id: "5df0a7e441e2682c38df9369",
            username: "Swarnim"
        }
    },
    {
        name: "Android Customization Fest",
        image:
            "https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=600",
        description:
            "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
        startTime: "2019-12-16",
        location: "Mumbai",
        lat: 19.076,
        lng: 72.8777,
        host: {
            id: "5df0a7e441e2682c38df9369",
            username: "Swarnim"
        }
    },
    {
        name: "Data is the new gold: A Discussion",
        image:
            "https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=600",
        description:
            "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
        startTime: "2019-12-14",
        location: "Mumbai",
        lat: 19.076,
        lng: 72.8777,
        host: {
            id: "5df0a7e441e2682c38df9369",
            username: "Swarnim"
        }
    }
];

async function seedDB() {
    try {
        await Event.remove({});
        console.log("Events removed");
        await Comment.remove({});
        console.log("Comments removed");

        for (const seed of seeds) {
            let event = await Event.create(seed);
            console.log("Event created");
            let comment = await Comment.create({
                text: "Very Interesting.. Excited to see you all there! :)",
                author: {
                    id: "5df0a7e441e2682c38df9369",
                    username: "Swarnim"
                }
            });
            console.log("Comment created");
            event.comments.push(comment);
            event.save();
            console.log("Comment added to campground");
        }
    } catch (err) {
        console.log(err);
    }
}

module.exports = seedDB;
