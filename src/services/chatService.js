import supabase from '../lib/supabase.js';
import socketIO from '../socket.js';  // 只引入模块，不立即获取实例

const getChatRooms = async (userId) => {
  try {
    // 获取用户参与的所有聊天室
    const { data: participations, error: participationsError } = await supabase
      .from('chat_room_participants')
      .select('chat_room_id, unread_count')
      .eq('user_id', userId);

    if (participationsError) {
      throw new Error(participationsError.message);
    }

    if (!participations || participations.length === 0) {
      return [];
    }

    const roomIds = participations.map(p => p.chat_room_id);

    // 获取聊天室详细信息
    const { data: rooms, error: roomsError } = await supabase
      .from('chat_rooms')
      .select(`
        _id,
        created_at,
        messages!inner (
          _id,
          content,
          created_at,
          sender_id,
          message_type,
          post_id
        ),
        chat_room_participants!inner (
          user_id,
          unread_count
        )
      `)
      .in('_id', roomIds)
      .order('created_at', { ascending: false });

    if (roomsError) {
      throw new Error(roomsError.message);
    }

    // 获取所有参与者的用户信息
    const allParticipantIds = rooms.flatMap(room => 
      room.chat_room_participants.map(p => p.user_id)
    );

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('_id, first_name, last_name, avatar')
      .in('_id', allParticipantIds);

    if (usersError) {
      throw new Error(usersError.message);
    }

    // 格式化返回数据
    const formattedRooms = rooms.map(room => {
      // 找到最后一条消息
      const messages = room.messages || [];
      const lastMessage = messages.length > 0 
        ? messages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
        : null;

      // 找到当前用户的未读消息数
      const userParticipant = room.chat_room_participants.find(p => p.user_id === userId);
      const unreadCount = userParticipant ? userParticipant.unread_count : 0;

      // 找到其他参与者
      const otherParticipantIds = room.chat_room_participants
        .filter(p => p.user_id !== userId)
        .map(p => p.user_id);

      const participants = otherParticipantIds.map(id => {
        const user = users.find(u => u._id === id);
        return user ? {
          _id: user._id,
          firstName: user.first_name,
          lastName: user.last_name,
          avatar: user.avatar,
          unreadCount: 0 // 这里只关心当前用户的未读数
        } : null;
      }).filter(Boolean);

      // 添加当前用户
      const currentUser = users.find(u => u._id === userId);
      if (currentUser) {
        participants.push({
          _id: currentUser._id,
          firstName: currentUser.first_name,
          lastName: currentUser.last_name,
          avatar: currentUser.avatar,
          unreadCount
        });
      }

      return {
        _id: room._id,
        participants,
        lastMessage: lastMessage ? {
          _id: lastMessage._id,
          content: lastMessage.content,
          createdAt: lastMessage.created_at,
          senderId: lastMessage.sender_id,
          messageType: lastMessage.message_type,
          postId: lastMessage.post_id
        } : null,
        createdAt: room.created_at
      };
    });

    return formattedRooms;
  } catch (error) {
    throw new Error(`Failed to get chat rooms: ${error.message}`);
  }
};

const getChatMessages = async (roomId, userId) => {
  try {
    // 验证用户是否在聊天室中
    const { data: participation, error: participationError } = await supabase
      .from('chat_room_participants')
      .select('*')
      .eq('chat_room_id', roomId)
      .eq('user_id', userId)
      .single();

    if (participationError || !participation) {
      throw new Error('Chat room not found or no access');
    }

    // 获取消息
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(`
        _id,
        content,
        message_type,
        post_id,
        created_at,
        sender_id,
        message_read_by!inner (
          user_id,
          read_at
        )
      `)
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      throw new Error(messagesError.message);
    }

    // 获取发送者信息
    const senderIds = [...new Set(messages.map(m => m.sender_id))];
    const { data: senders, error: sendersError } = await supabase
      .from('users')
      .select('_id, first_name, last_name, avatar')
      .in('_id', senderIds);

    if (sendersError) {
      throw new Error(sendersError.message);
    }

    // 标记消息为已读
    const unreadMessageIds = messages
      .filter(m => 
        m.sender_id !== userId && 
        !m.message_read_by.some(r => r.user_id === userId)
      )
      .map(m => m._id);

    if (unreadMessageIds.length > 0) {
      // 插入已读记录
      const readByRecords = unreadMessageIds.map(messageId => ({
        messageId: messageId,
        userId: userId,
        read_at: new Date()
      }));

      const { error: readByError } = await supabase
        .from('message_read_by')
        .insert(readByRecords);

      if (readByError) {
        console.error('标记消息已读失败:', readByError);
      }

      // 更新未读计数
      const { error: updateError } = await supabase
        .from('chat_room_participants')
        .update({ unread_count: 0 })
        .eq('chat_room_id', roomId)
        .eq('user_id', userId);

      if (updateError) {
        console.error('更新未读计数失败:', updateError);
      }
    }

    // 格式化返回数据
    const formattedMessages = messages.map(message => {
      const sender = senders.find(s => s._id === message.sender_id);
      const readBy = message.message_read_by.map(r => r.user_id);

      return {
        _id: message._id,
        content: message.content,
        messageType: message.message_type,
        postId: message.post_id,
        createdAt: message.created_at,
        senderId: {
          _id: sender?._id,
          firstName: sender?.first_name,
          lastName: sender?.last_name,
          avatar: sender?.avatar
        },
        readBy
      };
    });

    return formattedMessages;
  } catch (error) {
    throw new Error(`Failed to get messages: ${error.message}`);
  }
};

const sendMessage = async (roomId, senderId, { content, postId, messageType = 'text' }) => {
  try {
    // 验证用户是否在聊天室中
    const { data: participation, error: participationError } = await supabase
      .from('chat_room_participants')
      .select('*')
      .eq('chat_room_id', roomId)
      .eq('user_id', senderId)
      .single();

    if (participationError || !participation) {
      throw new Error('Chat room not found or no access');
    }

    // 创建消息
    const messageData = {
      room_id: roomId,
      sender_id: senderId,
      message_type: messageType,
      created_at: new Date(),
      updated_at: new Date()
    };

    if (messageType === 'post') {
      messageData.post_id = postId;
    } else {
      messageData.content = content;
    }

    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single();

    if (messageError) {
      throw new Error(messageError.message);
    }

    // 添加自己为已读
    const { error: readByError } = await supabase
      .from('message_read_by')
      .insert({
        messageId: message._id,
        userId: senderId,
        read_at: new Date()
      });

    if (readByError) {
      console.error('添加已读记录失败:', readByError);
    }

    // 更新其他参与者的未读计数
    const { data: otherParticipants, error: participantsError } = await supabase
      .from('chat_room_participants')
      .select('user_id, unread_count')
      .eq('chat_room_id', roomId)
      .neq('user_id', senderId);

    if (!participantsError && otherParticipants) {
      for (const participant of otherParticipants) {
        const { error: updateError } = await supabase
          .from('chat_room_participants')
          .update({ 
            unread_count: participant.unread_count + 1 
          })
          .eq('chat_room_id', roomId)
          .eq('user_id', participant.user_id);

        if (updateError) {
          console.error('更新未读计数失败:', updateError);
        }
      }
    }

    return message;
  } catch (error) {
    throw new Error(`Failed to send message: ${error.message}`);
  }
};

const createChatRoom = async (buyerId, sellerId) => {
  try {
    // 检查是否已存在聊天室
    const { data: existingRooms, error: checkError } = await supabase
      .from('chat_room_participants')
      .select('chat_room_id')
      .eq('user_id', buyerId);

    if (!checkError && existingRooms && existingRooms.length > 0) {
      const buyerRoomIds = existingRooms.map(r => r.chat_room_id);
      
      const { data: sellerParticipations, error: sellerError } = await supabase
        .from('chat_room_participants')
        .select('chat_room_id')
        .eq('user_id', sellerId)
        .in('chat_room_id', buyerRoomIds);

      if (!sellerError && sellerParticipations && sellerParticipations.length > 0) {
        // 找到买家和卖家都参与的聊天室
        const commonRoomId = sellerParticipations[0].chat_room_id;
        
        // 获取聊天室详情
        const { data: existingRoom, error: roomError } = await supabase
          .from('chat_rooms')
          .select(`
            _id,
            created_at,
            chat_room_participants!inner (
              user_id,
              unread_count
            )
          `)
          .eq('_id', commonRoomId)
          .single();

        if (!roomError && existingRoom) {
          // 获取参与者信息
          const participantIds = existingRoom.chat_room_participants.map(p => p.user_id);
          
          const { data: users, error: usersError } = await supabase
            .from('users')
            .select('_id, first_name, last_name, avatar')
            .in('_id', participantIds);

          if (!usersError && users) {
            // 格式化返回数据
            const participants = existingRoom.chat_room_participants.map(p => {
              const user = users.find(u => u._id === p.user_id);
              return {
                _id: p.user_id,
                firstName: user?.first_name,
                lastName: user?.last_name,
                avatar: user?.avatar,
                unread_count: p.unread_count
              };
            });

            return {
              _id: existingRoom._id,
              participants,
              created_at: existingRoom.created_at
            };
          }
        }
      }
    }

    // 获取用户信息
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('_id, first_name, last_name, avatar')
      .in('_id', [buyerId, sellerId]);

    if (usersError || !users || users.length !== 2) {
      throw new Error('Failed to get user information');
    }

    // 创建新聊天室
    const { data: room, error: roomError } = await supabase
      .from('chat_rooms')
      .insert({
        created_at: new Date()
      })
      .select()
      .single();

    if (roomError) {
      throw new Error(roomError.message);
    }

    // 添加参与者
    const participants = [
      {
        chat_room_id: room._id,
        user_id: buyerId,
        unread_count: 0
      },
      {
        chat_room_id: room._id,
        user_id: sellerId,
        unread_count: 0
      }
    ];

    const { error: participantsError } = await supabase
      .from('chat_room_participants')
      .insert(participants);

    if (participantsError) {
      throw new Error(participantsError.message);
    }

    // 格式化返回数据
    const formattedParticipants = users.map(user => ({
      _id: user._id,
      firstName: user.first_name,
      lastName: user.last_name,
      avatar: user.avatar,
      unread_count: 0
    }));

    return {
      _id: room._id,
      participants: formattedParticipants,
      created_at: room.created_at
    };
  } catch (error) {
    throw new Error(`Failed to create chat room: ${error.message}`);
  }
};

const markMessagesAsRead = async (roomId, userId) => {
  try {
    // 获取未读消息
    const { data: unreadMessages, error: messagesError } = await supabase
      .from('messages')
      .select(`
        _id,
        message_read_by!inner (
          user_id
        )
      `)
      .eq('room_id', roomId)
      .neq('sender_id', userId);

    if (messagesError) {
      throw new Error(messagesError.message);
    }

    // 找出未被当前用户阅读的消息
    const messagesToMark = unreadMessages.filter(message => 
      !message.message_read_by.some(r => r.user_id === userId)
    ).map(m => m._id);

    if (messagesToMark.length > 0) {
      // 插入已读记录
      const readByRecords = messagesToMark.map(messageId => ({
        messageId: messageId,
        userId: userId,
        read_at: new Date()
      }));

      const { error: readByError } = await supabase
        .from('message_read_by')
        .insert(readByRecords);

      if (readByError) {
        throw new Error(readByError.message);
      }
    }

    // 更新未读计数
    const { error: updateError } = await supabase
      .from('chat_room_participants')
      .update({ unread_count: 0 })
      .eq('chat_room_id', roomId)
      .eq('user_id', userId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    // 在需要使用时获取 io 实例
    const io = socketIO.getIO();
    io.to(roomId).emit('messages_read', { roomId, userId });
  } catch (error) {
    throw new Error(`Failed to mark messages as read: ${error.message}`);
  }
};

const findRoomWithUser = async (userId, sellerId) => {
  try {
    // 获取用户参与的所有聊天室
    const { data: userRooms, error: userRoomsError } = await supabase
      .from('chat_room_participants')
      .select('chat_room_id')
      .eq('user_id', userId);

    if (userRoomsError) {
      throw new Error(userRoomsError.message);
    }

    if (!userRooms || userRooms.length === 0) {
      return null;
    }

    const roomIds = userRooms.map(r => r.chat_room_id);

    // 查找卖家参与的聊天室
    const { data: sellerRooms, error: sellerRoomsError } = await supabase
      .from('chat_room_participants')
      .select('chat_room_id')
      .eq('user_id', sellerId)
      .in('chat_room_id', roomIds);

    if (sellerRoomsError) {
      throw new Error(sellerRoomsError.message);
    }

    if (!sellerRooms || sellerRooms.length === 0) {
      return null;
    }

    // 获取共同聊天室的详情
    const commonRoomId = sellerRooms[0].chat_room_id;
    
    const { data: room, error: roomError } = await supabase
      .from('chat_rooms')
      .select(`
        _id,
        created_at,
        messages!inner (
          _id,
          content,
          created_at,
          sender_id,
          message_type,
          post_id
        ),
        chat_room_participants!inner (
          user_id,
          unread_count
        )
      `)
      .eq('_id', commonRoomId)
      .single();

    if (roomError) {
      throw new Error(roomError.message);
    }

    // 获取参与者信息
    const participantIds = room.chat_room_participants.map(p => p.user_id);
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('_id, first_name, last_name, avatar')
      .in('_id', participantIds);

    if (usersError) {
      throw new Error(usersError.message);
    }

    // 找到最后一条消息
    const messages = room.messages || [];
    const lastMessage = messages.length > 0 
      ? messages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
      : null;

    // 格式化返回数据
    const participants = room.chat_room_participants.map(p => {
      const user = users.find(u => u._id === p.user_id);
      return {
        _id: p.user_id,
        firstName: user?.first_name,
        lastName: user?.last_name,
        avatar: user?.avatar,
        unread_count: p.unread_count
      };
    });

    return {
      _id: room._id,
      participants,
      lastMessage: lastMessage ? {
        _id: lastMessage._id,
        content: lastMessage.content,
        createdAt: lastMessage.created_at,
        senderId: lastMessage.sender_id,
        messageType: lastMessage.message_type,
        postId: lastMessage.post_id
      } : null,
      created_at: room.created_at
    };
  } catch (error) {
    throw new Error(`Failed to find chat room: ${error.message}`);
  }
};

const getTotalUnreadCount = async (userId) => {
  try {
    // 查询用户参与的所有聊天室的未读消息总数
    const { data, error } = await supabase
      .from('chat_room_participants')
      .select('unread_count')
      .eq('user_id', userId);
    
    if (error) {
      throw new Error(error.message);
    }
    
    // 计算总未读消息数
    const totalUnread = data.reduce((sum, item) => sum + (item.unread_count || 0), 0);
    
    return { totalUnread };
  } catch (error) {
    throw new Error(`Failed to get unread message count: ${error.message}`);
  }
};

export {
  getChatRooms,
  getChatMessages,
  sendMessage,
  createChatRoom,
  markMessagesAsRead,
  findRoomWithUser,
  getTotalUnreadCount
}; 