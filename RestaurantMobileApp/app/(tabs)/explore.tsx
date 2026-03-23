import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';

const CATEGORIES = [
  { id: '1', name: 'Sushi', icon: 'dribbble' },
  { id: '2', name: 'Italian', icon: 'coffee' },
  { id: '3', name: 'Steak', icon: 'target' },
  { id: '4', name: 'Vegan', icon: 'sun' },
  { id: '5', name: 'Cafe', icon: 'anchor' },
  { id: '6', name: 'Bar', icon: 'moon' },
];

const TRENDING = [
  { id: '1', name: 'Neon Noodle Bar', image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9', tags: ['Japanese', '$$'] },
  { id: '2', name: 'The Midnight Diner', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0', tags: ['American', '$$$'] },
  { id: '3', name: 'Sakura Lounge', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4', tags: ['Sushi', '$$$$'] },
];

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Search Bar */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#00F0FF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search restaurants, cuisines..."
            placeholderTextColor="#868E96"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={20} color="#868E96" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Categories Grid */}
        <Text style={styles.sectionTitle}>CUISINES</Text>
        <View style={styles.categoriesGrid}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity key={cat.id} style={styles.categoryCard}>
              <View style={styles.categoryIconWrap}>
                <Feather name={cat.icon as any} size={24} color="#00F0FF" />
              </View>
              <Text style={styles.categoryName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Trending Horizontal Scroll */}
        <View style={styles.trendingHeader}>
          <Text style={styles.sectionTitle}>TRENDING NOW</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>SEE ALL</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingScroll}>
          {TRENDING.map(item => (
            <TouchableOpacity key={item.id} style={styles.trendingCard}>
              <ImageBackground source={{ uri: item.image }} style={styles.trendingImage} imageStyle={styles.trendingImageStyle}>
                <View style={styles.trendingOverlay}>
                  <Text style={styles.trendingTitle}>{item.name}</Text>
                  <View style={styles.tagsRow}>
                    {item.tags.map(tag => (
                      <View key={tag} style={styles.tagBadge}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Recommended List Placeholder */}
        <Text style={[styles.sectionTitle, { marginTop: 32 }]}>RECOMMENDED FOR YOU</Text>
        <View style={styles.recommendedCard}>
          <Feather name="map" size={32} color="#1E1E28" style={{ marginBottom: 12 }} />
          <Text style={{ color: '#868E96', fontSize: 14, textAlign: 'center' }}>Enable location services to discover the best spots near your current coordinate sector.</Text>
          <TouchableOpacity style={styles.locationBtn}>
            <Text style={styles.locationBtnText}>ENABLE TRACKING</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  header: { padding: 24, paddingBottom: 16 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E28', height: 50, borderRadius: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: '#2A2A35' },
  searchInput: { flex: 1, color: '#FFF', fontSize: 15, fontWeight: '600', marginLeft: 12 },
  
  scrollContent: { paddingBottom: 100 },
  sectionTitle: { fontSize: 14, fontWeight: '900', color: '#FFF', letterSpacing: 2, paddingHorizontal: 24, marginBottom: 16, textShadowColor: 'rgba(0,240,255,0.3)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 5 },
  
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, marginBottom: 32 },
  categoryCard: { width: '33.33%', alignItems: 'center', marginBottom: 24 },
  categoryIconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#0F0F16', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#1E1E28', shadowColor: '#00F0FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 5, marginBottom: 8 },
  categoryName: { color: '#FFF', fontSize: 12, fontWeight: '700', letterSpacing: 1 },

  trendingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 24 },
  seeAllText: { color: '#00F0FF', fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 16 },
  trendingScroll: { paddingHorizontal: 24, gap: 16 },
  trendingCard: { width: 260, height: 160, borderRadius: 24 },
  trendingImage: { width: '100%', height: '100%', justifyContent: 'flex-end' },
  trendingImageStyle: { borderRadius: 24 },
  trendingOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 24, padding: 16, justifyContent: 'flex-end' },
  trendingTitle: { color: '#FFF', fontSize: 18, fontWeight: '800', textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4, marginBottom: 8 },
  tagsRow: { flexDirection: 'row', gap: 8 },
  tagBadge: { backgroundColor: 'rgba(0,240,255,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  tagText: { color: '#00F0FF', fontSize: 10, fontWeight: '800' },

  recommendedCard: { marginHorizontal: 24, backgroundColor: '#0F0F16', borderRadius: 20, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#1E1E28', borderStyle: 'dashed' },
  locationBtn: { marginTop: 20, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, backgroundColor: 'rgba(0,240,255,0.1)' },
  locationBtnText: { color: '#00F0FF', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
});
