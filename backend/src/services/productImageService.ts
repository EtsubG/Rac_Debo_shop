import { randomUUID } from 'node:crypto';
import { supabase } from '../config/supabase.ts';

export async function uploadProductImage(
  file: Express.Multer.File
): Promise<string> {
  if (!file) {
    throw new Error('No image file provided');
  }

  let extension = 'jpg';

  if (file.mimetype === 'image/png') {
    extension = 'png';
  } else if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/jpg'
  ) {
    extension = 'jpg';
  } else {
    throw new Error('Only JPG, JPEG, and PNG images are allowed');
  }

  const filePath = `products/${randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from('product-image')
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
}