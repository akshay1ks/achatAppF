import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import OtpScreen from '../screens/OtpScreen';
import ConversationsScreen from '../screens/ConversationsScreen';
import NewChatScreen from '../screens/NewChatScreen';
import ChatScreen from '../screens/ChatScreen';

export type RootStackParamList = {
  Login: undefined;
  Otp: { phone: string };
  Conversations: undefined;
  NewChat: undefined;
  Chat: { conversationId: string; title: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!session ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ title: 'Sign in' }}
            />
            <Stack.Screen
              name="Otp"
              component={OtpScreen}
              options={{ title: 'Verify OTP' }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Conversations"
              component={ConversationsScreen}
              options={{ title: 'Chats' }}
            />
            <Stack.Screen
              name="NewChat"
              component={NewChatScreen}
              options={{ title: 'New chat' }}
            />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={({ route }) => ({ title: route.params.title })}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
