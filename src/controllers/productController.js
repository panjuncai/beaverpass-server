const productService = require("../services/productService");

const product = async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    res.status(200).json({ code: 0, msg: "Products found", data: products });
  } catch (e) {
    res.status(400).json({ code: 1, msg: e.message });
  }
};

module.exports = { product };
