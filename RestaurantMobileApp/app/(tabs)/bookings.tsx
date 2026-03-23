import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';

interface Booking {
  id: string;
  restaurantName: string;
  status: string;
  distance: string;
  date: string;
  time: string;
  guests: number;
  notes?: string;
}

export default function BookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = () => {
    fetch('http://10.0.2.2:3000/api/bookings/user/USER123')
      .then(res => res.json())
      .then(data => {
        setBookings(Array.isArray(data) ? data : []);
        setLoading(false);
        setRefreshing(false);
      })
      .catch(err => {
        console.error(err);
        setBookings([]);
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBookings();
  }, []);

  const handleAbort = (booking: Booking) => {
    Alert.alert('Cancel Reservation', `Cancel your booking at ${booking.restaurantName}?`, [
      { text: 'Keep It', style: 'cancel' },
      { text: 'Cancel', style: 'destructive', onPress: () => {
        fetch(`http://10.0.2.2:3000/api/bookings/${booking.id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Cancelled' }),
        }).then(() => fetchBookings()).catch(console.error);
      }},
    ]);
  };

  const handleRoute = (booking: Booking) => {
    const query = encodeURIComponent(booking.restaurantName);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>NEXUS PASS</Text>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00F0FF" />}
      >
        {loading ? (
           <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
             <Feather name="loader" size={32} color="#00F0FF" />
           </View>
        ) : bookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="inbox" size={48} color="#1E1E28" />
            <Text style={styles.emptyTitle}>NO ACTIVE CODES</Text>
            <Text style={styles.emptyText}>Swipe through the feed to secure a neon table.</Text>
          </View>
        ) : (
          bookings.map((booking: Booking) => (
            <View key={booking.id} style={styles.bookingCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.restaurantName}>{booking.restaurantName}</Text>
                <View style={[styles.statusBadge, booking.status === 'Cancelled' && { backgroundColor: 'rgba(255,0,85,0.1)' }]}>
                  <Text style={[styles.statusText, booking.status === 'Cancelled' && { color: '#FF0055' }]}>{booking.status}</Text>
                </View>
              </View>

              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Feather name="map-pin" size={16} color="#00F0FF" />
                  <Text style={styles.detailText}>{booking.distance}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Feather name="clock" size={16} color="#00F0FF" />
                  <Text style={styles.detailText}>{booking.date} @ {booking.time}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Feather name="users" size={16} color="#00F0FF" />
                  <Text style={styles.detailText}>Party of {booking.guests}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Feather name="hash" size={16} color="#00F0FF" />
                  <Text style={styles.detailText}>{booking.id}</Text>
                </View>
              </View>

              {booking.status !== 'Cancelled' && (
                <View style={styles.actionsRow}>
                  <TouchableOpacity style={styles.btnOutline} onPress={() => handleAbort(booking)}>
                    <Text style={styles.btnOutlineText}>ABORT</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btnPrimary} onPress={() => handleRoute(booking)}>
                    <Text style={styles.btnPrimaryText}>INIT ROUTE</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  header: { padding: 24, paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: '900', color: '#FFF', letterSpacing: 2, textShadowColor: 'rgba(0,240,255,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 10 },
  content: { padding: 24, paddingTop: 8, paddingBottom: 100 },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#FFF', marginTop: 16, letterSpacing: 2, textShadowColor: 'rgba(0,240,255,0.3)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 },
  emptyText: { fontSize: 14, color: '#868E96', textAlign: 'center', marginTop: 8 },
  bookingCard: { backgroundColor: '#0F0F16', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#1E1E28', shadowColor: '#00F0FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4, marginBottom: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#1E1E28', paddingBottom: 16, marginBottom: 16 },
  restaurantName: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  statusBadge: { backgroundColor: 'rgba(0, 240, 255, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { color: '#00F0FF', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 24 },
  detailItem: { width: '45%', flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: '500' },
  actionsRow: { flexDirection: 'row', gap: 12 },
  btnOutline: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#FF0055', alignItems: 'center' },
  btnOutlineText: { color: '#FF0055', fontWeight: '800', letterSpacing: 1 },
  btnPrimary: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#00F0FF', alignItems: 'center', shadowColor: '#00F0FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 },
  btnPrimaryText: { color: '#0A0A0F', fontWeight: '900', letterSpacing: 1 }
});
