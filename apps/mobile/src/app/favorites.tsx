import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FavoritesScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container} accessible accessibilityRole="text">
        <Text style={styles.title}>Favorites</Text>
        <Text style={styles.body}>Your saved cafés will appear here.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  title: {
    color: '#202124',
    fontSize: 32,
    fontWeight: '700',
  },
  body: {
    color: '#202124',
    fontSize: 20,
    lineHeight: 28,
  },
});
