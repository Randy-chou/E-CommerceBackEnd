const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

  // find all categories
router.get('/', async (req, res) => {
  try{
    const categoryData = await Category.findAll({
      include: [{model: Product}]
    });
    res.status(200).json(categoryData);
  }catch (err){
    res.status(500).json(err);
  }
});

// find one category by its `id` value
router.get('/:id', async (req, res) => {
  try{
    const categoryData = await Category.findByPk(req.params.id, {
      include: [{model: Product}]
    });
    if(!categoryData){
      res.status(404).json({message: 'Category not found?'});
      return;
    }
    res.status(200).json(categoryData);
  }catch (err){
    res.status(500).json(err);
  }
});

// create a new category
router.post('/', async (req, res) => {
  try{
    const categoryData = await Category.create(req.body);
    res.status(200).json(categoryData);
  }catch (err){
    res.status(500).json(err);
  }
});

// update a category by its `id` value
router.put('/:id', async (req, res) => {
  try{
    const newCategory = await Category.update(req.body,{
      where: {
        id: req.params.id
      }
    })
    if (!newCategory[0]) {
      res.status(404).json({ message: 'No user with this id!' });
      return;
    }
    res.status(200).json(newCategory);
  }catch(err){
    res.status(500).json(err);
  }
});

// delete a category by its `id` value
router.delete('/:id', async (req, res) => {
  try{
    const deletedCategory = await Category.destroy({
      where: {
        id: req.params.id,
      },
    })
    if (!deletedCategory) {
      res.status(404).json({ message: 'No user with this id!' });
      return;
    }
    res.status(200).json(deletedCategory);
  }catch(err){
    res.status(500).json(err);
  }
});

module.exports = router;
