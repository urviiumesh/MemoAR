import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { useRouter } from 'expo-router';

// API URL for backend requests
const API_URL = 'http://172.20.201.67:5000';

// Icon Components
const CheckIcon = ({ width, height, color }) => (
  <Svg width={width} height={height} fill={color} viewBox="0 0 256 256">
    <Path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z" />
  </Svg>
);

const ClockIcon = ({ width, height, color }) => (
  <Svg width={width} height={height} fill={color} viewBox="0 0 256 256">
    <Path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z" />
  </Svg>
);

const CalendarIcon = ({ width, height, color }) => (
  <Svg width={width} height={height} fill={color} viewBox="0 0 256 256">
    <Path d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Z" />
  </Svg>
);

// Reminder Item Component
const ReminderItem = ({ item }) => {
  return (
    <View style={[styles.reminderItem, item.checked && styles.completedItem]}>
      <View style={styles.reminderLeftContent}>
        <View style={[styles.checkboxContainer, item.checked && styles.checkedContainer]}>
          {item.checked && <CheckIcon width={20} height={20} color="#FFFFFF" />}
        </View>
        <View style={styles.reminderTextContainer}>
          <Text style={[styles.reminderTitle, item.checked && styles.completedText]}>{item.title}</Text>
          <Text style={styles.reminderTime}>
            <ClockIcon width={12} height={12} color="#666" /> {item.time} • {item.date}
          </Text>
          {item.description && (
            <Text style={styles.reminderDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

// Main Caregiver Reminders Component
const CaregiverRemindersScreen = () => {
  const [reminders, setReminders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch reminders from API
  useEffect(() => {
    fetchReminders();
  }, []);

  // Function to fetch reminders from the backend
  const fetchReminders = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/get_reminder`);
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success' && data.data) {
        // Convert object of reminders to array with proper dates and sort
        const reminderArray = Object.entries(data.data).map(([id, reminder]) => {
          // Clean up date if it has extra quotes
          let reminderDate = reminder.date;
          if (typeof reminderDate === 'string') {
            reminderDate = reminderDate.trim().replace(/^["'](.*)["']$/, '$1');
          }
          
          // Ensure time is properly formatted
          let reminderTime = reminder.time;
          if (typeof reminderTime === 'string') {
            reminderTime = reminderTime.trim();
          }
          
          // Create a date object from the cleaned values
          let dateObj;
          try {
            dateObj = new Date(`${reminderDate}T${reminderTime}`);
            // If the date is invalid, try an alternative format
            if (isNaN(dateObj.getTime())) {
              // Try to extract the time portion from the time string (e.g., "08:00 AM" -> "08:00")
              const timeParts = reminderTime.split(' ');
              let hours = 0;
              let minutes = 0;
              
              if (timeParts.length > 0) {
                const [h, m] = timeParts[0].split(':');
                hours = parseInt(h, 10);
                minutes = parseInt(m, 10);
                
                // Handle AM/PM
                if (timeParts.length > 1 && timeParts[1].toUpperCase() === 'PM' && hours < 12) {
                  hours += 12;
                }
                if (timeParts.length > 1 && timeParts[1].toUpperCase() === 'AM' && hours === 12) {
                  hours = 0;
                }
              }
              
              dateObj = new Date(reminderDate);
              dateObj.setHours(hours, minutes);
            }
          } catch (e) {
            console.error('Error parsing date:', e);
            dateObj = new Date(); // Fallback to current date/time
          }
          
          const today = new Date();
          const tomorrow = new Date();
          tomorrow.setDate(today.getDate() + 1);
          
          // Format date string
          let dateString = 'Unknown';
          if (
            dateObj.getDate() === today.getDate() &&
            dateObj.getMonth() === today.getMonth() &&
            dateObj.getFullYear() === today.getFullYear()
          ) {
            dateString = 'Today';
          } else if (
            dateObj.getDate() === tomorrow.getDate() &&
            dateObj.getMonth() === tomorrow.getMonth() &&
            dateObj.getFullYear() === tomorrow.getFullYear()
          ) {
            dateString = 'Tomorrow';
          } else {
            dateString = dateObj.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            });
          }
          
          return {
            id,
            title: reminder.title || 'No Title',
            description: reminder.description || '',
            time: reminder.time,
            date: dateString,
            dateObj: dateObj,
            checked: false
          };
        }).sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
        
        setReminders(reminderArray);
      } else {
        console.log('No reminders found or API returned error');
        setReminders([]);
      }
    } catch (err) {
      console.error('Error fetching reminders:', err);
      setReminders([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Group reminders by date
  const groupedReminders = reminders.reduce((groups, reminder) => {
    const date = reminder.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(reminder);
    return groups;
  }, {});

  // Convert grouped reminders to array for rendering
  const reminderSections = Object.keys(groupedReminders).map(date => ({
    date,
    data: groupedReminders[date].sort((a, b) => {
      // Sort by time
      return new Date('1970/01/01 ' + a.time).getTime() - new Date('1970/01/01 ' + b.time).getTime();
    })
  })).sort((a, b) => {
    // Sort sections by date: Today, Tomorrow, then other dates
    if (a.date === 'Today') return -1;
    if (b.date === 'Today') return 1;
    if (a.date === 'Tomorrow') return -1;
    if (b.date === 'Tomorrow') return 1;
    
    // For other dates, sort chronologically
    const dateA = a.data[0].dateObj;
    const dateB = b.data[0].dateObj;
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <TouchableOpacity style={{margin:16, marginBottom:0, alignSelf:'flex-start', padding:8, backgroundColor:'#eee', borderRadius:8}} onPress={() => router.replace('/caregiverHome')}>
        <Text style={{fontSize:16}}>{'< Back'}</Text>
      </TouchableOpacity>
      <ScrollView style={styles.scrollView}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.loadingText}>Loading reminders...</Text>
          </View>
        ) : reminderSections.length > 0 ? (
          reminderSections.map((section, index) => (
            <View key={index} style={styles.sectionContainer}>
              <View style={styles.sectionHeaderContainer}>
                <Text style={styles.sectionTitle}>{section.date}</Text>
                <View style={styles.sectionDivider} />
              </View>
              {section.data.map(item => (
                <ReminderItem
                  key={item.id}
                  item={item}
                />
              ))}
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No reminders found</Text>
            <Text style={styles.emptySubtext}>Patient has not set any reminders yet</Text>
          </View>
        )}

        {/* Bottom padding */}
        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerIconContainer: {
    width: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    textAlign: 'center',
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#4A90E2',
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666666',
  },
  sectionContainer: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginRight: 12,
  },
  sectionDivider: {
    flex: 1,
    height: 1,
    backgroundColor: '#DDDDDD',
  },
  reminderItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  completedItem: {
    backgroundColor: '#F5F5F5',
    opacity: 0.8,
  },
  reminderLeftContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkedContainer: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  reminderTextContainer: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#888888',
  },
  reminderTime: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  reminderDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  bottomSpace: {
    height: 80,
  },
});

export default CaregiverRemindersScreen;