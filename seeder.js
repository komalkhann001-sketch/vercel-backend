const mongoose = require('mongoose');
const dotenv = require('dotenv');
const users = [
    {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        isAdmin: true,
    }
];
const products = [
    {
        name: "Luminous Glow Serum",
        tagline: "Radiance in a bottle",
        price: 23800,
        category: "Serums",
        skinType: ["dry", "sensitive"],
        image: "/images/image2.png",
        description: "A concentrated blend of vitamin C and botanical extracts designed to brighten and even out skin tone.",
        ingredients: ["Vitamin C", "Hyaluronic Acid", "Rosehip Oil"],
        benefits: ["Brightens complexion", "Reduces dark spots"],
        usage: "Apply 2-3 drops to clean skin morning and night.",
        rating: 4.8,
        numReviews: 124,
        countInStock: 10
    },
    {
        name: "Vitamin C Glow Essence",
        tagline: "Radiance in a bottle",
        price: 27700,
        category: "Serums",
        skinType: ["dry", "sensitive"],
        image: "/images2/glow serum4.png",
        description: "A concentrated blend of vitamin C and botanical extracts designed to brighten and even out skin tone.",
        ingredients: ["Vitamin C", "Hyaluronic Acid", "Rosehip Oil"],
        benefits: ["Brightens complexion", "Reduces dark spots"],
        usage: "Apply 2-3 drops to clean skin morning and night.",
        rating: 4.9,
        numReviews: 89,
        countInStock: 15
    },
    {
        name: "Bakuchiol Plumping Serum",
        tagline: "Radiance in a bottle",
        price: 22400,
        category: "Serums",
        skinType: ["dry", "sensitive"],
        image: "/images2/Eqqualberry Bakuchiol Plumping Serum.png",
        description: "A concentrated blend of vitamin C and botanical extracts designed to brighten and even out skin tone.",
        ingredients: ["Vitamin C", "Hyaluronic Acid", "Rosehip Oil"],
        benefits: ["Brightens complexion", "Reduces dark spots"],
        usage: "Apply 2-3 drops to clean skin morning and night.",
        rating: 4.7,
        numReviews: 156,
        countInStock: 20
    }
];

const User = require('./models/userModel');
const Product = require('./models/productModel');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const importData = async () => {
    try {
        await Product.deleteMany();
        await User.deleteMany();

        const createdUsers = await User.insertMany(users);
        const adminUser = createdUsers[0]._id;

        const sampleProducts = products.map((product) => {
            return { ...product, user: adminUser };
        });

        await Product.insertMany(sampleProducts);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await Product.deleteMany();
        await User.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
