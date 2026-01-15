const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const subCategorySchema = new Schema(
  {
    subcategoryName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
      },
    products: [{
        type: Schema.Types.ObjectId,
        ref: 'SubCategory'
      }],
    
    createdAt: {
      type: Date,
      default: Date.now,
    },
    
  },

);



const SubCategory = mongoose.model('SubCategory', subCategorySchema);

module.exports = SubCategory;
