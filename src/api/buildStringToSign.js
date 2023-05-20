const buildStringToSign = (method, uri, accessKey, dataType, signatureVersion, timestamp) => {
    return [method, uri, accessKey, dataType, signatureVersion, timestamp].join('\n');
}
export {buildStringToSign}