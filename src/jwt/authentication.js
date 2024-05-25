const jwt = require("jsonwebtoken")
const userModel = require("../models/users")

const userAuthentication = async (req, res, next) => {
    try {
        let token = req.headers["Authorization"] ? req.headers["Authorization"] : req.headers["authorization"]
        if (!token) {
            return res.status(400).send({ status: false, message: "token is required" })
        }
        token = token.split(" ")
        token = token[1]
        let decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        if (!decodedToken) {
            return res.status(400).send({ status: false, message: "token is invalid" })
        }
        req.decodedToken = decodedToken
        next()
    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}

const userAuthorization = async (req, res, next) => {
    try {
        let { userId } = req.params
        if (!userId) {
            return res.status(400).send({ status: false, message: "user id is required" })
        }
        const user = await userModel.findByPk(userId)
        if (!user) {
            return res.status(400).send({ status: false, message: "user not found" })
        }
        let decodedToken = req.decodedToken
        if (!decodedToken) {
            return res.status(400).send({ status: false, message: "token is invalid" })
        }
        if (decodedToken.id != userId) {
            return res.status(403).send({ status: false, message: "You are not authorized to perform this action" })
        }
        next()
    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = { userAuthentication, userAuthorization }