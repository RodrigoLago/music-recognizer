import React, { useState, useEffect, useRef } from 'react'
import { Button, View, Text } from 'react-native';
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
        console.log("DATA :"+data)
        //console.log("DATA METADATA:"+JSON.parse(data.metadata))
        data = JSON.parse(data)
        //let response =  JSON.stringify(data.metadata)
        this.setState({myText: JSON.stringify(data)})
    }
    async _findSong(callback) {
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
            .then(response => callback(response))
            
            //this.setState({myText: 'My Changed Text'})
            console.log(result);
            return result;
        } catch (error) {
            console.log(error);
            console.log('Error in this!!!!');
        }
    }
    render() {
        return (
            <View>
                <Text > {this.state.myText} </Text>
                <Button title="Find Song" color="#841584" onPress={() => this._findSong(this._updateText)} />
            </View>
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
    let result = await response.text();
    //console.log(result);
    return result;
}