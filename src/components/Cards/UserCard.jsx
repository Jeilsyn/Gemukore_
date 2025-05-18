import React from 'react';
import './MtachCards.css';
 
function PokemonCard({ match, onClick, isSelected }) {
  const mainGame = match.games?.[0];

  return (
    <div
      className={`pokemon-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onClick(match)}
    >
      <div className="card-content">
        <div className="card-image">
          <img
            src={match.user.photo || '/default-user.png'}
            alt={match.user.name}
            onError={(e) => {
              e.target.src = '/default-user.png';
            }}
          />
        </div>
        <div className="card-info">
          <h3>{match.user.name}</h3>
         
        </div>
      </div>
    </div>
  );
}export default PokemonCard;