const pool = require('../config/database');
const cashRegisterSessionRepository = require('../repositories/cashRegisterSession.repository');
const cashRegisterRepository = require('../repositories/cashRegister.repository');
const AppError = require('../errors/AppError');
const {
    validateOpenSessionInput,
    validateCloseSessionInput,
    validateCashSessionIdParam
} = require('../validators/cashRegisterSession.validator');
const { USER_ROLES } = require('../constants/userRoles');


const validateAuthenticatedUserId = (userId) => {
    if (!Number.isInteger(userId) || userId <= 0) {
        throw new AppError('Authenticated user ID is invalid', 400);
    }
};

const getAllSessions = async () => {
    return cashRegisterSessionRepository.findAll();
};

const getSessionById = async (id) => {
    validateCashSessionIdParam(String(id));
    const session = await cashRegisterSessionRepository.findById(id);
    if (!session) {
        throw new AppError('Cash session not found', 404);
    }
    return session;
};

const getCurrentSession = async (userId) => {
    validateAuthenticatedUserId(userId);

    const sessionOpenedByUser = await cashRegisterSessionRepository.findOpenByUserId(userId);
    if (!sessionOpenedByUser) {
        throw new AppError('Cash session not found', 404);
    }
    return sessionOpenedByUser;
};


const openSession = async (data, userId) => {
    validateOpenSessionInput(data);
    validateAuthenticatedUserId(userId);

    const openingNotes = data.openingNotes === undefined || data.openingNotes === null
        ? null
        : data.openingNotes.trim();

    const cashRegister = await cashRegisterRepository.findById(data.cashRegisterId);

    if (!cashRegister) {
        throw new AppError('Cash register not found', 404);
    }

    if (!cashRegister.active) {
        throw new AppError('Cash register is inactive', 409);
    }

    const registerOpenSession =
        await cashRegisterSessionRepository.findOpenByRegisterId(data.cashRegisterId);

    if (registerOpenSession) {
        throw new AppError('Cash register already has an open session', 409);
    }

    const userOpenSession =
        await cashRegisterSessionRepository.findOpenByUserId(userId);

    if (userOpenSession) {
        throw new AppError('User already has an open cash session', 409);
    }

    const client = await pool.connect();
    let createdSession;

    try {
        await client.query('BEGIN');

        createdSession = await cashRegisterSessionRepository.create(client, {
            cashRegisterId: data.cashRegisterId,
            openedByUserId: userId,
            openingAmount: data.openingAmount,
            openingNotes
        });

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');

        if (
            error.code === '23505'
            && error.constraint === 'cash_register_sessions_register_open_unique_idx'
        ) {
            throw new AppError('Cash register already has an open session', 409);
        }

        if (
            error.code === '23505'
            && error.constraint === 'cash_register_sessions_user_open_unique_idx'
        ) {
            throw new AppError('User already has an open cash session', 409);
        }

        throw error;
    } finally {
        client.release();
    }

    return getSessionById(createdSession.id);
};

const toCents = (value) => {
    return Math.round((Number(value) + Number.EPSILON) * 100);
};

const fromCents = (value) => {
    return value / 100;
};

const closeSession = async (id, data, authenticatedUser) => {
    validateCashSessionIdParam(String(id));
    validateCloseSessionInput(data);

    if (!authenticatedUser || typeof authenticatedUser !== 'object') {
        throw new AppError('Authenticated user is required', 401);
    }

    validateAuthenticatedUserId(authenticatedUser.id);

    if (!Object.values(USER_ROLES).includes(authenticatedUser.role)) {
        throw new AppError('Authenticated user role is invalid', 403);
    }

    const closingNotes =
        data.closingNotes === undefined
            || data.closingNotes === null
            ? null
            : data.closingNotes.trim();

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const existingSession =
            await cashRegisterSessionRepository.findByIdForUpdate(
                client,
                id
            );

        if (!existingSession) {
            throw new AppError('Cash session not found', 404);
        }

        if (existingSession.status === 'CLOSED') {
            throw new AppError(
                'Cash session is already closed',
                409
            );
        }

        if (
            authenticatedUser.role === USER_ROLES.EMPLOYEE
            && Number(existingSession.opened_by_user_id)
            !== Number(authenticatedUser.id)
        ) {
            throw new AppError(
                'You can only close your own cash session',
                403
            );
        }

        const expectedAmountValue =
            await cashRegisterSessionRepository.calculateExpectedAmount(
                client,
                id
            );

        const expectedAmountCents =
            toCents(expectedAmountValue);

        const closingAmountCents =
            toCents(data.closingAmount);

        const differenceAmountCents =
            closingAmountCents - expectedAmountCents;

        const expectedAmount =
            fromCents(expectedAmountCents);

        const closingAmount =
            fromCents(closingAmountCents);

        const differenceAmount =
            fromCents(differenceAmountCents);

        const closedSession =
            await cashRegisterSessionRepository.closeOpenSession(
                client,
                id,
                {
                    closedByUserId: authenticatedUser.id,
                    expectedAmount,
                    closingAmount,
                    differenceAmount,
                    closingNotes
                }
            );

        if (!closedSession) {
            throw new AppError(
                'Cash session is already closed',
                409
            );
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }

    return getSessionById(id);
};

module.exports = {
    getAllSessions,
    getSessionById,
    getCurrentSession,
    openSession,
    closeSession
};