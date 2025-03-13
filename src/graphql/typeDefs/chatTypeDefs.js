const { gql } = require('apollo-server-express');

module.exports = gql`
  enum MessageType {
    TEXT
    IMAGE
    POST
  }

  type ChatRoom {
    id: ID!
    participants: [User!]!
    messages: [Message!]
    createdAt: String
  }

  type Message {
    id: ID!
    chatRoom: ChatRoom!
    chatRoomId: ID!
    sender: User
    senderId: ID
    content: String
    post: Post
    postId: ID
    messageType: MessageType!
    readBy: [MessageReadBy!]
    createdAt: String
    updatedAt: String
  }

  type MessageReadBy {
    message: Message!
    messageId: ID!
    user: User!
    userId: ID!
    readAt: String
  }

  input CreateChatRoomInput {
    participantIds: [ID!]!
  }

  input SendMessageInput {
    chatRoomId: ID!
    content: String
    postId: ID
    messageType: MessageType!
  }

  input MarkMessageReadInput {
    messageId: ID!
  }

  extend type Query {
    chatRooms: [ChatRoom!]!
    chatRoom(id: ID!): ChatRoom
    messages(chatRoomId: ID!, limit: Int, offset: Int): [Message!]!
    unreadMessagesCount: Int!
  }

  extend type Mutation {
    createChatRoom(input: CreateChatRoomInput!): ChatRoom!
    sendMessage(input: SendMessageInput!): Message!
    markMessageRead(input: MarkMessageReadInput!): Boolean!
  }
`; 