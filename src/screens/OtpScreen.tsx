import React, { useState } from 'react';
import {
  ActivityIndicator, Alert, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Otp'>;

export default function OtpScreen({ route }: Props) {
  const { phone } = route.params;
  const { verifyOtp, sendOtp } = useAuth();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const onVerify = async () => {
    if (code.length < 4) {
      Alert.alert('Enter the OTP', 'Please enter the 6-digit code sent to you.');
      return;
    }
    setBusy(true);
    try {
      await verifyOtp(phone, code);
      // On success the auth listener flips the navigator to the app stack.
    } catch (e: any) {
      Alert.alert('Verification failed', e.message ?? String(e));
    } finally {
      setBusy(false);
    }
  };

  const onResend = async () => {
    try {
      await sendOtp(phone);
      Alert.alert('OTP resent', `A new code was sent to ${phone}.`);
    } catch (e: any) {
      Alert.alert('Could not resend', e.message ?? String(e));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter the code</Text>
      <Text style={styles.subtitle}>Sent to {phone}</Text>

      <TextInput
        style={styles.input}
        placeholder="6-digit OTP"
        keyboardType="number-pad"
        maxLength={6}
        value={code}
        onChangeText={setCode}
        autoFocus
      />

      <TouchableOpacity
        style={[styles.button, busy && styles.buttonDisabled]}
        onPress={onVerify}
        disabled={busy}
      >
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={onResend} style={styles.resend}>
        <Text style={styles.resendText}>Resend code</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#555', marginBottom: 28 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 14, fontSize: 22, letterSpacing: 6, textAlign: 'center',
    marginBottom: 20,
  },
  button: { backgroundColor: '#1f6feb', paddingVertical: 16, borderRadius: 10, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  resend: { marginTop: 18, alignItems: 'center' },
  resendText: { color: '#1f6feb', fontSize: 14, fontWeight: '600' },
});
