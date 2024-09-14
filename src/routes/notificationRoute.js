const express = require("express")
const router = express.Router()
const notification = require("../controllers/notification")
const auth = require("../jwt/authentication")

router.post('/:userId/notification', auth.userAuthentication, auth.userAuthorization, notification.createNotification)
router.get('/:userId/notification', auth.userAuthentication, auth.userAuthorization, notification.findAllNotification)
router.get('/:userId/notification/:id', auth.userAuthentication, auth.userAuthorization, notification.findNotificationById)
router.put('/:userId/notification/:id', auth.userAuthentication, auth.userAuthorization, notification.updateNotificationById)
router.delete('/:userId/notification/:id', auth.userAuthentication, auth.userAuthorization, notification.deleteNotificationById)

module.exports = router