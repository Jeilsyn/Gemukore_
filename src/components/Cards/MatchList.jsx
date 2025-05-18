import React, { useState, useEffect } from 'react';
import { getMatchesWithGameInfo } from '../../lib/services/appwrite/collections';
import PokemonCard from './UserCard';

function MatchList({ userId }) {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadMatches() {
      if (!userId) return;

      console.log("userId:", userId); // DEBUG

      try {
        setLoading(true);
        setError(null);

        const userMatches = await getMatchesWithGameInfo(userId);
        console.log("Matches obtenidos:", userMatches); // DEBUG
        setMatches(userMatches);
      } catch (error) {
        console.error("Error loading matches:", error);
        setError("Error al cargar matches. Por favor, intenta nuevamente.");
      } finally {
        setLoading(false);
      }
    }

    loadMatches();
  }, [userId]);

  if (loading) return <div className="loading">Cargando matches...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="game-board-container">
      <h1>Tus Matches de Juego</h1>

      {matches.length === 0 ? (
        <div className="no-matches">
          <p>Aún no tienes matches. ¡Sigue buscando!</p>
        </div>
      ) : (
        <div className="matches-grid">
          {matches.map(match => (
            <PokemonCard 
              key={match.$id}
              match={match}
              onClick={() => setSelectedMatch(match)}
              isSelected={selectedMatch?.$id === match.$id}
            />
          ))}
        </div>
      )}
      
      {selectedMatch && (
        <div className="match-detail">
          <h2>Detalles de {selectedMatch.user.name}</h2>
          <div className="game-details">
            {selectedMatch.games.map(game => (
              <div key={game.$id} className="game-info">
                <h3>{game.nombre}</h3>
                <p><strong>Nickname:</strong> {game.nickname_en_juego || 'No especificado'}</p>
                <p><strong>Rol:</strong> {game.rol || 'No especificado'}</p>
                <p><strong>Nivel:</strong> {game.nivel_juego || 'No especificado'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MatchList;
