// React-first server entry point. The API remains on /api/* and the built client is served for browser routes.
if (process.env.NODE_ENV !== "production") require("dotenv").config();

const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const Listing = require("./models/listing.js");
const Booking = require("./models/booking.js");
const { createBookingRequest } = require("./utils/bookingService.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const bookingRouter = require("./routes/booking.js");
const clientBookingsRouter = require("./routes/clientBookings.js");
const notificationRouter = require("./routes/notification.js");
const adminRouter = require("./routes/admin.js");
const ownerRouter = require("./routes/owner.js");
const chatbotRouter = require("./routes/chatbot.js");

const dbUrl = process.env.ATLASDB_URL;
const clientDist = path.join(__dirname, "client", "dist");
const hasClientBuild = fs.existsSync(path.join(clientDist, "index.html"));

if (dbUrl) {
    mongoose.connect(dbUrl)
        .then(() => console.log("Connected to MongoDB"))
        .catch((err) => console.error("MongoDB connection error:", err));
} else {
    console.warn("WARNING: ATLASDB_URL is not set. Database features will be disabled.");
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = ["http://localhost:5173", process.env.CLIENT_ORIGIN].filter(Boolean);
    if (origin && allowedOrigins.includes(origin)) res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
});

const sessionSecret = process.env.SECRET || "apnaghar-dev-secret-change-in-production";
const sessionOptions = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true },
};
if (dbUrl) {
    sessionOptions.store = MongoStore.create({
        mongoUrl: dbUrl,
        crypto: { secret: sessionSecret },
        touchAfter: 24 * 3600,
    });
}
app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.set("io", io);

const publicUser = (user) => ({
    _id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    fullName: user.fullName,
    phone: user.phone,
});

app.get("/api/auth/session", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ user: null });
    res.json({ user: publicUser(req.user) });
});

app.post("/api/auth/signup", async (req, res, next) => {
    try {
        const { username, email, password, role, fullName, phone } = req.body;
        const userRole = ["client", "owner"].includes(role) ? role : "client";
        const user = await User.register(new User({ username, email, role: userRole, fullName: fullName || "", phone: phone || "" }), password);
        req.login(user, (err) => err ? next(err) : res.status(201).json({ user: publicUser(user) }));
    } catch (err) {
        res.status(400).json({ message: err.message || "Signup failed" });
    }
});

app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ message: info?.message || "Invalid credentials" });
        req.login(user, (loginErr) => loginErr ? next(loginErr) : res.json({ user: publicUser(user) }));
    })(req, res, next);
});

app.post("/api/auth/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.session.destroy(() => res.json({ success: true }));
    });
});

app.get("/api/listings", async (req, res, next) => {
    try {
        const { search, feature } = req.query;
        const filter = {};
        if (search) filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } },
            { country: { $regex: search, $options: "i" } },
        ];
        if (feature) filter.features = feature;
        res.json(await Listing.find(filter).sort({ createdAt: -1 }));
    } catch (err) { next(err); }
});

app.get("/api/listings/:id", async (req, res, next) => {
    try {
        const listing = await Listing.findById(req.params.id)
            .populate({ path: "reviews", populate: { path: "author" } })
            .populate("owner");
        if (!listing) return res.status(404).json({ message: "Listing not found" });
        res.json(listing);
    } catch (err) { next(err); }
});

app.post("/api/listings/:id/book", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
        const { booking } = await createBookingRequest({ listingId: req.params.id, client: req.user, input: req.body, io });
        res.status(201).json({ booking, message: "Booking request submitted successfully." });
    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message || "Booking failed." });
    }
});

app.get("/api/bookings", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
        res.json(await Booking.find({ client: req.user._id }).populate("listing").sort({ createdAt: -1 }));
    } catch (err) { next(err); }
});

io.on("connection", (socket) => socket.on("join", (userId) => socket.join(userId)));

// Legacy routes remain available as backend compatibility endpoints; React is the UI.
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/listings", bookingRouter);
app.use("/listings", chatbotRouter);
app.use("/bookings", clientBookingsRouter);
app.use("/notifications", notificationRouter);
app.use("/admin", adminRouter);
app.use("/owner", ownerRouter);
app.use("/", userRouter);

if (hasClientBuild) {
    app.use(express.static(clientDist));
    app.get("*", (req, res, next) => {
        if (req.path.startsWith("/api/")) return next();
        res.sendFile(path.join(clientDist, "index.html"));
    });
}

app.use((req, res) => {
    if (hasClientBuild && !req.path.startsWith("/api/")) return res.sendFile(path.join(clientDist, "index.html"));
    res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.statusCode || err.status || 500).json({ message: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => console.log(`ApnaGhar server running on port ${PORT}`));
