const express = require("express");
const router = express.Router();

const User = require("../models/user");
const Event = require("../models/event");

const passport = require("passport");

const async = require("async");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

//INDEX ROUTE
router.get("/", (req, res) => {
    res.redirect("/events");
});

// ================
// AUTH ROUTES
// ================

//display the user registration form
router.get("/register", (req, res) => {
    res.render("register", { page: "register" });
});

//handle user signup
router.post("/register", (req, res) => {
    let newUser = new User({
        username: req.body.username,
        avatar: req.body.avatar,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
    });

    if (req.body.adminCode === process.env.ADMIN_CODE) {
        newUser.isAdmin = true;
    }

    User.register(newUser, req.body.password, (err, user) => {
        if (err) {
            console.log(err);
            return res.render("register", { error: err.message });
        }

        passport.authenticate("local")(req, res, function () {
            req.flash(
                "success",
                "Successfully Signed Up, Nice to meet you " + user.username
            );
            res.redirect("/events");
        });
    });
});

//display the login form
router.get("/login", (req, res) => {
    res.render("login", { page: "login" });
});

//handle user login
router.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/events",
        failureRedirect: "/login",
        failureFlash: true,
        successFlash: "Logged In",
    })
);

//handle user logout
router.get("/logout", (req, res) => {
    req.logOut();
    req.flash("success", "Logged Out");
    res.redirect("/events");
});

//USER PROFILE ROUTE
router.get("/users/:id", (req, res) => {
    User.findById(req.params.id, (err, foundUser) => {
        if (err) {
            console.log(err);
            req.flash("error", "Something went wrong!");
            return res.redirect("/");
        }
        Event.find()
            .where("host.id")
            .equals(foundUser._id)
            .exec((err, events) => {
                if (err) {
                    console.log(err);
                    req.flash("error", "Something went wrong!");
                    return res.redirect("/");
                }
                res.render("users/show", { user: foundUser, events: events });
            });
    });
});

//USER EDIT ROUTE
router.get("/users/:id/edit", (req, res) => {
    User.findById(req.params.id, (err, foundUser) => {
        if (err) {
            console.log(err);
            req.flash("error", "Something went wrong!");
            return res.redirect("back");
        }
        res.render("users/edit", { user: foundUser });
    });
});

//USER UPDATE ROUTE
router.put("/users/:id", (req, res) => {
    User.findByIdAndUpdate(req.params.id, req.body.user, (err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect(`/users/${req.params.id}`);
        }
    });
});

// PASSWORD RESET
router.get("/forgot", function (req, res) {
    res.render("forgot");
});

router.post("/forgot", function (req, res, next) {
    async.waterfall(
        [
            function (done) {
                crypto.randomBytes(20, function (err, buf) {
                    var token = buf.toString("hex");
                    done(err, token);
                });
            },
            function (token, done) {
                User.findOne({ email: req.body.email }, function (err, user) {
                    if (!user) {
                        req.flash(
                            "error",
                            "No account with that email address exists."
                        );
                        return res.redirect("/forgot");
                    }

                    user.resetPasswordToken = token;
                    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                    user.save(function (err) {
                        done(err, token, user);
                    });
                });
            },
            function (token, user, done) {
                var smtpTransport = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                        user: "popclub5824@gmail.com",
                        pass: process.env.GMAILPW,
                    },
                    tls: {
                        rejectUnauthorized: false,
                    },
                });
                var mailOptions = {
                    to: user.email,
                    from: "popclub5824@gmail.com",
                    subject: "Events App Password Reset",
                    text:
                        "You are receiving this because you (or someone else) have requested the reset of the password for your Events App account: /n " +
                        "Username: " +
                        user.username +
                        " \n \n" +
                        "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
                        "http://" +
                        req.headers.host +
                        "/reset/" +
                        token +
                        "\n\n" +
                        "If you did not request this, please ignore this email and your password will remain unchanged.\n",
                };
                smtpTransport.sendMail(mailOptions, function (err) {
                    console.log("mail sent");
                    req.flash(
                        "success",
                        "An e-mail has been sent to " +
                            user.email +
                            " with further instructions."
                    );
                    done(err, "done");
                });
            },
        ],
        function (err) {
            if (err) return next(err);
            res.redirect("/forgot");
        }
    );
});

router.get("/reset/:token", function (req, res) {
    User.findOne(
        {
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() },
        },
        function (err, user) {
            if (!user) {
                req.flash(
                    "error",
                    "Password reset token is invalid or has expired."
                );
                return res.redirect("/forgot");
            }
            res.render("reset", { token: req.params.token });
        }
    );
});

router.post("/reset/:token", function (req, res) {
    async.waterfall(
        [
            function (done) {
                User.findOne(
                    {
                        resetPasswordToken: req.params.token,
                        resetPasswordExpires: { $gt: Date.now() },
                    },
                    function (err, user) {
                        if (!user) {
                            req.flash(
                                "error",
                                "Password reset token is invalid or has expired."
                            );
                            return res.redirect("back");
                        }
                        if (req.body.password === req.body.confirm) {
                            user.setPassword(req.body.password, function (err) {
                                user.resetPasswordToken = undefined;
                                user.resetPasswordExpires = undefined;

                                user.save(function (err) {
                                    req.logIn(user, function (err) {
                                        done(err, user);
                                    });
                                });
                            });
                        } else {
                            req.flash("error", "Passwords do not match.");
                            return res.redirect("back");
                        }
                    }
                );
            },
            function (user, done) {
                var smtpTransport = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                        user: "popclub5824@gmail.com",
                        pass: process.env.GMAILPW,
                    },
                });
                var mailOptions = {
                    to: user.email,
                    from: "popclub5824@mail.com",
                    subject: "Events App: Your password has been changed",
                    text:
                        "Hello,\n\n" +
                        "This is a confirmation that the password for your account has just been changed.\n" +
                        "Username: " +
                        user.username +
                        "Email: " +
                        user.email,
                };
                smtpTransport.sendMail(mailOptions, function (err) {
                    req.flash(
                        "success",
                        "Success! Your password has been changed."
                    );
                    done(err);
                });
            },
        ],
        function (err) {
            res.redirect("/events");
        }
    );
});

module.exports = router;
