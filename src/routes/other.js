const express = require("express");
const router = express.Router()
const other = require("../controller/other")

router.get("/config/keys", other.generatePrivateAndPublicKeys)
router.post("/config/keys/encode", other.getBase16EncodedKey)
router.post("/config/keys/decode", other.getBase16DecodedKey)
router.post("/config/keys/token/bearer", other.getBearerToken)

module.exports = router