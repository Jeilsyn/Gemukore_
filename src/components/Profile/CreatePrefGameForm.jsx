import React, { useState, useEffect } from 'react';
import {
  createUserGamesProfile,
  getAllVideoGames,
  searchVideoGames,
  getUserGamesPreferences
} from '../../lib/services/appwrite/collections';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  fadeInUp,
  fadeIn,
  buttonHover,
  buttonTap
} from "../animations/animation";

function CreatePrefGameForm({ userId }) {
  const [allGames, setAllGames] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredGames, setFilteredGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [nivelJuego, setNivelJuego] = useState('');
  const [favorito, setFavorito] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [userCurrentGames, setUserCurrentGames] = useState([]);
  const [formMessage, setFormMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // "success" | "error"
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const [games, userGames] = await Promise.all([
          getAllVideoGames(),
          userId ? getUserGamesPreferences(userId) : Promise.resolve([])
        ]);
        setAllGames(games);
        setUserCurrentGames(userGames.map(g => g.videojuego_id.$id));
      } catch (error) {
        console.error('Error cargando datos:', error);
      }
    }
    fetchData();
  }, [userId]);

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearch(value);
    setSelectedGame(null);

    if (searchTimeout) clearTimeout(searchTimeout);

    if (value.trim().length >= 2) {
      setSearchTimeout(
        setTimeout(async () => {
          try {
            const results = await searchVideoGames(value);
            const filtered = results.filter(game =>
              !userCurrentGames.includes(game.$id)
            );
            setFilteredGames(filtered);
          } catch (error) {
            console.error('Error en búsqueda:', error);
            const filtered = allGames.filter(game =>
              game.nombre.toLowerCase().includes(value.toLowerCase()) &&
              !userCurrentGames.includes(game.$id)
            );
            setFilteredGames(filtered.slice(0, 50));
          }
        }, 300)
      );
    } else {
      setFilteredGames([]);
    }
  };

  const handleSelectGame = (game) => {
    setSelectedGame(game);
    setSearch(game.nombre);
    setFilteredGames([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage('');
    setMessageType('');

    if (!selectedGame || !nivelJuego) {
      setFormMessage('Por favor selecciona un videojuego y tu nivel.');
      setMessageType('error');
      return;
    }

    if (!userId) {
      setFormMessage('Error: No se pudo identificar al usuario');
      setMessageType('error');
      return;
    }

    const profileData = {
      usuario_id: userId,
      videojuego_id: selectedGame.$id,
      favorito,
      nivel_juego: nivelJuego,
    };

    try {
      setLoading(true);
      await createUserGamesProfile(profileData);
      setFormMessage('✅ Juego añadido correctamente.');
      setMessageType('success');
      setTimeout(() => {
        navigate("/createGameInfoUser");
      }, 1500);
    } catch (err) {
      console.error('Error al guardar:', err);
      setFormMessage(`❌ Error al añadir juego: ${err.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [searchTimeout]);

  useEffect(() => {
    if (formMessage) {
      const timeout = setTimeout(() => {
        setFormMessage('');
        setMessageType('');
      }, 4000);
      return () => clearTimeout(timeout);
    }
  }, [formMessage]);

  return (
    <motion.div className="profile-form-container" {...fadeInUp}>
      <h2>Añadir Nuevo Juego</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <Input
            label="Buscar videojuego"
            id="search"
            value={search}
            onChange={handleSearchChange}
            placeholder="Escribe al menos 2 caracteres..."
          />
          {search && !selectedGame && (
            <div className="suggestions">
              {filteredGames.length > 0 ? (
                <div className="suggestions-list">
                  {filteredGames.map((game) => (
                    <div
                      key={game.$id}
                      className="suggestion-item"
                      onClick={() => handleSelectGame(game)}
                    >
                      {game.nombre}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-results">
                  {userCurrentGames.length > 0 && filteredGames.length === 0
                    ? "Ya tienes este juego añadido"
                    : "No se encontraron juegos"}
                </p>
              )}
            </div>
          )}
        </div>

        {selectedGame && (
          <motion.div className="form-group" {...fadeIn}>
            <strong>Juego seleccionado:</strong>
            <h1 className='selectGame'>{selectedGame.nombre}</h1>
          </motion.div>
        )}

        <div className="form-group">
          <label htmlFor="nivelJuego">Tu nivel en el juego:</label>
          <select
            id="nivelJuego"
            value={nivelJuego}
            onChange={(e) => setNivelJuego(e.target.value)}
            required
          >
            <option value="">-- Selecciona nivel --</option>
            <option value="principiante">Principiante</option>
            <option value="intermedio">Intermedio</option>
            <option value="veterano">Veterano</option>
          </select>
        </div>

        <div className="form-group checkbox-group">
          <label>
            Marcar como favorito<br />
            <input
              type="checkbox"
              checked={favorito}
              onChange={(e) => setFavorito(e.target.checked)}
            />
          </label>
        </div>

        {/* Mensaje de feedback */}
        {formMessage && (
          <div className={`form-message ${messageType}`}>
            {formMessage}
          </div>
        )}

        <div className="form-actions">
          <motion.div whileHover={buttonHover} whileTap={buttonTap}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/settings")}
            >
              Cancelar
            </Button>
          </motion.div>
          <motion.div whileHover={buttonHover} whileTap={buttonTap}>
            <Button
              type="submit"
              loading={loading}
              disabled={!selectedGame || !nivelJuego}
            >
              Añadir Juego
            </Button>
          </motion.div>
        </div>
      </form>
    </motion.div>
  );
}

export default CreatePrefGameForm;
