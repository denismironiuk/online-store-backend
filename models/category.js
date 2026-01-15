const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema(
  {
    categoryName: {
      type: String,
      required: true,
      trim: true,
    },
    isFeatured:{
      type: Boolean,
      default: false,
    },
    subcategories: [{
        type: Schema.Types.ObjectId,
        ref: 'SubCategory'
      }],
    
    createdAt: {
      type: Date,
      default: Date.now,
    },
    
  },

);



const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
