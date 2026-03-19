import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { restaurants } from '../../constants/Data';
import { useState } from 'react';

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const restaurant = restaurants.find(r => r.id.toString() === id) || restaurants[0];

  const [date, setDate] = useState('2024-10-24'); // Simple controlled strings for demo
  const [time, setTime] = useState('19:00');
  const [guests, setGuests] = useState('2');

  const handleBook = () => {
    // In production, sync to global state or backend
    router.push('/booking/success');
  };

  return (
    <View style={styles.container}>
      <ImageBackground source={{ uri: restaurant.image }} style={styles.headerImage}>
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="#212529" />
          </TouchableOpacity>
        </View>
      </ImageBackground>

      <View style={styles.contentWrapper}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{restaurant.name}</Text>
            <View style={styles.ratingBadge}>
              <Feather name="star" size={14} color="#FFF" />
              <Text style={styles.ratingText}>{restaurant.rating}</Text>
            </View>
          </View>

          <Text style={styles.description}>{restaurant.about}</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Feather name="map-pin" size={20} color="#FF6B6B" />
              <View>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{restaurant.distance}</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <Feather name="clock" size={20} color="#FF6B6B" />
              <View>
                <Text style={styles.infoLabel}>Open Hours</Text>
                <Text style={styles.infoValue}>10 AM - 10 PM</Text>
              </View>
            </View>
          </View>

          {/* Booking Form */}
          <View style={styles.bookingSection}>
            <Text style={styles.sectionTitle}>Reserve a Table</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date (YYYY-MM-DD)</Text>
              <TextInput 
                style={styles.input} 
                value={date} 
                onChangeText={setDate}
                placeholder="2024-10-24" 
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Time</Text>
                <TextInput 
                  style={styles.input} 
                  value={time} 
                  onChangeText={setTime}
                  placeholder="19:00" 
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Guests</Text>
                <TextInput 
                  style={styles.input} 
                  value={guests} 
                  onChangeText={setGuests}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <TouchableOpacity style={styles.bookButton} onPress={handleBook}>
              <Text style={styles.bookButtonText}>Confirm Booking</Text>
            </TouchableOpacity>
          </View>
          
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  headerImage: { width: '100%', height: 350 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.1)', paddingTop: 50, paddingHorizontal: 20 },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  contentWrapper: { flex: 1, backgroundColor: '#F8F9FA', marginTop: -40, borderTopLeftRadius: 32, borderTopRightRadius: 32, overflow: 'hidden' },
  content: { padding: 24 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#212529', flex: 1, marginRight: 16 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF6B6B', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, gap: 4 },
  ratingText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  description: { fontSize: 15, color: '#868E96', lineHeight: 24, marginBottom: 24 },
  infoGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  infoItem: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  infoLabel: { fontSize: 12, color: '#868E96', marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#212529' },
  bookingSection: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#212529', marginBottom: 20 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 12, fontWeight: '600', color: '#868E96', marginBottom: 8 },
  input: { height: 50, backgroundColor: '#F8F9FA', borderRadius: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: '#E9ECEF', fontSize: 15 },
  formRow: { flexDirection: 'row', gap: 12 },
  bookButton: { backgroundColor: '#FF6B6B', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  bookButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});
