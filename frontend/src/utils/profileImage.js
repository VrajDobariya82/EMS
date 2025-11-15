// Utility functions for profile images

/**
 * Generate a profile image URL using UI Avatars API
 * @param {string} name - Full name of the person
 * @param {number} size - Size of the image (default: 200)
 * @returns {string} - URL to the generated avatar
 */
export const generateAvatarUrl = (name, size = 200) => {
  const encodedName = encodeURIComponent(name || 'User');
  return `https://ui-avatars.com/api/?name=${encodedName}&size=${size}&background=3B82F6&color=ffffff&bold=true&format=png`;
};

/**
 * Generate a random dummy profile image from a pool of professional avatars
 * @param {string} name - Name to use for consistent selection
 * @param {string} gender - Optional: 'male' or 'female' for gender-specific avatars
 * @returns {string} - URL to a dummy profile image
 */
export const getDummyProfileImage = (name, gender = null) => {
  // Use DiceBear Avatars API for professional dummy images
  const style = gender === 'female' ? 'avataaars' : 'avataaars';
  const seed = name ? encodeURIComponent(name) : Math.random().toString(36).substring(7);
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=b6e3ff&radius=50`;
};

/**
 * Convert file to base64 data URL for preview/upload
 * @param {File} file - Image file to convert
 * @returns {Promise<string>} - Base64 data URL
 */
export const fileToDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Validate image file
 * @param {File} file - File to validate
 * @returns {object} - { valid: boolean, error: string }
 */
export const validateImageFile = (file) => {
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Please select a valid image file (JPEG, PNG, GIF, or WebP)' };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return { valid: false, error: 'Image size must be less than 5MB' };
  }

  return { valid: true, error: null };
};

