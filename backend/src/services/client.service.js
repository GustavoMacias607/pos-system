const clientRepository = require('../repositories/client.repository');
const AppError = require('../errors/AppError');

const getAllClients = async () => {
    return clientRepository.findAll();
}

const getClientById = async (id) => {
    const client = await clientRepository.findById(id);
    if (!client) {
        throw new AppError('Client not found', 404);
    }
    return client;
}

const createClient = async (data) => {
    if (data.email) {
        const existClient = await clientRepository.findByEmail(data.email)
        if (existClient) {
            throw new AppError('Client email already exists', 409);
        }
    }

    return clientRepository.create(data);
}

const updateClient = async (id, data) => {
    const existingClient = await clientRepository.findById(id);
    if (!existingClient) {
        throw new AppError('Client not found', 404);
    }

    if (data.email !== undefined) {
        const clientWithEmail = await clientRepository.findByEmail(data.email);

        if (clientWithEmail && clientWithEmail.id !== existingClient.id) {
            throw new AppError('Client email already exists', 409);
        }
    }
    const updatedClientData = {
        name: data.name ?? existingClient.name,
        email: data.email ?? existingClient.email,
        phone: data.phone ?? existingClient.phone,
        address: data.address ?? existingClient.address
    };

    return clientRepository.update(id, updatedClientData);
}

const deleteClient = async (id) => {
    const client = await clientRepository.findById(id);
    if (!client) {
        throw new AppError('Client not found', 404);
    }
    return clientRepository.deactivate(id)
}

const activateClient = async (id) => {
    const client = await clientRepository.findById(id);
    if (!client) {
        throw new AppError('Client not found', 404);
    }
    return clientRepository.activate(id)
}

module.exports = {
    getAllClients,
    getClientById,
    createClient,
    updateClient,
    deleteClient,
    activateClient
};