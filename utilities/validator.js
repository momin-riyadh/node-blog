module.exports.isEmail = (email) => {
  const emailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

  return emailFormat.test(email);
};

module.exports.isStrongPassword = (password) => {
  const passwordFormat =
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).*$/;
  // contain at least one digit, one lowercase letter, one uppercase letter, one special character, and no spaces.

  return passwordFormat.test(password);
};
