const express = require("express")
const router = express.Router()
const notification = require("../controller/notification")

router.post('/', notification.createNotification)
router.get('/all', notification.findAllNotification)
router.get('/:id', notification.findNotificationById)
router.put('/:id', notification.updateNotificationById)
router.delete('/:id', notification.deleteNotificationById)

module.exports = router