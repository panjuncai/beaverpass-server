import { gql } from 'apollo-server-express';

const postTypeDefs = gql`
  enum PostCategory {
    LIVING_ROOM_FURNITURE
    BEDROOM_FURNITURE
    DINING_ROOM_FURNITURE
    OFFICE_FURNITURE
    OUTDOOR_FURNITURE
    STORAGE
    OTHER
  }

  enum PostCondition {
    LIKE_NEW
    GENTLY_USED
    MINOR_SCRATCHES
    STAINS
    NEEDS_REPAIR
  }

  enum DeliveryType {
    HOME_DELIVERY
    PICKUP
    BOTH
  }

  enum PostStatus {
    ACTIVE
    INACTIVE
    SOLD
    DELETED
  }

  # 帖子类型
  type Post {
    id: ID!
    category: PostCategory!
    title: String!
    description: String!
    condition: PostCondition!
    amount: Float!
    isNegotiable: Boolean
    deliveryType: DeliveryType!
    poster: User
    posterId: ID
    status: PostStatus
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
    minPrice: Float
    maxPrice: Float
    status: String
  }

  # 创建帖子输入
  input CreatePostInput {
    category: PostCategory!
    title: String!
    description: String!
    condition: PostCondition!
    amount: Float!
    isNegotiable: Boolean
    deliveryType: DeliveryType!
    images: [PostImageInput]!
  }

  # 更新帖子输入
  input UpdatePostInput {
    id: ID!
    category: PostCategory
    title: String
    description: String
    condition: PostCondition
    amount: Float
    isNegotiable: Boolean
    deliveryType: DeliveryType
    status: PostStatus
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
    getPostsByFilter(filter: PostFilterInput): PostListRsp!
    
    # 获取单个帖子
    getPostById(id: ID!): PostRsp!
    
    # 获取用户的帖子
    getPostsByPosterId(posterId: ID!): PostListRsp!
    
    # 获取当前用户的帖子
    getMyPosts: PostListRsp!

    posts(
      category: PostCategory
      condition: PostCondition
      deliveryType: DeliveryType
      status: PostStatus
      limit: Int
      offset: Int
    ): [Post]
    post(id: ID!): Post
    userPosts(userId: ID!): [Post]
  }

  # 扩展变更
  extend type Mutation {
    # 创建帖子
    createPost(input: CreatePostInput!): PostRsp!
    
    # 更新帖子
    updatePost(input: UpdatePostInput!): PostRsp!
    
    # 更新帖子状态
    updatePostStatus(id: ID!, status: String!): PostRsp!
    
    # 删除帖子（实际上是将状态设置为deleted）
    deletePost(id: ID!): PostRsp!

    # 添加帖子图片
    addPostImage(input: AddPostImageInput!): PostRsp!
    
    # 删除帖子图片
    deletePostImage(input: DeletePostImageInput!): PostRsp!
  }
`;
export default postTypeDefs;