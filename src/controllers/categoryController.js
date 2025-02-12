const categoryService = require("../services/categoryService");


const category=async (req,res)=>{
    try {
        const categories=await categoryService.getAllCategories();
        res.status(200).json({ code: 0, msg: "Categories found", data: categories});
    } catch (e) {
        res.status(400).json({ code: 1, msg: e.message })
    }
}

module.exports = {category};
