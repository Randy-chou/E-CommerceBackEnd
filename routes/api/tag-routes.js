const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');
const { bulkCreate } = require('../../models/Product');

// The `/api/tags` endpoint
// find all tags
router.get('/', async (req, res) => {
  try{
    const tagData = await Tag.findAll({
      include: [{model: Product, as: "tag_products"}]
    });
    res.status(200).json(tagData);
  }catch (err){
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  try{
    const tagData = await Tag.findByPk(req.params.id, {
      include: [{model: Product, as: "tag_products"}]
    });
    if(!tagData){
      res.status(404).json({message: 'Tag not found?'});
      return;
    }
    res.status(200).json(tagData);
  }catch (err){
    res.status(500).json(err);
  }
});

// create a new tag
router.post('/', async (req, res) => {
  /* req.body should look like this...
    {
      tag_name: "Basketball",
      productIds: [1, 2, 3, 4]
    }
  */
  try{
    const newTag = await Tag.create(req.body);
    if(req.body.productIds.length){
      const productTagArr = req.body.productIds.map((product_id)=>{
        return {
          product_id,
          tag_id: newTag.id,
        }
      });
      const newprodTagIds = await ProductTag.bulkCreate(productTagArr);
      res.status(200).json(newprodTagIds);
    }else{
      res.status(200).json(newTag);
    }
  } catch (err){
    console.log(err);
    res.status(500).json(err);
  }
});

// update a tag's name by its `id` value
router.put('/:id', async (req, res) => {
  /* req.body should look like this...
    {
      tag_name: "Basketball",
      productIds: [1, 2, 3, 4]
    }
  */
  try {
    const updatedTag = await Tag.update(req.body, {
      where: {
        id: req.params.id
      }
    })
    const productTags = await ProductTag.findAll({
      where: { tag_id: req.params.id }
    })
    // Get list of current product_ids
    const productTagIds = productTags.map(({ product_id }) => product_id);
    // Create filtered list of new product_ids
    const newProductTags = req.body.productIds
      .filter((product_id) => !productTagIds.includes(product_id))
      .map((product_id) => {
        return {
          product_id,
          tag_id: req.params.id,
        }
      });
    // figure out which ones to remove
    const productTagsToRemove = productTags
      .filter(({product_id}) => !req.body.productIds.includes(product_id))
      .map(({id}) => id);
    // run both actions
    const result = await Promise.all([
      ProductTag.destroy({ where: { id: productTagsToRemove } }),
      ProductTag.bulkCreate(newProductTags),
    ])
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// delete on tag by its `id` value
router.delete('/:id', async (req, res) => {
  try{
    const tagDestroy = await Tag.destroy({
      where: {
        id: req.params.id,
      },
    })
    await ProductTag.destroy({ 
      where: {tag_id: req.params.id} 
    });
    if (!tagDestroy) {
      res.status(404).json({ message: 'No tag with this id!' });
      return;
    }
    res.status(200).json(tagDestroy);
  }catch(err){
    res.status(500).json(err);
  }
});

module.exports = router;
