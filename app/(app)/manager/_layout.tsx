// app/(app)/manager/_layout.tsx

import { COLORS } from '@/constants/colors';
import { Tabs } from 'expo-router';
import { Building2, Home, MessageCircle, User } from 'lucide-react-native';
import React from 'react';

export default function ManagerTabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // ⛔️ REMOVE tabBarHideOnKeyboard from here
        tabBarStyle: {
          backgroundColor: COLORS.bgSecondary,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 65,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      {/* Dashboard / Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarHideOnKeyboard: true, // ✅ apply per-tab if you still want it
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} />
          ),
        }}
      />

      {/* Hostels tab */}
      <Tabs.Screen
        name="hostels"
        options={{
          title: 'Hostels',
          tabBarHideOnKeyboard: true,
          tabBarIcon: ({ color, size }) => (
            <Building2 size={size} color={color} />
          ),
        }}
      />

      {/* Chat tab */}
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarHideOnKeyboard: true,
          tabBarIcon: ({ color, size }) => (
            <MessageCircle size={size} color={color} />
          ),
        }}
      />

      {/* Profile tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarHideOnKeyboard: true,
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} />
          ),
        }}
      />

      {/* Hidden stack-style screens (no tab item) */}
      <Tabs.Screen
        name="hostel/[id]"
        options={{ href: null, tabBarHideOnKeyboard: false }}
      />
      <Tabs.Screen
        name="hostel/create"
        options={{ href: null, tabBarHideOnKeyboard: false }}
      />
      <Tabs.Screen
        name="hostel/edit/[id]"
        options={{ href: null, tabBarHideOnKeyboard: false }}
      />
      <Tabs.Screen
        name="students/[hostelId]"
        options={{ href: null, tabBarHideOnKeyboard: false }}
      />
      <Tabs.Screen
        name="reservations"
        options={{ href: null, tabBarHideOnKeyboard: false }}
      />
      <Tabs.Screen
        name="bookings"
        options={{ href: null, tabBarHideOnKeyboard: false }}
      />
      <Tabs.Screen
        name="verification"
        options={{ href: null, tabBarHideOnKeyboard: false }} // 👈 important
      />
      <Tabs.Screen
        name="conversation/[id]"
        options={{ href: null, tabBarHideOnKeyboard: false }}
      />
    </Tabs>
  );
}