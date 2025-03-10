import { gql } from 'apollo-server-express';

const postTypeDefs = gql`
  enum PostStatus {
    active
    inactive
    sold
    deleted
  }

  # 帖子类型
  type Post {
    id: ID!
    category:String!
    title: String!
    description: String!
    condition: String!
    images: PostImages!
    price: PostPrice!
    deliveryType: String!
    poster: User!
    status: PostStatus!
    createdAt: String!
    updatedAt: String!
  }

  # 帖子图片类型
  type PostImages {
    FRONT: String!
    SIDE: String
    BACK: String
    DAMAGE: String
  }

  # 帖子价格类型
  type PostPrice {
    amount: String
    isFree: Boolean!
    isNegotiable: Boolean!
  }

  # 帖子响应类型
  type PostRsp implements BaseRsp {
    code: Int!
    msg: String!
    data: Post
  }

  # 帖子列表响应类型
  type PostListRsp implements BaseRsp {
    code: Int!
    msg: String!
    data: [Post]
  }

  # 帖子过滤条件输入
  input PostFilterInput {
    category: String
    condition: String
    priceRange: String
    status: String
  }

  # 创建帖子输入
  input CreatePostInput {
    category: String!
    title: String! @constraint(maxLength: 100)
    description: String! @constraint(maxLength: 500)
    condition: String!
    images: PostImagesInput!
    price: PostPriceInput!
    deliveryType: String!
  }

  # 更新帖子输入
  input UpdatePostInput {
    category: String
    title: String @constraint(maxLength: 100)
    description: String @constraint(maxLength: 500)
    condition: String
    images: PostImagesInput
    price: PostPriceInput
    deliveryType: String
    status: PostStatus
  }

  # 帖子图片输入
  input PostImagesInput {
    FRONT: String!
    SIDE: String
    BACK: String
    DAMAGE: String
  }

  # 帖子价格输入
  input PostPriceInput {
    amount: Float!
    isFree: Boolean!
    isNegotiable: Boolean!
  }

  # 扩展查询
  extend type Query {
    # 获取所有帖子（支持过滤）
    getPostsByFilter(filter: PostFilterInput): PostListRsp!
    
    # 获取单个帖子
    getPostById(id: ID!): PostRsp!
    
    # 获取用户的帖子
    getPostsByPosterId(posterId: ID!): PostListRsp!
    
    # 获取当前用户的帖子
    getMyPosts: PostListRsp!
  }

  # 扩展变更
  extend type Mutation {
    # 创建帖子
    createPost(input: CreatePostInput!): PostRsp!
    
    # 更新帖子
    updatePost(id: ID!, input: UpdatePostInput!): PostRsp!
    
    # 更新帖子状态
    updatePostStatus(id: ID!, status: PostStatus!): PostRsp!
    
    # 删除帖子（实际上是将状态设置为deleted）
    deletePost(id: ID!): PostRsp!
  }
`;
export default postTypeDefs;