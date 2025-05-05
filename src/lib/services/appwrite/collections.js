import { databases } from "./appwriteClient.js"; // Asegúrate que esté bien importado
import { Query } from "appwrite";
/* import fs from 'fs';
import path from 'path';

const videojuegos = JSON.parse(fs.readFileSync(path.resolve('src/data/videojuegos.json'), 'utf8'));
 */
import { storage, teams } from "./appwriteClient";
import { ID, Permission, Role } from "appwrite";
const BUCKET_ID = "680e342900053bdb9610";
const DATABASE_ID = "680e28230014830b3ef3";
const USUARIOS_COLLECTION_ID = "680e2839001d6f039f0a";
const USUARIOS_JUEGOS_COLLECTION_ID = "680e29eb00099919fc72";
const VIDEOJUEGOS_COLLECTION_ID = "680e2a4c003066987223";
const MATCHES_COLLECTION = "68188f96001e495758a2";
const LIKES_COLLECTION = "681894a3001f3d2e9a0e";

/* // Ejecuta esta función una sola vez
export async function corregirURLsPreview() {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      USUARIOS_COLLECTION_ID,
      [Query.limit(100)]
    );

    for (const user of response.documents) {
      const url = user.foto_perfil_url;
      if (url && url.includes("/preview")) {
        const fileId = url.split("/files/")[1]?.split("/")[0];
        const nuevaUrl = `https://fra.cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=680e27de001ffc71f5a7`;

        console.log(`🔁 Actualizando usuario ${user.$id}:`, nuevaUrl);

        await databases.updateDocument(
          DATABASE_ID,
          USUARIOS_COLLECTION_ID,
          user.$id,
          {
            foto_perfil_url: nuevaUrl,
          }
        );
      }
    }

    console.log("✅ Todas las URLs han sido corregidas.");
  } catch (error) {
    console.error("❌ Error al corregir URLs:", error);
  }
}
 */
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
/**
 * Sube una imagen al bucket de Appwrite y retorna su URL de vista previa
 * @param {File} file - Archivo de imagen
 * @param {string} userId - ID del usuario
 * @returns {Promise<string>} - URL de la imagen subida
 */
export const uploadProfileImage = async (file, userId) => {
  if (!file) return "";

  try {
    const response = await storage.createFile(BUCKET_ID, ID.unique(), file, [
      Permission.read(`user:${userId}`),
      Permission.update(`user:${userId}`),
      Permission.delete(`user:${userId}`),
    ]);

    // ✅ Esta es la línea que soluciona el problema
    return `https://fra.cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${response.$id}/view?project=680e27de001ffc71f5a7`;
  } catch (error) {
    console.error("Error al subir imagen de perfil:", error);
    throw error;
  }
};
export async function getUserProfile(userId) {
  try {
    const response = await databases.getDocument(
      DATABASE_ID,
      USUARIOS_COLLECTION_ID,
      userId
    );

    // Transformar la foto_perfil_url (preview) en una URL view persistente
    if (
      response.foto_perfil_url &&
      response.foto_perfil_url.includes("/preview")
    ) {
      const fileId = response.foto_perfil_url
        .split("/files/")[1]
        ?.split("/")[0];
      response.foto_perfil_url = `https://fra.cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=680e27de001ffc71f5a7`;
    }

    return response;
  } catch (err) {
    console.error("Error obteniendo perfil de usuario:", err);
    throw err;
  }
}

export async function updateUserProfile(userId, profileData) {
  try {
    const response = await databases.updateDocument(
      DATABASE_ID,
      USUARIOS_COLLECTION_ID,
      userId,
      profileData
    );
    return response;
  } catch (err) {
    console.error("Error actualizando perfil de usuario:", err);
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

      if (response.documents.length < 100) {
        hasMore = false;
      } else {
        lastId = response.documents[response.documents.length - 1].$id;
      }
    }

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
    if (!profileData.usuario_id || typeof profileData.usuario_id !== "string") {
      throw new Error("El ID de usuario es requerido y debe ser una cadena");
    }
    if (
      !profileData.videojuego_id ||
      typeof profileData.videojuego_id !== "string"
    ) {
      throw new Error("El ID de videojuego es requerido y debe ser una cadena");
    }

    const response = await databases.createDocument(
      DATABASE_ID,
      USUARIOS_JUEGOS_COLLECTION_ID,
      ID.unique(),
      {
        usuario_id: profileData.$id,
        ...profileData,
      },
      [] // Permisos (opcional)
    );

    console.log("Documento creado:", response); // Verificar respuesta completa
    return response;
  } catch (err) {
    console.error("Error detallado al crear perfil de juego:", {
      message: err.message,
      code: err.code,
      type: err.type,
      response: err.response,
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
} /* export async function cargarVideojuegos() {
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

//EN cuanto a Match
export async function getAllUsers(currentUserId) {
  const response = await databases.listDocuments(
    DATABASE_ID,
    USUARIOS_COLLECTION_ID,
    [Query.limit(100)]
  );
  return response.documents.filter((user) => user.$id !== currentUserId);
}

// Create a new like
// Actualiza la función createLike para aceptar el estado como parámetro
export async function createLike(
  emisorId,
  receptorId,
  estado = "pendiente_receptor"
) {
  const isValidUID = (uid) => /^[a-zA-Z0-9_]{1,36}$/.test(uid);
  if (!isValidUID(emisorId) || !isValidUID(receptorId)) {
    console.error("UID inválido al crear like:", emisorId, receptorId);
    return;
  }

  return databases.createDocument(DATABASE_ID, LIKES_COLLECTION, ID.unique(), {
    emisor_id: emisorId,
    receptor_id: receptorId,
    fecha_like: new Date().toISOString(),
    estado: estado, // Usa el parámetro estado
  });
}

export async function skipUser(emisorId, receptorId) {
  return databases.createDocument(DATABASE_ID, LIKES_COLLECTION, ID.unique(), {
    emisor_id: emisorId,
    receptor_id: receptorId,
    fecha_like: new Date().toISOString(),
    estado: "rechazado_receptor",
  });
}
// Fetch pending likes for the current user (to accept or reject)
export async function getPendingLikes(userId) {
  if (!userId || typeof userId !== "string") {
    throw new Error("ID de usuario inválido");
  }

  const response = await databases.listDocuments(
    DATABASE_ID,
    LIKES_COLLECTION,
    [
      Query.equal("receptor_id", userId),
      Query.equal("estado", "pendiente_receptor"),
      Query.limit(50),
    ]
  );
  return response.documents;
}
// Update a like's state and optionally attach match_id
export async function updateLike(likeId, data) {
  if (!likeId || typeof likeId !== "string") {
    throw new Error("ID de like inválido");
  }

  return databases.updateDocument(DATABASE_ID, LIKES_COLLECTION, likeId, data);
}
// Create a new match entry
/**
 * Asegura que exista un Team para dos usuarios y que ambos estén inscritos.
 * El ID del team se genera con los IDs de usuario ordenados y concatenados.
 */
async function generateTeamId(userA, userB) {
  const raw = new TextEncoder().encode([userA, userB].sort().join("_"));
  const hashBuffer = await crypto.subtle.digest("SHA-256", raw);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return hex.slice(0, 36);
}

// Asegura que exista un equipo y que ambos usuarios estén dentro
async function ensureMatchTeam(userA, userB) {
  const teamId = await generateTeamId(userA, userB);

  try {
    await teams.get(teamId); // Intenta obtener el equipo existente
  } catch (err) {
    if (err.code === 404) { // Si el equipo no existe, crearlo
      await teams.create(teamId, `Match_${teamId}`, []);
      
      // Obtenemos los perfiles de ambos usuarios, donde se supone que debe estar el email
      const userAProfile = await getUserProfile(userA);
      const userBProfile = await getUserProfile(userB);

      // Aquí asumimos que los perfiles contienen un campo "email"
      if (!userAProfile.email || !userBProfile.email) {
        throw new Error("Uno o ambos usuarios no tienen un correo electrónico válido.");
      }
      console.log("Email A:", userAProfile.email);
      console.log("Email B:", userBProfile.email);
      
      // Usamos el email directamente del perfil para agregar a los miembros
      await teams.createMembership(teamId, ID.unique(), ["member"], userAProfile.email, null, null, null);
      await teams.createMembership(teamId, ID.unique(), ["member"], userBProfile.email, null, null, null);
    } else {
      throw err; // Si ocurrió otro error, lanzarlo
    }
  }

  return teamId;
}
// Crea un nuevo match con permisos para los usuarios involucrados
export async function createMatch(userA, userB) {
  if (!userA || !userB) throw new Error("IDs de usuarios inválidos");

  const teamId = await ensureMatchTeam(userA, userB);

  return databases.createDocument(
    DATABASE_ID,
    MATCHES_COLLECTION,
    ID.unique(),
    {
      usuarios_ids: [userA, userB],
      fecha_match: new Date().toISOString(),
      estado: "activo",
    },
    [Permission.read(Role.team(teamId)), Permission.update(Role.team(teamId))]
  );
}



export async function getUserGamesPreferencesWithNames(userId) {
  try {
    const prefs = await getUserGamesPreferences(userId); // Obtén las preferencias del usuario
    const allGames = await getAllVideoGames(); // Obtén todos los videojuegos disponibles

    const gameMap = {};
    allGames.forEach((game) => {
      gameMap[game.$id] = game.nombre; // Mapea los IDs de juegos a sus nombres
    });

    // Aquí es donde combinamos las preferencias con los nombres de juegos
    return prefs.map((pref) => ({
      ...pref,
      nombre: gameMap[pref.videojuego_id.$id] || "Juego desconocido", // Accede al nombre del juego correctamente
    }));
  } catch (err) {
    console.error("Error combinando preferencias con nombres de juegos:", err);
    throw err;
  }
}
