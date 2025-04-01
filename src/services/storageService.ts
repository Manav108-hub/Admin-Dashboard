// firebaseStorageService.ts
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { auth } from '../firebase/config';

// Initialize Firebase Storage from your existing app
const storage = getStorage();

/**
 * Upload a file to Firebase Storage
 * @param file File to upload
 * @param folder Optional folder path
 * @returns URL of the uploaded file
 */
export const uploadImage = async (file: File, folder: string = 'profile-pictures'): Promise<string> => {
  try {
    console.log('Starting file upload to Firebase Storage...');
    
    // Generate a unique file name
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    
    // Optional: Include user ID in path if user is authenticated
    const userId = auth.currentUser?.uid;
    const filePath = userId 
      ? `${folder}/${userId}/${uniqueFileName}` 
      : `${folder}/${uniqueFileName}`;
    
    console.log(`Generated unique file path: ${filePath}`);
    
    // Create a reference to the file location
    const storageRef = ref(storage, filePath);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    console.log('Firebase upload successful:', snapshot.metadata.name);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('File available at:', downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading to Firebase Storage:', error);
    throw error;
  }
};

/**
 * Delete a file from Firebase Storage
 * @param fileUrl URL of the file to delete
 */
export const deleteImage = async (fileUrl: string): Promise<void> => {
  try {
    if (!fileUrl) {
      console.warn('No file URL provided for deletion');
      return;
    }
    
    // Extract the file path from the URL
    // Firebase Storage URLs look like: https://firebasestorage.googleapis.com/v0/b/[bucket]/o/[encoded-file-path]?token=...
    
    // Parse the URL to extract the file path
    const url = new URL(fileUrl);
    const fullPath = decodeURIComponent(url.pathname.split('/o/')[1].split('?')[0]);
    
    console.log(`Attempting to delete file: ${fullPath}`);
    
    // Create a reference to the file
    const fileRef = ref(storage, fullPath);
    
    // Delete the file
    await deleteObject(fileRef);
    console.log('File deleted successfully');
  } catch (error) {
    console.error('Error deleting file from Firebase Storage:', error);
    throw error;
  }
};