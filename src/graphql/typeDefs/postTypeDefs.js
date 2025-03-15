import { gql } from 'apollo-server-express';

const postTypeDefs = gql`
  
  # 帖子类型
  type Post {
    id: ID!
    category: String!
    title: String!
    description: String!
    condition: String!
    amount: Float!
    isNegotiable: Boolean
    deliveryType: String!
    poster: User
    posterId: ID
    status: String
    createdAt: String
    updatedAt: String
    images: [PostImage]
  }

  # 帖子图片类型
  type PostImage {
    id: ID!
    postId: ID!
    imageUrl: String!
    imageType: String
    createdAt: String
  }


  # 帖子过滤条件输入
  input PostFilterInput {
    category: String
    condition: String
    minPrice: Float
    maxPrice: Float
    status: String
  }

  # 创建帖子输入
  input CreatePostInput {
    category: String!
    title: String!
    description: String!
    condition: String!
    amount: Float!
    isNegotiable: Boolean
    deliveryType: String!
    images: [PostImageInput]!
  }

  # 更新帖子输入
  input UpdatePostInput {
    id: ID!
    category: String
    title: String
    description: String
    condition: String
    amount: Float
    isNegotiable: Boolean
    deliveryType: String
    status: String
  }

  # 帖子图片输入
  input PostImageInput {
    imageUrl: String!
    imageType: String
  }

  # 添加图片输入
  input AddPostImageInput {
    postId: ID!
    imageUrl: String!
    imageType: String
  }

  # 删除图片输入
  input DeletePostImageInput {
    id: ID!
  }

  # 扩展查询
  extend type Query {
    # 获取所有帖子（支持过滤）
    getPostsByFilter(filter: PostFilterInput): [Post]
    
    # 获取单个帖子
    getPostById(id: ID): Post
    
    # 获取用户的帖子
    getPostsByPosterId(posterId: ID!): [Post]
    
    # 获取当前用户的帖子
    getMyPosts: [Post]

    posts(
      category: String
      condition: String
      deliveryType: String
      status: String
      limit: Int
      offset: Int
    ): [Post]
    post(id: ID!): Post
    userPosts(userId: ID!): [Post]
  }

  # 扩展变更
  extend type Mutation {
    # 创建帖子
    createPost(input: CreatePostInput!): Post
    
    # 更新帖子
    updatePost(input: UpdatePostInput!): Post
    
    # 更新帖子状态
    updatePostStatus(id: ID!, status: String!): Post
    
    # 删除帖子(实际上是将状态设置为deleted)
    deletePost(id: ID!): Post

    # 添加帖子图片
    addPostImage(input: AddPostImageInput!): Post
    
    # 删除帖子图片
    deletePostImage(input: DeletePostImageInput!): Post
  }
`;
export default postTypeDefs;