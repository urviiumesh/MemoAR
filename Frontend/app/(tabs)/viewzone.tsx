import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, SafeAreaView, Text, ActivityIndicator, Alert } from 'react-native';
import MapView, { Polygon, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { DeviceEventEmitter } from 'react-native';

interface CoordinateRange {
  min_latitude: number;
  max_latitude: number;
  min_longitude: number;
  max_longitude: number;
}

interface Zone {
  id: string;
  coordinate_range: CoordinateRange;
  coordinates?: Array<{ latitude: number; longitude: number }>;
}

const patientId = 'patient-456';
const caregiverId = 'caregiver-123';

export default function ViewZoneScreen() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState<Region | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [isOutOfZone, setIsOutOfZone] = useState(false);

  const fetchZones = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://172.20.201.67:5000/get_coordinate?caregiver_id=${caregiverId}&patient_id=${patientId}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch zones: ${response.status} ${response.statusText}. ${errorText}`);
      }
      const data = await response.json();

      if (data.status === 'success' && data.zone) {
        const zoneData = data.zone;
        setZones([{ ...zoneData }]);
        
        const firstZone = zoneData.coordinate_range;
        setRegion({
          latitude: (firstZone.min_latitude + firstZone.max_latitude) / 2,
          longitude: (firstZone.min_longitude + firstZone.max_longitude) / 2,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05
        });
      } else {
        setZones([]);
      }
    } catch (error) {
      Alert.alert('Error Fetching Zones', (error as Error).message);
      setZones([]);
    } finally {
      setLoading(false);
    }
  };

  const getPolygonCoordinates = (zone: Zone) => {
    if (zone.coordinates && zone.coordinates.length > 2) {
      return zone.coordinates;
    }
    const range = zone.coordinate_range;
    return [
      { latitude: range.min_latitude, longitude: range.min_longitude },
      { latitude: range.min_latitude, longitude: range.max_longitude },
      { latitude: range.max_latitude, longitude: range.max_longitude },
      { latitude: range.max_latitude, longitude: range.min_longitude }
    ];
  };

  useEffect(() => {
    fetchZones();
  }, []);

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;
    let isMounted = true;

    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        return;
      }
      console.log('Start tracking');
      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10,
        },
        (position) => {
          if (!isMounted) return;
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
          console.log(`Current user location: latitude=${latitude}, longitude=${longitude}`);

          // Check if location is within any zone
          const inZone = zones.some(zone => {
            const polygon = getPolygonCoordinates(zone);
            let inside = false;
            for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
              const xi = polygon[i].latitude, yi = polygon[i].longitude;
              const xj = polygon[j].latitude, yj = polygon[j].longitude;
              const intersect = ((yi > longitude) !== (yj > longitude)) &&
                (latitude < (xj - xi) * (longitude - yi) / (yj - yi) + xi);
              if (intersect) inside = !inside;
            }
            return inside;
          });

          if (!inZone && !isOutOfZone) {
            setIsOutOfZone(true);
            Alert.alert('Alert', 'You have left safe the zone! Please return to the safe area.');
            DeviceEventEmitter.emit('PatientLeftZone', 'You have left safe the zone! Please return to the safe area.');
            
            // Call DangerZone API
            fetch('http://172.20.201.67:5000/DangerZone', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                patient_id: patientId,
                caregiver_id: caregiverId,
                location: currentLocation
              })
            }).catch(error => console.error('Error calling DangerZone:', error));
          } else if (inZone && isOutOfZone) {
            setIsOutOfZone(false);
          }
        }
      );
    };

    startTracking();
    return () => {
      isMounted = false;
      locationSubscription?.remove();
    };
  }, [zones, isOutOfZone]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>View Assigned Zones</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#4A90E2" style={{marginTop: 40}} />
      ) : (
        <View style={styles.mapContainer}>
          {region && (
            <MapView
              style={styles.map}
              initialRegion={region}
              region={currentLocation ? {
                ...currentLocation,
                latitudeDelta: 0.08,
                longitudeDelta: 0.08
              } : region}
              scrollEnabled={true}
              zoomEnabled={true}
              pitchEnabled={false}
              rotateEnabled={true}
              showsUserLocation={true}
            >
              {zones.map(zone => (
                <Polygon
                  key={zone.id}
                  coordinates={getPolygonCoordinates(zone)}
                  fillColor="rgba(0, 0, 255, 0.2)"
                  strokeColor="blue"
                  strokeWidth={2}
                />
              ))}
            </MapView>
          )}
          {!loading && zones.length === 0 && !region && (
            <View style={styles.noZonesContainer}>
              <Text style={styles.noZonesText}>No zones are currently assigned for this patient.</Text>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    textAlign: 'center',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    height: Dimensions.get('window').height * 0.8,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  noZonesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noZonesText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
});