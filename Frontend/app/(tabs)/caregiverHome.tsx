import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Animated,
  Platform,
  Alert
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { DeviceEventEmitter } from 'react-native';

// Color palettes (reuse from your theme)
const LIGHT_COLORS = {
  background: '#FFFFFF',
  text: '#000000',
  secondaryText: '#6B6B6B',
  card: '#FFFFFF',
  primaryButton: '#000000',
  primaryButtonText: '#FFFFFF',
  secondaryButton: '#EEEEEE',
  secondaryButtonText: '#000000',
  icon: '#000000',
  statusBar: 'dark-content',
};
const DARK_COLORS = {
  background: '#121212',
  text: '#FFFFFF',
  secondaryText: '#BBBBBB',
  card: '#1E1E1E',
  primaryButton: '#FFFFFF',
  primaryButtonText: '#000000',
  secondaryButton: '#333333',
  secondaryButtonText: '#FFFFFF',
  icon: '#FFFFFF',
  statusBar: 'light-content',
};

// Icons (reuse from your app)
const SunIcon = (props: { color: string }) => (
  <Svg width={24} height={24} fill={props.color} viewBox="0 0 256 256" {...props}>
    <Path d="M120,40V32a8,8,0,0,1,16,0v8a8,8,0,0,1-16,0Zm72,88a64,64,0,1,1-64-64A64.07,64.07,0,0,1,192,128Zm-16,0a48,48,0,1,0-48,48A48.05,48.05,0,0,0,176,128ZM58.34,69.66A8,8,0,0,0,69.66,58.34l-8-8A8,8,0,0,0,50.34,61.66Zm0,116.68-8,8a8,8,0,0,0,11.32,11.32l8-8a8,8,0,0,0-11.32-11.32ZM192,72a8,8,0,0,0,5.66-2.34l8-8a8,8,0,0,0-11.32-11.32l-8,8A8,8,0,0,0,192,72Zm5.66,114.34a8,8,0,0,0-11.32,11.32l8,8a8,8,0,0,0,11.32-11.32ZM40,120H32a8,8,0,0,0,0,16h8a8,8,0,0,0,0-16Zm88,88a8,8,0,0,0-8,8v8a8,8,0,0,0,16,0v-8A8,8,0,0,0,128,208Zm96-88h-8a8,8,0,0,0,0,16h8a8,8,0,0,0,0-16Z" />
  </Svg>
);
const MoonIcon = (props: { color: string }) => (
  <Svg width={24} height={24} fill={props.color} viewBox="0 0 256 256" {...props}>
    <Path d="M233.54,142.23a8,8,0,0,0-8-2,88.08,88.08,0,0,1-109.8-109.8,8,8,0,0,0-10-10,104.84,104.84,0,0,0-52.91,37A104,104,0,0,0,136,224a103.09,103.09,0,0,0,62.52-20.88,104.84,104.84,0,0,0,37-52.91A8,8,0,0,0,233.54,142.23ZM188.9,190.34A88,88,0,0,1,65.66,67.11a89,89,0,0,1,31.4-26A106,106,0,0,0,96,56,104.11,104.11,0,0,0,200,160a106,106,0,0,0,14.92-1.06A89,89,0,0,1,188.9,190.34Z" />
  </Svg>
);

const CaregiverHome = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [colors, setColors] = useState(LIGHT_COLORS);
  const [fadeAnim] = useState(new Animated.Value(1));
  const router = useRouter();

  useEffect(() => {
    setColors(isDarkMode ? DARK_COLORS : LIGHT_COLORS);
  }, [isDarkMode]);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('PatientLeftZone', (message) => {
      Alert.alert('Alert', message);
    });
    return () => subscription.remove();
  }, []);

  const toggleTheme = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsDarkMode(!isDarkMode);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  // Example patient data
  const patient = {
    name: "John Doe",
    age: 72,
    gender: "Male",
    diagnosis: "Early-stage Dementia",
    medications: [
      { name: "Donepezil", time: "08:00 AM" },
      { name: "Memantine", time: "08:00 PM" }
    ],
    reminders: [
      { id: 1, title: "Doctor's Appointment", time: "10:00 AM" },
      { id: 2, title: "Take Blood Pressure", time: "02:00 PM" }
    ],
    emergencyContact: {
      name: "Jane Doe",
      relation: "Daughter",
      phone: "+91 9876543210"
    },
    lastCheckin: "Today, 09:30 AM"
  };

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: colors.background,
    },
    portalHeader: {
      backgroundColor: "#FFFFFF",
      paddingVertical: 16,
      paddingHorizontal: 20,
      marginBottom: 20,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
      alignItems: 'center',
    },
    portalHeaderText: {
      fontSize: 24,
      fontWeight: 'bold',
      color:'#000000',
      textAlign: 'center',
      letterSpacing: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 18,
      marginBottom: 18,
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
      borderWidth: 1,
      borderColor: isDarkMode ? '#333' : '#EEE',
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 6,
    },
    cardContent: {
      color: colors.secondaryText,
      fontSize: 16,
      marginBottom: 4,
    },
    sectionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    button: {
      backgroundColor: colors.primaryButton,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 10,
    },
    buttonText: {
      color: colors.primaryButtonText,
      fontWeight: 'bold',
      fontSize: 16,
    },
    themeToggleButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: isDarkMode ? '#FFF' : '#000',
    },
    medicationRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    reminderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    emergencyText: {
      color: '#ED6665',
      fontWeight: 'bold',
    }
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>        
        {/* Header */}
        <View style={styles.portalHeader}>
          <Text style={styles.portalHeaderText}>Care Giver Portal</Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Patient Profile Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Patient Profile</Text>
            <Text style={styles.cardContent}>Name: {patient.name}</Text>
            <Text style={styles.cardContent}>Age: {patient.age}</Text>
            <Text style={styles.cardContent}>Gender: {patient.gender}</Text>
            <Text style={styles.cardContent}>Diagnosis: {patient.diagnosis}</Text>
            <Text style={styles.cardContent}>Last Check-in: {patient.lastCheckin}</Text>
          </View>
          {/* Reminders Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Reminders</Text>
            {patient.reminders.map((rem) => (
              <View style={styles.reminderRow} key={rem.id}>
                <Text style={styles.cardContent}>{rem.title}</Text>
                <Text style={styles.cardContent}>{rem.time}</Text>
                <TouchableOpacity onPress={() => Alert.alert('Reminder', `Completed: ${rem.title}`)}>
                  <Text style={{ color: colors.primaryButton }}>✔</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.button} onPress={() => router.push('/caregiverReminders')}>
              <Text style={styles.buttonText}>View All Reminders</Text>
            </TouchableOpacity>
          </View>
          {/* Danger Zone Card */}
          <View style={styles.card}>
            <Text style= {styles.cardTitle}>Danger Zone Assignment</Text>
            <TouchableOpacity style={styles.button} onPress={() => router.push('/zone')}>
              <Text style={styles.buttonText}>Assign Danger Zone</Text>
            </TouchableOpacity>
          </View>

          {/* Add Caregiver Profile */}
          <View style={styles.card}>
            <Text style= {styles.cardTitle}>Configure Your Profile</Text>
            <TouchableOpacity style={styles.button} onPress={() => router.push('/caregiverInfo')}>
              <Text style={styles.buttonText}>Add Profile</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

export default CaregiverHome;