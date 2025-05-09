import React, { useState, useEffect } from 'react';
import {
  View,
  Button,
  Alert,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Text,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import MapView, {
  Marker,
  Polygon,
  MapPressEvent,
  Region,
  LatLng,
} from 'react-native-maps';
import * as Location from 'expo-location';

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface Zone {
  id: string;
  points: Coordinate[];
}

const doLinesIntersect = (a1: Coordinate, a2: Coordinate, b1: Coordinate, b2: Coordinate) => {
  const det = (a2.longitude - a1.longitude) * (b2.latitude - b1.latitude) -
               (b2.longitude - b1.longitude) * (a2.latitude - a1.latitude);
  if (det === 0) return false;

  const lambda = ((b2.latitude - b1.latitude) * (b2.longitude - a1.longitude) +
                  (b1.longitude - b2.longitude) * (b2.latitude - a1.latitude)) / det;
  const gamma = ((a1.latitude - a2.latitude) * (b2.longitude - a1.longitude) +
                 (a2.longitude - a1.longitude) * (b2.latitude - a1.latitude)) / det;

  return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
};

const doesPolygonIntersect = (points1: Coordinate[], points2: Coordinate[]) => {
  // Check each line segment of polygon1 against each line segment of polygon2
  for (let i = 0; i < points1.length; i++) {
    const j = (i + 1) % points1.length;
    for (let k = 0; k < points2.length; k++) {
      const l = (k + 1) % points2.length;
      if (doLinesIntersect(points1[i], points1[j], points2[k], points2[l])) {
        return true;
      }
    }
  }
  return false;
};

const caregiverId = 'caregiver-123'; // Replace with actual ID
const patientId = 'patient-456'; // Replace with actual ID

export default function ZoneControlScreen() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [currentZone, setCurrentZone] = useState<Coordinate[]>([]);
  const [activeZoneIndex, setActiveZoneIndex] = useState<number>(-1);

  const checkIntersection = (point: Coordinate, zonePoints: Coordinate[]) => {
    if (zonePoints.length < 4) return false;
    
    // Simple point-in-polygon check
    let inside = false;
    for (let i = 0, j = zonePoints.length - 1; i < zonePoints.length; j = i++) {
      const xi = zonePoints[i].latitude, yi = zonePoints[i].longitude;
      const xj = zonePoints[j].latitude, yj = zonePoints[j].longitude;
      
      const intersect = ((yi > point.longitude) !== (yj > point.longitude)) &&
        (point.latitude < (xj - xi) * (point.longitude - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  const handleMapPress = (e: MapPressEvent) => {
    const { coordinate } = e.nativeEvent;
    
    // Check if the new point would create self-intersecting edges
    if (currentZone.length >= 2) {
      const tempPoints = [...currentZone, coordinate];
      for (let i = 0; i < tempPoints.length - 2; i++) {
        if (doLinesIntersect(
          tempPoints[tempPoints.length - 2],
          coordinate,
          tempPoints[i],
          tempPoints[i + 1]
        )) {
          Alert.alert('Error', 'Cannot create self-intersecting zones');
          return;
        }
      }
    }

    // Check if the new point is inside any existing zone
    const isInsideExistingZone = zones.some(zone => 
      checkIntersection(coordinate, zone.points)
    );

    if (isInsideExistingZone) {
      Alert.alert('Error', 'Cannot place points inside existing zones');
      return;
    }

    setCurrentZone([...currentZone, coordinate]);
  };

  const handleMarkerPress = (index: number) => {
    setCurrentZone(currentZone.filter((_, i) => i !== index));
  };

  const handleAddZone = async () => {
    if (currentZone.length < 4) {
      Alert.alert('Error', 'A zone must have at least 4 points.');
      return;
    }

    // Check if the new zone's edges intersect with any existing zone's edges
    const intersectsWithExisting = zones.some(zone =>
      doesPolygonIntersect(currentZone, zone.points)
    );

    if (intersectsWithExisting) {
      Alert.alert('Error', 'New zone cannot intersect with existing zones');
      return;
    }

    const newZoneToAdd = {
      id: Date.now().toString(),
      points: [...currentZone]
    };

    // Prepare coordinate range for the new zone
    const latitudes = newZoneToAdd.points.map(p => p.latitude);
    const longitudes = newZoneToAdd.points.map(p => p.longitude);
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    const zoneForBackend = {
      id: newZoneToAdd.id,
      coordinate_range: {
        min_latitude: minLat,
        max_latitude: maxLat,
        min_longitude: minLng,
        max_longitude: maxLng
      }
    };

    try {
      console.log('Sending new zone to backend:', JSON.stringify({
        caregiver_id: caregiverId,
        patient_id: patientId,
        zones: [zoneForBackend] // Send as an array with one zone
      }, null, 2));

      const response = await fetch('http://172.20.201.67:5000/assign_coordinates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caregiver_id: caregiverId,
          patient_id: patientId,
          zones: [zoneForBackend] // Send as an array with one zone
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to assign coordinates and could not parse error.' }));
        throw new Error(errorData.message || 'Failed to assign coordinates');
      }

      setZones([...zones, newZoneToAdd]);
      setCurrentZone([]);
      Alert.alert('Zone Added', 'Zone successfully added and saved to backend!');

    } catch (error) {
      Alert.alert('Error Saving Zone', (error as Error).message);
    }
  };

  const handleSelectZone = (index: number) => {
    setActiveZoneIndex(index);
    setCurrentZone(zones[index].points);

    // Calculate and display coordinate ranges
    const points = zones[index].points;
    const latitudes = points.map(p => p.latitude);
    const longitudes = points.map(p => p.longitude);
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    Alert.alert(
      'Zone Coordinates',
      `Latitude: ${minLat.toFixed(6)} to ${maxLat.toFixed(6)}\nLongitude: ${minLng.toFixed(6)} to ${maxLng.toFixed(6)}`
    );
  };

  const handleDeleteZone = (index: number) => {
    Alert.alert(
      'Delete Zone',
      'Are you sure you want to delete this zone?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setZones(zones.filter((_, i) => i !== index));
            setActiveZoneIndex(-1);
            setCurrentZone([]);
          }
        },
      ]
    );
  };

  const handleClearCurrentZone = () => {
    setCurrentZone([]);
    setActiveZoneIndex(-1);
  };

  const handleClearAllZones = () => {
    Alert.alert(
      'Clear All',
      'Are you sure you want to clear all zones? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: () => {
            setZones([]);
            setCurrentZone([]);
            setActiveZoneIndex(-1);
          }
        },
      ]
    );
  };

  // const handleSaveZones = async () => { ... }; // This function is no longer needed as zones are saved individually.

  const [currentLocation, setCurrentLocation] = useState<Region>({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      const { latitude, longitude } = location.coords;
      setCurrentLocation({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Unable to get location');
    }
  };

  useEffect(() => {
    const setupLocation = async () => {
      const hasPermission = await requestLocationPermission();
      if (hasPermission) {
        await getCurrentLocation();
      }
    };
    setupLocation();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Zone Control</Text>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={currentLocation}
          showsUserLocation={true}
          followsUserLocation={true}
          onPress={handleMapPress}
        >
        {/* Display saved zones */}
        {zones.map((zone, zoneIndex) => (
          <React.Fragment key={zone.id}>
            <>
              <Polygon
                coordinates={zone.points}
                fillColor={activeZoneIndex === zoneIndex ? "rgba(0, 255, 0, 0.3)" : "rgba(255, 0, 0, 0.3)"}
                strokeColor={activeZoneIndex === zoneIndex ? "green" : "red"}
                strokeWidth={2}
                onPress={() => handleSelectZone(zoneIndex)}
              />

            </>
          </React.Fragment>
        ))}

        {/* Display current zone being created */}
        {currentZone.map((point, index) => (
          <Marker 
            key={index} 
            coordinate={point as LatLng}
            onPress={() => handleMarkerPress(index)}
          />
        ))}
        {currentZone.length >= 4 && (
          <Polygon
            coordinates={currentZone}
            fillColor="rgba(0, 0, 255, 0.3)"
            strokeColor="blue"
            strokeWidth={2}
          />
        )}
        </MapView>

      </View>
      <View style={styles.buttonContainer}>
        <View style={styles.buttonRow}>
          <Button title="Add Zone" onPress={handleAddZone} />
          <Button title="Clear Current" onPress={handleClearCurrentZone} />
          <Button title="Clear All" onPress={handleClearAllZones} color="red" />
        </View>
        {/* <Button title="Save All Zones" onPress={handleSaveZones} /> */}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    position: 'relative',
    height: Dimensions.get('window').height * 0.8,
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 10,
    gap: 10,
  },
  container: {
    flex: 1,
    paddingTop: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  buttonContainer: {
    marginTop: 10,
    paddingHorizontal: 16,
    gap: 10,
  },
});
