import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useState, useEffect } from 'react';

interface UserProfile {
  name: string;
  email: string;
  totalBookings: number;
}

export default function ProfileScreen() {
  const [user, setUser] = useState<UserProfile>({ name: 'Nexus User', email: 'user@dinedesk.io', totalBookings: 0 });

  useEffect(() => {
    fetch('http://10.0.2.2:3000/api/bookings/user/USER123')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setUser(prev => ({ ...prev, totalBookings: data.length }));
      })
      .catch(() => {});
  }, []);

  const initial = user.name.charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.headerTitle}>IDENTITY</Text>

        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Feather name="calendar" size={20} color="#00F0FF" />
            <Text style={styles.statValue}>{user.totalBookings}</Text>
            <Text style={styles.statLabel}>BOOKINGS</Text>
          </View>
          <View style={styles.statCard}>
            <Feather name="award" size={20} color="#00F0FF" />
            <Text style={styles.statValue}>{user.totalBookings >= 5 ? 'VIP' : 'STD'}</Text>
            <Text style={styles.statLabel}>TIER</Text>
          </View>
          <View style={styles.statCard}>
            <Feather name="zap" size={20} color="#00F0FF" />
            <Text style={styles.statValue}>{user.totalBookings * 50}</Text>
            <Text style={styles.statLabel}>POINTS</Text>
          </View>
        </View>

        {/* Menu items */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}><Feather name="user" size={18} color="#00F0FF" /></View>
            <Text style={styles.menuText}>Edit Profile</Text>
            <Feather name="chevron-right" size={18} color="#2A2A35" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}><Feather name="bell" size={18} color="#00F0FF" /></View>
            <Text style={styles.menuText}>Notifications</Text>
            <Feather name="chevron-right" size={18} color="#2A2A35" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}><Feather name="shield" size={18} color="#00F0FF" /></View>
            <Text style={styles.menuText}>Privacy & Security</Text>
            <Feather name="chevron-right" size={18} color="#2A2A35" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}><Feather name="help-circle" size={18} color="#00F0FF" /></View>
            <Text style={styles.menuText}>Help Center</Text>
            <Feather name="chevron-right" size={18} color="#2A2A35" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn}>
          <Feather name="log-out" size={18} color="#FF0055" />
          <Text style={styles.logoutText}>DISCONNECT</Text>
        </TouchableOpacity>

        <Text style={styles.version}>DineDesk v2.0 · Nexus Build</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  content: { padding: 24, paddingBottom: 120 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#FFF', letterSpacing: 2, marginBottom: 32, textShadowColor: 'rgba(0,240,255,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 10 },

  avatarWrap: { alignItems: 'center', marginBottom: 32 },
  avatarRing: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: '#00F0FF', justifyContent: 'center', alignItems: 'center', shadowColor: '#00F0FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 15, elevation: 10, marginBottom: 16 },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#0F0F16', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 36, fontWeight: '900', color: '#00F0FF' },
  userName: { fontSize: 22, fontWeight: '800', color: '#FFF', marginBottom: 4 },
  userEmail: { fontSize: 14, color: '#868E96', fontWeight: '500' },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  statCard: { flex: 1, backgroundColor: '#0F0F16', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#1E1E28' },
  statValue: { fontSize: 22, fontWeight: '900', color: '#FFF', marginTop: 8 },
  statLabel: { fontSize: 10, fontWeight: '700', color: '#868E96', letterSpacing: 1, marginTop: 4 },

  menuSection: { backgroundColor: '#0F0F16', borderRadius: 20, borderWidth: 1, borderColor: '#1E1E28', overflow: 'hidden', marginBottom: 24 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#1E1E28' },
  menuIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(0,240,255,0.08)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  menuText: { flex: 1, fontSize: 15, fontWeight: '600', color: '#FFF' },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#FF0055', marginBottom: 24 },
  logoutText: { color: '#FF0055', fontWeight: '800', letterSpacing: 1 },

  version: { textAlign: 'center', fontSize: 12, color: '#2A2A35', fontWeight: '500' },
});
