import React, { useCallback, useState } from 'react';
import {
  FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootNavigator';
import { api, ConversationListItem } from '../lib/api';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Conversations'>;

function titleFor(item: ConversationListItem): string {
  return item.other?.display_name || item.other?.phone || 'Unknown';
}

export default function ConversationsScreen({ navigation }: Props) {
  const { signOut } = useAuth();
  const [items, setItems] = useState<ConversationListItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setItems(await api.listConversations());
    } catch (e) {
      console.warn(e);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={signOut}>
          <Text style={{ color: '#1f6feb', fontWeight: '600' }}>Sign out</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, signOut]);

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No chats yet. Start one!</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() =>
              navigation.navigate('Chat', { conversationId: item.id, title: titleFor(item) })
            }
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{titleFor(item).slice(-2)}</Text>
            </View>
            <Text style={styles.rowTitle}>{titleFor(item)}</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('NewChat')}>
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  row: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14,
    paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#eee',
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#1f6feb',
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  avatarText: { color: '#fff', fontWeight: '700' },
  rowTitle: { fontSize: 16, fontWeight: '500' },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#888' },
  fab: {
    position: 'absolute', right: 20, bottom: 30, width: 58, height: 58,
    borderRadius: 29, backgroundColor: '#1f6feb', justifyContent: 'center',
    alignItems: 'center', elevation: 4,
  },
  fabText: { color: '#fff', fontSize: 30, lineHeight: 32 },
});
