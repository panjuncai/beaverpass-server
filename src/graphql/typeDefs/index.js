const { gql } = require('apollo-server-express');
const userTypeDefs = require('./userTypeDefs');
const postTypeDefs = require('./postTypeDefs');
const chatTypeDefs = require('./chatTypeDefs');
const orderTypeDefs = require('./orderTypeDefs');

const baseTypeDefs = gql`
  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }
`;

module.exports = [
  baseTypeDefs,
  userTypeDefs,
  postTypeDefs,
  chatTypeDefs,
  orderTypeDefs
]; 