import { databases, account } from "./appwriteClient.js"; // Asegúrate que esté bien importado
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
const USUARIO_GAME_INFO_COLLECTION_ID = "681f603e00343d636ac5";
const TUTORIALES_COLLECTION_ID = "682203a70001320efb74";
const ADMIN_ID = "682a1d8a003387bdeeb7";

/* // Ejecuta esta función una sola vez, con esto arreglue lo del problema de la fotos, para poder visualizarla y no solo previsualizarla.


Esta función la he creado ya que tuve un problema con el formato con el
que se guardaba los enlaces de las imágenes de los buckets, ya que en vez de guardarse con
view, se guarda con preview, lo que no permite visualizar la foto. Por ende lo que hago es
básicamente alterar el enlace de todos los documentos que se guardaron con ese fallo, para no
cambiarlos de forma manual, por eso solo la ejecute una vez y ya, la he dejado comentada
para explicar como lo resolví el problema.


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

        console.log(` Actualizando usuario ${user.$id}:`, nuevaUrl);

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

    console.log(" Todas las URLs han sido corregidas.");
  } catch (error) {
    console.error(" Error al corregir URLs:", error);
  }
}
 */

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//GESTIÓN DE USUARIOS Y PERFILES

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

/* crea un documento de perfil de usuario con los datos proporcionados y el ID
del usuario.
 */ export async function createUserProfile(profileData, userId) {
  try {
    const response = await databases.createDocument(
      DATABASE_ID,
      USUARIOS_COLLECTION_ID,
      userId,
      {
        ...profileData,
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

    //  Esta es la línea que soluciona el problema de como e ve la imagen para que sea con view y no con preview
    return `https://fra.cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${response.$id}/view?project=680e27de001ffc71f5a7`;
  } catch (error) {
    console.error("Error al subir imagen de perfil:", error);
    throw error;
  }
};

//Obtiene el perfil de un usuario por su ID y ajusta la URL de la foto de perfil si
/* es que es necesario.
 */
export async function getUserProfile(userId) {
  try {
    const response = await databases.getDocument(
      DATABASE_ID,
      USUARIOS_COLLECTION_ID,
      userId
    );

    // Transformar la foto_perfil_url (preview) en una URL view
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

//actualiza los datos del perfil de usuario

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
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//VIDEOJUEGOS

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

/*Obtiene todos los videojuegos de la colección, y realiza paginación si es
que es necesario (ya que en las colecciones de Appwrite los documentos se almacenan por
páginas).*/
export async function getAllVideoGames() {
  let allGames = [];
  let lastId = null;
  let hasMore = true;

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


//busca videojeugos por nombre usando lo que haya metido el usuario.
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

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//PREFERENCIAS Y PERFILES DE JUEGOS DEL USUARIO 

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


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
      []
    );

    console.log("Documento creado:", response);
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
}


export async function getUserGamesPreferencesWithNames(userId) {
  try {
    const prefs = await getUserGamesPreferences(userId);
    const allGames = await getAllVideoGames();
    const gameMap = {};
    allGames.forEach((game) => {
      gameMap[game.$id] = game.nombre;
    });

    return prefs.map((pref) => ({
      ...pref,
      nombre: gameMap[pref.videojuego_id.$id] || "Juego desconocido",
    }));
  } catch (err) {
    console.error("Error combinando preferencias con nombres de juegos:", err);
    throw err;
  }
}


export const deleteUserGamePreference = async (userGameId) => {
  try {
    await databases.deleteDocument(
      DATABASE_ID,
      USUARIOS_JUEGOS_COLLECTION_ID,
      userGameId
    );
  } catch (err) {
    console.error("Error :", err);
    throw err;
  }
};


/*Solo una vez

export async function cargarVideojuegos() {
  for (const juego of videojuegos) {
    await databases.createDocument(
      DATABASE_ID,
      VIDEOJUEGOS_COLLECTION_ID,
      ID.unique(),
      juego
    );
  }
  console.log(" Todos los videojuegos han sido cargados.");
}
 */



//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//MATCH Y LIKE 

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------



//:devuelve todos los usuarios disponibles para match, excluyendo los que ya hicieron match, fueron rechazados o son admin
export async function getAllUsers(currentUserId) {
  const allUsers = await databases.listDocuments(
    DATABASE_ID,
    USUARIOS_COLLECTION_ID,
    [Query.limit(100)]
  );

  const likes = await databases.listDocuments(DATABASE_ID, LIKES_COLLECTION, [
    Query.equal("emisor_id", currentUserId),
  ]);

  // No podemos hacer filtros en usuarioss_ids si es relación, así que traemos todo
  const matches = await databases.listDocuments(
    DATABASE_ID,
    MATCHES_COLLECTION,
    [
      Query.limit(100), //  pocos matches, si no, hay que paginar
    ]
  );

  const matchedIds = matches.documents
    .filter((match) =>
      match.usuarioss_ids?.some((u) => u.$id === currentUserId)
    )
    .flatMap((match) => match.usuarioss_ids.map((u) => u.$id))
    .filter((id) => id !== currentUserId);

  const rejectedIds = likes.documents
    .filter((like) => like.estado === "rechazado_receptor")
    .map((like) => like.receptor_id);

  const excludedIds = new Set([...rejectedIds, ...matchedIds, ADMIN_ID]);

  return allUsers.documents.filter(
    (user) =>
      user.$id !== currentUserId &&
      !excludedIds.has(user.$id) &&
      user.$id !== ADMIN_ID
  );
}



// crea un like de un usuario a otro, con un estado(pendiente,rechazado,etc)
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
    estado: estado,
  });
}

//marca un usuario como “rechazado”(skip) si ya existe un like, o crea uno nuevo con ese estado
export async function skipUser(emisorId, receptorId) {
  try {
    //  Buscar si ya hay un like de ese emisor al receptor
    const existing = await databases.listDocuments(
      DATABASE_ID,
      LIKES_COLLECTION,
      [
        Query.equal("emisor_id", emisorId),
        Query.equal("receptor_id", receptorId),
      ]
    );

    if (existing.total > 0) {
      const likeDoc = existing.documents[0];

      // Si ya existe, actualizar estado a "rechazado_receptor"
      return databases.updateDocument(
        DATABASE_ID,
        LIKES_COLLECTION,
        likeDoc.$id,
        {
          estado: "rechazado_receptor",
          fecha_like: new Date().toISOString(),
        }
      );
    }

    // Si no existe, crearlo
    return databases.createDocument(
      DATABASE_ID,
      LIKES_COLLECTION,
      ID.unique(),
      {
        emisor_id: emisorId,
        receptor_id: receptorId,
        fecha_like: new Date().toISOString(),
        estado: "rechazado_receptor",
      }
    );
  } catch (err) {
    console.error("Error al hacer skip:", err);
    throw err;
  }
}

//R
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

//actualiza el estado o información de un like
export async function updateLike(likeId, data) {
  if (!likeId || typeof likeId !== "string") {
    throw new Error("ID de like inválido");
  }

  return databases.updateDocument(DATABASE_ID, LIKES_COLLECTION, likeId, data);
}
// Create a new match entry
/**
 * Asegura que exista un Team para dos usuarios y que ambos estén inscritos.

 */
async function generateTeamId(userA, userB) {
  const raw = new TextEncoder().encode([userA, userB].sort().join("_"));
  const hashBuffer = await crypto.subtle.digest("SHA-256", raw);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 36);
}

// Asegura que exista un equipo y que ambos usuarios estén dentro
async function ensureMatchTeam(userA, userB) {
  const teamId = await generateTeamId(userA, userB);

  try {
    await teams.get(teamId);
  } catch (err) {
    if (err.code === 404) {
      await teams.create(teamId, `Match_${teamId}`, []);

      // Usar user IDs directamente para las membresías
      await teams.createMembership(
        teamId,
        ID.unique(),
        ["member"],
        undefined, // email no
        undefined, // phone no
        undefined, // name no
        `user:${userA}` // user ID
      );
      await teams.createMembership(
        teamId,
        ID.unique(),
        ["member"],
        undefined,
        undefined,
        undefined,
        `user:${userB}`
      );
    } else {
      throw err;
    }
  }

  return teamId;
}

//***********************************************************************************************************************************+ */

// Corrige la función createMatch
export async function createMatch(userA, userB) {
  if (!userA || !userB) throw new Error("IDs de usuarios inválidos");

  const teamId = await ensureMatchTeam(userA, userB);

  const MATCH_COST = 100;

  try {
    // Obtener perfiles actuales
    const [userAProfile, userBProfile] = await Promise.all([
      getUserProfile(userA),
      getUserProfile(userB),
    ]);

    // Restar thomcoins a userA
    const thomcoinsA = (userAProfile.thomcoins || 0) - MATCH_COST;
    if (thomcoinsA < 0) {
      throw new Error(
        "El usuario no tiene suficientes thomcoins para hacer match."
      );
    }

    // Actualizar perfiles
    await Promise.all([
      updateUserProfile(userA, { thomcoins: thomcoinsA }),
      updateUserProfile(userB, { thomcoins: userBProfile.thomcoins || 0 }),
    ]);

    //  Primero crear el match
    const match = await databases.createDocument(
      DATABASE_ID,
      MATCHES_COLLECTION,
      ID.unique(),
      {
        usuarioss_ids: [userA, userB],
        fecha_match: new Date().toISOString(),
        estado: "activo",
      },
      [Permission.read(Role.team(teamId)), Permission.update(Role.team(teamId))]
    );

    return match;
  } catch (err) {
    console.error("Error en createMatch:", err);
    throw err;
  }
}



//Tarjeta Pokemon/// Me refiero al userCard
export async function getMatchesWithGameInfo(userId) {
  try {
    //Obtener todos los matches del usuario
    const matchesResponse = await databases.listDocuments(
      DATABASE_ID,
      MATCHES_COLLECTION,
      [Query.limit(100)]
    );

    //  Filtrar matches que incluyen al usuario actual
    const userMatches = matchesResponse.documents.filter((match) => {
      const userIds = (match.usuarioss_ids || [])
        .map((u) => (typeof u === "string" ? u : u?.$id))
        .filter(Boolean);
      return userIds.includes(userId);
    });

    console.log(" User matches found:", userMatches.length);

    if (!userMatches.length) return [];

    //  Procesar cada match
    const enrichedMatches = await Promise.all(
      userMatches.map(async (match) => {
        try {
          //  Encontrar el otro usuario en el match
          const otherUserId = (match.usuarioss_ids || [])
            .map((u) => (typeof u === "string" ? u : u?.$id))
            .find((id) => id && id !== userId);

          if (!otherUserId) {
            console.warn(" Error:", match.$id);
            return null;
          }

          console.log(" Error:", otherUserId);

          //  Obtener perfil del otro usuario
          const otherUser = await databases.getDocument(
            DATABASE_ID,
            USUARIOS_COLLECTION_ID,
            otherUserId
          );

          // Obtener TODA la información relevante de una sola vez
          const [gamesPrefs, gameInfos] = await Promise.all([
            databases.listDocuments(
              DATABASE_ID,
              USUARIOS_JUEGOS_COLLECTION_ID,
              [Query.equal("usuario_id", otherUserId)]
            ),
            databases.listDocuments(
              DATABASE_ID,
              USUARIO_GAME_INFO_COLLECTION_ID,
              [Query.equal("usuario_id", otherUserId)]
            ),
          ]);

          console.log(" Games prefs:", gamesPrefs.documents.length);
          console.log(" Game infos:", gameInfos.documents.length);

          //  Crear mapa de información de juegos
          const gameInfoMap = {};
          gameInfos.documents.forEach((info) => {
            const gameId =
              typeof info.juego_id === "string"
                ? info.juego_id
                : info.juego_id?.$id;

            if (gameId) {
              gameInfoMap[gameId] = info;
            }
          });

          //  Procesar cada juego con su información
          const gamesWithInfo = await Promise.all(
            gamesPrefs.documents.map(async (pref) => {
              try {
                const gameId =
                  typeof pref.videojuego_id === "string"
                    ? pref.videojuego_id
                    : pref.videojuego_id?.$id;

                if (!gameId) {
                  console.warn(" Invalid game ID in pref:", pref);
                  return null;
                }

                const gameDetails = await databases
                  .getDocument(DATABASE_ID, VIDEOJUEGOS_COLLECTION_ID, gameId)
                  .catch(() => null);

                if (
                  otherUser.foto_perfil_url &&
                  otherUser.foto_perfil_url.includes("/preview")
                ) {
                  const fileId = otherUser.foto_perfil_url
                    .split("/files/")[1]
                    ?.split("/")[0];
                  otherUser.foto_perfil_url = `https://fra.cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=680e27de001ffc71f5a7`;
                }

                const gameInfo = gameInfoMap[gameId];

                console.log(` Processing game ${gameId}:`, {
                  hasInfo: !!gameInfo,
                  gameName: gameDetails?.nombre,
                });

                return {
                  $id: pref.$id,
                  videojuego_id: gameId,
                  nombre: gameDetails?.nombre || "Juego desconocido",
                  nivel_juego: pref.nivel_juego,
                  favorito: pref.favorito,
                  nickname_en_juego: gameInfo?.nickname_en_juego || null,
                  rol: gameInfo?.rol || null,
                };
              } catch (error) {
                console.error(" Error processing game pref:", error);
                return null;
              }
            })
          );

          return {
            $id: match.$id,
            user: {
              id: otherUser.$id,
              name: otherUser.nombre_usuario,
              photo: otherUser.foto_perfil_url || "/default-user.png",
              description: otherUser.descripcion,
            },
            games: gamesWithInfo.filter(Boolean),
          };
        } catch (error) {
          console.error(" Error processing match:", error);
          return null;
        }
      })
    );

    const validMatches = enrichedMatches.filter(Boolean);
    console.log(" Valid matches found:", validMatches.length);
    return validMatches;
  } catch (error) {
    console.error(" Error in getMatchesWithGameInfo:", error);
    throw error;
  }
}


export async function debugUserGameInfo(userId) {
  console.log(" Starting debug for user:", userId);

  try {
    //  Obtener todos los juegos del usuario
    const userGames = await databases.listDocuments(
      DATABASE_ID,
      USUARIOS_JUEGOS_COLLECTION_ID,
      [Query.equal("usuario_id", userId)]
    );

    console.log(" User games found:", userGames.documents.length);

    // Obtener toda la información de juegos del usuario
    const gameInfos = await databases.listDocuments(
      DATABASE_ID,
      USUARIO_GAME_INFO_COLLECTION_ID,
      [Query.equal("usuario_id", userId)]
    );

    console.log(" Game info entries found:", gameInfos.documents.length);

    // 3. Verificar cada juego
    const results = await Promise.all(
      userGames.documents.map(async (gamePref) => {
        const gameId =
          typeof gamePref.videojuego_id === "string"
            ? gamePref.videojuego_id
            : gamePref.videojuego_id?.$id;

        if (!gameId) {
          return {
            gamePref,
            status: "INVALID_ID",
            gameInfo: null,
          };
        }

        // Buscar información del juego
        const gameInfo = gameInfos.documents.find(
          (info) => info.juego_id === gameId
        );

        // Verificar si el juego existe
        let gameExists;
        try {
          await databases.getDocument(
            DATABASE_ID,
            VIDEOJUEGOS_COLLECTION_ID,
            gameId
          );
          gameExists = true;
        } catch {
          gameExists = false;
        }

        return {
          gamePref,
          gameId,
          gameExists,
          gameInfo,
          status: gameInfo ? "FOUND" : "NOT_FOUND",
        };
      })
    );

    console.log("Debugeando:", results);

    // 4. Mostrar resumen
    const summary = {
      totalGames: results.length,
      gamesWithInfo: results.filter((r) => r.status === "FOUND").length,
      gamesWithoutInfo: results.filter((r) => r.status === "NOT_FOUND").length,
      invalidIds: results.filter((r) => r.status === "INVALID_ID").length,
      nonExistentGames: results.filter((r) => !r.gameExists).length,
    };

    return {
      results,
      summary,
    };
  } catch (error) {
    console.error("  error:", error);
    throw error;
  }
}

// Crear el perfil del usuario en relacion a un videojuego 
export async function createUserGameInfo(userId, gameId, data) {
  try {
    return await databases.createDocument(
      DATABASE_ID,
      USUARIO_GAME_INFO_COLLECTION_ID,
      ID.unique(),
      {
        usuario_id: userId,
        juego_id: gameId,
        nickname_en_juego: data.nickname,
        rol: data.rol || null,
      }
    );
  } catch (err) {
    console.error("Error :", err);
    throw err;
  }
}


//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//GAME INFO 

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------



//permite obtener el perfil del anterior 
export async function getUserGameInfo(userId) {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      USUARIO_GAME_INFO_COLLECTION_ID,
      [Query.equal("usuario_id", userId)]
    );
    return response.documents;
  } catch (err) {
    console.error("Error :", err);
    throw err;
  }
}
//inserta o actualiza la informacion de juego de un usuario para un juego en especifico
export async function upsertUserGameInfo(userId, gameId, data) {
  try {
    const existing = await databases.listDocuments(
      DATABASE_ID,
      USUARIO_GAME_INFO_COLLECTION_ID,
      [
        Query.equal("usuario_id", userId),
        Query.equal("juego_id", gameId),
        Query.limit(1),
      ]
    );

    if (existing.documents.length > 0) {
      return await databases.updateDocument(
        DATABASE_ID,
        USUARIO_GAME_INFO_COLLECTION_ID,
        existing.documents[0].$id,
        {
          nickname_en_juego: data.nickname,
          rol: data.rol || null,
        }
      );
    } else {
      return await databases.createDocument(
        DATABASE_ID,
        USUARIO_GAME_INFO_COLLECTION_ID,
        ID.unique(),
        {
          usuario_id: userId,
          juego_id: gameId,
          nickname_en_juego: data.nickname,
          rol: data.rol || null,
        }
      );
    }
  } catch (err) {
    console.error("Error :", err);
    throw err;
  }
}
//obtiene la informacion de un usuario sobre un juego especifico
export async function getUserGameInfoByGame(userId, gameId) {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      USUARIO_GAME_INFO_COLLECTION_ID,
      [
        Query.equal("usuario_id", userId),
        Query.equal("juego_id", gameId),
        Query.limit(1),
      ]
    );
    return response.documents[0] || null;
  } catch (err) {
    console.error("Error en getUserGameInfoByGame:", err);
    throw err;
  }
}

//elimina la informacion de juego de un usuario
export async function deleteUserGameInfo(documentId) {
  try {
    return await databases.deleteDocument(
      DATABASE_ID,
      USUARIO_GAME_INFO_COLLECTION_ID,
      documentId
    );
  } catch (err) {
    console.error("Error en deleteUserGameInfo:", err);
    throw err;
  }
}

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//TUTORIALES

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------



//Tutoriales
export async function getAllTutorials() {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      TUTORIALES_COLLECTION_ID,
      [Query.limit(100)]
    );
    return response.documents;
  } catch (err) {
    console.error("Error :", err);
    throw err;
  }
}


//busca tutoriales filtrando por videojuego o nivel recomendado
export async function getTutorialsByFilters(videojuegoId = null, nivel = null) {
  try {
    let queries = [];

    if (videojuegoId) {
      queries.push(Query.equal("videojuego_id", videojuegoId));
    }

    if (nivel) {
      queries.push(Query.equal("nivel_recomendado", nivel));
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      TUTORIALES_COLLECTION_ID,
      queries
    );

    return response.documents;
  } catch (err) {
    console.error("Error :", err);
    throw err;
  }
}

//trae la informacion de un tutorial por su ID
export async function getTutorialById(tutorialId) {
  try {
    const response = await databases.getDocument(
      DATABASE_ID,
      TUTORIALES_COLLECTION_ID,
      tutorialId
    );
    return response;
  } catch (err) {
    console.error("Error :", err);
    throw err;
  }
}

//crea un nuevo tutorial
export async function createTutorial(tutorialData) {
  try {
    const response = await databases.createDocument(
      DATABASE_ID,
      TUTORIALES_COLLECTION_ID,
      ID.unique(),
      tutorialData
    );
    return response;
  } catch (err) {
    console.error("Error :", err);
    throw err;
  }
}

//actualiza los datos de un tutorial
export async function updateTutorial(tutorialId, tutorialData) {
  try {
    const response = await databases.updateDocument(
      DATABASE_ID,
      TUTORIALES_COLLECTION_ID,
      tutorialId,
      tutorialData
    );
    return response;
  } catch (err) {
    console.error("Error :", err);
    throw err;
  }
}

//eliminar tutorial 
export async function deleteTutorial(tutorialId) {
  try {
    const response = await databases.deleteDocument(
      DATABASE_ID,
      TUTORIALES_COLLECTION_ID,
      tutorialId
    );
    return response;
  } catch (err) {
    console.error("Error :", err);
    throw err;
  }
}

////---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//ADMINISTRAIÓN USUARIOS 

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


////////////////////////////////////////////cambia el estado de bloqueo de un usuario llamando a un endpoint backend
export const updateUserStatus = async (userId, block) => {
  const response = await fetch(
    "https://gemukore-backend.onrender.com/api/bloquear",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, block }),
    }
  );

  const data = await response.json();

  if (!data.success) {
    throw new Error(`Estado no cambiado (actual: ${data.actualStatus})`);
  }

  return data;
};



//******************************************************************* */
export const deleteUserFromAuth = async (userId) => {
  try {
    const response = await fetch(
      "https://gemukore-backend.onrender.com/api/eliminar-usuario",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
        // credentials: 'include' // ¡Comenta esto si no usas cookies!
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error("Error en deleteUserFromAuth:", err);
    throw new Error(err.message || "Error de conexión");
  }
};


/**
 * Obtiene todos los usuarios para administración
 */
export async function getAllUsersAdmin() {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      USUARIOS_COLLECTION_ID,
      [
        Query.select(["$id", "nombre_usuario", "email", "foto_perfil_url"]),
        Query.limit(100),
      ]
    );

    // Transformar URLs de perfil si es necesario
    return response.documents.map((user) => {
      if (user.foto_perfil_url && user.foto_perfil_url.includes("/preview")) {
        const fileId = user.foto_perfil_url.split("/files/")[1]?.split("/")[0];
        user.foto_perfil_url = `https://fra.cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=680e27de001ffc71f5a7`;
      }
      return user;
    });
  } catch (err) {
    console.error("Error obteniendo usuarios:", err);
    throw err;
  }
}

/* export async function blockUser(userId) {
  try {
    return await updateUserStatus(userId, true);
  } catch (err) {
    console.error("Error bloqueando usuario:", err);
    throw new Error(`No se pudo bloquear: ${err.message}`);
  }
}

export async function unblockUser(userId) {
  try {
    return await updateUserStatus(userId, false);
  } catch (err) {
    console.error("Error desbloqueando usuario:", err);
    throw new Error(`No se pudo desbloquear: ${err.message}`);
  }
}
 *//**
 * Elimina un usuario completamente (Database y Auth)
 */

 
export async function deleteUserAccount(userId) {
  try {
    // 1. Eliminar de Database
    await databases.deleteDocument(DATABASE_ID, USUARIOS_COLLECTION_ID, userId);

    // 2. Eliminar de Auth
    const result = await deleteUserFromAuth(userId);

    return {
      success: true,
      message:
        result.message ||
        "La eliminación del usuario se completará en 2-3 días.",
    };
  } catch (err) {
    console.error("Error eliminando cuenta de usuario:", err);
    throw new Error(err.message || "Error al eliminar cuenta de usuario");
  }
}

//eliminar usuario settings
export async function deleteUserAccountAndRedirect(userId, navigate) {
  try {
    // Primero cerrar la sesión activa (antes de eliminar la cuenta)
    try {
      await account.deleteSession("current");
    } catch (sessionError) {
      console.warn("Error al cerrar sesión:", sessionError);
    }

    //  Eliminar documentos relacionados
    const collectionsToClean = [
      USUARIOS_JUEGOS_COLLECTION_ID,
      USUARIO_GAME_INFO_COLLECTION_ID,
      LIKES_COLLECTION,
      MATCHES_COLLECTION,
    ];

    for (const collectionId of collectionsToClean) {
      try {
        const userDocs = await databases.listDocuments(
          DATABASE_ID,
          collectionId,
          [Query.equal("usuario_id", userId)]
        );

        await Promise.all(
          userDocs.documents.map((doc) =>
            databases.deleteDocument(DATABASE_ID, collectionId, doc.$id)
          )
        );
      } catch (error) {
        console.warn(`Error limpiando ${collectionId}:`, error);
      }
    }

    // Eliminar perfil principal
    await databases.deleteDocument(DATABASE_ID, USUARIOS_COLLECTION_ID, userId);

    //  Eliminar cuenta de autenticación (usando endpoint backend)
    const authResponse = await fetch("http://localhost:3002/eliminar-usuario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    if (!authResponse.ok) {
      throw new Error("Error al eliminar autenticación");
    }

    // Redirigir
    if (navigate) {
      navigate("/login", { replace: true });
      window.location.reload();
    }

    return {
      success: true,
      message: "Cuenta eliminada correctamente",
    };
  } catch (error) {
    console.error("Error en deleteUserAccountAndRedirect:", error);

    // Forzar redirección incluso si hay error
    if (navigate) {
      navigate("/", { replace: true });
    }

    throw new Error(error.message || "Error al eliminar la cuenta");
  }
}
