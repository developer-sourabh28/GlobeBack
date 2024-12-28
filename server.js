const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const path = require('path');
const session = require('express-session');

const QuoteRoute = require('./route/quoteRoute');
const UploadRoute = require('./route/UploadRoute');
const userData = require('./route/SignupRoute');
const loginData = require('./route/LoginRoute');
const logoutRoute = require('./route/LogoutRoute');
const commentRoute = require('./route/UploadRoute');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1);
    });

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['POST', 'GET', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
}));

app.use(bodyParser.json());
app.use(express.json()); // Body parser
app.use(session({
    secret: process.env.SECRET_KEY || 'Quote_App',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24,
    },
}));

console.log('Available Routes:');
app._router.stack.forEach((middleware) => {
    if (middleware.route) {
        console.log(middleware.route.path, middleware.route.methods);
    }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/quote', QuoteRoute);
app.use('/api', UploadRoute);
app.use('/signup', userData);
app.use('/login', loginData);
app.use('/logout', logoutRoute);
app.use('/api/comments', commentRoute)

// Start server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

