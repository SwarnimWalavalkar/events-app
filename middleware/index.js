let middlewareObj = {};

let Event = require("../models/event");
let Comment = require("../models/comment");

middlewareObj.checkEventOwnership = function(req, res, next) {
    if (req.isAuthenticated()) {
        Event.findById(req.params.id, (err, foundEvent) => {
            if (err || !foundEvent) {
                req.flash("error", "Event not found");
                res.redirect("back");
            } else {
                //does user own the event
                if (
                    foundEvent.host.id.equals(req.user._id) ||
                    req.user.isAdmin
                ) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        //if not, redirect somewhere
        req.flash("error", "You need to be logged in to that that");
        res.redirect("/login");
    }
};

middlewareObj.checkCommentOwnership = function(req, res, next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, (err, foundComment) => {
            if (err || !foundComment) {
                res.redirect("back");
            } else {
                //does user own the comment
                if (
                    foundComment.host.id.equals(req.user._id) ||
                    req.user.isAdmin
                ) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        //if not, redirect somewhere
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
};

module.exports = middlewareObj;
