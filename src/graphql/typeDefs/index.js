import { gql } from 'apollo-server-express';
import baseTypeDefs from './baseTypeDefs.js';
import userTypeDefs from './userTypeDefs.js';
import chatTypeDefs from './chatTypeDefs.js';
import postTypeDefs from './postTypeDefs.js';
import orderTypeDefs from './orderTypeDefs.js';

const rootTypeDefs = gql`
  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }
`;

export default [
  rootTypeDefs,
  baseTypeDefs,
  userTypeDefs,
  chatTypeDefs,
  postTypeDefs,
  orderTypeDefs
]; 