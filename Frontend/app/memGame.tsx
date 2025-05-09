import React from 'react';
import { Stack } from 'expo-router';
import MemoryGame from './(tabs)/memGame';

export default function MemGameScreen() {
  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      <MemoryGame />
    </>
  );
} 