import React, { useEffect, useState } from "react";
import { Card, Button, Spinner } from "flowbite-react";
import { useAuth } from "src/contexts/AuthContext";
import { getUserProfile, updateUserProfile, createUserProfile, updateProfilePicture } from "../../services/userProfileServices";
import { uploadImage, deleteImage } from "../../services/storageService";
import { UserProfile, UserProfileFormData } from "../../types/profile/user";
import { FaEdit, FaCamera, FaUserCircle, FaTrash } from "react-icons/fa";

const Profile: React.FC = () => {
  const { currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserProfileFormData>({
    displayName: '',
    phoneNumber: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    dateOfBirth: '',
    bio: '',
    occupation: '',
    company: '',
    profilePictureUrl: null,
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUserProfile();
  }, [currentUser]);

  const fetchUserProfile = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      let profile = await getUserProfile(currentUser.uid);

      if (!profile) {
        await createUserProfile(
          currentUser.uid,
          currentUser.email || '',
          currentUser.displayName || ''
        );
        profile = await getUserProfile(currentUser.uid);
      }

      setUserProfile(profile);

      if (profile) {
        setFormData({
          displayName: profile.displayName || '',
          phoneNumber: profile.phoneNumber || '',
          street: profile.address.street || '',
          city: profile.address.city || '',
          state: profile.address.state || '',
          zipCode: profile.address.zipCode || '',
          country: profile.address.country || '',
          dateOfBirth: profile.dateOfBirth || '',
          bio: profile.bio || '',
          occupation: profile.occupation || '',
          company: profile.company || '',
          profilePictureUrl: profile.profilePictureUrl || null,
        });

        if (!isProfileComplete(profile)) {
          setIsEditing(true);
        }
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const isProfileComplete = (profile: UserProfile | null): boolean => {
    if (!profile) return false;
    return !!(
      profile.displayName &&
      profile.phoneNumber &&
      profile.address.street &&
      profile.address.city &&
      profile.address.state &&
      profile.address.zipCode &&
      profile.address.country
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile || !currentUser) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;

    if (!validTypes.includes(selectedFile.type)) {
      setUploadError('Please select a valid image file (JPEG, PNG, GIF, or WEBP)');
      return;
    }

    if (selectedFile.size > maxSize) {
      setUploadError('Image size must be less than 5MB');
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const imageUrl = await uploadImage(selectedFile);

      // Delete old image if it exists
      if (userProfile?.profilePictureUrl) {
        try {
          await deleteImage(userProfile.profilePictureUrl);
        } catch (err) {
          console.error('Failed to delete old image:', err);
          // Continue even if deletion fails
        }
      }

      await updateProfilePicture(currentUser.uid, imageUrl);

      setUserProfile(prev =>
        prev
          ? { ...prev, profilePictureUrl: imageUrl }
          : {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: formData.displayName || '',
              phoneNumber: formData.phoneNumber || '',
              address: {
                street: formData.street || '',
                city: formData.city || '',
                state: formData.state || '',
                zipCode: formData.zipCode || '',
                country: formData.country || '',
              },
              dateOfBirth: formData.dateOfBirth || '',
              bio: formData.bio || '',
              occupation: formData.occupation || '',
              company: formData.company || '',
              profilePictureUrl: imageUrl,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
      );

      setFormData(prev => ({ ...prev, profilePictureUrl: imageUrl }));
    } catch (err: any) {
      console.error('Profile picture upload failed:', err);
      setUploadError(err.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!currentUser) {
      setError('Not authenticated');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await updateUserProfile(currentUser.uid, formData);

      const updatedProfile: UserProfile = {
        uid: currentUser.uid,
        email: currentUser.email || '',
        createdAt: userProfile?.createdAt || new Date().toISOString(),
        profilePictureUrl: userProfile?.profilePictureUrl,
        displayName: formData.displayName,
        phoneNumber: formData.phoneNumber,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
        dateOfBirth: formData.dateOfBirth,
        bio: formData.bio,
        occupation: formData.occupation,
        company: formData.company,
        updatedAt: new Date().toISOString(),
      };

      setUserProfile(updatedProfile);
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveProfilePicture = async () => {
    if (!currentUser || !userProfile?.profilePictureUrl) return;

    try {
      setIsUploading(true);

      // Delete the image from Firebase Storage
      await deleteImage(userProfile.profilePictureUrl);
      await updateProfilePicture(currentUser.uid, null);

      setUserProfile(prev =>
        prev
          ? { ...prev, profilePictureUrl: undefined }
          : {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: formData.displayName || '',
              phoneNumber: formData.phoneNumber || '',
              address: {
                street: formData.street || '',
                city: formData.city || '',
                state: formData.state || '',
                zipCode: formData.zipCode || '',
                country: formData.country || '',
              },
              dateOfBirth: formData.dateOfBirth || '',
              bio: formData.bio || '',
              occupation: formData.occupation || '',
              company: formData.company || '',
              profilePictureUrl: undefined,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
      );

      setFormData(prev => ({ ...prev, profilePictureUrl: null }));
    } catch (err: any) {
      console.error('Failed to remove profile picture:', err);
      setUploadError(err.message || 'Failed to remove image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4">
      <Card>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-6">
          <div className="flex flex-col items-center">
            <div className="relative h-32 w-32 mb-4">
              <div className="h-full w-full rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                {userProfile?.profilePictureUrl ? (
                  <img
                    src={userProfile.profilePictureUrl}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FaUserCircle className="h-20 w-20 text-gray-400" />
                )}
              </div>
              {isUploading && (
                <div className="absolute inset-0 bg-gray-900 bg-opacity-50 rounded-full flex items-center justify-center">
                  <Spinner color="info" />
                </div>
              )}
            </div>
            {uploadError && (
              <div className="text-red-500 text-sm mb-2">{uploadError}</div>
            )}
            <div className="flex gap-2">
              <Button
                size="sm"
                color="primary"
                onClick={triggerFileInput}
                disabled={isUploading}
                className="flex items-center gap-1"
              >
                <FaCamera className="text-sm" />
                <span>{userProfile?.profilePictureUrl ? 'Change Photo' : 'Upload Photo'}</span>
              </Button>
              {userProfile?.profilePictureUrl && (
                <Button
                  size="sm"
                  color="failure"
                  onClick={handleRemoveProfilePicture}
                  disabled={isUploading}
                  className="flex items-center gap-1"
                >
                  <FaTrash className="text-sm" />
                  <span>Remove</span>
                </Button>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
            />
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">
                {userProfile?.displayName || currentUser?.email?.split('@')[0] || 'User Profile'}
              </h1>
              {!isEditing && (
                <Button
                  color="light"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2"
                >
                  <FaEdit />
                  Edit Profile
                </Button>
              )}
            </div>
            <p className="text-gray-500 mb-4">
              {userProfile?.email || currentUser?.email}
            </p>
            {!isProfileComplete(userProfile) && !isEditing && (
              <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Your profile is incomplete. Please add your personal details to complete your profile.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="border-t pt-6">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Personal Information</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">Full Name *</label>
                    <input
                      type="text"
                      id="displayName"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number *</label>
                    <input
                      type="text"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-6 pt-4 border-t">
                <h2 className="text-xl font-semibold">Address</h2>
                <div>
                  <label htmlFor="street" className="block text-sm font-medium text-gray-700">Street Address *</label>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter your street address"
                  />
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">City *</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Enter your city"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">State/Province *</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Enter your state or province"
                    />
                  </div>
                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">ZIP/Postal Code *</label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Enter your ZIP or postal code"
                    />
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country *</label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Enter your country"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-6 pt-4 border-t">
                <h2 className="text-xl font-semibold">Professional Information</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="occupation" className="block text-sm font-medium text-gray-700">Occupation</label>
                    <input
                      type="text"
                      id="occupation"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Enter your occupation"
                    />
                  </div>
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company</label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Enter your company"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-6 pt-4 border-t">
                <h2 className="text-xl font-semibold">Bio</h2>
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700">About Yourself</label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    value={formData.bio}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm resize-none"
                    placeholder="Tell us something about yourself"
                  ></textarea>
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button
                  color="light"
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={loading}
                  isProcessing={loading}
                >
                  Save Profile
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-8">
              <div className="border-b pb-6 last:border-0">
                <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500 text-sm">Email</p>
                      <p className="font-medium">{userProfile?.email || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Phone</p>
                      <p className="font-medium">{userProfile?.phoneNumber || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Birthday</p>
                      <p className="font-medium">
                        {userProfile?.dateOfBirth
                          ? new Date(userProfile.dateOfBirth).toLocaleDateString()
                          : 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-b pb-6 last:border-0">
                <h2 className="text-xl font-semibold mb-4">Address</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-500 text-sm">Location</p>
                    <p className="font-medium">
                      {userProfile?.address.street
                        ? `${userProfile.address.street}, ${userProfile.address.city}, ${userProfile.address.state} ${userProfile.address.zipCode}, ${userProfile.address.country}`
                        : 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="border-b pb-6 last:border-0">
                <h2 className="text-xl font-semibold mb-4">Professional Information</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500 text-sm">Occupation</p>
                      <p className="font-medium">{userProfile?.occupation || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Company</p>
                      <p className="font-medium">{userProfile?.company || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>
              {userProfile?.bio && (
                <div className="border-t pt-6">
                  <h2 className="text-xl font-semibold mb-4">Bio</h2>
                  <div>
                    <p className="whitespace-pre-line">{userProfile.bio}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Profile;