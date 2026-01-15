const Cart = require('../models/cart');

const addToCart = async (req, res, next) => {

  const userId = req.userId;



  try {
    const cart = await Cart.findOne({ user: userId });

    
    cart.totalQuantity = req.body.cartItems.totalQuantity;
    cart.totalPrice = req.body.cartItems.totalPrice
    cart.items = req.body.cartItems.items;
    await cart.save();


    res.status(200).json({ cart }); // Return the updated cart object
  } catch (error) {
    console.error('Error adding item to cart:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


// Function to retrieve the cart items
const retrieveFromTheCart = async (req, res, next) => {
  const userId = req.userId;


  try {
    const cart = await Cart.findOne({ user: userId });


    if (cart) {
      return res.status(200).json({ cart }); // Return the cart items
    }
  } catch (error) {
    console.error('Error retrieving cart items:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  retrieveFromTheCart, addToCart
}