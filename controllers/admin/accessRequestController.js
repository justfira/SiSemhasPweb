// controllers/accessRequestController.js
const accessRequestService = require('../../services/accessRequestService');

const getAccessRequests = async (req, res) => {
    try {
        const requests = await accessRequestService.getPendingAccessRequests();
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const acceptAccessRequest = async (req, res) => {
    const nim = parseInt(req.params.nim); // Ambil NIM dari parameter URL

    if (isNaN(nim)) {
        return res.status(400).json({ message: 'Invalid NIM provided.' });
    }

    try {
        const result = await accessRequestService.acceptAccessRequest(nim);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const rejectAccessRequest = async (req, res) => {
    const nim = parseInt(req.params.nim); // Ambil NIM dari parameter URL

    if (isNaN(nim)) {
        return res.status(400).json({ message: 'Invalid NIM provided.' });
    }

    try {
        const result = await accessRequestService.rejectAccessRequest(nim);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAccessRequests,
    acceptAccessRequest,
    rejectAccessRequest
};