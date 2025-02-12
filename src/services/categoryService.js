const Category = require("../models/Category");

const getAllCategories=async ()=>{
    try{
        const categories=await Category.find();
        if(!categories){
            throw new Error('Categories are not exists');
        }
        return categories;
    }catch(e){
        throw e;
    }
}

module.exports = { getAllCategories };
