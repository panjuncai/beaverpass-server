
import _ from 'lodash'
const formatUserToCamel=(user)=>{
    // 移除敏感字段
    const {password,verification_token,...filteredUser}=user
    // 转换字段名为驼峰命名
    return _.mapKeys(filteredUser,(value,key)=>_.camelCase(key))
}

// 转换字段名为驼峰命名
const formatEntityToCamel=(entity)=>{
    return _.mapKeys(entity,(value,key)=>_.camelCase(key))
}

// 转换字段名为蛇形命名
const formatEntityToSnake=(entity)=>{
    return _.mapKeys(entity,(value,key)=>_.snakeCase(key))
}

export {formatUserToCamel,formatEntityToSnake,formatEntityToCamel}