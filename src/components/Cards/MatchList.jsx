import React, { useState, useEffect } from 'react';
import { getMatchesWithGameInfo } from '../../lib/services/appwrite/collections';
import { useUser } from '../../context/AuthContext';
import PokemonCard from './UserCard';
/* import './MatchCards.css';
 */
function MatchList() {
  const { user } = useUser();
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMatches() {
      if (user) {
        try {
          const userMatches = await getMatchesWithGameInfo(user.$id);
          setMatches(userMatches);
        } catch (error) {
          console.error("Error loading matches:", error);
        } finally {
          setLoading(false);
        }
      }
    }
    
    loadMatches();
  }, [user]);

  if (loading) return <div className="loading">Cargando matches...</div>;

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
              key={match.matchId}
              match={match}
              onClick={() => setSelectedMatch(match)}
              isSelected={selectedMatch?.matchId === match.matchId}
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
                <h3>{game.nombre || game.videojuego_id?.nombre}</h3>
                <p><strong>Nickname:</strong> {game.nickname_en_juego}</p>
                <p><strong>Rol:</strong> {game.rol}</p>
                <p><strong>Nivel:</strong> {game.nivel_juego}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MatchList;