// =====================================
// Product Controller - FarmHub
// =====================================

const Product = require("../models/Product");

// ===============================
// Create Product (Farmer)
// ===============================
exports.createProduct = async (req, res) => {
  try {
    const { name, price, quantity, description, image } = req.body;

    if (!name || !price || !quantity) {
      return res.status(400).json({
        message: "Name, price and quantity are required."
      });
    }

    const product = await Product.create({
      farmer: req.user.id,
      name,
      price,
      quantity,
      description,
      image
    });

    res.status(201).json({
      message: "Product created successfully",
      product
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// Get All Products (Public)
// ===============================
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("farmer", "name state district");

    res.json(products);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// Get My Products (Farmer)
// ===============================
exports.getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({
      farmer: req.user.id
    });

    res.json(products);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// Update Product (Farmer)
// ===============================
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, quantity, description, image } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // ensure the logged in user is the owner
    if (product.farmer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = price;
    if (quantity !== undefined) product.quantity = quantity;
    if (description !== undefined) product.description = description;
    if (image !== undefined) product.image = image;

    await product.save();

    res.json({ message: 'Product updated successfully', product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
