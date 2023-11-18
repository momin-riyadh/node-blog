const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
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

// HOOK
db.models.User.beforeCreate(async (user, options) => {
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
});

// ASSOXIATION
db.models.User.hasMany(db.models.Token, {
  foreignKey: "user_id",
  as: "tokens",
  onDelete: "CASCADE",
});
db.models.Token.belongsTo(db.models.User, { foreignKey: "user_id" });

module.exports = db;
