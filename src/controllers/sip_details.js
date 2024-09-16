const SIP_Details = require('../models/SIP_Details');

const getSIPInstallments = async (req, res) => {
    try {
        const { sip_id } = req.params;
        const installments = await SIP_Details.findAll({ where: { sip_id } });
        res.status(200).json(installments);
    } catch (error) {
        console.error("Error fetching SIP installments:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const updateSIPInstallmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const installment = await SIP_Details.findOne({ where: { id } });
        if (!installment) {
            return res.status(404).json({ message: "Installment not found" });
        }

        installment.status = status;
        await installment.save();

        res.status(200).json({ message: "Installment status updated successfully", installment });
    } catch (error) {
        console.error("Error updating installment status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    getSIPInstallments,
    updateSIPInstallmentStatus
};
