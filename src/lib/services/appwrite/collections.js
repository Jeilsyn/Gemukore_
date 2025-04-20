import { ID, Permission, Role } from 'appwrite';
import { databases } from './appwriteClient'; // Asegúrate que esté bien importado

const DATABASE_ID = "68023a6f001b52add074";
const USUARIOS_COLLECTION_ID = "6803b02e0001f28d2191";

export async function createUserProfile(profileData,user_id) {
  try {
    const response = await databases.createDocument(
      DATABASE_ID,
      USUARIOS_COLLECTION_ID,
      ID.unique(),
      profileData,
      [
      ]
    );

    return response;
  } catch (err) {
    throw err;
  }
}
