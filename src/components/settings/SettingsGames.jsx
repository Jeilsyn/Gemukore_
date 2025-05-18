import { useEffect, useState } from "react";
import { account } from "../../lib/services/appwrite/appwriteClient";
import {
  getUserProfile,
  updateUserProfile,
  uploadProfileImage,
  getUserGamesPreferences,
  deleteUserGameInfo,
  deleteUserGamePreference,
  getUserGameInfoByGame
} from "../../lib/services/appwrite/collections";
import Button from "../ui/Button";
import Input from "../ui/InputPerfil";
import { useNavigate } from "react-router-dom";

export default function SettingsGame() {
  const [form, setForm] = useState({
    nombre_usuario: "",
    descripcion: "",
    nivel_jugador: "",
    tema_app: "",
    text_size: 12,
    idioma: "",
    foto_perfil_url: ""
  });

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [userGames, setUserGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUserData() {
      try {
        const user = await account.get();
        const response = await getUserProfile(user.$id);
        
        setForm({
          nombre_usuario: response.nombre_usuario,
          descripcion: response.descripcion,
          nivel_jugador: response.nivel_jugador,
          tema_app: response.tema_app,
          text_size: parseInt(response.text_size),
          idioma: response.idioma,
          foto_perfil_url: response.foto_perfil_url || ""
        });

        if (response.foto_perfil_url) {
          const fileId = response.foto_perfil_url.split('/files/')[1]?.split('/')[0];
          const bucketId = '680e342900053bdb9610';
          const url = `https://fra.cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${fileId}/view?project=680e27de001ffc71f5a7`;
          setPreviewUrl(url);
        } else {
          setPreviewUrl("");
        }

        await loadUserGames(user.$id);
      } catch (err) {
        console.error("Error al cargar el perfil:", err);
      }
    }
    fetchUserData();
  }, []);

  const loadUserGames = async (userId) => {
    setLoadingGames(true);
    try {
      const gamesPrefs = await getUserGamesPreferences(userId);
      const gamesWithInfo = await Promise.all(
        gamesPrefs.map(async (pref) => {
          const gameInfo = await getUserGameInfoByGame(userId, pref.videojuego_id.$id);
          return {
            ...pref,
            gameInfo: gameInfo || null
          };
        })
      );
      setUserGames(gamesWithInfo);
    } catch (err) {
      console.error("Error cargando juegos del usuario:", err);
    } finally {
      setLoadingGames(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen válido");
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      alert("La imagen es demasiado grande (máx. 5MB)");
      return;
    }

    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const handleDeleteGame = async (gameId, gameInfoId, userGameId) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este juego de tu perfil?")) {
      return;
    }

    try {
      const user = await account.get();
      
      // Eliminar la información adicional del juego si existe
      if (gameInfoId) {
        await deleteUserGameInfo(gameInfoId);
      }
      
      // Eliminar la preferencia de juego principal
      if (userGameId) {
        await deleteUserGamePreference(userGameId);
      }
      
      // Recargar la lista de juegos
      await loadUserGames(user.$id);
      alert("Juego eliminado correctamente");
    } catch (err) {
      console.error("Error eliminando juego:", err);
      alert("Error al eliminar el juego");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const user = await account.get();

      let imageUrl = form.foto_perfil_url;
      if (file) {
        imageUrl = await uploadProfileImage(file, user.$id);
      }

      await updateUserProfile(user.$id, {
        ...form,
        text_size: parseInt(form.text_size),
        foto_perfil_url: imageUrl
      });
 
      alert("Perfil actualizado correctamente");
      navigate("/LoadingPage", { state: { from: 'Game' } });
    } catch (err) {
      console.error(err);
      alert("Error al actualizar perfil");
    }
  };

  return (
    <div className="settings-page">
      <h2>⚙️ Configuración de Perfil</h2>
      <form onSubmit={handleUpdate}>
        {/* Sección de configuración básica */}
        <div className="form-section">
          <Input
            label="Nombre de usuario"
            name="nombre_usuario"
            value={form.nombre_usuario}
            onChange={handleChange}
          />
          {/* Agrega aquí los demás campos del formulario... */}
        </div>

        {/* Sección de videojuegos del usuario */}
        <div className="user-games-section">
          <h3>Tus Videojuegos</h3>
          
          {loadingGames ? (
            <p>Cargando tus juegos...</p>
          ) : userGames.length === 0 ? (
            <p>No tienes juegos añadidos aún.</p>
          ) : (
            <div className="games-list">
              {userGames.map((game) => (
                <div key={game.$id} className="game-item">
                  <div className="game-info">
                    <h4>{game.videojuego_id.nombre}</h4>
                    <p>Nivel: {game.nivel_juego}</p>
                    {game.gameInfo && (
                      <>
                        <p>Nickname: {game.gameInfo.nickname_en_juego}</p>
                        {game.gameInfo.rol && <p>Rol: {game.gameInfo.rol}</p>}
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteGame(
                      game.videojuego_id.$id, 
                      game.gameInfo?.$id,
                      game.$id
                    )}
                    className="delete-game-btn"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <Button 
            type="button" 
            onClick={() => navigate("/CrearPrefJuegos")}
            style={{ marginTop: '1rem' }}
          >
            Añadir Nuevo Juego
          </Button>

          <Button 
            type="button" 
            onClick={() => navigate("/createGameInfoUser")}
            style={{ marginTop: '1rem' }}
          >
            Editar Nickname y roles
          </Button>
        </div>

        <Button type="submit">Guardar cambios</Button>
      </form>
    </div>
  );
}