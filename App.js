import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import MusicRec_Test from "./Acr.js"
import { LinearGradient } from 'expo-linear-gradient';

export default function App() {
  return (
    <View style={styles.container}>
      <LinearGradient
        // Button Linear Gradient
        colors={['#02aab0', '#420047']}
        style={styles.background}>
        <StatusBar style="auto" />
        <MusicRec_Test />
      </LinearGradient>

    </View>
  );
}
const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    color: '#ffffff',
    background: '#080808',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
