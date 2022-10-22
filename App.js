import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import MusicRec_Test from "./Acr.js"

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Music Recognizer</Text>
      <StatusBar style="auto" />
      <MusicRec_Test style={styles.container} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
