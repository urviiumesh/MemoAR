import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  SafeAreaView,
  StatusBar,
  Image,
  FlatList,
  ScrollView, // Added ScrollView
  Alert, // Added Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ConfettiCannon from 'react-native-confetti-cannon'; // Import ConfettiCannon
import Svg, { Circle } from 'react-native-svg'; // Import Svg components

// Get screen dimensions
const { width, height } = Dimensions.get('window');

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
  taskComplete: '#d4edda',
  taskIncomplete: '#f8f9fa',
  taskBorder: '#e0e0e0',
  taskHighlight: '#007bff',
  cardGradient1: ['#4facfe', '#00f2fe'],
  cardGradient2: ['#667eea', '#764ba2'],
  cardShadow: 'rgba(0, 0, 0, 0.1)',
  stepComplete: '#d4edda',
  stepIncomplete: '#ffffff',
};

// Morning routine activities with detailed steps
const routineActivities = [
  {
    id: 1,
    title: 'Brush Your Teeth',
    description: 'Keep your teeth healthy and fresh',
    icon: 'water-outline',
    color: '#BBDEFB',
    gradient: ['#4facfe', '#00f2fe'],
    duration: 120, // Duration in seconds (2 minutes)
    steps: [
      { id: 1, instruction: 'Go to the washroom', icon: 'walk-outline' },
      { id: 2, instruction: 'Take your toothbrush', icon: 'hand-left-outline' },
      { id: 3, instruction: 'Apply toothpaste on the brush', icon: 'color-fill-outline' },
      { id: 4, instruction: 'Brush your teeth gently in circular motions', icon: 'repeat-outline' },
      { id: 5, instruction: 'Rinse your mouth with water', icon: 'water-outline' },
    ],
    tips: 'Brush for at least 2 minutes, covering all surfaces of your teeth.',
    imageUrl: 'https://images.unsplash.com/photo-1588454784129-a1c2e9e57f48?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
  },
  {
    id: 2,
    title: 'Wash Your Face',
    description: 'Refresh yourself and wake up fully',
    icon: 'water-outline',
    color: '#C8E6C9',
    gradient: ['#667eea', '#764ba2'],
    duration: 60, // Duration in seconds (1 minute)
    steps: [
      { id: 1, instruction: 'Stand in front of the sink', icon: 'body-outline' },
      { id: 2, instruction: 'Wet your face with warm water', icon: 'water-outline' },
      { id: 3, instruction: 'Apply face wash or soap', icon: 'hand-right-outline' },
      { id: 4, instruction: 'Gently massage in circular motions', icon: 'sync-outline' },
      { id: 5, instruction: 'Rinse thoroughly with water', icon: 'water-outline' },
      { id: 6, instruction: 'Pat dry with a clean towel', icon: 'checkmark-done-outline' },
    ],
    tips: 'Use lukewarm water, not hot, to avoid drying out your skin.',
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
  },
];

const RoutineScreen = () => {
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState({});
  const [remainingTime, setRemainingTime] = useState({});
  const [isTimerActive, setIsTimerActive] = useState({});
  const [showConfetti, setShowConfetti] = useState(false); // State for confetti
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const intervalRefs = useRef({}); // To store interval IDs

  useEffect(() => {
    // Clear intervals when component unmounts or currentActivityIndex changes
    return () => {
      Object.values(intervalRefs.current).forEach(clearInterval);
    };
  }, []);

  useEffect(() => {
    const currentActivity = routineActivities[currentActivityIndex];
    if (currentActivity && currentActivity.duration) {
      // Set initial time when activity becomes current, but don't start timer yet
      setRemainingTime(prev => ({ ...prev, [currentActivity.id]: currentActivity.duration }));
      setIsTimerActive(prev => ({ ...prev, [currentActivity.id]: false })); // Mark timer as not active
    }
    // When activity changes, clear previous interval if it exists
    // and stop its timer if it was active for a different card
    Object.keys(intervalRefs.current).forEach(activityId => {
      const numericActivityId = parseInt(activityId);
      if (numericActivityId !== currentActivity.id) {
        clearInterval(intervalRefs.current[numericActivityId]);
        delete intervalRefs.current[numericActivityId];
        // Optionally reset its active state if needed, though current logic focuses on new card
        // setIsTimerActive(prev => ({ ...prev, [numericActivityId]: false })); 
      }
    });

  }, [currentActivityIndex]);

  const handleStartTimer = (activityId, duration) => {
    if (isTimerActive[activityId]) return; // Don't restart if already active

    setIsTimerActive(prev => ({ ...prev, [activityId]: true }));
    startTimer(activityId, remainingTime[activityId] || duration); // Start with current remaining or full duration
  };

  const startTimer = (activityId, duration) => {
    // Clear existing interval for this activity if it exists
    if (intervalRefs.current[activityId]) {
      clearInterval(intervalRefs.current[activityId]);
    }

    setRemainingTime(prev => ({ ...prev, [activityId]: duration }));

    intervalRefs.current[activityId] = setInterval(() => {
      setRemainingTime(prev => {
        const newTime = (prev[activityId] || 0) - 1;
        if (newTime <= 0) {
          clearInterval(intervalRefs.current[activityId]);
          delete intervalRefs.current[activityId];
          Alert.alert("Time's up!", `${routineActivities.find(a=>a.id === activityId)?.title} duration has ended.`);
          // Check if all steps are completed when timer ends
          const activity = routineActivities.find(act => act.id === activityId);
          if (activity) {
            const activityKey = `activity_${activityId}`;
            const completedCount = (completedSteps[activityKey] || []).length;
            if (completedCount === activity.steps.length) {
              setShowConfetti(true); // Show confetti if all steps completed when timer ends
            }
          }
          return { ...prev, [activityId]: 0 };
        }
        return { ...prev, [activityId]: newTime };
      });
    }, 1000);
  };

  // Toggle step completion
  const toggleStepCompletion = (activityId, stepId) => {
    setCompletedSteps(prev => {
      const activityKey = `activity_${activityId}`;
      const currentActivitySteps = prev[activityKey] || [];
      
      if (currentActivitySteps.includes(stepId)) {
        return {
          ...prev,
          [activityKey]: currentActivitySteps.filter(id => id !== stepId)
        };
      } else {
        return {
          ...prev,
          [activityKey]: [...currentActivitySteps, stepId]
        };
      }
    });

    // Check if all steps are completed after toggling
    const activity = routineActivities.find(act => act.id === activityId);
    if (activity) {
      const activityKey = `activity_${activityId}`;
      // Need to calculate based on the 'next' state of completedSteps
      const currentActivitySteps = completedSteps[activityKey] || [];
      let newCompletedCount;
      if (currentActivitySteps.includes(stepId)) { // Step was just un-completed
        newCompletedCount = currentActivitySteps.filter(id => id !== stepId).length;
      } else { // Step was just completed
        newCompletedCount = [...currentActivitySteps, stepId].length;
      }

      if (newCompletedCount === activity.steps.length) {
        setShowConfetti(true); // Show confetti if all steps are now completed
      }
    }
  };

  // Check if a step is completed
  const isStepCompleted = (activityId, stepId) => {
    const activityKey = `activity_${activityId}`;
    return (completedSteps[activityKey] || []).includes(stepId);
  };

  // Calculate progress for an activity
  const calculateProgress = (activityId) => {
    const activity = routineActivities.find(act => act.id === activityId);
    if (!activity) return 0;
    
    const activityKey = `activity_${activityId}`;
    const completedCount = (completedSteps[activityKey] || []).length;
    return completedCount / activity.steps.length;
  };

  // Navigate to next activity
  const goToNextActivity = () => {
    if (currentActivityIndex < routineActivities.length - 1) {
      setCurrentActivityIndex(currentActivityIndex + 1);
      flatListRef.current?.scrollToIndex({ index: currentActivityIndex + 1, animated: true });
    }
  };

  // Navigate to previous activity
  const goToPrevActivity = () => {
    if (currentActivityIndex > 0) {
      setCurrentActivityIndex(currentActivityIndex - 1);
      flatListRef.current?.scrollToIndex({ index: currentActivityIndex - 1, animated: true });
    }
  };

  // Reset all completed steps
  const resetAllSteps = () => {
    setCompletedSteps({});
  };

  // Render a single activity card
  const renderActivityCard = ({ item, index }) => {
    const progress = calculateProgress(item.id);
    const allStepsCompleted = progress === 1;
    const timeForActivity = remainingTime[item.id] !== undefined ? remainingTime[item.id] : item.duration;
    const minutes = Math.floor(timeForActivity / 60);
    const seconds = timeForActivity % 60;
    const timerHasStarted = isTimerActive[item.id];

    return (
      <View style={styles.cardContainer}>
        <LinearGradient
          colors={item.gradient}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContentContainer}> {/* Added ScrollView here */}
            <View style={styles.cardHeader}>
              <View style={styles.cardIconContainer}>
                <Ionicons name={item.icon} size={36} color="#FFFFFF" />
              </View>
              <View style={styles.cardTitleContainer}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDescription}>{item.description}</Text>
                {/* Timer display and Start Button */}
                <View style={styles.timerControlsContainer}>
                  <Text style={styles.timerText}>
                    Time: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                  </Text>
                  {!timerHasStarted && remainingTime[item.id] > 0 && (
                    <TouchableOpacity 
                      style={styles.startButton} 
                      onPress={() => handleStartTimer(item.id, item.duration)}
                    >
                      <Ionicons name="play-circle-outline" size={24} color="#FFFFFF" />
                      <Text style={styles.startButtonText}>Start Timer</Text>
                    </TouchableOpacity>
                  )}
                  {timerHasStarted && remainingTime[item.id] === 0 && (
                     <Text style={styles.timerEndedText}>Time's Up!</Text>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.cardContent}>
              <View style={styles.stepsContainer}>
                {item.steps.map((step) => {
                  const isCompleted = isStepCompleted(item.id, step.id);
                  return (
                    <TouchableOpacity
                      key={step.id}
                      style={[styles.stepItem, { backgroundColor: isCompleted ? COLORS.stepComplete : COLORS.stepIncomplete }]}
                      onPress={() => toggleStepCompletion(item.id, step.id)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.stepIconContainer}>
                        <Ionicons name={step.icon} size={24} color={isCompleted ? COLORS.success : COLORS.text} />
                      </View>
                      <Text style={styles.stepText}>{step.instruction}</Text>
                      {isCompleted && (
                        <Ionicons name="checkmark-circle" size={24} color={COLORS.success} style={styles.stepCompletedIcon} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.tipContainer}>
                <Text style={styles.tipTitle}>Tip:</Text>
                <Text style={styles.tipText}>{item.tips}</Text>
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                </View>
                <Text style={styles.progressText}>
                  {`${Math.round(progress * 100)}% Complete`}
                </Text>
              </View>
            </View>

            {allStepsCompleted && (
              <View style={styles.completionBadge}>
                <Ionicons name="trophy-outline" size={24} color="#FFFFFF" />
                <Text style={styles.completionText}>Activity Completed!</Text>
              </View>
            )}
          </ScrollView> {/* Closed ScrollView here */}
          {showConfetti && currentActivityIndex === index && (
            <ConfettiCannon count={200} origin={{x: -10, y: 0}} fallSpeed={3000} explosionSpeed={400} />
          )}
        </LinearGradient>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={COLORS.statusBar} backgroundColor={COLORS.background} />
      
      <FlatList
        ref={flatListRef}
        data={routineActivities}
        renderItem={renderActivityCard}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentActivityIndex(newIndex);
        }}
        scrollEventThrottle={16}
      />

      <View style={styles.paginationContainer}>
        {routineActivities.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [10, 20, 10],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[styles.paginationDot, { width: dotWidth, opacity }]}
            />
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.secondaryText,
  },
  cardContainer: {
    width: width,
    height: height * 0.9, // Increased from 0.75 to 0.9 to use most of the screen height
    paddingHorizontal: 20,
  },
  cardGradient: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  scrollContentContainer: { // Added style for ScrollView content
    flexGrow: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  timerControlsContainer: { // New style for timer and button
    marginTop: 10,
    alignItems: 'center', // Center items like button and timer text
  },
  timerDisplay: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  timerTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerTextLarge: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  timerTextSmall: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: -2,
  },
  timerText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  cardContent: {
    flex: 1,
    padding: 20,
  },
  stepsContainer: {
    flex: 1,
    marginBottom: 15,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.stepIncomplete,
    borderRadius: 12,
    marginBottom: 10,
    padding: 15,
    elevation: 2,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  stepIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  stepCompletedIcon: {
    marginLeft: 10,
  },
  tipContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  tipText: {
    fontSize: 14,
    color: COLORS.secondaryText,
    lineHeight: 20,
  },
  progressContainer: {
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'right',
  },
  startButton: { // Style for the new start button
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.3)', // Semi-transparent black
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: { // Style for the start button text
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  timerEndedText: { // Style for "Time's Up!" text
    fontSize: 16,
    color: COLORS.error, // Use error color for emphasis
    fontWeight: 'bold',
    marginTop: 10,
  },
  completionBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: COLORS.success,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  completionText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  paginationDot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.text,
    marginHorizontal: 5,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginHorizontal: 5,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledButtonText: {
    color: COLORS.inactiveButton,
  },
  resetButton: {
    backgroundColor: COLORS.secondaryButton,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  resetButtonText: {
    color: COLORS.secondaryButtonText,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RoutineScreen;