const { Sequelize, DataTypes } = require("sequelize");

const dbConfig = require("../config/db");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  logging: false,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});

const db = {};
db.models = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.models.User = require("./user")(sequelize, DataTypes);
db.models.Token = require("./token")(sequelize, DataTypes);

db.models.User.hasMany(db.models.Token, { as: "tokens", onDelete: "CASCADE" });
db.models.Token.belongsTo(db.models.User, { foreignKey: "user_id" });

module.exports = db;
