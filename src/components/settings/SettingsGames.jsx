import { useEffect, useState } from "react";
import { account } from "../../lib/services/appwrite/appwriteClient";
import {
  getUserProfile,
  getUserGamesPreferences,
  deleteUserGameInfo,
  deleteUserGamePreference,
  getUserGameInfoByGame
} from "../../lib/services/appwrite/collections";
import Button from "../ui/Button";
import Input from "../ui/InputPerfil";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useFontSize } from "../../context/FontSizeContext";
import "../../styles/Settings/setings2.css"
import i18n from "../../lib/translate/i18n.js"

export default function SettingsGame() {
    const { t } = useTranslation();
  const { fontSize, setFontSize } = useFontSize();
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

  if (response.idioma) {
          await i18n.changeLanguage(response.idioma);
        }

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
  }, [t]);

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
    setForm(prev => ({ ...prev, [name]: value }));
    
    if (name === "text_size") {
      setFontSize(parseInt(value));
    }


  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      alert(t("settingsGame.errors.invalidImage"));
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      alert(t("settingsGame.errors.imageTooLarge"));
      return;
    }

    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

const handleDeleteGame = async (gameId, gameInfoId, userGameId) => {
  if (!window.confirm(t("settingsGame.confirmDelete"))) {
    return;
  }

  try {
    const user = await account.get();
    
    // Eliminar la información del juego si existe
    if (gameInfoId) {
      await deleteUserGameInfo(gameInfoId);
    }
    
    // Eliminar la preferencia del juego
    await deleteUserGamePreference(userGameId);
    
    // Recargar la lista de juegos
    await loadUserGames(user.$id);
    
    alert(t("settingsGame.gameDeleted"));
  } catch (err) {
    console.error(t("settingsGame.errors.deleteError"), err);
    alert(t("settingsGame.errors.deleteFailed"));
  }
};
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // ... lógica de actualización
      alert(t("settingsGame.profileUpdated"));
      navigate("/LoadingPage", { state: { from: 'Game' } });
    } catch (err) {
      console.error(t("settingsGame.errors.updateError"), err);
      alert(t("settingsGame.errors.updateFailed"));
    }
  };

  return (
    <div className="settings-page">
      <h2>{t("settingsGame.title")}</h2>
      <form onSubmit={handleUpdate}>
        <div className="form-section">
         
          {/* Otros campos del formulario */}
        </div>

        <div className="user-games-section">
          <h3>{t("settingsGame.yourGames")}</h3>
          
          {loadingGames ? (
            <p>{t("settingsGame.loadingGames")}</p>
          ) : userGames.length === 0 ? (
            <p>{t("settingsGame.noGames")}</p>
          ) : (
            <div className="games-list">
              {userGames.map((game) => (
                <div key={game.$id} className="game-item">
                  <div className="game-info">
                    <h4>{game.videojuego_id.nombre}</h4>
                    <p>{t("settingsGame.level")}: {game.nivel_juego}</p>
                    {game.gameInfo && (
                      <>
                        <p>{t("settingsGame.nickname")}: {game.gameInfo.nickname_en_juego}</p>
                        {game.gameInfo.rol && <p>{t("settingsGame.role")}: {game.gameInfo.rol}</p>}
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
                    className="delete-game-btn2"
                  >
                    {t("settingsGame.delete")}
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
            {t("settingsGame.addGame")}
          </Button>

          <Button 
            type="button" 
            onClick={() => navigate("/createGameInfoUser")}
            style={{ marginTop: '1rem' }}
          >
            {t("settingsGame.editNickname")}
          </Button>
        </div>

      </form>
    </div>
  );
}

