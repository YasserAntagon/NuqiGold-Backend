const PlanModel = require("../models/SubscriptionPlan")

const checkSubscriptionPlanORCreate = async () => {
    try {
        const plan = await PlanModel.findAndCountAll();
        if (plan.count == 7) {
            console.log("Plan already exists");
            return
        }
        const newPlan = await PlanModel.bulkCreate([
            { name: 'Free Plan', price: 0, duration: 1, storageLimit: 0.5 },
            { name: 'Basic Plan', price: 6.99, duration: 1, storageLimit: 10 },
            { name: 'Standard Plan', price: 29.99, duration: 1, storageLimit: 50 },
            { name: 'Plus Plan', price: 97.99, duration: 1, storageLimit: 100 },
            { name: 'Advanced Plan', price: 219.99, duration: 1, storageLimit: 300 },
            { name: 'Premium Plan', price: 389.99, duration: 1, storageLimit: 500 },
            { name: 'Elite Plan', price: 659.99, duration: 1, storageLimit: 1000 }
            // Add more plans as needed
        ]);
        console.log("Plan created successfully");
    }
    catch (error) {
        console.error(error);
        console.log("Error creating plan")
    }
}

module.exports = {
    checkSubscriptionPlanORCreate
}