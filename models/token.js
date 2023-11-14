module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Token", {
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
};
