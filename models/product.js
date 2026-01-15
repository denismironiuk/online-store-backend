const mongoose = require('mongoose');

// Define a schema for your data
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: Object, // Assuming the image is stored as an object, you might want to adjust this based on your actual use case
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', // Reference to the Category model
    required: true,
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubCategory', // Reference to the Subcategory model
    required: true,
  },
}, { timestamps: true });

// Create a Product model using the schema
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
