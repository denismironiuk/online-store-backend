const express = require('express');
const upload = require('./../helpers/multer/multer')
const User = require('../models/admin');

const { body } = require('express-validator');

const userController = require('../controllers/admin');
const isAuth=require ('../middleware/is-auth')

const router = express.Router();

router.post(
  '/signup',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject('E-Mail address already exists');
          }
        });
      }),
  ],
  userController.signup
);

router.post('/login', userController.login);

router.post('/update/password',isAuth,userController.changeUserPassword);

router.post('/update/image',isAuth,upload.single('image'),userController.updateUserImage)
router.post('/update/email',isAuth,userController.updateUserEmail)
module.exports = router;
