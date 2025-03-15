drop table message_read_by cascade;
drop table messages cascade;
drop table posts cascade;
drop table post_images cascade;
drop table chat_room_participants cascade;
drop table chat_rooms cascade;
drop table users cascade;
drop table orders cascade;

drop type message_type_enum;
drop type post_category_enum;
drop type post_condition_enum;
drop type delivery_type_enum;
drop type post_status_enum;
drop type order_status_enum;

-- 消息类型
CREATE TYPE message_type_enum AS ENUM ('TEXT', 'IMAGE', 'POST');

-- 帖子分类
CREATE TYPE post_category_enum AS ENUM (
  'LIVING_ROOM_FURNITURE',
  'BEDROOM_FURNITURE',
  'DINING_ROOM_FURNITURE',
  'OFFICE_FURNITURE',
  'OUTDOOR_FURNITURE',
  'STORAGE',
  'OTHER'
);

-- 帖子成色
CREATE TYPE post_condition_enum AS ENUM (
  'LIKE_NEW', 'GENTLY_USED', 'MINOR_SCRATCHES', 'STAINS', 'NEEDS_REPAIR'
);

-- 配送方式
CREATE TYPE delivery_type_enum AS ENUM ('HOME_DELIVERY', 'PICKUP', 'BOTH');

-- 帖子状态
CREATE TYPE post_status_enum AS ENUM ('ACTIVE', 'INACTIVE', 'SOLD', 'DELETED');

-- 订单状态
CREATE TYPE order_status_enum AS ENUM (
  'PENDING_PAYMENT', 'PAID', 'SHIPPED', 'COMPLETED', 'CANCELED', 'REFUNDED'
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  avatar TEXT,
  address TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category post_category_enum NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL CHECK (char_length(description) <= 500),
  condition post_condition_enum NOT NULL,
  
  amount numeric(12,2) NOT NULL DEFAULT 0,
  is_negotiable BOOLEAN DEFAULT FALSE,

  delivery_type delivery_type_enum NOT NULL,
  poster_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status post_status_enum DEFAULT 'ACTIVE',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- 如果想保留约束，限制价格至少>=0，可以这样：
  CHECK (amount >= 0)
);
CREATE INDEX idx_posts_poster_id ON posts(poster_id);

CREATE TABLE post_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_type TEXT,  -- 可选，比如 'front', 'side', 'back', 'damage'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_post_images_post_id ON post_images(post_id);


CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_room_participants (
  chat_room_id UUID NOT NULL,
  user_id UUID NOT NULL,
  PRIMARY KEY (chat_room_id,user_id),
  FOREIGN KEY (chat_room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,

  content TEXT,
  post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  message_type message_type_enum DEFAULT 'TEXT',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  CHECK (
    (message_type != 'POST' AND content IS NOT NULL AND post_id IS NULL)
    OR
    (message_type = 'POST' AND post_id IS NOT NULL AND content IS NULL)
  )
);
CREATE INDEX idx_messages_chat_room_id ON messages(chat_room_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);

CREATE TABLE message_read_by (
  message_id UUID NOT NULL,
  user_id UUID NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (message_id, user_id),
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE ON UPDATE NO ACTION,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES users(id),
  seller_id UUID NOT NULL REFERENCES users(id),

  post_id UUID NOT NULL REFERENCES posts(id),

  -- 收货信息
  shipping_address TEXT NOT NULL,
  shipping_receiver TEXT NOT NULL,
  shipping_phone TEXT NOT NULL,

  -- 支付信息
  payment_method TEXT NOT NULL,
  payment_transaction_id TEXT,

  -- 金额计算相关
  payment_fee NUMERIC(12,2) DEFAULT 0,
  delivery_fee NUMERIC(12,2) DEFAULT 0,
  service_fee NUMERIC(12,2) DEFAULT 0,
  tax NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) NOT NULL,

  -- 订单状态
  status order_status_enum DEFAULT 'PENDING_PAYMENT',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_seller_id ON orders(seller_id);