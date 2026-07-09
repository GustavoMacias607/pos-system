const USER_ROLES = Object.freeze({
    ADMIN: 'ADMIN',
    EMPLOYEE: 'EMPLOYEE',
    SUPERVISOR: 'SUPERVISOR',
});

const USER_ROLE_VALUES = Object.values(USER_ROLES);

module.exports = {
    USER_ROLES,
    USER_ROLE_VALUES,
};