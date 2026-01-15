const Category = require('../models/category')

exports.getCategories = (req, res, next) => {
    Category.find()
        .then(categories => {
            res.status(200).json({
                categories: categories
            })
        }).catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}
exports.getFeaturedCategories = (req, res, next) => {
    Category.find({isFeatured: true})
        .then(categories => {
            res.status(200).json({
                categories: categories
            })
        }).catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}

exports.addCategories =  async(req, res, next) => {
         const { categoryName,isFeatured } = req.body;
        try {
        
          const category =  new Category({
           categoryName,
           isFeatured
          });
      
          // Save the product to the database
         await  category.save();
      
          res.status(201).json({ success: true, message: 'Category added successfully' });
        } catch (error) {
          res.status(500).json({ success: false, message: 'Unable to add category' });
        }
    };