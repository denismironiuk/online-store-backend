
const Cart = require('../../models/cart');


const createUserCart = async (user, cart) => {
  let cartObj = await Cart.findOne({ user: user._id });

  if (!cartObj) {
    cartObj = new Cart({ user: user._id });
  }

  if (cart) {
    cartObj.items.push(...cart.items);
    cartObj.totalPrice = cart.totalPrice;
    cartObj.totalQuantity = cart.totalQuantity;
  }

  await cartObj.save();

  return cartObj;
};

const updateUserCart = async (cartObj, cart) => {
  for (const item of cart.items) {
    const existingCartItem = cartObj.items.find((cartItem) => cartItem._id.toString() === item._id);

    if (existingCartItem) {
      existingCartItem.quantity += item.quantity;
      existingCartItem.totalPrice += item.totalPrice;
    } else {
      cartObj.items.push(item);
    }

    cartObj.totalQuantity += item.quantity;
    cartObj.totalPrice += item.totalPrice;
  }

  await cartObj.save();

  return cartObj;
};

module.exports ={
    updateUserCart,
    createUserCart
}