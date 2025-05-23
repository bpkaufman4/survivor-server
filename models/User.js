const { Model, DataTypes } = require('sequelize');

const sequelize = require('../config/connection');

const bcrypt = require('bcrypt');

class User extends Model {
    checkPassword(loginPw) {
        return bcrypt.compareSync(loginPw, this.pwd);
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
        userType: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'USER'
        }
    },
    {
        hooks: {
            async beforeCreate(newUserData) {
                newUserData.pwd = await bcrypt.hash(newUserData.pwd, 10);
                return newUserData;
            },
            async beforeUpdate(newUserData) {
                newUserData.pwd = await bcrypt.hash(newUserData.pwd, 10);
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