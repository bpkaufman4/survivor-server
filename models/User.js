const { Model, DataTypes } = require('sequelize');

const sequelize = require('../config/connection');

const bcrypt = require('bcrypt');

class User extends Model {
    checkPassword(loginPw) {
        return bcrypt.compareSync(loginPw, this.pwd);
    }

    checkVerificationCode(code) {
        return this.verificationCode === code;
    }
};


User.init(
    {
        userId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        pwd: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [4]
            }
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true, // Allow null for existing users
            validate: {
                isEmail: {
                    msg: 'Must be a valid email address'
                }
            }
        },
        emailVerified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        verificationCode: {
            type: DataTypes.INTEGER,
            defaultValue: Math.floor(100000 + Math.random() * 900000)
        },
        emailOptIn: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        emailPreferences: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: {
                draftNotifications: true,
                latestUpdates: true,
                pollReminders: true
            }
        },
        userType: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'USER'
        }
    },
    {
        hooks: {
            async beforeCreate(newUserData) {
                if (newUserData.pwd) {
                    newUserData.pwd = await bcrypt.hash(newUserData.pwd, 10);
                }
                return newUserData;
            },
            async beforeUpdate(newUserData) {
                // Only hash password if it's being updated and is not empty
                if (newUserData.pwd && newUserData.changed('pwd')) {
                    newUserData.pwd = await bcrypt.hash(newUserData.pwd, 10);
                }
                return newUserData;
            }
        },
        indexes:[
            {
                name: 'userAK1',
                unique: true,
                fields: ['username']
            }
        ],
        sequelize,
        timestamps: true,
        createdAt: 'created',
        updatedAt: 'updated',
        freezeTableName: true,
        underscored: false,
        modelName: 'user',
        paranoid: false
    }
);

module.exports = User;