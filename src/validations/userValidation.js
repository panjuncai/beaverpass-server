const Joi=require('joi')

const registerValidationSchema=Joi.object({
    firstName:Joi.string().min(1).max(20).required().messages({
        'string.base':'firstName must be a string',
        'string.empty':'firstName cannot be empty',
        'string.min':'firstName must be atleast 1 character long',
        'string.max':'firstName must be atmost 20 characters long',
        'any.required':'firstName is required'
    }),
    lastName:Joi.string().min(1).max(20).required().messages({
        'string.base':'lastName must be a string',
        'string.empty':'lastName cannot be empty',
        'string.min':'lastName must be atleast 1 character long',
        'string.max':'lastName must be atmost 20 characters long',
        'any.required':'lastName is required'
    }),
    email:Joi.string().email().required().messages({
        'string.base':'email must be a string',
        'string.empty':'email cannot be empty',
        'any.required':'email is required',
        'string.email':'email must be a valid email'
    }),
    password:Joi.string().min(1).max(20).required().messages({
        'string.base':'password must be a string',
        'string.empty':'password cannot be empty',
        'string.min':'password must be atleast 1 character long',
        'string.max':'password must be atmost 20 characters long',
        'any.required':'password is required'
    }),
    confirmPassword:Joi.string().valid(Joi.ref('password')).required().messages({
        'string.base':'comfirmPassword must be a string',
        'string.empty':'comfirmPassword cannot be empty',
        'any.only':'comfirmPassword must match password',
        'any.required':'comfirmPassword is required'
    })
})

const validateRegister=(data)=>{
    return registerValidationSchema.validate(data,{abortEarly:false})
}


const loginValidationSchema=Joi.object({
    email:Joi.string().email().required().messages({
        'string.base':'email must be a string',
        'string.empty':'email cannot be empty',
        'any.required':'email is required',
        'string.email':'email must be a valid email'
    }),
    password:Joi.string().min(1).max(20).required().messages({
        'string.base':'password must be a string',
        'string.empty':'password cannot be empty',
        'string.min':'password must be atleast 1 character long',
        'string.max':'password must be atmost 20 characters long',
        'any.required':'password is required'
    }),})

const validateLogin=(data)=>{
    return loginValidationSchema.validate(data,{abortEarly:false})
}
module.exports={validateRegister,validateLogin}