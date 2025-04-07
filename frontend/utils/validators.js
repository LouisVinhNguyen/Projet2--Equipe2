/**
 * Validates an email address format
 * 
 * @param {string} email - The email address to validate
 * @returns {boolean} True if the email format is valid, false otherwise
 */
function validateEmail(email) {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailPattern.test(email);
}

/**
 * Validates a telephone number format
 * Accepts various formats including international codes
 * 
 * @param {string} telephone - The telephone number to validate
 * @returns {boolean} True if the telephone format is valid, false otherwise
 */
function validateTelephone(telephone) {
  const phonePattern = /^(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}$/;
  return phonePattern.test(telephone);
}

// Export for browser usage
export { validateEmail, validateTelephone };