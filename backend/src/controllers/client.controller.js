const clientService = require('../services/client.service');
const asyncHandler = require('../utils/asyncHandler');

const getAllClients = asyncHandler(async (req, res) => {
    const clients = await clientService.getAllClients();

    res.json({
        success: true,
        data: clients
    });
});

const getClientById = asyncHandler(async (req, res) => {
    const client = await clientService.getClientById(req.params.id);

    res.json({
        success: true,
        data: client
    });
});

const createClient = asyncHandler(async (req, res) => {
    const client = await clientService.createClient(req.body);

    res.status(201).json({
        success: true,
        data: client,
        message: 'Client created successfully'
    });
});



const updateClient = asyncHandler(async (req, res) => {
    const client = await clientService.updateClient(req.params.id, req.body);

    res.json({
        success: true,
        data: client,
        message: 'Client updated successfully'
    });
});


const deleteClient = asyncHandler(async (req, res) => {
    const client = await clientService.deleteClient(req.params.id);

    res.json({
        success: true,
        data: client,
        message: 'Client deactivated successfully'
    });
});

const activateClient = asyncHandler(async (req, res) => {
    const client = await clientService.activateClient(req.params.id);

    res.json({
        success: true,
        data: client,
        message: 'Client activated successfully'
    });
});

module.exports = {
    getAllClients,
    getClientById,
    createClient,
    updateClient,
    deleteClient,
    activateClient
};

