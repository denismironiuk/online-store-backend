const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      price: {
        type: Number,
       
      },
      quantity: {
        type: Number,
        required: true
      },
      name: {
        type: String,
        required: true
      },
      desc: {
        type: String,
        required: true
      },
      totalPrice: {
        type: Number,
        required: true
      },
      img: {
        type: String,
        required: true
      }
    }
  ],
  totalPrice: {
    type: Number,
    required: true,
    default:0
  },
  totalQuantity: {
    type: Number,
    required: true,
    default:0
  }
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
