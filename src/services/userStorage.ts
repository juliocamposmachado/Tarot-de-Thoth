/**
 * UserStorage Service
 * 
 * This service provides functions to manage user information (name and birth date)
 * in the browser's localStorage, enabling persistent user data between visits.
 */

// Interface for user data
export interface UserData {
  name: string;
  birthDate: string; // ISO date string format
  lastVisit?: string; // ISO date string format
}

// Key used for storing user data in localStorage
const USER_DATA_KEY = 'thoth_tarot_user_data';

/**
 * Save user data to localStorage
 * 
 * @param userData The user data object to save
 * @returns boolean indicating success or failure
 */
export const saveUserData = (userData: UserData): boolean => {
  try {
    // Update the last visit timestamp
    const dataToSave: UserData = {
      ...userData,
      lastVisit: new Date().toISOString()
    };
    
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(dataToSave));
    return true;
  } catch (error) {
    console.error('Error saving user data to localStorage:', error);
    return false;
  }
};

/**
 * Retrieve user data from localStorage
 * 
 * @returns The user data object or null if not found or on error
 */
export const getUserData = (): UserData | null => {
  try {
    const userData = localStorage.getItem(USER_DATA_KEY);
    if (!userData) {
      return null;
    }
    
    return JSON.parse(userData) as UserData;
  } catch (error) {
    console.error('Error retrieving user data from localStorage:', error);
    return null;
  }
};

/**
 * Check if user data exists in localStorage
 * 
 * @returns boolean indicating if user data exists
 */
export const hasUserData = (): boolean => {
  try {
    return localStorage.getItem(USER_DATA_KEY) !== null;
  } catch (error) {
    console.error('Error checking for user data in localStorage:', error);
    return false;
  }
};

/**
 * Clear user data from localStorage
 * 
 * @returns boolean indicating success or failure
 */
export const clearUserData = (): boolean => {
  try {
    localStorage.removeItem(USER_DATA_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing user data from localStorage:', error);
    return false;
  }
};

/**
 * Update specific user data fields
 * 
 * @param partialData Partial user data to update
 * @returns boolean indicating success or failure
 */
export const updateUserData = (partialData: Partial<UserData>): boolean => {
  try {
    const currentData = getUserData();
    if (!currentData) {
      // If no existing data, create new entry with partial data
      return saveUserData(partialData as UserData);
    }
    
    // Merge existing data with new partial data
    return saveUserData({
      ...currentData,
      ...partialData
    });
  } catch (error) {
    console.error('Error updating user data in localStorage:', error);
    return false;
  }
};
