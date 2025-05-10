import React from 'react';
import './MtachCards.css';
 
function PokemonCard({ match, onClick, isSelected }) {
  const mainGame = match.games[0]; // Tomamos el primer juego como principal

  return (
    <div 
      className={`pokemon-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="card-content">
        <div className="card-image">
          <img src={match.user.photo} alt={match.user.name} />
        </div>
        <div className="card-info">
          <h3>{match.user.name}</h3>
          <p className="game-name">{mainGame.nombre || mainGame.videojuego_id?.nombre}</p>
          <p className="game-nickname">{mainGame.nickname_en_juego}</p>
          <p className="game-role">{mainGame.rol}</p>
        </div>
      </div>
    </div>
  );
}

export default PokemonCard;