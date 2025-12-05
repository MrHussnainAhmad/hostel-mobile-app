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
        tabBarHideOnKeyboard: true,
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
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} />
          ),
        }}
      />

      {/* Hidden stack-style screens (no tab item) */}
      <Tabs.Screen name="hostel/[id]" options={{ href: null }} />
      <Tabs.Screen name="hostel/create" options={{ href: null }} />
      <Tabs.Screen name="hostel/edit/[id]" options={{ href: null }} />
      <Tabs.Screen name="students/[hostelId]" options={{ href: null }} />
      <Tabs.Screen name="reservations" options={{ href: null }} />
      <Tabs.Screen name="bookings" options={{ href: null }} />
      <Tabs.Screen name="verification" options={{ href: null }} />
      <Tabs.Screen name="conversation/[id]" options={{ href: null }} />
    </Tabs>
  );
}