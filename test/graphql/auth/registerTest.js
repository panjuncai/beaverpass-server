/**
 * 注册功能测试
 * 
 * 测试步骤:
 * 1. 使用GraphQL API注册新用户
 * 2. 验证返回结果
 * 3. 清理测试数据
 */

import { expect } from 'chai';
import { gql } from 'apollo-server-express';
import { createTestClient } from 'apollo-server-testing';
import { ApolloServer } from 'apollo-server-express';
import typeDefs from '../../../src/graphql/typeDefs/index.js';
import resolvers from '../../../src/graphql/resolvers/index.js';
import { setupTestEnvironment, cleanupTestData, prisma } from '../../testHelper.js';

// 测试用户数据
const testUser = {
  email: 'test_register@example.com',
  password: 'Test@123456',
  firstName: 'Test',
  lastName: 'User',
  phone: '1234567890'
};

// 注册用户的GraphQL查询
const REGISTER_USER = gql`
  mutation RegisterUser($input: RegisterInput!) {
    register(input: $input) {
      code
      msg
      data {
        id
        email
        firstName
        lastName
        phone
      }
    }
  }
`;

describe('注册功能测试', () => {
  let server;
  let mutate;

  before(() => {
    // 初始化测试环境
    setupTestEnvironment();
    
    // 创建测试服务器
    server = new ApolloServer({
      typeDefs,
      resolvers,
      context: () => ({
        prisma
      })
    });
    
    const testClient = createTestClient(server);
    mutate = testClient.mutate;
  });

  after(async () => {
    // 清理测试数据
    await cleanupTestData(testUser.email);
  });

  it('应该成功注册新用户', async () => {
    const res = await mutate({
      mutation: REGISTER_USER,
      variables: {
        input: testUser
      }
    });

    // 验证响应
    expect(res.data.register.code).to.equal(0);
    expect(res.data.register.msg).to.include('success');
    expect(res.data.register.data).to.have.property('id');
    expect(res.data.register.data.email).to.equal(testUser.email);
    expect(res.data.register.data.firstName).to.equal(testUser.firstName);
    expect(res.data.register.data.lastName).to.equal(testUser.lastName);
    expect(res.data.register.data.phone).to.equal(testUser.phone);
  });

  it('应该拒绝重复注册', async () => {
    const res = await mutate({
      mutation: REGISTER_USER,
      variables: {
        input: testUser
      }
    });

    // 验证响应
    expect(res.data.register.code).to.equal(1);
    expect(res.data.register.msg).to.include('already exists');
  });
}); 