import React from 'react';
import { Tabs, usePathname } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
}) {
  return <Ionicons size={32} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const { colors } = useTheme();
  const pathname = usePathname();
  
  // Check if we're in the caregiver portal
  const isCaregiverPortal = pathname.includes('caregiverHome');

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          display: route.name === 'login' ? 'none' : 'flex',
        },
        // Hide tabs based on whether we're in caregiver portal or not
        tabBarItemStyle: {
          display: (() => {
            if (route.name === 'login') return 'none';

            if (isCaregiverPortal) {
              const caregiverTabs = ['caregiverHome', 'caregiverReminders', 'zone', 'people'];
              return caregiverTabs.includes(route.name) ? 'flex' : 'none';
            } else {
              // For patients, 'zone' should map to 'viewzone.tsx'
              // The actual screen name in Tabs.Screen will be 'viewzone'
              const patientTabs = ['index', 'reminders', 'viewzone', 'help', 'people'];
              return patientTabs.includes(route.name) ? 'flex' : 'none';
            }
          })()
        }
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
{isCaregiverPortal ? (
        <Tabs.Screen
          name="caregiverReminders" // This will map to caregiverReminders.tsx
          options={{
            headerShown: false,
            title: 'Reminder Check', // Title for the tab
            tabBarIcon: ({ color, size }) => (<Ionicons name="notifications-outline" size={size} color={color} />),
          }}
        />
      ) : (
        <Tabs.Screen
          name="reminders" // This will map to reminders.tsx
          options={{
            headerShown: false,
            title: 'Reminders', // Title for the tab
            tabBarIcon: ({ color, size }) => (<Ionicons name="notifications-outline" size={size} color={color} />),
          }}
        />
      )}
      <Tabs.Screen
        name="zone" // This refers to the file zone.tsx
        options={{
          headerShown: false,
          title: 'Zone Tab', // This title will be used if 'zone' is in caregiverTabs
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="viewzone" // This refers to the file viewzone.tsx
        options={{
          headerShown: false,
          title: 'Zone', // This title will be used if 'viewzone' is in patientTabs
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          headerShown: false, // Hide header for Help
          title: 'Help',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="help-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="people"
        options={{
          headerShown: false,
          title: isCaregiverPortal ? 'Profile' : 'People',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={isCaregiverPortal ? "person-outline" : "people-outline"} size={size} color={color} />
          ),
        }}
      />
      {/* Memory games - hidden from tab bar */}
      <Tabs.Screen
        name="addReminder"
        options={{
          headerShown: false,
          tabBarItemStyle: { display: 'none' },
        }}
      />

      <Tabs.Screen
        name="memorygame1"
        options={{
          headerShown: false,
          tabBarItemStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="login"
        options={{
          headerShown: false,
          tabBarItemStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          headerShown: false,
          tabBarItemStyle: { display: 'none' },
        }}
      />
      
      <Tabs.Screen
        name="caregiverHome"
        options={{
          headerShown: false,
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}