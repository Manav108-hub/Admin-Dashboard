import { 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc
  } from 'firebase/firestore';
  import { db } from '../firebase/config';
  import { UserProfile, UserProfileFormData } from '../types/profile/user';
  
  export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
      const userRef = doc(db, 'userProfiles', uid);
      const userSnap = await getDoc(userRef);
  
      if (userSnap.exists()) {
        return userSnap.data() as UserProfile;
      } else {
        console.log('No profile found for this user');
        return null;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  };
  
  export const createUserProfile = async (
    uid: string, 
    email: string, 
    displayName: string = ''
  ): Promise<void> => {
    try {
      const userRef = doc(db, 'userProfiles', uid);
      const now = new Date().toISOString();
      
      const newUserProfile: UserProfile = {
        uid,
        email,
        displayName: displayName || '',
        phoneNumber: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
        dateOfBirth: '',
        bio: '',
        occupation: '',
        company: '',
        createdAt: now,
        updatedAt: now
      };
  
      await setDoc(userRef, newUserProfile);
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  };
  
  export const updateUserProfile = async (
    uid: string, 
    profileData: UserProfileFormData
  ): Promise<void> => {
    try {
      const userRef = doc(db, 'userProfiles', uid);
      
      // Format the data for Firestore
      const updateData = {
        displayName: profileData.displayName,
        phoneNumber: profileData.phoneNumber,
        address: {
          street: profileData.street,
          city: profileData.city,
          state: profileData.state,
          zipCode: profileData.zipCode,
          country: profileData.country,
        },
        dateOfBirth: profileData.dateOfBirth,
        bio: profileData.bio,
        occupation: profileData.occupation,
        company: profileData.company,
        updatedAt: new Date().toISOString()
      };
  
      await updateDoc(userRef, updateData);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };
  
  export const updateProfilePicture = async (
    uid: string,
    profilePictureUrl: string | null
  ): Promise<void> => {
    try {
      const userRef = doc(db, 'userProfiles', uid);
      
      await updateDoc(userRef, {
        profilePictureUrl: profilePictureUrl,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating profile picture:', error);
      throw error;
    }
  };