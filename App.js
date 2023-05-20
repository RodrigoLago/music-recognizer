import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import MusicRec from "./src/components/MusicRec.js"
import { LinearGradient } from 'expo-linear-gradient';

export default function App() {
  return (
    <View style={styles.container}>
      <LinearGradient
        // Button Linear Gradient
        colors={['#00cdac', '#02aab0', '#cc2b5e']}
        style={styles.background}>
        <StatusBar style="auto" />
        <MusicRec />
        <MusicRec/>
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
