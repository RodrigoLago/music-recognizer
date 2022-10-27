import React, { useState, useEffect, useRef } from 'react'
import { Button, StyleSheet, View, Text } from 'react-native';
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
            loading: 'false'
        };
        this._updateText = this._updateText.bind(this);
    }
    _updateText = (data) => {
        console.log(data)
        if (data.status.code != 0) {
            this.setState({ myText: 'No se encontró la canción' })
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
            this.setState({ myText: text })
        }

    }
    async _findSong(callback) {
        this.setState({ myText: 'Processing...' })
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
            <View style={styles.view}>
                <Text style={styles.txt}> {this.state.myText}</Text>
                <View style={styles.btndv}>
                    <Button style={styles.btn} title="Find Song" type="solid" color="#7c1a38" onPress={() => this._findSong(this._updateText)} />
                </View>
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
function roundNumber(num, scale) {
    if (!("" + num).includes("e")) {
        return +(Math.round(num + "e+" + scale) + "e-" + scale);
    } else {
        var arr = ("" + num).split("e");
        var sig = ""
        if (+arr[1] + scale > 0) {
            sig = "+";
        }
        return +(Math.round(+arr[0] + "e" + sig + (+arr[1] + scale)) + "e-" + scale);
    }
}
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