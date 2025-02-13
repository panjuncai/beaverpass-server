const Product= require("../models/Product");

const getAllProducts=async ()=>{
    try{
        const products=await Product.find();
        if(!products){
            throw new Error('Products are not exists');
        }
        return products;
    }catch(e){
        throw e;
    }
}

module.exports = { getAllProducts };
