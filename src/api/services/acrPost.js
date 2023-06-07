import { buildStringToSign } from "../buildStringToSign";
import { signString } from "../signString";
import { FileSystem } from 'react-native-unimodules';

const acrPost = async (uri, options) => {
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

export {acrPost}