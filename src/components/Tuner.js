import React, { useState } from "react"
import { Button, StyleSheet, View, Text } from 'react-native';
import { Audio } from 'expo-av';
import { timeout } from '../utils/timeout';
import { Sound } from "expo-av/build/Audio";
 




const Tuner = () => {

    const captureFreq = async () => 
    {
        alert("capture")

        const { status } = await Audio.requestPermissionsAsync();
        alert('Current Status: ' + status);

        const recording = new Audio.Recording();
        try {
            //#region CONFIG
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                allowsRecordingIOS: true,
            });
            const recordingSettings = {
                android: {
                extension: '.m4a',
                outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
                audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
                sampleRate: 44100,
                numberOfChannels: 2,
                bitRate: 128000,
                },
                ios: {
                extension: '.wav',
                audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
                sampleRate: 44100,
                numberOfChannels: 1,
                linearPCMBitDepth: 16,
                linearPCMIsBigEndian: false,
                linearPCMIsFloat: false,
                },
            };
            await recording.prepareToRecordAsync(recordingSettings);
            
            //#endregion

            //#region REC
            await recording.startAsync();
            console.log('Start Recording');

            recording.setOnRecordingStatusUpdate((status) => {
                console.log(status);
                // Aquí puedes hacer lo que desees con la información de la frecuencia en tiempo real
                // Puedes llamar a una función de análisis o actualizar el estado de tu componente, etc.
            });

            await timeout(5000);
            await recording.stopAndUnloadAsync();
            console.log('Stop Recording');

            //#endregion
            
            let uri = recording.getURI();
            console.log(uri)

            //#region PLAY
            const sound = new Audio.Sound();
            try {
                
                await sound.loadAsync({ uri: uri});
                await sound.playAsync();
                
                const getStatus = await sound.getStatusAsync();
                console.log(getStatus);
                
                await timeout(5000);
                
                await sound.unloadAsync(); //unload de memoria

            } catch (error) {
                console.log(error);
            }

            //#endregion
        }
        
        catch (error) {
            console.log(error);
        }

    }
    
    return (
        <React.Fragment>
            <View style={styles.view}>
                <Text style={styles.txt}>Tuner</Text>
                <View style={styles.btndv}>
                    <Button style={styles.btn} title="Guitar Tuner" type="solid" color="#7c1a38" onPress={() => captureFreq()} />
                </View>
            </View >
        </React.Fragment>
    )
}

export default Tuner;
    
const styles = StyleSheet.create({
    btn: {
        width: '100%',
        borderRadius: 70,

    },
    btndv: {
        margin: '10%',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    view: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    txt: {
        fontSize: 20,
        color: '#fff'
    }
});
