const supplierRepository = require('../repositories/supplier.repository');
const AppError = require('../errors/AppError');

const getAllSuppliers = async () => {
    return supplierRepository.findAll();
};

const getSupplierById = async (id) => {
    const supplier = await supplierRepository.findById(id);

    if (!supplier) {
        throw new AppError('Supplier not found', 404);
    }

    return supplier;
};

const createSupplier = async (data) => {
    const supplierData = {
        name: data.name.trim(),
        contactName: data.contactName?.trim() ?? null,
        email: data.email?.trim() ?? null,
        phone: data.phone?.trim() ?? null,
        address: data.address?.trim() ?? null
    };

    if (supplierData.email !== null) {
        const existingSupplier = await supplierRepository.findByEmail(
            supplierData.email
        );

        if (existingSupplier) {
            throw new AppError('Supplier email already exists', 409);
        }
    }

    return supplierRepository.create(supplierData);
};

const updateSupplier = async (id, data) => {
    const existingSupplier = await supplierRepository.findById(id);

    if (!existingSupplier) {
        throw new AppError('Supplier not found', 404);
    }

    if (data.email !== undefined && data.email !== null) {
        const normalizedEmail = data.email.trim();

        const supplierWithEmail = await supplierRepository.findByEmail(
            normalizedEmail
        );

        if (
            supplierWithEmail &&
            supplierWithEmail.id !== existingSupplier.id
        ) {
            throw new AppError('Supplier email already exists', 409);
        }
    }

    const updatedSupplierData = {
        name: data.name !== undefined
            ? data.name.trim()
            : existingSupplier.name,

        contactName: data.contactName !== undefined
            ? data.contactName === null
                ? null
                : data.contactName.trim()
            : existingSupplier.contact_name,

        email: data.email !== undefined
            ? data.email === null
                ? null
                : data.email.trim()
            : existingSupplier.email,

        phone: data.phone !== undefined
            ? data.phone === null
                ? null
                : data.phone.trim()
            : existingSupplier.phone,

        address: data.address !== undefined
            ? data.address === null
                ? null
                : data.address.trim()
            : existingSupplier.address
    };

    return supplierRepository.update(id, updatedSupplierData);
};

const deleteSupplier = async (id) => {
    const supplier = await supplierRepository.findById(id);

    if (!supplier) {
        throw new AppError('Supplier not found', 404);
    }

    return supplierRepository.deactivate(id);
};

const activateSupplier = async (id) => {
    const supplier = await supplierRepository.findById(id);

    if (!supplier) {
        throw new AppError('Supplier not found', 404);
    }

    return supplierRepository.activate(id);
};

module.exports = {
    getAllSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    activateSupplier
};
