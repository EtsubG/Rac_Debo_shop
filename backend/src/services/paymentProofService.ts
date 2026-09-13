import { randomUUID } from 'node:crypto';
import { supabase } from '../config/supabase.ts';

export async function uploadPaymentProof(
  file: Express.Multer.File
): Promise<string> {
  if (!file) {
    throw new Error('No payment proof provided');
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

  const filePath = `orders/${randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from('payment-proofs')
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw new Error(
      `Failed to upload payment proof: ${error.message}`
    );
  }

  const { data } = supabase.storage
    .from('payment-proofs')
    .getPublicUrl(filePath);

  return data.publicUrl;
}