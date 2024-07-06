const { generateKeys, base16Decoder, base16Encoder, createAssertion } = require("../other/keyGenerator")

const generatePrivateAndPublicKeys = (req, res) => {
    try {
        const { privateKey, publicKey } = generateKeys()
        return res.status(200).send({
            privateKey: privateKey,
            publicKey: publicKey
        })
    }
    catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

const getBase16EncodedKey = (req, res) => {
    try {
        const { key } = req.body
        const encodedKey = base16Encoder(key)
        return res.status(200).send({
            encodedKey
        })
    }
    catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

const getBase16DecodedKey = (req, res) => {
    try {
        const { key } = req.body
        const decodedKey = base16Decoder(key)
        return res.status(200).send({
            decodedKey
        })
    }
    catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

const getBearerToken = (req, res) => {
    try {
        const { privateKey, appKey, institution, userId } = req.body
        if (!privateKey || !appKey || !institution || !userId) {
            return res.status(400).send({
                status: false,
                message: "privateKey, appKey, institution and userId are required"
            })
        }
        const accessToken = createAssertion(privateKey, appKey, institution, userId)
        return res.status(200).send({
            accessToken
        })
    }
    catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

module.exports = {
    generatePrivateAndPublicKeys,
    getBase16EncodedKey,
    getBase16DecodedKey,
    getBearerToken
}