import React, {useState, useEffect} from 'react'
import { Button, StyleSheet, View, Text, Row, Spinner } from 'react-native';
import { Audio } from 'expo-av';
import { timeout } from '../utils/timeout';
import { roundNumber } from '../utils/roundNumber';
import { acrPost } from '../api/services/acrPost';
import { defaultOptions } from '../config/defaultOptions';

const MusicRecTest = () => {
    const [myText, setMyText] = useState('Music Recognizer');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {

      },[]);

    const _updateText = (data) => {
        console.log(data)
        if (data.status.code != 0) {
            setMyText('No se encontró la canción')
        }
        else {
            let title = data.metadata.music[0].title // listo
            let album = data.metadata.music[0].album.name // listo
            let artist = data.metadata.music[0].artists[0].name //listo
            let processTime = data.cost_time
            processTime = roundNumber(processTime, 3);
            processTime.toString()
            console.log(title + album + artist)
            let text = `Artist: ${artist}\n Title: ${title}\n Album: ${album}\n Cost Time: ${processTime}s`
            //let artista = data.metadata.music[0].artist.name
            setMyText(text)
        }
    }

    const _findSong = async (callback) => 
    {
        setMyText('Processing...')
        setLoading(true)

        const { status } = await Audio.requestPermissionsAsync();
        console.log('Current Status ' + status);
        const recording = new Audio.Recording();
        try {
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                allowsRecordingIOS: true,
            });
            const recordOptions = {
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
                    sampleRate: 8000,
                    numberOfChannels: 1,
                    linearPCMBitDepth: 16,
                    linearPCMIsBigEndian: false,
                    linearPCMIsFloat: true,
                },
            };
            await recording.prepareToRecordAsync(recordOptions);
            await recording.startAsync();
            console.log('Recording');
            await timeout(8000);
            console.log('Done recording');
            await recording.stopAndUnloadAsync();
            let recordingFile = recording.getURI();

            let result = await acrPost(recordingFile, defaultOptions)
                //.then((result) => console.log(result))
                //.then((json) => callback(json))
                //.then((json) => this.setState({ myText: JSON.stringify(json.status) }))
                .then((json) => callback(json))

            
            setLoading(false)
            return result;
        } catch (error) {
            console.log(error);
            console.log('Error in this!!!!');
        }

    }

    return (
        <React.Fragment>
            {loading ? 
                <Text className='justify-content-md-center'>
                Buscando info (spinner)
                </Text>
            : 
                <Text style={styles.txt}> {myText}</Text>
            }
            <View style={styles.view}>
                <View style={styles.btndv}>
                    <Button style={styles.btn} title="Find Song" type="solid" color="#7c1a38" onPress={() => _findSong(_updateText)} />
                </View>
            </View >
        </React.Fragment>
    );
}

export default MusicRecTest;

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