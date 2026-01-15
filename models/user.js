const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const imageSchema = new Schema({
  public_id: {
    type: String,
    required: true,
  },
  secure_url: {
    type: String,
    required: true,
  },
});

const userSchema = new Schema(
  {
    name: {
      type: String,
     
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    image:{
      type: imageSchema
    },
    cart: {
      type: Schema.Types.ObjectId,
      ref: 'Cart'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
