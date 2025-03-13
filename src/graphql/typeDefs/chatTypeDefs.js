import { gql } from 'apollo-server-express';

export default gql`
  enum MessageType {
    TEXT
    IMAGE
    POST
  }

  type ChatRoom {
    id: ID!
    participants: [User!]!
    messages: [Message!]!
    unreadCount: Int
    lastMessage: Message
    createdAt: String!
  }

  type Message {
    id: ID!
    room: ChatRoom!
    sender: User
    content: String
    post: Post
    messageType: MessageType!
    readBy: [MessageReadBy!]!
    createdAt: String!
    updatedAt: String!
  }

  type MessageReadBy {
    id: ID!
    message: Message!
    user: User!
    readAt: String!
  }

  input SendMessageInput {
    chatRoomId: ID!
    content: String
    postId: ID
    messageType: MessageType!
  }

  type ChatRoomResponse {
    code: Int!
    success: Boolean!
    message: String!
    chatRoom: ChatRoom
  }

  type MessageResponse {
    code: Int!
    success: Boolean!
    message: String!
    messageData: Message
  }

  extend type Query {
    getChatRooms: [ChatRoom!]!
    getChatRoom(chatRoomId: ID!): ChatRoom
    getMessages(chatRoomId: ID!, limit: Int, offset: Int): [Message!]!
    unreadMessagesCount: Int!
  }

  extend type Mutation {
    createChatRoom(userId: ID!): ChatRoomResponse!
    sendMessage(input: SendMessageInput!): MessageResponse!
    markMessagesAsRead(chatRoomId: ID!): Boolean!
    markMessageRead(input: MessageReadInput!): Boolean!
  }

  input MessageReadInput {
    messageId: ID!
  }
`; 