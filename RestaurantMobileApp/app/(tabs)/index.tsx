import { View, Text, StyleSheet, Dimensions, FlatList, ImageBackground, TouchableOpacity, Modal, TextInput, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { fetchRestaurants, createBooking } from '../../constants/Data';

interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  rating: number;
  reviews: number;
  distance: string;
  image: string;
  about: string;
  priceRange: string;
  tags?: string[];
}

// Get exact window dimensions for the paging scroll
const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedRest, setSelectedRest] = useState<Restaurant | null>(null);
  const [guests, setGuests] = useState('2');
  const [time, setTime] = useState('19:00');

  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const data = await fetchRestaurants();
    setRestaurants(data);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    loadData();
  }, [loadData]);

  const handleBookPress = (restaurant: Restaurant) => {
    setSelectedRest(restaurant);
    setBookingModalVisible(true);
  };

  const confirmBooking = async () => {
    if (!selectedRest) return;
    await createBooking({
      restaurantId: selectedRest.id,
      userId: 'USER123',
      date: '2024-10-24',
      time: time,
      guests: parseInt(guests)
    });
    setBookingModalVisible(false);
    router.push('/booking/success');
  };

  const renderItem = ({ item, index }: { item: Restaurant, index: number }) => (
    <View style={styles.pageContainer}>
      <ImageBackground 
        source={{ uri: item.image }} 
        style={styles.imageBackground}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <Animated.View 
            entering={FadeInUp.delay(200).duration(800)}
            style={styles.infoContainer}
          >
            <Text style={styles.title}>{item.name}</Text>
            
            <View style={styles.tagsRow}>
              {item.tags?.map((t: string, idx: number) => (
                <View key={idx} style={styles.tag}>
                  <Text style={styles.tagText}>{t}</Text>
                </View>
              ))}
              <View style={[styles.tag, { backgroundColor: 'rgba(0, 240, 255, 0.2)' }]}>
                <Feather name="star" size={12} color="#00F0FF" />
                <Text style={[styles.tagText, { color: '#00F0FF', marginLeft: 4 }]}>{item.rating}</Text>
              </View>
            </View>
            
            <Text style={styles.description}>{item.about}</Text>
            
            <Text style={styles.metaData}>{item.cuisine} • {item.distance}</Text>

            <Animated.View entering={FadeInDown.delay(400).duration(600)}>
              <TouchableOpacity 
                style={styles.bookButton} 
                activeOpacity={0.8}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  handleBookPress(item);
                }}
              >
                <Text style={styles.bookButtonText}>Book Table</Text>
                <Feather name="arrow-up-right" size={20} color="#0A0A0F" />
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </View>
      </ImageBackground>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <Animated.View
            entering={FadeInUp}
            style={useAnimatedStyle(() => ({
              transform: [{ scale: withRepeat(withSequence(withTiming(1.2, { duration: 1000 }), withTiming(1, { duration: 1000 })), -1, true) }],
              opacity: withRepeat(withSequence(withTiming(1, { duration: 1000 }), withTiming(0.5, { duration: 1000 })), -1, true),
            }))}
          >
            <Feather name="target" size={48} color="#00F0FF" />
          </Animated.View>
          <Text style={{ color: '#00F0FF', marginTop: 16, fontWeight: '700', letterSpacing: 2 }}>DINEDESK</Text>
        </View>
      ) : (
        <FlatList
          data={restaurants}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToInterval={height}
          snapToAlignment="start"
          decelerationRate="fast"
          bounces={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#00F0FF"
              colors={['#00F0FF']}
            />
          }
        />
      )}

      {/* Booking Glassmorphism Custom Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={bookingModalVisible}
        onRequestClose={() => setBookingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.dragHandle} />
            <Text style={styles.modalTitle}>Reserve at {selectedRest?.name}</Text>
            
            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Guests</Text>
                <TextInput style={styles.input} value={guests} onChangeText={setGuests} keyboardType="numeric" placeholderTextColor="#666" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Time</Text>
                <TextInput style={styles.input} value={time} onChangeText={setTime} placeholderTextColor="#666" />
              </View>
            </View>

            <TouchableOpacity style={styles.confirmButton} onPress={confirmBooking}>
              <Text style={styles.confirmButtonText}>Confirm & Secure</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setBookingModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pageContainer: { width, height }, // takes exactly one screen
  imageBackground: { flex: 1, justifyContent: 'flex-end' },
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'flex-end', paddingBottom: 100 },
  infoContainer: { padding: 24, paddingBottom: 40 },
  title: { fontSize: 36, fontWeight: '900', color: '#FFF', letterSpacing: 1, marginBottom: 16, textShadowColor: 'rgba(0,240,255,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 10 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  tag: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 } as any,
  tagText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  description: { color: 'rgba(255,255,255,0.9)', fontSize: 15, lineHeight: 22, marginBottom: 16 },
  metaData: { color: '#00F0FF', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 24 },
  bookButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#00F0FF', height: 56, borderRadius: 28, gap: 8, shadowColor: '#00F0FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 15, elevation: 10 },
  bookButtonText: { color: '#0A0A0F', fontSize: 18, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#0F0F16', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40, borderWidth: 1, borderColor: '#1E1E28' },
  dragHandle: { width: 40, height: 4, backgroundColor: '#1E1E28', borderRadius: 2, alignSelf: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#FFF', marginBottom: 24, textAlign: 'center' },
  inputRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  inputGroup: { flex: 1 },
  inputLabel: { color: '#868E96', fontSize: 12, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  input: { backgroundColor: '#1E1E28', height: 50, borderRadius: 12, paddingHorizontal: 16, color: '#FFF', fontSize: 16, fontWeight: '600', borderWidth: 1, borderColor: '#2A2A35' },
  confirmButton: { backgroundColor: '#00F0FF', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  confirmButtonText: { color: '#0A0A0F', fontSize: 16, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  cancelButton: { height: 50, justifyContent: 'center', alignItems: 'center' },
  cancelButtonText: { color: '#868E96', fontSize: 15, fontWeight: '600' }
});
