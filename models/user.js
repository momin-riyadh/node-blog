module.exports = (sequelize, DataTypes) => {
  return sequelize.define("User", {
    user_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },

    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    full_name: {
      type: DataTypes.VIRTUAL,

      get() {
        return `${this.first_name} ${this.last_name}`;
      },

      set() {
        throw new Error(
          "Oops! 'full_name' is auto-generated and cannot be directly set. Set them individually, and we'll handle the rest."
        );
      },
    },

    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },

    hash_password: {
      type: DataTypes.STRING,
      allowNull: false,

      set() {
        throw new Error(
          "Please use the 'password' field to set your password."
        );
      },
    },

    password: {
      type: DataTypes.VIRTUAL,

      set(value) {
        this.setDataValue("password", value); // need set the data value, otherwise it won't be validated. It stored plainly in the password field so it can be validated, but is never stored in the DB.
        this.setDataValue("hash_password", "hash password");
      },
    },

    role: {
      type: DataTypes.ENUM("admin", "user"),
      defaultValue: "user",
      allowNull: false,
    },

    avatar: {
      type: DataTypes.BLOB,
    },
  });
};
