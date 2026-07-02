import React, { useState } from 'react';
import {
  ActivityIndicator, Alert, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { api } from '../lib/api';
import { toIndianE164 } from '../lib/phone';

type Props = NativeStackScreenProps<RootStackParamList, 'NewChat'>;

export default function NewChatScreen({ navigation }: Props) {
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);

  const onStart = async () => {
    const e164 = toIndianE164(phone);
    if (!e164) {
      Alert.alert('Invalid number', 'Enter a valid Indian 10-digit mobile number.');
      return;
    }
    setBusy(true);
    try {
      const other = await api.lookupByPhone(e164);
      const convo = await api.startConversation(other.id);
      navigation.replace('Chat', {
        conversationId: convo.id,
        title: other.display_name || other.phone,
      });
    } catch (e: any) {
      Alert.alert('Could not start chat', e.message ?? String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter a contact's Indian mobile number</Text>
      <View style={styles.phoneRow}>
        <View style={styles.prefix}><Text style={styles.prefixText}>+91</Text></View>
        <TextInput
          style={styles.input}
          placeholder="10-digit number"
          keyboardType="number-pad"
          maxLength={10}
          value={phone}
          onChangeText={setPhone}
          autoFocus
        />
      </View>
      <TouchableOpacity
        style={[styles.button, busy && { opacity: 0.6 }]}
        onPress={onStart}
        disabled={busy}
      >
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Start chat</Text>}
      </TouchableOpacity>
      <Text style={styles.note}>
        The person must already have signed up in the app.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  label: { fontSize: 15, color: '#444', marginBottom: 14 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  prefix: {
    paddingHorizontal: 14, paddingVertical: 14, borderWidth: 1, borderColor: '#ddd',
    borderRightWidth: 0, borderTopLeftRadius: 10, borderBottomLeftRadius: 10, backgroundColor: '#f6f6f6',
  },
  prefixText: { fontSize: 16, fontWeight: '600' },
  input: {
    flex: 1, paddingHorizontal: 14, paddingVertical: 14, borderWidth: 1, borderColor: '#ddd',
    borderTopRightRadius: 10, borderBottomRightRadius: 10, fontSize: 16,
  },
  button: { backgroundColor: '#1f6feb', paddingVertical: 16, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  note: { marginTop: 16, color: '#888', fontSize: 12 },
});
