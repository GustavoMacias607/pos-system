const cashRegisterRepository = require('../repositories/cashRegister.repository');
const AppError = require('../errors/AppError');

const {
    validateCreateCashRegisterInput,
    validateUpdateCashRegisterInput,
    validateCashRegisterIdParam
} = require('../validators/cashRegister.validator');

const getAllCashRegisters = async () => {
    return cashRegisterRepository.findAll();
};

const getCashRegisterById = async (id) => {
    validateCashRegisterIdParam(String(id));

    const cashRegister = await cashRegisterRepository.findById(id);

    if (!cashRegister) {
        throw new AppError('Cash register not found', 404);
    }

    return cashRegister;
};

const createCashRegister = async (data) => {
    validateCreateCashRegisterInput(data);

    const name = data.name.trim();
    const location = data.location === undefined || data.location === null
        ? null
        : data.location.trim();

    const existingRegister = await cashRegisterRepository.findByName(name);

    if (existingRegister) {
        throw new AppError('Cash register name already exists', 409);
    }

    return cashRegisterRepository.create({ name, location });
};

const updateCashRegister = async (id, data) => {
    validateCashRegisterIdParam(String(id));
    validateUpdateCashRegisterInput(data);

    const existingRegister = await cashRegisterRepository.findById(id);

    if (!existingRegister) {
        throw new AppError('Cash register not found', 404);
    }

    let name = existingRegister.name;
    let location = existingRegister.location;

    if (data.name !== undefined) {
        name = data.name.trim();

        const registerWithName = await cashRegisterRepository.findByName(name);

        if (registerWithName && String(registerWithName.id) !== String(existingRegister.id)) {
            throw new AppError('Cash register name already exists', 409);
        }
    }

    if (data.location !== undefined) {
        location = data.location === null ? null : data.location.trim();
    }

    return cashRegisterRepository.update(id, { name, location });
};

const deactivateCashRegister = async (id) => {
    validateCashRegisterIdParam(String(id));

    const existingRegister = await cashRegisterRepository.findById(id);

    if (!existingRegister) {
        throw new AppError('Cash register not found', 404);
    }

    const cashRegister = await cashRegisterRepository.deactivate(id);

    if (!cashRegister) {
        throw new AppError('Cash register cannot be deactivated while it has an open session', 409);
    }

    return cashRegister;
};

const activateCashRegister = async (id) => {
    validateCashRegisterIdParam(String(id));

    const existingRegister = await cashRegisterRepository.findById(id);

    if (!existingRegister) {
        throw new AppError('Cash register not found', 404);
    }

    return cashRegisterRepository.activate(id);
};

module.exports = {
    getAllCashRegisters,
    getCashRegisterById,
    createCashRegister,
    updateCashRegister,
    deactivateCashRegister,
    activateCashRegister
};