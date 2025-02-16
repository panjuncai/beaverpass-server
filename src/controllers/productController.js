const mongoose = require("mongoose");

const productService = require("../services/productService");

const getAllProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    res.status(200).json({ code: 0, msg: "Products found", data: products });
  } catch (e) {
    res.status(400).json({ code: 1, msg: e.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ code: 1, msg: "Invalid product ID" });
    }
    const product = await productService.getProductById(productId);
    res.status(200).json({ code: 0, msg: "Product found", data: product });
  } catch (e) {
    res.status(400).json({ code: 1, msg: e.message });
  }
};

module.exports = { getAllProducts, getProductById };
