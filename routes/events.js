const express = require("express");
const router = express.Router();

//Models
const Event = require("../models/event");
const Comment = require("../models/comment");

//Middleware
const middleware = require("../middleware");

//INDEX ROUTE

router.get("/", (req, res) => {
    Event.find({}, (err, events) => {
        if (err) {
            console.log(err);
        } else {
            res.render("events/index", { events: events });
        }
    });
});

//NEW ROUTE
router.get("/new", middleware.isLoggedIn, (req, res) => {
    res.render("events/new");
});

//CREATE ROUTE
router.post("/", middleware.isLoggedIn, (req, res) => {
    //get the data from the form and add it to a new object
    let name = req.body.name;
    let image = req.body.image;
    let desc = req.body.description;
    // let date = moment(req.body.startTime).format("YYYY-MM-DD hh:mm");
    let date = req.body.startTime;
    let location = req.body.location;
    var host = {
        id: req.user._id,
        username: req.user.username,
    };

    let newEvent = {
        name: name,
        host: host,
        image: image,
        description: desc,
        startTime: date,
        location: location,
    };

    //Create a new event and save it to the DB
    Event.create(newEvent, (err, newlyCreated) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect(`/events/${newlyCreated.id}`);
        }
    });
});

//SHOW ROUTE
router.get("/:id", (req, res) => {
    //find the event with the provided id
    Event.findById(req.params.id)
        .populate("comments")
        .exec((err, foundEvent) => {
            if (err) {
                console.log(err);
            } else {
                res.render("events/show", { event: foundEvent });
            }
        });
});

//EDIT ROUTE
router.get(
    "/:id/edit",
    middleware.isLoggedIn,
    middleware.checkEventOwnership,
    (req, res) => {
        Event.findById(req.params.id, (err, foundEvent) => {
            if (err) {
                req.flash("err", err.getMessage());
                res.redirect("back");
                console.log(err);
            } else {
                res.render("events/edit", { event: foundEvent });
            }
        });
    }
);

//UPDATE ROUTE
router.put("/:id", middleware.checkEventOwnership, (req, res) => {
    Event.findByIdAndUpdate(req.params.id, req.body.event, (err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect(`/events/${req.params.id}`);
        }
    });
});

//DELETE ROUTE
router.delete("/:id", middleware.checkEventOwnership, (req, res) => {
    Event.findById(req.params.id, (err, event) => {
        if (err) {
            res.redirect("/events");
        } else {
            //Deletes all comments associated with the event
            Comment.remove({ _id: { $in: event.comments } }, (err) => {
                if (err) {
                    console.log(err);
                    return res.redirect("/events");
                }
                //delete the event
                event.remove();
                req.flash("success", "Event Deleted Successfully!");
                res.redirect("/events");
            });
        }
    });
});

module.exports = router;
