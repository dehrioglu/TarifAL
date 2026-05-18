import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { storage } from './firebase';

export const uploadRecipeImage = async (uri: string, userId: string) => {
  if (!storage) {
    return uri;
  }

  const response = await fetch(uri);
  const blob = await response.blob();
  const imageRef = ref(storage, `recipes/${userId}/${Date.now()}.jpg`);
  await uploadBytes(imageRef, blob);

  return getDownloadURL(imageRef);
};
