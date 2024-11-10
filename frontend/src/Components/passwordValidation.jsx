const passwordValidation = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    let errorMessage = '';
    if (password.length < minLength) {
      errorMessage = `Password must be at least ${minLength} characters.`;
    } else if (!hasUpperCase) {
      errorMessage = 'Password must contain at least one uppercase letter.';
    } else if (!hasLowerCase) {
      errorMessage = 'Password must contain at least one lowercase letter.';
    } else if (!hasNumber) {
      errorMessage = 'Password must contain at least one number.';
    }

    return errorMessage;
  };
  export default passwordValidation