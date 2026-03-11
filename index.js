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
        user: "507f1f77bcf86cd799439011",
        name: "Essence of Seoul Serum",
        image: "https://res.cloudinary.com/dpxrf24v8/image/upload/v1773256027/Korean_skincare_e3gkny.jpg",
        description: "A meticulously crafted Korean essence for ultimate hydration and glass skin finish.",
        brand: "Lumière Atelier",
        category: "Serums",
        price: 3500,
        countInStock: 15,
        rating: 4.9,
        numReviews: 24
    },
    {
        user: "507f1f77bcf86cd799439011",
        name: "Hyalu-Cica Sun Defense",
        image: "https://res.cloudinary.com/dpxrf24v8/image/upload/v1773256042/HYALU-CICA_WATER-FIT_SUN_SERUM_SPF50_CENTELLA_agwldk.jpg",
        description: "Water-fit sun serum with SPF50 and Centella for weightless protection.",
        brand: "Lumière Atelier",
        category: "Sun Care",
        price: 2800,
        countInStock: 20,
        rating: 4.8,
        numReviews: 18
    },
    {
        user: "507f1f77bcf86cd799439011",
        name: "Botanical Glow Mask",
        image: "https://res.cloudinary.com/dpxrf24v8/image/upload/v1773256055/Face_Masks_for_Glowing_Skin_nufpfm.jpg",
        description: "An orchestral composition of botanical brilliance for an instant ethereal glow.",
        brand: "Lumière Atelier",
        category: "Masks",
        price: 1500,
        countInStock: 30,
        rating: 4.7,
        numReviews: 12
    },
    {
        user: "507f1f77bcf86cd799439011",
        name: "Velvet Cleansing Milk",
        image: "https://res.cloudinary.com/dpxrf24v8/image/upload/v1773256070/image3.png_y9blnu.jpg",
        description: "A gentle yet powerful cleanser designed to honor the unique narrative of your skin.",
        brand: "Lumière Atelier",
        category: "Cleansers",
        price: 2200,
        countInStock: 12,
        rating: 4.6,
        numReviews: 9
    },
    {
        user: "507f1f77bcf86cd799439011",
        name: "Ethereal Sheet Mask",
        image: "https://res.cloudinary.com/dpxrf24v8/image/upload/v1773256086/face_mask.png_k0fdyc.jpg",
        description: "Ethically sourced molecular hydration for deep cellular repair.",
        brand: "Lumière Atelier",
        category: "Masks",
        price: 850,
        countInStock: 50,
        rating: 4.9,
        numReviews: 31
    },
    {
        user: "507f1f77bcf86cd799439011",
        name: "Liquid Silk Toner",
        image: "https://res.cloudinary.com/dpxrf24v8/image/upload/v1773256099/download_25_msj2nj.jpg",
        description: "Purity distilled into a toner that transforms texture into liquid silk.",
        brand: "Lumière Atelier",
        category: "Toners",
        price: 1900,
        countInStock: 18,
        rating: 4.5,
        numReviews: 14
    },
    {
        user: "507f1f77bcf86cd799439011",
        name: "Ceramide Barrier Cream",
        image: "https://res.cloudinary.com/dpxrf24v8/image/upload/v1773256115/image2_ctqafu.jpg",
        description: "Clinical devotion to your skin's barrier with advanced lipid delivery.",
        brand: "Lumière Atelier",
        category: "Moisturizers",
        price: 4200,
        countInStock: 8,
        rating: 5.0,
        numReviews: 7
    },
    {
        user: "507f1f77bcf86cd799439011",
        name: "Aura Radiance Oil",
        image: "https://res.cloudinary.com/dpxrf24v8/image/upload/v1773256141/Skincare_tddou1.jpg",
        description: "Luminous molecular finish for an otherworldly radiance.",
        brand: "Lumière Atelier",
        category: "Face Oils",
        price: 5500,
        countInStock: 5,
        rating: 4.9,
        numReviews: 22
    },
    {
        user: "507f1f77bcf86cd799439011",
        name: "Moisture Surge Intense",
        image: "https://res.cloudinary.com/dpxrf24v8/image/upload/v1773256166/CLINIQUE_moisture_surge_intense_dmgjqp.jpg",
        description: "Deeply calibrated cellular hydration for extreme conditions.",
        brand: "Lumière Atelier",
        category: "Moisturizers",
        price: 6800,
        countInStock: 10,
        rating: 4.8,
        numReviews: 15
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
