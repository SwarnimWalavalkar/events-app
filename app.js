require("dotenv").config();

//dependencies
const express = require("express");
const app = express();
const flash = require("connect-flash");
const mongoose = require("mongoose");
const passport = require("passport");
const bodyParser = require("body-parser");
const LocalStrategy = require("passport-local");
const methodOverride = require("method-override");
const expressSession = require("express-session");

const seedDB = require("./seed");

//Models
const User = require("./models/user");

//Routes Import
const indexRoutes = require("./routes/index");
const eventRoutes = require("./routes/events");
const commentRoutes = require("./routes/comments");

//Mongoose Setup
//I dont know what these do, but the docs said to add these to avoid deprication conflits: https://mongoosejs.com/docs/deprecations.html
mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);
///////////////////////////////////////////////////////////////////
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/events_app";

mongoose.connect(dbUrl);

//Express Setup
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

const secret = process.env.SECRET || "thecakeisalie";

//MomentJS
app.locals.moment = require("moment");

const MongoStore = require("connect-mongo")(expressSession);

const store = new MongoStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    console.log("Session Store Error: ", err);
});

//Session config
app.use(
    expressSession({
        store,
        secret,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 7,
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//seedDB(); //Seed the database

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/", indexRoutes);
app.use("/events", eventRoutes);
app.use("/events/:id/comments", commentRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serving on Port ${PORT}`);
});
