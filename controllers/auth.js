const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const Cart = require('../models/cart');
const User = require('../models/user');
const cloudinary = require('cloudinary').v2;
const { createUserCart, updateUserCart } = require('../helpers/user/user');
const { createToken } = require('../helpers/token/token');
const streamifier = require('streamifier');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_API_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET_KEY
});

// User Signup
exports.signup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed');
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const { email, name, password, cart } = req.body;

    const hashedPw = await bcrypt.hash(password, 12);

    // Create a new user
    const user = new User({
      name: name,
      email: email,
      password: hashedPw,
    });

    // Save the user to the database
    const savedUser = await user.save();

    // Create a token for authentication
    const token = createToken(user);

    // Create or update the user's cart
    const cartObj = await createUserCart(savedUser, cart);

    // Return the response with the token, user ID, and cart information
    res.status(201).json({
      message: 'User created',
      token: token,
      user: {
        name:savedUser.name,
        email:savedUser.email,
        image:savedUser.image
      },
      cart: {
        items: cartObj.items,
        totalPrice: cartObj.totalPrice,
        totalQuantity: cartObj.totalQuantity,
      },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// User Login
exports.login = async (req, res, next) => {
  const { email, password, cart } = req.body;
  let loadedUserData;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed');
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    
    // Find the user by email
    const user = await User.findOne({ email: email });

    if (!user) {
      // Return an error if the user is not found
      const error = new Error('Email not found');
      error.statusCode = 401;
      throw error;
    }

    loadedUserData = user;

    // Compare the password with the hashed password
    const isEqual = await bcrypt.compare(password, user.password);

    if (!isEqual) {
      // Return an error if the password is incorrect
      const error = new Error('Wrong password');
      error.statusCode = 401;
      throw error;
    }

    // Create a token for authentication
    const token = createToken(loadedUserData);

    // Find or create the user's cart
    let cartObj = await Cart.findOne({ user: loadedUserData._id.toString() });

    if (!cartObj) {
      // Create a new cart if it doesn't exist
      cartObj = await createUserCart(loadedUserData, cart);
    } else {
      // Update the existing cart with the new items
      cartObj = await updateUserCart(cartObj, cart);
    }

    // Return the response with the token, user ID, and cart information
    res.status(200).json({
      token,
      user: {
        name:loadedUserData.name,
        email:loadedUserData.email,
        image:loadedUserData.image

      },
      cart: {
        items: cartObj.items,
        totalPrice: cartObj.totalPrice,
        totalQuantity: cartObj.totalQuantity,
      },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// Change User Password
exports.changeUserPassword = async (req, res, next) => {
  try {
    // Validate the request using express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Return validation errors as response
      const error = new Error('Validation failed');
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      // Return an error if the user is not found
      const error = new Error('User data not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if the current password is equal to the password stored in the database
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      // Return an error if the current password is not valid
      const error = new Error('Invalid current password');
      error.statusCode = 401;
      throw error;
    }

    // Check if the current password is the same as the new password
    if (currentPassword === newPassword) {
      // Return an error if the current password and new password are the same
      const error = new Error('Current password and new password must be different');
      error.statusCode = 400;
      throw error;
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update the user's password
    user.password = hashedPassword;
    const updatedUser = await user.save();

    // Return the response with the updated user data
    res.status(200).json({ message: 'Password updated successfully', updatedUser });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.updateUserImage = async (req, res, next) => {
  try {
    const bufferStream = streamifier.createReadStream(req.file.buffer);

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'user-images' },
        async (error, result) => {
          if (error) {
            reject(error);
          } else {
            try {
              const userId = req.userId;
              const user = await User.findById(userId);

              if (!user) {
                const error = new Error('User data not found');
                error.statusCode = 404;
                throw error;
              }

              // Delete the existing image from Cloudinary if it exists
              if (user.image && user.image.public_id) {
                const res=await cloudinary.uploader.destroy(user.image.public_id);
               
              }

              // Save the public_id and secure_url of the new image in MongoDB
              user.image = {
                public_id: result.public_id,
                secure_url: result.secure_url,
              };
              const updatedUser = await user.save();

              resolve({ imageUrl: result.secure_url, user: updatedUser });
            } catch (error) {
              reject(error);
            }
          }
        }
      );

      bufferStream.pipe(uploadStream);
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error updating user image:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.updateUserEmail = async (req, res, next) => {
  const userId = req.userId
  const { email, password } = req.body
  let loadedUserData;
  try {
    const user = await User.findById(userId);

    if (!user) {
      // Return an error if the user is not found
      const error = new Error('Email not found');
      error.statusCode = 401;
      throw error;
    }

    loadedUserData = user;
    const isEqual = await bcrypt.compare(password, user.password);

    if (!isEqual) {
      // Return an error if the password is incorrect
      const error = new Error('Wrong password');
      error.statusCode = 401;
      throw error;
    }
    loadedUserData.email = email

    const updatedUser = await loadedUserData.save();

    res.status(200).json({
      message: "Email updated successfully",
      user: updatedUser
    })
  }
  catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }


} 


