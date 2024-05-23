const { default: AsyncQueue } = require('sequelize/lib/dialects/mssql/async-queue')
const notificationModel = require('../models/notification')

const createNotification = async (req, res) => {
    try {
        const { title, body, user_id, type, image } = req.body
        if (!title) {
            return res.status(400).send({
                status: false,
                message: "Title not found"
            })
        }
        if (!body) {
            return res.status(400).send({
                status: false,
                message: "Body not found"
            })
        }
        const data = {
            title,
            body
        }
        if (user_id) {
            data.user_id = user_id
        }
        if (type) {
            data.type = type
        }
        if (image) {
            data.image = image
        }
        const createdNotification = await notificationModel.create(data)
        return res.status(201).send({
            status: true,
            message: "Notification Created Successfully",
            data: createdNotification
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            error
        })
    }
}

const findAllNotification = async (req, res) => {
    try {
        const data = await notificationModel.findAll()
        if (data.length === 0) {
            return res.status(404).send({
                status: false,
                message: "Notification Not Found"
            })
        }
        return res.status(200).send({
            status: true,
            message: "All Notification Get Successfully",
            data: data
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            error
        })
    }
}

const findNotificationById = async (req, res) => {
    try {
        const { id } = req.params
        if (!id) {
            return res.status(400).send({
                status: false,
                message: "Id not Found"
            })
        }
        const data = await notificationModel.findByPk(id)
        if (!data) {
            return res.status(404).send({
                status: false,
                message: "Notification not found"
            })
        }
        return res.status(200).send({
            status: true,
            message: "Notification Found",
            data
        })

    }
    catch (error) {
        return res.status(500).send({
            status: false,
            error
        })
    }
}

const updateNotificationById = async (req, res) => {
    try {
        const { id } = req.params
        if (!id) {
            return res.status(400).send({
                status: false,
                message: "Id not Found"
            })
        }
        const { title, body, user_id, type, image } = req.body
        const data = {}
        if (title) {
            data.title = title
        }
        if (body) {
            data.body = body
        }
        if (user_id) {
            data.user_id = user_id
        }
        if (type) {
            data.type = type
        }
        if (image) {
            data.image = image
        }
        const updatedNotification = await notificationModel.update(data, { where: { id } })
        if (updatedNotification === 0) {
            return res.status(404).send({
                status: false,
                message: "Notification not found"
            })
        }
        return res.status(200).send({
            status: true,
            message: "Notification Updated Successfully",
            data: updatedNotification
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            error
        })
    }
}

const deleteNotificationById = async (req, res) => {
    try {
        const { id } = req.params
        if (!id) {
            return res.status(400).send({
                status: false,
                message: "Id not Found"
            })
        }
        const deletedNotification = await notificationModel.destroy({ where: { id } })
        if (deletedNotification === 0) {
            return res.status(404).send({
                status: false,
                message: "Notification not found"
            })
        }
        return res.status(200).send({
            status: true,
            message: "Notification Deleted Successfully",
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            error
        })
    }
}

module.exports = {
    createNotification,
    findAllNotification,
    findNotificationById,
    updateNotificationById,
    deleteNotificationById
}