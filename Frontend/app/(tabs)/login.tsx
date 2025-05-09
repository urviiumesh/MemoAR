import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

// Define our color palette
const COLORS = {
  background: '#FFFFFF',
  text: '#000000',
  secondaryText: '#6B6B6B',
  card: '#FFFFFF',
  primaryButton: '#000000',
  primaryButtonText: '#FFFFFF',
  secondaryButton: '#EEEEEE',
  secondaryButtonText: '#000000',
  inputBackground: '#F8F8F8',
  inputBorder: '#E0E0E0',
  activeButton: '#000000', // Example active color
  inactiveButton: '#CCCCCC',
  statusBar: 'dark-content',
  icon: '#000000',
  gradient: ['#f8f9fa', '#e9ecef'],
};

const LoginPage = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'caregiver' | 'patient'>('caregiver'); // Default role

  const handleLogin = () => {
    if (!name.trim() || !password.trim()) {
      Alert.alert('Error', 'Name and password cannot be empty.');
      return;
    }
    // Basic login logic (replace with actual authentication)
    console.log('Login attempt:', { name, password, role });
    Alert.alert('Login Success', `Logged in as ${name} (${role})`);
    // Navigate to the correct home screen based on role
    if (role === 'caregiver') {
      router.replace('/(tabs)/caregiverHome');
    } else {
      router.replace('/(tabs)');
    }
  };

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 30,
      backgroundColor: 'transparent',
    },
    contentBox: {
      width: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: 20,
      borderColor: '#FFFFFF',
      borderWidth: 1,
      padding: 25,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 40,
    },
    logo: {
      width: 100,
      height: 100,
      marginBottom: 15,
      borderRadius: 20,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: COLORS.text,
      marginBottom: 10,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    },
    subtitle: {
      fontSize: 16,
      color: COLORS.secondaryText,
      marginBottom: 30,
      textAlign: 'center',
    },
    inputContainer: {
      width: '100%',
      marginBottom: 25,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: COLORS.secondaryText,
      marginBottom: 8,
      marginLeft: 4,
    },
    input: {
      width: '100%',
      height: 55,
      backgroundColor: COLORS.inputBackground,
      borderColor: COLORS.inputBorder,
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 15,
      fontSize: 16,
      color: COLORS.text,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    roleSelectorContainer: {
      flexDirection: 'row',
      marginBottom: 30,
      width: '100%',
      justifyContent: 'space-between',
    },
    roleButton: {
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 12,
      borderWidth: 1,
      width: '48%',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    roleButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    loginButton: {
      width: '100%',
      height: 55,
      backgroundColor: COLORS.primaryButton,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 12,
      marginTop: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    loginButtonText: {
      color: COLORS.primaryButtonText,
      fontSize: 18,
      fontWeight: 'bold',
    },
    gradientBackground: {
      flex: 1,
    },
  });

  return (
    <LinearGradient
      colors={COLORS.gradient}
      style={styles.gradientBackground}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar 
          barStyle={COLORS.statusBar}
          backgroundColor={COLORS.gradient[0]} 
        />
        <View style={styles.container}>
          <View style={styles.contentBox}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../assets/images/robot.png')} 
                style={styles.logo} 
                resizeMode="contain"
              />
              <Text style={styles.title}>MemoAR</Text>
              <Text style={styles.subtitle}>Your memory assistant</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor={COLORS.secondaryText}
                value={name}
                onChangeText={setName}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={COLORS.secondaryText}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.roleSelectorContainer}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  { 
                    backgroundColor: role === 'caregiver' ? COLORS.activeButton : COLORS.secondaryButton,
                    borderColor: role === 'caregiver' ? COLORS.activeButton : COLORS.inputBorder,
                  }
                ]}
                onPress={() => setRole('caregiver')}
              >
                <Text style={[{ color: role === 'caregiver' ? COLORS.primaryButtonText : COLORS.secondaryButtonText }, styles.roleButtonText]}>
                  CareGiver/Family
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleButton,
                  { 
                    backgroundColor: role === 'patient' ? COLORS.activeButton : COLORS.secondaryButton,
                    borderColor: role === 'patient' ? COLORS.activeButton : COLORS.inputBorder,
                  }
                ]}
                onPress={() => setRole('patient')}
              >
                <Text style={[{ color: role === 'patient' ? COLORS.primaryButtonText : COLORS.secondaryButtonText }, styles.roleButtonText]}>
                  Patient
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default LoginPage;