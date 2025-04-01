import {
  doc,
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  getDocs,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from 'src/firebase/config';
import { Product } from 'src/types/products/products';

export const createProduct = async (productData: Product, imageFiles: File[]): Promise<Product> => {
  try {
    const imageUrls: string[] = [];
    for (const file of imageFiles) {
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      imageUrls.push(downloadURL);
    }

    const productWithImages: Product = {
      ...productData,
      imageUrls
    };

    const productRef = collection(db, 'products');
    const docRef = await addDoc(productRef, productWithImages);

    return { ...productWithImages, id: docRef.id };
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

export const updateProduct = async (productId: string, productData: Partial<Product>, newImageFiles?: File[]) => {
  try {
    const productRef = doc(db, 'products', productId);

    if (newImageFiles && newImageFiles.length > 0) {
      const newImageUrls: string[] = [];
      for (const file of newImageFiles) {
        const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        newImageUrls.push(downloadURL);
      }

      const updatedData = {
        ...productData,
        imageUrls: [...(productData.imageUrls || []), ...newImageUrls]
      };
      await updateDoc(productRef, updatedData);
    } else {
      await updateDoc(productRef, productData);
    }
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

export const deleteProduct = async (productId: string) => {
  try {
    const productRef = doc(db, 'products', productId);
    await deleteDoc(productRef);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const productRef = collection(db, 'products');
    const querySnapshot = await getDocs(productRef);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Product));
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}