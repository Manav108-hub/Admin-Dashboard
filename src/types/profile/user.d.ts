export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  phoneNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  dateOfBirth: string; // ISO date string format
  bio: string;
  occupation: string;
  company: string;
  profilePictureUrl?: string;
  createdAt: string; // ISO date string format
  updatedAt: string; // ISO date string format
}

export interface UserProfileFormData {
  displayName: string;
  phoneNumber: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  dateOfBirth: string;
  bio: string;
  occupation: string;
  company: string;
  profilePictureUrl?: string | null;
}