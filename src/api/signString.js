import hmacSHA1 from 'crypto-js/hmac-sha1';

const signString = (stringToSign, accessSecret) => {
    var CryptoJS = require("crypto-js");
    return CryptoJS.enc.Base64.stringify(hmacSHA1(stringToSign, accessSecret))
}
export {signString}