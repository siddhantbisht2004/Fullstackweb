if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
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

if (dbUrl) {
    main()
        .then(() => {
            console.log("Connected to MongoDB");
        })
        .catch((err) => {
            console.log("MongoDB connection error:", err);
        });
} else {
    console.warn("WARNING: ATLASDB_URL is not set. Database features will be disabled.");
}

async function main() {
    await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
        "http://localhost:5173",
        process.env.CLIENT_ORIGIN,
    ].filter(Boolean);

    if (origin && allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const sessionSecret = process.env.SECRET || "apnaghar-dev-secret-change-in-production";

const sessionOptions = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

if (dbUrl) {
    const store = MongoStore.create({
        mongoUrl: dbUrl,
        crypto: { secret: sessionSecret },
        touchAfter: 24 * 3600,
    });
    store.on("error", (err) => {
        console.log("Error in Mongo Store", err);
    });
    sessionOptions.store = store;
}

app.get("/", (req, res) => {
    if (!dbUrl) return res.redirect("/setup");
    res.redirect("/listings");
});

app.get("/setup", (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ApnaGhar – Setup Required</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
  <style>
    body { font-family: 'Inter', sans-serif; background: linear-gradient(135deg, #f5f3ff, #fdf4ff); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .setup-card { background: white; border-radius: 24px; padding: 3rem 2.5rem; max-width: 560px; width: 90%; box-shadow: 0 10px 40px rgba(0,0,0,0.12); border: 1px solid #e5e7eb; }
    .icon-circle { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed, #9333ea); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: white; margin: 0 auto 1rem; }
    h2 { font-weight: 800; color: #1a1a2e; }
    .step { display: flex; align-items: flex-start; gap: 1rem; padding: 0.85rem; background: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb; margin-bottom: 0.75rem; }
    .step-num { width: 28px; height: 28px; border-radius: 50%; background: #7c3aed; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; }
    code { background: #ede9fe; color: #5b21b6; padding: 2px 6px; border-radius: 4px; font-size: 0.85rem; }
    .btn-refresh { background: #7c3aed; color: white; border: none; border-radius: 999px; padding: 0.75rem 2rem; font-weight: 700; cursor: pointer; font-size: 1rem; margin-top: 1.5rem; width: 100%; }
    .btn-refresh:hover { background: #5b21b6; }
  </style>
</head>
<body>
  <div class="setup-card">
    <div class="icon-circle"><i class="fa-solid fa-house-chimney"></i></div>
    <h2 class="text-center mb-2">ApnaGhar Setup</h2>
    <p class="text-center text-muted mb-4">Please configure the required secrets to get started.</p>
    <div class="step">
      <div class="step-num">1</div>
      <div><strong>MongoDB Atlas URL</strong><br><small class="text-muted">Set <code>ATLASDB_URL</code> in Secrets — your MongoDB connection string</small></div>
    </div>
    <div class="step">
      <div class="step-num">2</div>
      <div><strong>Session Secret</strong><br><small class="text-muted">Set <code>SECRET</code> — any long random string</small></div>
    </div>
    <div class="step">
      <div class="step-num">3</div>
      <div><strong>Cloudinary (for images)</strong><br><small class="text-muted">Set <code>CLOUD_NAME</code>, <code>CLOUD_API_KEY</code>, <code>CLOUD_API_SECRET</code></small></div>
    </div>
    <div class="step">
      <div class="step-num">4</div>
      <div><strong>Mapbox Token (for maps)</strong><br><small class="text-muted">Set <code>MAP_TOKEN</code> — get it from mapbox.com</small></div>
    </div>
    <div class="step">
      <div class="step-num">5</div>
      <div><strong>Murf API (for voice chatbot)</strong><br><small class="text-muted">Set <code>MURF_API_KEY</code> and optionally <code>MURF_VOICE_ID</code>, <code>MURF_LOCALE</code>, <code>MURF_LANGUAGE</code></small></div>
    </div>
    <p class="text-muted small text-center mt-3">After adding all secrets, restart the application.</p>
    <button class="btn-refresh" onclick="location.reload()"><i class="fa-solid fa-rotate-right me-2"></i>Check Again</button>
  </div>
</body>
</html>`);
});

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

app.set("io", io);

app.get("/api/auth/session", (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ user: null });
    }

    res.json({ user: {
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        fullName: req.user.fullName,
        phone: req.user.phone,
    } });
});

app.post("/api/auth/signup", async (req, res, next) => {
    try {
        const { username, email, password, role, fullName, phone } = req.body;
        const allowedRoles = ["client", "owner"];
        const userRole = allowedRoles.includes(role) ? role : "client";
        const newUser = new User({
            email,
            username,
            role: userRole,
            fullName: fullName || "",
            phone: phone || "",
        });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            return res.status(201).json({
                user: {
                    _id: registeredUser._id,
                    username: registeredUser.username,
                    email: registeredUser.email,
                    role: registeredUser.role,
                    fullName: registeredUser.fullName,
                    phone: registeredUser.phone,
                },
            });
        });
    } catch (e) {
        return res.status(400).json({ message: e.message || "Signup failed" });
    }
});

app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            return res.status(401).json({ message: info?.message || "Invalid username or password" });
        }

        req.login(user, (loginErr) => {
            if (loginErr) return next(loginErr);
            return res.json({
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    fullName: user.fullName,
                    phone: user.phone,
                },
            });
        });
    })(req, res, next);
});

app.post("/api/auth/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.session.destroy(() => {
            res.json({ success: true });
        });
    });
});

app.get("/api/listings", async (req, res) => {
    const { search, feature } = req.query;
    let filter = {};

    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } },
            { country: { $regex: search, $options: "i" } },
        ];
    }

    if (feature) {
        filter.features = feature;
    }

    const allListings = await Listing.find(filter).sort({ createdAt: -1 });
    res.json(allListings);
});

app.get("/api/listings/:id", async (req, res) => {
    const listing = await Listing.findById(req.params.id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("owner");

    if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
    }

    res.json(listing);
});

app.post("/api/listings/:id/book", async (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const { booking } = await createBookingRequest({
            listingId: req.params.id,
            client: req.user,
            input: req.body,
            io,
        });

        return res.status(201).json({
            booking,
            message: "Booking request submitted successfully.",
        });
    } catch (err) {
        const status = err.statusCode || 500;
        return res.status(status).json({
            message: err.message || "Booking failed.",
        });
    }
});

app.get("/api/bookings", async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const bookings = await Booking.find({ client: req.user._id })
        .populate("listing")
        .sort({ createdAt: -1 });

    res.json(bookings);
});

io.on("connection", (socket) => {
    socket.on("join", (userId) => {
        socket.join(userId);
    });
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/listings", bookingRouter);
app.use("/listings", chatbotRouter);
app.use("/bookings", clientBookingsRouter);
app.use("/notifications", notificationRouter);
app.use("/admin", adminRouter);
app.use("/owner", ownerRouter);
app.use("/", userRouter);

app.use((req, res, next) => {
    res.status(404).render("error.ejs", {
        statusCode: 404,
        message: "Page Not Found",
    });
});

app.use((err, req, res, next) => {
    console.error("ERROR:", err);
    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || "Internal Server Error";
    res.status(statusCode).render("error.ejs", { statusCode, message });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
    console.log(`ApnaGhar server running on port ${PORT}`);
});
