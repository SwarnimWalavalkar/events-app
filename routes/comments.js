const express = require("express");
const router = express.Router({ mergeParams: true });

const Event = require("../models/event");
const Comment = require("../models/comment");

//Middleware
const middleware = require("../middleware");

// //NEW ROUTE
// router.get("/new", (req, res) => {
//     Event.findById(req.params.id, (err, foundEvent) => {
//         if (err) {
//             console.log(err);
//         } else {
//             req.render("comments/new", { event: foundEvent });
//         }
//     });
// });

//CREATE ROUTE
router.post("/", middleware.isLoggedIn, (req, res) => {
    Event.findById(req.params.id, (err, foundEvent) => {
        if (err) {
            console.log(err);
            req.flash("error", "something went wrong!");
            res.redirect("events");
        } else {
            Comment.create(req.body.comment, (err, comment) => {
                if (err) {
                    console.log(err);
                    req.flash("error", "Something went wrong!");
                } else {
                    //Add username and id to comment and then save the comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    foundEvent.comments.push(comment);
                    foundEvent.save();
                    console.log(comment);
                    req.flash("success", "Successfully added comment");
                    res.redirect(`/events/${foundEvent.id}`);
                }
            });
        }
    });
});

// //EDIT ROUTE
// router.get("/:comment_id/edit", (req, res) => {
//     Event.findById(req.params.id, (err, foundEvent) => {
//         if (err || !foundEvent) {
//             req.flash("err", "Event not found");
//             return res.redirect("back");
//         }
//         Comment.findById(req.params.comment_id, (err, foundComment) => {
//             if (err || !foundComment) {
//                 req.flash("error", "Comment not found");
//                 res.redirect("/events/" + req.params.id);
//             } else {
//                 res.render("comments/edit", {
//                     event_id: req.params.id,
//                     comment: foundComment
//                 });
//             }
//         });
//     });
// });

//UPDATE ROUTE
router.put("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndUpdate(
        req.params.comment_id,
        req.body.comment,
        (err, upddatedComment) => {
            if (err) {
                console.log(err);
                req.flash("error", "Couldn't Update your comment");
            } else {
                req.flash("success", "Comment Succesfully edited!");
                res.redirect("/events/" + req.params.id);
            }
        }
    );
});

//DELETE ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndRemove(req.params.comment_id, err => {
        if (err) {
            res.redirect("back");
        } else {
            req.flash("success", "Comment Deleted");
            res.redirect("/events/" + req.params.id);
        }
    });
});

module.exports = router;
