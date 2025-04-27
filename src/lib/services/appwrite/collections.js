import { ID } from "appwrite";
import { databases } from "./appwriteClient.js"; // Asegúrate que esté bien importado
import { Query } from "appwrite";
/* import fs from 'fs';
import path from 'path';

const videojuegos = JSON.parse(fs.readFileSync(path.resolve('src/data/videojuegos.json'), 'utf8'));
 */
const DATABASE_ID = "680e28230014830b3ef3";
const USUARIOS_COLLECTION_ID = "680e2839001d6f039f0a";
const USUARIOS_JUEGOS_COLLECTION_ID = "680e29eb00099919fc72";
const VIDEOJUEGOS_COLLECTION_ID = "680e2a4c003066987223";

export async function createUserProfile(profileData, userId) {
  try {
    // Asegúrate de que el usuario_id esté correctamente asignado
    const response = await databases.createDocument(
      DATABASE_ID,
      USUARIOS_COLLECTION_ID,
      userId,
      {
      // Se asegura de que el ID de usuario esté presente
        ...profileData, // Otros datos como nombre, correo, etc.
      }
    );
    return response;
  } catch (err) {
    console.error("Error creando perfil de usuario:", err);
    throw err;
  }
}
export async function getAllVideoGames() {
  let allGames = [];
  let lastId = null;
  let hasMore = true;
  let totalFetched = 0;

  try {
    while (hasMore) {
      const queries = [Query.limit(100), Query.orderAsc("$id")];

      if (lastId) {
        queries.push(Query.cursorAfter(lastId));
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        VIDEOJUEGOS_COLLECTION_ID,
        queries
      );

      allGames = [...allGames, ...response.documents];
      totalFetched += response.documents.length;

      if (response.documents.length < 100) {
        hasMore = false;
      } else {
        lastId = response.documents[response.documents.length - 1].$id;
      }
    }

    console.log(`🎮 Total games fetched: ${totalFetched}`);
    return allGames;
  } catch (err) {
    console.error("Error fetching video games:", err);
    throw err;
  }
}

export async function searchVideoGames(searchTerm) {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      VIDEOJUEGOS_COLLECTION_ID,
      [Query.search("nombre", searchTerm), Query.limit(50)]
    );
    return response.documents;
  } catch (err) {
    console.error("Error searching games:", err);
    throw err;
  }
}

// Crear el perfil de juegos preferidos del usuario
export async function createUserGamesProfile(profileData) {
  try {
    // Validación más estricta de los IDs
    if (!profileData.usuario_id || typeof profileData.usuario_id !== 'string') {
      throw new Error("El ID de usuario es requerido y debe ser una cadena");
    }
    if (!profileData.videojuego_id || typeof profileData.videojuego_id !== 'string') {
      throw new Error("El ID de videojuego es requerido y debe ser una cadena");
    }

    console.log('Creando documento con:', profileData); // Log para depuración

    const response = await databases.createDocument(
      DATABASE_ID,
      USUARIOS_JUEGOS_COLLECTION_ID,
      ID.unique(),
      {
        usuario_id:profileData.$id,
       ...profileData
      },
      [] // Permisos (opcional)
    );

    console.log('Documento creado:', response); // Verificar respuesta completa
    return response;
  } catch (err) {
    console.error("Error detallado al crear perfil de juego:", {
      message: err.message,
      code: err.code,
      type: err.type,
      response: err.response
    });
    throw err;
  }
}
// Obtener todas las preferencias de juegos del usuario
export async function getUserGamesPreferences(userId) {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      USUARIOS_JUEGOS_COLLECTION_ID,
      [Query.equal("usuario_id", userId)] // Filtra por el ID del usuario
    );

    return response.documents;
  } catch (err) {
    console.error("Error obteniendo preferencias de juegos del usuario:", err);
    throw err;
  }
}/* export async function cargarVideojuegos() {
  for (const juego of videojuegos) {
    await databases.createDocument(
      DATABASE_ID,
      VIDEOJUEGOS_COLLECTION_ID,
      ID.unique(),
      juego
    );
  }
  console.log("🎮 Todos los videojuegos han sido cargados.");
}
 */