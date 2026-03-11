const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();
console.log('Attempting to connect to MongoDB Atlas...');
connectDB().then(() => console.log('DB Connection Attempt Finished.'));

const app = express();

app.use(helmet()); // Set security HTTP headers
app.use(mongoSanitize()); // Sanitize data against NoSQL injection
app.use(hpp()); // Prevent HTTP Parameter Pollution

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter);

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Body Parser
app.use(express.json({ limit: '10kb' })); // Limit body size for security
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL : true,
    credentials: true
}));
app.use(cookieParser());

const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Test Route
const Product = require('./models/productModel');
const products = [
    {
        user: "507f1f77bcf86cd799439011", // Dummy MongoDB ID
        name: "Glowing Skin Serum",
        image: "https://res.cloudinary.com/demo/image/upload/v1611000000/sample.jpg",
        description: "High-quality serum for glowing skin.",
        brand: "Lumiere",
        category: "Serums",
        price: 2500,
        countInStock: 10,
        rating: 4.5,
        numReviews: 12
    },
    {
        user: "507f1f77bcf86cd799439011", // Dummy MongoDB ID
        name: "Organic Face Wash",
        image: "https://res.cloudinary.com/dpxrf24v8/image/upload/v1773255582/cleanser2.png_gb5dda.jpg",
        description: "Natural ingredients for a fresh look.",
        brand: "Lumiere",
        category: "Cleansers",
        price: 1200,
        countInStock: 15,
        rating: 4.8,
        numReviews: 8
    }
];

app.get('/api/seed-data-now', async (req, res) => {
    try {
        await Product.deleteMany();
        await Product.insertMany(products);
        res.send('Data Seeded Successfully into Atlas!');
    } catch (error) {
        res.status(500).send('Error seeding data: ' + error.message);
    }
});

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
}

module.exports = app;
