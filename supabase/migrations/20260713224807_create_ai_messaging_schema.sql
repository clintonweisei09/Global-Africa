/*
# GlobalHire Africa — AI Assistant & Messaging Schema

## Overview
Adds tables for the AI Recruitment Assistant (conversation history, AI memory) and the real-time messaging system (direct messages between users, employers, agents, and support).

## New Tables
1. `ai_conversations` — ChatGPT-style conversation sessions per user (title, created_at, updated_at)
2. `ai_messages` — Individual messages within an AI conversation (role: user/assistant, content, markdown, timestamps)
3. `ai_memory` — Long-term AI memory entries per user (key facts the AI remembers about the user's preferences, job goals, etc.)
4. `chat_conversations` — Direct messaging conversations between two parties (user_id + other party type/id)
5. `chat_messages` — Messages within a chat conversation (sender_id, content, type: text/voice/file/image, read status, translated content)
6. `chat_presence` — Online/presence tracking for users (user_id, online status, last_seen, typing state)

## Security
- RLS enabled on ALL tables.
- AI tables are owner-scoped (user_id = auth.uid()).
- Chat tables: users can read conversations where they are a participant, and can insert messages they send.
- All owner/participant columns default to auth.uid() where applicable.
*/

-- AI CONVERSATIONS
CREATE TABLE IF NOT EXISTS ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text DEFAULT 'New Conversation',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_ai_convos" ON ai_conversations;
CREATE POLICY "select_own_ai_convos" ON ai_conversations FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_ai_convos" ON ai_conversations;
CREATE POLICY "insert_own_ai_convos" ON ai_conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_ai_convos" ON ai_conversations;
CREATE POLICY "update_own_ai_convos" ON ai_conversations FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_ai_convos" ON ai_conversations;
CREATE POLICY "delete_own_ai_convos" ON ai_conversations FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- AI MESSAGES
CREATE TABLE IF NOT EXISTS ai_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user',
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_ai_msgs" ON ai_messages;
CREATE POLICY "select_own_ai_msgs" ON ai_messages FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_ai_msgs" ON ai_messages;
CREATE POLICY "insert_own_ai_msgs" ON ai_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_ai_msgs" ON ai_messages;
CREATE POLICY "delete_own_ai_msgs" ON ai_messages FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS ai_msgs_convo_idx ON ai_messages (conversation_id);

-- AI MEMORY
CREATE TABLE IF NOT EXISTS ai_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  key text NOT NULL,
  value text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE ai_memory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_ai_mem" ON ai_memory;
CREATE POLICY "select_own_ai_mem" ON ai_memory FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_ai_mem" ON ai_memory;
CREATE POLICY "insert_own_ai_mem" ON ai_memory FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_ai_mem" ON ai_memory;
CREATE POLICY "delete_own_ai_mem" ON ai_memory FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- CHAT CONVERSATIONS (direct messaging)
CREATE TABLE IF NOT EXISTS chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_type text NOT NULL DEFAULT 'support',
  participant_name text NOT NULL,
  participant_avatar text DEFAULT '',
  participant_role text DEFAULT '',
  last_message text DEFAULT '',
  last_message_at timestamptz DEFAULT now(),
  unread_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_chat_convos" ON chat_conversations;
CREATE POLICY "select_own_chat_convos" ON chat_conversations FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_chat_convos" ON chat_conversations;
CREATE POLICY "insert_own_chat_convos" ON chat_conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_chat_convos" ON chat_conversations;
CREATE POLICY "update_own_chat_convos" ON chat_conversations FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_chat_convos" ON chat_conversations;
CREATE POLICY "delete_own_chat_convos" ON chat_conversations FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- CHAT MESSAGES
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  sender text NOT NULL DEFAULT 'user',
  content text NOT NULL,
  message_type text DEFAULT 'text',
  file_url text DEFAULT '',
  file_name text DEFAULT '',
  duration int DEFAULT 0,
  read_at timestamptz,
  translated_content text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_chat_msgs" ON chat_messages;
CREATE POLICY "select_own_chat_msgs" ON chat_messages FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_chat_msgs" ON chat_messages;
CREATE POLICY "insert_own_chat_msgs" ON chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_chat_msgs" ON chat_messages;
CREATE POLICY "update_own_chat_msgs" ON chat_messages FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_chat_msgs" ON chat_messages;
CREATE POLICY "delete_own_chat_msgs" ON chat_messages FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS chat_msgs_convo_idx ON chat_messages (conversation_id);

-- CHAT PRESENCE
CREATE TABLE IF NOT EXISTS chat_presence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  online boolean DEFAULT false,
  last_seen timestamptz DEFAULT now(),
  typing boolean DEFAULT false,
  conversation_id uuid
);
ALTER TABLE chat_presence ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_presence" ON chat_presence;
CREATE POLICY "select_own_presence" ON chat_presence FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_presence" ON chat_presence;
CREATE POLICY "insert_own_presence" ON chat_presence FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_presence" ON chat_presence;
CREATE POLICY "update_own_presence" ON chat_presence FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
