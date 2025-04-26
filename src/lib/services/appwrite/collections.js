import { ID } from "appwrite";
import { databases } from "./appwriteClient"; // Asegúrate que esté bien importado
import { Query } from "appwrite";

const DATABASE_ID = "68023a6f001b52add074";
const USUARIOS_COLLECTION_ID = "6803b02e0001f28d2191";
const USUARIOS_JUEGOS_COLLECTION_ID = "6803b4590037984ad086";
const VIDEOJUEGOS_COLLECTION_ID = "680d15a4001129c9aa50";

export async function createUserProfile(profileData, user_id) {
  try {
    const response = await databases.createDocument(
      DATABASE_ID,
      USUARIOS_COLLECTION_ID,
      ID.unique(),
      profileData,
      []
    );

    return response;
  } catch (err) {
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
      const queries = [
        Query.limit(100),
        Query.orderAsc('$id')
      ];

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
      [
        Query.search('nombre', searchTerm),
        Query.limit(50)
      ]
    );
    return response.documents;
  } catch (err) {
    console.error("Error searching games:", err);
    throw err;
  }
}

export async function createUserGamesProfile(profileData) {
  try {
    // Validar que los IDs requeridos estén presentes
    if (!profileData.usuario_id || !profileData.videojuego_id) {
      throw new Error("Faltan IDs requeridos (usuario_id o videojuego_id)");
    }

    const response = await databases.createDocument(
      DATABASE_ID,
      USUARIOS_JUEGOS_COLLECTION_ID,
      ID.unique(),
      {
        usuario_id: profileData.usuario_id,
        videojuego_id: profileData.videojuego_id,
        favorito: profileData.favorito || false,
        nivel_juego: profileData.nivel_juego || "Principiante",
        // Añade cualquier otro campo necesario
      },
      [
        
      ]
    );

    console.log("Perfil de juego creado:", response);
    return response;
  } catch (err) {
    console.error("Error al crear perfil de juego:", err);
    throw err;
  }
}

//**************************************************************************************************************************** */
//Rellenar la colección de videojuegos con con videojuegos de la API 
export async function fillVideojuegos() {
  try {
    let existingNames = new Set();
    let cursor = null;

    do {
      const queryOptions = {
        queries: [],
        ...(cursor ? { cursorAfter: cursor } : {})
      };

      const response = await databases.listDocuments(
        DATABASE_ID,
        VIDEOJUEGOS_COLLECTION_ID,
        queryOptions.queries
      );

      response.documents.forEach(doc => {
        existingNames.add(doc.nombre.toLowerCase().trim());
      });

      if (response.documents.length > 0) {
        cursor = response.documents[response.documents.length - 1].$id;
      } else {
        cursor = null;
      }
    } while (cursor);

    const existingGamesCount = existingNames.size;

    console.log(`🎮 Juegos ya existentes en base de datos: ${existingGamesCount}`);

    const TOTAL_GAMES = 100;
    const GAMES_NEEDED = TOTAL_GAMES - existingGamesCount;

    if (GAMES_NEEDED <= 0) {
      console.log(` Ya hay ${existingGamesCount} juegos o más.`);
      return;
    }

    console.log(` Faltan ${GAMES_NEEDED} juegos para llegar a ${TOTAL_GAMES}.`);

    const DELAY_BETWEEN_INSERTS_MS = 6000;
    const RAWG_API_KEY = "d4376e47cb3c4e83b2cd022ff200bc72"; // Tu key
    const PAGE_SIZE = 40;
    let insertedGames = 0;
    let page = 1;

    function delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    while (insertedGames < GAMES_NEEDED) {
      const response = await fetch(
        `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&page=${page}&page_size=${PAGE_SIZE}`
      );
      const data = await response.json();
      const games = data.results;

      if (!games || games.length === 0) {
        console.log("No hay más juegos disponibles en la API.");
        break;
      }

      for (const game of games) {
        if (insertedGames >= GAMES_NEEDED) {
          console.log(` Se alcanzaron los ${TOTAL_GAMES} videojuegos.`);
          break;
        }

        const nombre = game.name.slice(0, 50).toLowerCase().trim();

        if (existingNames.has(nombre)) {
          console.log(` Duplicado: ${game.name}, se salta.`);
          continue;
        }

        const gameData = {
          nombre: game.name.slice(0, 50),
          genero: game.genres
            .map((g) => g.name)
            .join(", ")
            .slice(0, 50),
        };

        await databases.createDocument(
          DATABASE_ID,
          VIDEOJUEGOS_COLLECTION_ID,
          ID.unique(),
          gameData
        );

        console.log(`Insertado (${insertedGames + 1} de ${GAMES_NEEDED}): ${game.name}`);

        existingNames.add(nombre);
        insertedGames++;

        await delay(DELAY_BETWEEN_INSERTS_MS);
      }

      page++;
    }

    console.log(` Relleno completado. Total de videojuegos en la colección ahora: ${existingNames.size}`);
  } catch (error) {
    console.error("Error al rellenar videojuegos:", error);
    throw error;
  }
}
