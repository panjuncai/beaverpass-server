import { gql } from 'apollo-server-express';
import userTypeDefs from './userTypeDefs.js';
import chatTypeDefs from './chatTypeDefs.js';
import postTypeDefs from './postTypeDefs.js';
import orderTypeDefs from './orderTypeDefs.js';
import uploadTypes from './uploadTypes.js';
import scalarTypeDefs from './scalarTypeDefs.js';

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
  scalarTypeDefs,
  userTypeDefs,
  chatTypeDefs,
  postTypeDefs,
  orderTypeDefs,
  uploadTypes
]; 