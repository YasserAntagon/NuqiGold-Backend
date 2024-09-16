const crypto = require('crypto');
const jwt = require('jsonwebtoken');

function base16Encoder(digestMsgByte) {
    let verifyMsg = '';
    for (let i = 0; i < digestMsgByte.length; i++) {
        let hexChar = digestMsgByte[i] & 0xff;
        let hexString = hexChar.toString(16);
        if (hexString.length === 1) {
            verifyMsg += '0';
        }
        verifyMsg += hexString;
    }
    return verifyMsg;
}

function base16Decoder(hex_string) {
    const bts = new Uint8Array(hex_string.length / 2);
    for (let i = 0; i < bts.length; i++) {
        bts[i] = parseInt(hex_string.slice(i * 2, (i + 1) * 2), 16);
    }
    return bts;
}

function generateKeys() {
    const keyAlgorithm = 'rsa';
    const numBits = 1024;

    const { privateKey, publicKey } = crypto.generateKeyPairSync(keyAlgorithm, {
        modulusLength: numBits,
        publicKeyEncoding: {
            type: 'spki',
            format: 'der'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'der'
        }
    });

    const private_key_bytes = privateKey;
    const public_key_bytes = publicKey;

    return {
        privateKey: base16Encoder(private_key_bytes),
        publicKey: base16Encoder(public_key_bytes)
    }
}

const createAssertion = (privateKey, appKey, institution, userId) => {
    try {
        const private_key_byte_arrary = base16Decoder(privateKey);

        const accessTokenExpiryTimeMs = 86400000; // 1 day
        const accessTokenExpiry = Date.now() + accessTokenExpiryTimeMs;

        // Create RSA private key object from raw bytes
        const private_key = crypto.createPrivateKey({ key: Buffer.from(private_key_byte_arrary), format: 'der', type: 'pkcs8' });

        const payload = {
            instCode: institution,
            exp: accessTokenExpiry,
            userId: userId
        };

        const options = {
            algorithm: 'RS256',
            issuer: appKey,
            allowInsecureKeySizes: true
        };

        const accessToken = jwt.sign(payload, private_key, options);

        return accessToken;
    } catch (e) {
        console.error(e);
        return null;
    }
}

module.exports = {
    generateKeys,
    base16Encoder,
    base16Decoder,
    createAssertion
}