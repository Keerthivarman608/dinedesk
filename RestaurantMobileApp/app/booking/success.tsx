import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BookingSuccessScreen() {
  const router = useRouter();

  const handleFinish = () => {
    router.dismissAll();
    router.replace('/(tabs)/bookings');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Feather name="shield" size={48} color="#0A0A0F" />
        </View>
        
        <Text style={styles.title}>ACCESS GRANTED</Text>
        <Text style={styles.subtitle}>Secure booking transaction complete.</Text>

        <TouchableOpacity style={styles.btnPrimary} onPress={handleFinish}>
          <Text style={styles.btnPrimaryText}>ENTER NEXUS</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#00F0FF' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  iconCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(10,10,15,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 32, fontWeight: '900', color: '#0A0A0F', letterSpacing: 2, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: 'rgba(10,10,15,0.8)', textAlign: 'center', fontWeight: '600', marginBottom: 40 },
  btnPrimary: { backgroundColor: '#0A0A0F', paddingVertical: 18, paddingHorizontal: 40, borderRadius: 30, alignItems: 'center' },
  btnPrimaryText: { color: '#00F0FF', fontSize: 16, fontWeight: '900', letterSpacing: 2 }
});
