const { Model, DataTypes } = require('sequelize');

const sequelize = require('../config/connection');

class UserFcmToken extends Model {}

UserFcmToken.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'user',
                key: 'userId'
            }
        },
        fcmToken: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true // Prevent duplicate tokens
        },
        deviceInfo: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: {}
            // Can store: { userAgent, platform, browser, lastSeen, etc. }
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    },
    {
        sequelize,
        timestamps: true,
        createdAt: 'created',
        updatedAt: 'updated',
        freezeTableName: true,
        underscored: false,
        modelName: 'userFcmToken',
        paranoid: false,
        indexes: [
            {
                name: 'userFcmTokenAK1',
                unique: true,
                fields: ['fcmToken']
            },
            {
                name: 'userFcmTokenIdx1',
                fields: ['userId']
            },
            {
                name: 'userFcmTokenIdx2',
                fields: ['userId', 'isActive']
            }
        ]
    }
);

module.exports = UserFcmToken;
