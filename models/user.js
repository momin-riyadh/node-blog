module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "User",
    {
      user_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      first_name: {
        type: DataTypes.STRING,
        allowNull: false,

        validate: {
          notNull: {
            msg: "First name field is required.",
          },

          notEmpty: {
            msg: "First name field is required.",
          },
        },
      },

      last_name: {
        type: DataTypes.STRING,
        allowNull: false,

        validate: {
          notNull: {
            msg: "Last name field is required.",
          },
          notEmpty: {
            msg: "Last name field is required.",
          },
        },
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
        unique: {
          args: true,
          msg: "User already exists. Please choose a different one.",
        },
        allowNull: false,

        validate: {
          notNull: {
            msg: "Email field is required.",
          },

          notEmpty: {
            msg: "Email field is required.",
          },

          isEmail: {
            msg: "Your entered email is not valid",
          },
        },
      },

      hash_password: {
        type: DataTypes.STRING,
        allowNull: false,

        set() {
          throw new Error("Please use the 'password' field to set password.");
        },
      },

      password: {
        type: DataTypes.VIRTUAL,
        allowNull: false,

        set(value) {
          this.setDataValue("password", value); // need set the data value, otherwise it won't be validated. It stored plainly in the password field so it can be validated, but is never stored in the DB.

          this.setDataValue("hash_password", value);
        },

        validate: {
          notNull: {
            msg: "Password field is required.",
          },

          notEmpty: {
            msg: "Password field is required.",
          },

          len: {
            args: [8, 16],
            msg: "Password must be between 8 and 16 characters.",
          },

          isStrongPassword(value) {
            if (
              !/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).*$/.test(
                value
              )
            ) {
              throw new Error(
                "Password must contain at least one digit, one lowercase letter, one uppercase letter, one special character, and no spaces."
              );
            }
          },
        },
      },

      role: {
        type: DataTypes.ENUM("superadmin", "admin", "user"),
        defaultValue: "user",
        allowNull: false,
        validate: {
          isIn: {
            args: [["superadmin", "admin", "user"]],
            msg: "Role must be one of: user, superadmin and admin",
          },
        },
      },

      avatar: {
        type: DataTypes.BLOB,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
};
