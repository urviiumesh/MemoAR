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
  ScrollView,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';

// Define our color palette (matching the app's theme)
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
  activeButton: '#000000',
  inactiveButton: '#CCCCCC',
  statusBar: 'dark-content',
  icon: '#000000',
  gradient: ['#f8f9fa', '#e9ecef'],
  success: '#28a745',
  error: '#dc3545',
};

const CaregiverInfoScreen = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    relation: '',
    age: '',
    interest: '',
  });
  const [imageUri, setImageUri] = useState(null);
  const [videoUri, setVideoUri] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form input changes
  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  // Pick an image from the device
  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'You need to grant camera roll permissions to upload an image.');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // Pick a video from the device
  const pickVideo = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'You need to grant camera roll permissions to upload a video.');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });
      
      if (!result.canceled) {
        setVideoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Error', 'Failed to pick video. Please try again.');
    }
  };

  // Submit the form data to the server
  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name || !formData.relation || !formData.age || !formData.interest || !imageUri) {
      Alert.alert('Missing Information', 'Please fill in all required fields and upload an image.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData object
      const data = new FormData();
      data.append('name', formData.name);
      data.append('relation', formData.relation);
      data.append('age', formData.age);
      data.append('interest', formData.interest);
      
      // Append image file
      const imageFileName = imageUri.split('/').pop();
      const imageType = 'image/' + (imageFileName.split('.').pop() === 'png' ? 'png' : 'jpeg');
      data.append('image', {
        uri: imageUri,
        name: imageFileName,
        type: imageType,
      });
      
      // Append video file if selected
      if (videoUri) {
        const videoFileName = videoUri.split('/').pop();
        const videoType = 'video/' + videoFileName.split('.').pop();
        data.append('video', {
          uri: videoUri,
          name: videoFileName,
          type: videoType,
        });
      }

      // Send data to the server
      const response = await fetch('http://172.20.201.67:5000/upload', {
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const responseData = await response.json();

      if (response.ok) {
        // Reset form fields after successful submission
        setFormData({
          name: '',
          relation: '',
          age: '',
          interest: '',
        });
        setImageUri(null);
        setVideoUri(null);
        
        Alert.alert(
          'Success', 
          'Profile created successfully!',
          [{ text: 'OK', onPress: () => router.replace('/(tabs)/caregiverHome') }]
        );
      } else {
        throw new Error(responseData.message || 'Failed to create profile');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      Alert.alert('Error', `Failed to create profile: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    gradientBackground: {
      flex: 1,
    },
    container: {
      flex: 1,
      padding: 20,
    },
    header: {
      marginBottom: 30,
      alignItems: 'center',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: COLORS.text,
      marginBottom: 10,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: COLORS.secondaryText,
      textAlign: 'center',
    },
    formContainer: {
      backgroundColor: COLORS.card,
      borderRadius: 15,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
      marginBottom: 20,
    },
    inputContainer: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: COLORS.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: COLORS.inputBackground,
      borderColor: COLORS.inputBorder,
      borderWidth: 1,
      borderRadius: 10,
      padding: 15,
      fontSize: 16,
      color: COLORS.text,
    },
    mediaSection: {
      marginBottom: 20,
    },
    mediaSectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: COLORS.text,
      marginBottom: 15,
    },
    mediaButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    mediaButton: {
      flex: 1,
      backgroundColor: COLORS.secondaryButton,
      borderRadius: 10,
      padding: 15,
      alignItems: 'center',
      marginHorizontal: 5,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    mediaButtonText: {
      color: COLORS.secondaryButtonText,
      fontWeight: '600',
      marginLeft: 8,
    },
    previewContainer: {
      marginTop: 15,
      alignItems: 'center',
    },
    imagePreview: {
      width: 150,
      height: 150,
      borderRadius: 10,
      marginTop: 10,
    },
    videoPreviewText: {
      marginTop: 10,
      color: COLORS.success,
      fontWeight: '600',
    },
    submitButton: {
      backgroundColor: COLORS.primaryButton,
      borderRadius: 10,
      padding: 18,
      alignItems: 'center',
      marginTop: 10,
    },
    submitButtonText: {
      color: COLORS.primaryButtonText,
      fontSize: 18,
      fontWeight: 'bold',
    },
    disabledButton: {
      backgroundColor: COLORS.inactiveButton,
    },
    requiredField: {
      color: COLORS.error,
      marginLeft: 5,
    },
  });

  return (
    <LinearGradient
      colors={COLORS.gradient}
      style={styles.gradientBackground}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle={COLORS.statusBar} backgroundColor={COLORS.gradient[0]} />
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Family Member Profile</Text>
            <Text style={styles.subtitle}>Add details about your loved one</Text>
          </View>

          <View style={styles.formContainer}>
            {/* Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Name<Text style={styles.requiredField}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter full name"
                value={formData.name}
                onChangeText={(text) => handleChange('name', text)}
              />
            </View>

            {/* Relation Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Relation<Text style={styles.requiredField}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="E.g., Father, Mother, Spouse"
                value={formData.relation}
                onChangeText={(text) => handleChange('relation', text)}
              />
            </View>

            {/* Age Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Age<Text style={styles.requiredField}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter age"
                value={formData.age}
                onChangeText={(text) => handleChange('age', text)}
                keyboardType="number-pad"
              />
            </View>

            {/* Interest Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Interest<Text style={styles.requiredField}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="E.g., Reading, Gardening, Music"
                value={formData.interest}
                onChangeText={(text) => handleChange('interest', text)}
              />
            </View>

            {/* Media Upload Section */}
            <View style={styles.mediaSection}>
              <Text style={styles.mediaSectionTitle}>Upload Media</Text>
              
              <View style={styles.mediaButtonsContainer}>
                <TouchableOpacity 
                  style={styles.mediaButton} 
                  onPress={pickImage}
                >
                  <Ionicons name="image-outline" size={24} color={COLORS.secondaryButtonText} />
                  <Text style={styles.mediaButtonText}>Image<Text style={styles.requiredField}>*</Text></Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.mediaButton} 
                  onPress={pickVideo}
                >
                  <Ionicons name="videocam-outline" size={24} color={COLORS.secondaryButtonText} />
                  <Text style={styles.mediaButtonText}>Video (Optional)</Text>
                </TouchableOpacity>
              </View>

              {/* Image Preview */}
              {imageUri && (
                <View style={styles.previewContainer}>
                  <Text>Image Preview:</Text>
                  <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                </View>
              )}

              {/* Video Preview */}
              {videoUri && (
                <View style={styles.previewContainer}>
                  <Text>Video Selected:</Text>
                  <Text style={styles.videoPreviewText}>
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.success} /> Video ready to upload
                  </Text>
                </View>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Creating Profile...' : 'Create New Profile'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default CaregiverInfoScreen;