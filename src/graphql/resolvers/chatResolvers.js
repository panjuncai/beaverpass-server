const { AuthenticationError, UserInputError, ForbiddenError } = require('apollo-server-express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Helper function to map database enum values to GraphQL enum values
const mapMessageTypeToGraphQL = (messageType) => {
  const mapping = {
    'text': 'TEXT',
    'image': 'IMAGE',
    'post': 'POST'
  };
  return mapping[messageType] || messageType;
};

// Helper function to map GraphQL enum values to database enum values
const mapMessageTypeToDB = (messageType) => {
  const mapping = {
    'TEXT': 'text',
    'IMAGE': 'image',
    'POST': 'post'
  };
  return mapping[messageType] || messageType;
};

// Format message for GraphQL response
const formatMessage = (message) => {
  if (!message) return null;
  
  return {
    ...message,
    messageType: mapMessageTypeToGraphQL(message.messageType)
  };
};

// Format chat room for GraphQL response
const formatChatRoom = (chatRoom) => {
  if (!chatRoom) return null;
  
  return {
    ...chatRoom,
    messages: chatRoom.messages?.map(formatMessage)
  };
};

const chatResolvers = {
  Query: {
    chatRooms: async (_, __, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to view chat rooms');
      }
      
      // Find all chat rooms where the user is a participant
      const chatRoomParticipants = await prisma.chatRoomParticipant.findMany({
        where: {
          userId: user.id
        },
        include: {
          chatRoom: {
            include: {
              participants: {
                include: {
                  user: true
                }
              },
              messages: {
                orderBy: {
                  createdAt: 'desc'
                },
                take: 1,
                include: {
                  sender: true,
                  readBy: true
                }
              }
            }
          }
        },
        orderBy: {
          chatRoom: {
            messages: {
              _max: {
                createdAt: 'desc'
              }
            }
          }
        }
      });
      
      // Format the chat rooms
      return chatRoomParticipants.map(participant => {
        const chatRoom = participant.chatRoom;
        return {
          ...chatRoom,
          participants: chatRoom.participants.map(p => p.user)
        };
      });
    },
    
    chatRoom: async (_, { id }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to view a chat room');
      }
      
      // Check if the user is a participant in the chat room
      const participant = await prisma.chatRoomParticipant.findUnique({
        where: {
          chatRoomId_userId: {
            chatRoomId: id,
            userId: user.id
          }
        }
      });
      
      if (!participant) {
        throw new ForbiddenError('You are not a participant in this chat room');
      }
      
      // Get the chat room with participants and messages
      const chatRoom = await prisma.chatRoom.findUnique({
        where: { id },
        include: {
          participants: {
            include: {
              user: true
            }
          },
          messages: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 20,
            include: {
              sender: true,
              readBy: true,
              post: {
                include: {
                  images: true
                }
              }
            }
          }
        }
      });
      
      if (!chatRoom) {
        throw new UserInputError('Chat room not found');
      }
      
      // Format the chat room
      return {
        ...chatRoom,
        participants: chatRoom.participants.map(p => p.user),
        messages: chatRoom.messages.map(formatMessage).reverse()
      };
    },
    
    messages: async (_, { chatRoomId, limit = 20, offset = 0 }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to view messages');
      }
      
      // Check if the user is a participant in the chat room
      const participant = await prisma.chatRoomParticipant.findUnique({
        where: {
          chatRoomId_userId: {
            chatRoomId,
            userId: user.id
          }
        }
      });
      
      if (!participant) {
        throw new ForbiddenError('You are not a participant in this chat room');
      }
      
      // Get the messages
      const messages = await prisma.message.findMany({
        where: {
          chatRoomId
        },
        include: {
          sender: true,
          readBy: true,
          post: {
            include: {
              images: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: limit
      });
      
      // Format and reverse the messages to show oldest first
      return messages.map(formatMessage).reverse();
    },
    
    unreadMessagesCount: async (_, __, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to view unread messages count');
      }
      
      // Find all chat rooms where the user is a participant
      const chatRoomParticipants = await prisma.chatRoomParticipant.findMany({
        where: {
          userId: user.id
        },
        select: {
          chatRoomId: true
        }
      });
      
      const chatRoomIds = chatRoomParticipants.map(p => p.chatRoomId);
      
      // Count all messages in those chat rooms that are not read by the user
      const unreadCount = await prisma.message.count({
        where: {
          chatRoomId: {
            in: chatRoomIds
          },
          senderId: {
            not: user.id
          },
          readBy: {
            none: {
              userId: user.id
            }
          }
        }
      });
      
      return unreadCount;
    }
  },
  
  Mutation: {
    createChatRoom: async (_, { input }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to create a chat room');
      }
      
      const { participantIds } = input;
      
      // Ensure the current user is included in the participants
      if (!participantIds.includes(user.id)) {
        participantIds.push(user.id);
      }
      
      // Check if all participants exist
      const participants = await prisma.user.findMany({
        where: {
          id: {
            in: participantIds
          }
        }
      });
      
      if (participants.length !== participantIds.length) {
        throw new UserInputError('One or more participants do not exist');
      }
      
      // Check if a chat room already exists with the same participants
      // For simplicity, we'll only check for direct messages (2 participants)
      if (participantIds.length === 2) {
        const existingChatRoom = await prisma.chatRoom.findFirst({
          where: {
            AND: [
              {
                participants: {
                  some: {
                    userId: participantIds[0]
                  }
                }
              },
              {
                participants: {
                  some: {
                    userId: participantIds[1]
                  }
                }
              }
            ]
          },
          include: {
            participants: {
              include: {
                user: true
              }
            },
            messages: {
              orderBy: {
                createdAt: 'desc'
              },
              take: 20,
              include: {
                sender: true,
                post: {
                  include: {
                    images: true
                  }
                },
                readBy: {
                  include: {
                    user: true
                  }
                }
              }
            }
          }
        });
        
        if (existingChatRoom) {
          return formatChatRoom({
            ...existingChatRoom,
            participants: existingChatRoom.participants.map(p => p.user)
          });
        }
      }
      
      // Create a new chat room
      const chatRoom = await prisma.chatRoom.create({
        data: {
          participants: {
            create: participantIds.map(userId => ({
              userId
            }))
          }
        },
        include: {
          participants: {
            include: {
              user: true
            }
          }
        }
      });
      
      return formatChatRoom({
        ...chatRoom,
        participants: chatRoom.participants.map(p => p.user)
      });
    },
    
    sendMessage: async (_, { input }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to send a message');
      }
      
      const { chatRoomId, content, postId, messageType } = input;
      
      // Check if chat room exists
      const chatRoom = await prisma.chatRoom.findUnique({
        where: { id: chatRoomId },
        include: {
          participants: true
        }
      });
      
      if (!chatRoom) {
        throw new UserInputError('Chat room not found');
      }
      
      // Check if user is a participant in the chat room
      const isParticipant = chatRoom.participants.some(p => p.userId === user.id);
      
      if (!isParticipant) {
        throw new ForbiddenError('You are not a participant in this chat room');
      }
      
      // Validate message type
      const dbMessageType = mapMessageTypeToDB(messageType);
      
      if (dbMessageType === 'text' && !content) {
        throw new UserInputError('Content is required for text messages');
      }
      
      if (dbMessageType === 'post' && !postId) {
        throw new UserInputError('Post ID is required for post messages');
      }
      
      if (dbMessageType === 'post') {
        // Check if post exists
        const post = await prisma.post.findUnique({
          where: { id: postId }
        });
        
        if (!post) {
          throw new UserInputError('Post not found');
        }
      }
      
      // Create the message
      const message = await prisma.message.create({
        data: {
          chatRoomId,
          senderId: user.id,
          content: dbMessageType === 'text' ? content : null,
          postId: dbMessageType === 'post' ? postId : null,
          messageType: dbMessageType
        },
        include: {
          sender: true,
          post: {
            include: {
              images: true
            }
          }
        }
      });
      
      return formatMessage(message);
    },
    
    markMessageRead: async (_, { input }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to mark a message as read');
      }
      
      const { messageId } = input;
      
      // Check if the message exists
      const message = await prisma.message.findUnique({
        where: { id: messageId },
        include: {
          chatRoom: {
            include: {
              participants: true
            }
          }
        }
      });
      
      if (!message) {
        throw new UserInputError('Message not found');
      }
      
      // Check if the user is a participant in the chat room
      const isParticipant = message.chatRoom.participants.some(p => p.userId === user.id);
      
      if (!isParticipant) {
        throw new ForbiddenError('You are not a participant in this chat room');
      }
      
      // Check if the message is already read by the user
      const existingRead = await prisma.messageReadBy.findUnique({
        where: {
          messageId_userId: {
            messageId,
            userId: user.id
          }
        }
      });
      
      if (existingRead) {
        return true; // Already marked as read
      }
      
      // Mark the message as read
      await prisma.messageReadBy.create({
        data: {
          messageId,
          userId: user.id
        }
      });
      
      return true;
    }
  },
  
  ChatRoom: {
    participants: async (chatRoom) => {
      if (chatRoom.participants) return chatRoom.participants;
      
      const roomWithParticipants = await prisma.chatRoom.findUnique({
        where: { id: chatRoom.id },
        include: {
          participants: {
            include: {
              user: true
            }
          }
        }
      });
      
      return roomWithParticipants.participants.map(p => p.user);
    },
    
    messages: async (chatRoom) => {
      if (chatRoom.messages) return chatRoom.messages;
      
      const messages = await prisma.message.findMany({
        where: { chatRoomId: chatRoom.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          sender: true,
          post: {
            include: {
              images: true
            }
          },
          readBy: {
            include: {
              user: true
            }
          }
        }
      });
      
      return messages.map(formatMessage);
    }
  },
  
  Message: {
    chatRoom: async (message) => {
      if (message.chatRoom) return message.chatRoom;
      
      const chatRoom = await prisma.chatRoom.findUnique({
        where: { id: message.chatRoomId }
      });
      
      return chatRoom;
    },
    
    sender: async (message) => {
      if (message.sender) return message.sender;
      
      if (!message.senderId) return null;
      
      return prisma.user.findUnique({
        where: { id: message.senderId }
      });
    },
    
    post: async (message) => {
      if (message.post) return message.post;
      
      if (!message.postId) return null;
      
      const post = await prisma.post.findUnique({
        where: { id: message.postId },
        include: {
          images: true
        }
      });
      
      return post;
    },
    
    readBy: async (message) => {
      if (message.readBy) return message.readBy;
      
      const readBy = await prisma.messageReadBy.findMany({
        where: { messageId: message.id },
        include: {
          user: true
        }
      });
      
      return readBy;
    }
  },
  
  MessageReadBy: {
    message: async (messageReadBy) => {
      if (messageReadBy.message) return messageReadBy.message;
      
      const message = await prisma.message.findUnique({
        where: { id: messageReadBy.messageId }
      });
      
      return formatMessage(message);
    },
    
    user: async (messageReadBy) => {
      if (messageReadBy.user) return messageReadBy.user;
      
      return prisma.user.findUnique({
        where: { id: messageReadBy.userId }
      });
    }
  }
};

module.exports = chatResolvers; 