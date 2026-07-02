import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useAuth } from '../context/AuthContext';
import { toIndianE164 } from '../lib/phone';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { sendOtp } = useAuth();
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);

  const onContinue = async () => {
    const e164 = toIndianE164(phone);
    if (!e164) {
      Alert.alert('Invalid number', 'Please enter a valid Indian 10-digit mobile number.');
      return;
    }
    setBusy(true);
    try {
      await sendOtp(e164);
      navigation.navigate('Otp', { phone: e164 });
    } catch (e: any) {
      Alert.alert('Could not send OTP', e.message ?? String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>Sign in with your Indian mobile number</Text>

      <View style={styles.phoneRow}>
        <View style={styles.prefix}>
          <Text style={styles.prefixText}>+91</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="10-digit mobile number"
          keyboardType="number-pad"
          maxLength={10}
          value={phone}
          onChangeText={setPhone}
          autoFocus
        />
      </View>

      <TouchableOpacity
        style={[styles.button, busy && styles.buttonDisabled]}
        onPress={onContinue}
        disabled={busy}
      >
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Send OTP</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.note}>
        Only Indian (+91) numbers are supported. Standard SMS rates may apply.
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#555', marginBottom: 28 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  prefix: {
    paddingHorizontal: 14, paddingVertical: 14, borderWidth: 1,
    borderColor: '#ddd', borderRightWidth: 0, borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10, backgroundColor: '#f6f6f6',
  },
  prefixText: { fontSize: 16, fontWeight: '600' },
  input: {
    flex: 1, paddingHorizontal: 14, paddingVertical: 14, borderWidth: 1,
    borderColor: '#ddd', borderTopRightRadius: 10, borderBottomRightRadius: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#1f6feb', paddingVertical: 16, borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  note: { marginTop: 18, color: '#888', fontSize: 12, textAlign: 'center' },
});
