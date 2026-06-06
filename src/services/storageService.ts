export const IMAGE_UPLOAD_DISABLED_MESSAGE =
  'Görsel yükleme özelliği şu anda kapalı. Görsel bağlantısı ekleyebilir veya varsayılan görselle devam edebilirsin.';

export const uploadRecipeImage = async (uri: string, userId: string, isDemo = false) => {
  const cleanUri = uri.trim();

  if (/^https?:\/\//i.test(cleanUri)) {
    return cleanUri;
  }

  void userId;
  void isDemo;
  throw new Error(IMAGE_UPLOAD_DISABLED_MESSAGE);
};
