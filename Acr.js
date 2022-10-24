import React, { useState, useEffect, useRef } from 'react'
import { StyleSheet, Button, View, Text } from 'react-native';
import { Audio } from 'expo-av';
import { FileSystem, Permissions } from 'react-native-unimodules';
//import hmacSHA1 from 'crypto-js/hmac-sha1';
//import { hmacSHA1 } from 'hmacsha1'
//var hmacSHA1 = require("hmacsha1");
import hmacSHA1 from 'crypto-js/hmac-sha1';
//import Base64 from 'crypto-js/enc-base64';
var CryptoJS = require("crypto-js");
import { Response } from './Response.js';
import { Buffer } from 'buffer';
import { style } from 'deprecated-react-native-prop-types/DeprecatedImagePropType.js';

export default class MusicRec_Test extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            response: '',
            myText: 'Music Recognizer',
        };
        this._updateText = this._updateText.bind(this);
    }
    _updateText = (data) => {
        if (data.status.code != 0) {
            this.setState({ myText: 'No se encontró la canción' })
        }
        else {
            let title = data.metadata.music[0].title // listo
            let album = data.metadata.music[0].album.name // listo
            let artist = data.metadata.music[0].artists[0].name //listo
            let processTime = data.cost_time
            processTime.toString()
            console.log(title + album + artist)
            let text = `Artista: ${artist}\nTitle: ${title}\nAlbum: ${album}\nTiempo en procesar: ${processTime}`
            //let artista = data.metadata.music[0].artist.name
            this.setState({ myText: text })
        }

    }
    async _findSong(callback) {
        this.setState({ myText: 'Procesando...' })
        // Audio.setAudioModeAsync()
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

            let result = await identify(recordingFile, defaultOptions)
                //.then((result) => console.log(result))
                //.then((json) => callback(json))
                //.then((json) => this.setState({ myText: JSON.stringify(json.status) }))
                .then((json) => callback(json))

            return result;
        } catch (error) {
            console.log(error);
            console.log('Error in this!!!!');
        }
    }
    render() {
        return (
            <View>
                <Text style={styles.txt}> {this.state.myText} </Text>
                <Button style={styles.btn} background-color='#fff' title="Find Song" color="#ffff" onPress={() => this._findSong(this._updateText)} />
            </View >
        );
    }
}
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
const defaultOptions = {
    host: 'identify-eu-west-1.acrcloud.com',
    endpoint: '/v1/identify',
    signature_version: '1',
    data_type: 'audio',
    secure: true,
    access_key: 'c00f954c13716ac155e0b995802c1d34',
    access_secret: 'kYaFzOUBKFbLkzqnPKG5otYB0UPo3fXQyYgUA7Jy',
};
function buildStringToSign(
    method,
    uri,
    accessKey,
    dataType,
    signatureVersion,
    timestamp,
) {
    return [method, uri, accessKey, dataType, signatureVersion, timestamp].join(
        '\n',
    );
}
function signString(stringToSign, accessSecret) {
    return CryptoJS.enc.Base64.stringify(hmacSHA1(stringToSign, accessSecret))
}
async function identify(uri, options) {
    var current_data = new Date();
    var timestamp = current_data.getTime() / 1000;
    var stringToSign = buildStringToSign(
        'POST',
        options.endpoint,
        options.access_key,
        options.data_type,
        options.signature_version,
        timestamp,
    );
    let fileinfo = await FileSystem.getInfoAsync(uri, { size: true });
    var signature = signString(stringToSign, options.access_secret);
    var formData = {
        sample: { uri: uri, name: 'sample.wav', type: 'audio/wav' },
        access_key: options.access_key,
        data_type: options.data_type,
        signature_version: options.signature_version,
        signature: signature,
        sample_bytes: fileinfo.size,
        timestamp: timestamp,
    };
    var form = new FormData();
    for (let key in formData) {
        form.append(key, formData[key]);
    }

    let postOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        body: form,
    };
    console.log(postOptions.body);
    let response = await fetch(
        'http://' + options.host + options.endpoint,
        postOptions,
    );
    let result = await response.json();
    //console.log(result);
    return result;
}
function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

const styles = StyleSheet.create({
    btn: {
        flex: 1,
        width: '100%',
        fontSize: 20,
        fontWeight: "bold",
        backgroundColor: '#000000',
    },
    txt: {
        color: '#fff'
    }
});