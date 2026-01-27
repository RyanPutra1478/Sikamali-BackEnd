const UserModel = require('../models/userModel');
const bcrypt = require('bcryptjs');

const UserService = {
    getUserByUsername: async (username) => {
        return await UserModel.getByUsername(username);
    },

    getUserById: async (id) => {
        return await UserModel.getById(id);
    },

    getAllUsers: async () => {
        return await UserModel.getAll();
    },

    registerUser: async (userData) => {
        const RoleModel = require('../models/roleModel');
        const data = { ...userData };
        const { password, role, roleName } = data;

        // 1. Hash password
        const salt = await bcrypt.genSalt(10);
        data.password = await bcrypt.hash(password, salt);

        // 2. Handle Role Mapping (if name provided instead of ID)
        const roleToMap = roleName || role;
        if (roleToMap && !data.role_id) {
            const roleObj = await RoleModel.getByName(roleToMap);
            if (roleObj) {
                data.role_id = roleObj.id;
            }
        }

        // Remove temporary helper fields so they don't cause DB error
        delete data.role;
        delete data.roleName;

        return await UserModel.create(data);
    },

    updateUser: async (id, userData) => {
        const data = { ...userData };
        if (data.password) {
            const salt = await bcrypt.genSalt(10);
            data.password = await bcrypt.hash(data.password, salt);
        }
        return await UserModel.update(id, data);
    },

    deleteUser: async (id) => {
        return await UserModel.delete(id);
    },

    updatePassword: async (userId, newPassword) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        return await UserModel.update(userId, {
            password: hashedPassword,
            must_change_password: 0
        });
    },

    validatePassword: async (inputPassword, storedPassword) => {
        return await bcrypt.compare(inputPassword, storedPassword);
    }
};

module.exports = UserService;
