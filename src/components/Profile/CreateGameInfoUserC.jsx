import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  getUserGamesPreferences,
  getUserGameInfoByGame,
  upsertUserGameInfo,
  getAllVideoGames
} from '../../lib/services/appwrite/collections';
import Input from '../ui/InputGIU';
import Button from '../ui/Button';
import { fadeInUp, scaleFadeIn, fadeIn } from '../animations/animation';
import "../../styles/CreateProfile/perfil3.css"

function CreateGameInfoUserC({ userId }) {
  const [userGames, setUserGames] = useState([]);
  const [allGames, setAllGames] = useState([]);
  const [selectedGameId, setSelectedGameId] = useState('');
  const [gameInfo, setGameInfo] = useState({ nickname: '', rol: '' });
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    async function loadData() {
      if (userId) {
        try {
          const gamesPrefs = await getUserGamesPreferences(userId);
          const gamesList = await getAllVideoGames();
          const combinedGames = gamesPrefs.map(pref => {
            const gameId = pref.videojuego_id?.$id;
            const gameInfo = gamesList.find(game => game.$id === gameId);
            return {
              ...pref,
              nombre: gameInfo?.nombre || pref.videojuego_id?.nombre || `Juego (ID: ${gameId})`,
              videojuego_id: gameId || pref.videojuego_id
            };
          });

          setUserGames(combinedGames);
          setAllGames(gamesList);
          setFormLoading(false);
        } catch (err) {
          console.error("Error loading data:", err);
          setError("Error al cargar los juegos");
          setFormLoading(false);
        }
      }
    }

    loadData();
  }, [userId]);

  useEffect(() => {
    async function loadGameInfo() {
      if (selectedGameId && userId) {
        try {
          const info = await getUserGameInfoByGame(userId, selectedGameId);
          if (info) {
            setGameInfo({
              nickname: info.nickname_en_juego || '',
              rol: info.rol || ''
            });
          } else {
            setGameInfo({ nickname: '', rol: '' });
          }
        } catch (err) {
          console.error("Error loading game info:", err);
          setError("Error al cargar la información del juego");
        }
      }
    }

    loadGameInfo();
  }, [selectedGameId, userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGameInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGameId || !gameInfo.nickname) {
      setError("Debes seleccionar un juego y proporcionar un nickname");
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');

      await upsertUserGameInfo(userId, selectedGameId, {
        nickname: gameInfo.nickname,
        rol: gameInfo.rol
      });

      const updatedInfo = await getUserGameInfoByGame(userId, selectedGameId);
      if (updatedInfo) {
        setGameInfo({
          nickname: updatedInfo.nickname_en_juego || '',
          rol: updatedInfo.rol || ''
        });
      }

      setSuccessMessage("Información guardada correctamente ✅");
    } catch (err) {
      console.error("Error saving game info:", err);
      setError("Error al guardar la información");
    } finally {
      setLoading(false);
    }
  };

  if (formLoading) {
    return <motion.div className="loading" {...fadeIn}>Cargando tus juegos...</motion.div>;
  }

  if (userGames.length === 0) {
    return (
      <motion.div className="no-games" {...fadeInUp}>
        <p>No tienes juegos registrados aún.</p>
        <p>Primero añade tus juegos preferidos en la sección correspondiente.</p>
      </motion.div>
    );
  }

  return (
    <motion.div className="game-info-form-container" {...fadeInUp}>
      <h2>Configura tus nicknames y roles</h2>
      <p>Completa tu información para cada juego que hayas añadido</p>

      <form onSubmit={handleSubmit}>
        <motion.div className="form-group" {...fadeIn}>
          <label htmlFor="game-select">Selecciona un juego:</label>
          <select
            id="game-select"
            value={selectedGameId}
            onChange={(e) => setSelectedGameId(e.target.value)}
            required
          >
            <option value="">-- Selecciona un juego --</option>
            {userGames.map(game => (
              <option key={game.$id} value={game.videojuego_id}>
                {game.nombre}
              </option>
            ))}
          </select>
        </motion.div>

        {selectedGameId && (
          <>
            <motion.div className="form-group" {...fadeIn}>
              <Input
                label="Tu nickname en este juego:"
                id="nickname"
                name="nickname"
                value={gameInfo.nickname}
                onChange={handleInputChange}
                required
                placeholder="Ej: Player123"
              />
            </motion.div>

            <motion.div className="form-group" {...fadeIn}>
              <Input
                label="Tu rol principal (opcional):"
                id="rol"
                name="rol"
                value={gameInfo.rol}
                onChange={handleInputChange}
                placeholder="Ej: Tanque, DPS, Support"
              />
            </motion.div>

            {error && <div className="error-message">{error}</div>}
            {successMessage && (
              <motion.div className="success-message" {...fadeIn}>
                {successMessage}
              </motion.div>
            )}

            <motion.div className="buttonNick" whileHover={{ scale: 1.05 }}>
              <Button type="submit" loading={loading}>
                Guardar Información
              </Button>
              <Button role="link" onClick={() => window.location = '/'}>
                Salir
              </Button>
            </motion.div>
          </>
        )}
      </form>
    </motion.div>
  );
}

export default CreateGameInfoUserC;
