const pool = require('../config/database');
const cashMovementRepository = require(
    '../repositories/cashMovement.repository'
);
const cashRegisterSessionRepository = require(
    '../repositories/cashRegisterSession.repository'
);
const AppError = require('../errors/AppError');
const { USER_ROLES } = require('../constants/userRoles');

const createCashMovement = async (data, authenticatedUser) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const session =
            await cashRegisterSessionRepository.findByIdForUpdate(
                client,
                data.cashSessionId
            );

        if (!session) {
            throw new AppError('Cash register session not found', 404);
        }

        if (session.status !== 'OPEN') {
            throw new AppError(
                'Cash movements cannot be added to a closed session',
                409
            );
        }

        if (
            authenticatedUser.role === USER_ROLES.EMPLOYEE &&
            Number(session.opened_by_user_id) !==
            Number(authenticatedUser.id)
        ) {
            throw new AppError(
                'You cannot add movements to another user\'s session',
                403
            );
        }

        const movement = await cashMovementRepository.create(client, {
            ...data,
            createdByUserId: authenticatedUser.id
        });

        await client.query('COMMIT');

        return movement;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const getMovementsBySessionId = async (cashSessionId) => {
    const session = await cashRegisterSessionRepository.findById(
        cashSessionId
    );

    if (!session) {
        throw new AppError('Cash register session not found', 404);
    }

    return cashMovementRepository.findBySessionId(cashSessionId);
};

module.exports = {
    createCashMovement,
    getMovementsBySessionId
};