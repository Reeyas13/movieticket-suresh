
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get the public URL for an image path
 * @param {string} filename - The filename of the uploaded file
 * @returns {string} - The public URL for the image
 */
export const getImageUrl = (filename) => {
  // Construct URL based on your server config
  return `/uploads/products/${filename}`;
};

/**
 * Delete an image by its URL path
 * @param {string} imageUrl - The URL of the image to delete
 * @returns {Promise<boolean>} - Success status
 */
export const deleteImage = async (imageUrl) => {
  try {
    // Extract the filename from the URL
    const filename = path.basename(imageUrl);
    const filepath = path.join(__dirname, '../uploads/products', filename);
    
    // Check if file exists before attempting to delete
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};

