import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { api, ChatMessage } from '../lib/api';
import { supabase } from '../lib/supabase';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

export default function ChatScreen({ route }: Props) {
  const { conversationId } = route.params;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [myId, setMyId] = useState<string | null>(null);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  // Load my user id + the message history.
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMyId(data.user?.id ?? null));
    api.listMessages(conversationId).then(setMessages).catch(console.warn);
  }, [conversationId]);

  // Realtime: subscribe to new rows in this conversation.
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const msg = payload.new as ChatMessage;
          setMessages((prev) =>
            prev.some((m) => m.id === msg.id) ? prev : [...prev, msg],
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    if (messages.length) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    }
  }, [messages.length]);

  const onSend = async () => {
    const body = text.trim();
    if (!body) return;
    setText('');
    try {
      // The backend inserts the row; Realtime echoes it back to both clients.
      const saved = await api.sendMessage(conversationId, body);
      setMessages((prev) =>
        prev.some((m) => m.id === saved.id) ? prev : [...prev, saved],
      );
    } catch (e) {
      console.warn(e);
      setText(body); // restore on failure
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => {
          const mine = item.sender_id === myId;
          return (
            <View style={[styles.bubbleRow, mine ? styles.right : styles.left]}>
              <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                <Text style={mine ? styles.textMine : styles.textTheirs}>{item.body}</Text>
              </View>
            </View>
          );
        }}
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Message"
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={onSend}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  bubbleRow: { marginVertical: 4, flexDirection: 'row' },
  left: { justifyContent: 'flex-start' },
  right: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '78%', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 16 },
  bubbleMine: { backgroundColor: '#1f6feb', borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: '#eee', borderBottomLeftRadius: 4 },
  textMine: { color: '#fff', fontSize: 15 },
  textTheirs: { color: '#111', fontSize: 15 },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', padding: 8,
    borderTopWidth: StyleSheet.hairlineWidth, borderColor: '#ddd',
  },
  input: {
    flex: 1, maxHeight: 120, borderWidth: 1, borderColor: '#ddd', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, marginRight: 8,
  },
  sendBtn: { backgroundColor: '#1f6feb', borderRadius: 20, paddingHorizontal: 18, paddingVertical: 11 },
  sendText: { color: '#fff', fontWeight: '600' },
});
