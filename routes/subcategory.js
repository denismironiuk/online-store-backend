const express = require('express');
const router = express.Router();
const SubCategory = require('../models/SubCategory');
const Category = require('../models/category');

// Get all subcategories
router.get('/subcategory', async (req, res) => {
  try {
    const subcategories = await SubCategory.find().populate('category');
    res.json(subcategories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/subcategories/:categoryId', async (req, res, next) => {
    const categoryId = req.params.categoryId;
   
  
    try {
      // Find all subcategories that belong to the specified category ID
      const subcategories = await SubCategory.find({ category: categoryId });
  
      res.status(200).json({ subcategories });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch subcategories' });
    }
  });

// Add a new subcategory
router.post('/subcategory', async (req, res) => {
  try {
    const { subcategoryName, categoryId } = req.body;
    const subcategory = new SubCategory({
      subcategoryName, 
      category: categoryId,
    });
    await subcategory.save();

    // Update the category with the subcategory ID
    await Category.findByIdAndUpdate(categoryId, {
      $push: { subcategories: subcategory._id },
    });

    res.status(201).json(subcategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete a subcategory
router.delete('/subcategory/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find the subcategory
    const subcategory = await SubCategory.findById(id);

    // Remove the subcategory from the associated category
    await Category.findByIdAndUpdate(subcategory.category, {
      $pull: { subcategories: subcategory._id },
    });

    // Delete the subcategory
    await SubCategory.findByIdAndDelete(id);

    res.json({ message: 'Subcategory deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update a subcategory
router.put('/subcategory/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // Find the subcategory and update its name
    const subcategory = await SubCategory.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );

    res.json(subcategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
