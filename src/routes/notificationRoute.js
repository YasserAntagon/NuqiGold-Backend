const express = require("express")
const router = express.Router()
const notification = require("../controller/notification")
const auth = require("../jwt/authentication")

router.post('/',auth.userAuthentication, auth.userAuthorization, notification.createNotification)
router.get('/all',auth.userAuthentication, auth.userAuthorization, notification.findAllNotification)
router.get('/:id',auth.userAuthentication, auth.userAuthorization, notification.findNotificationById)
router.put('/:id',auth.userAuthentication, auth.userAuthorization, notification.updateNotificationById)
router.delete('/:id',auth.userAuthentication, auth.userAuthorization, notification.deleteNotificationById)

module.exports = router