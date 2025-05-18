import React, { useEffect } from 'react';
import { useUser } from '../context/AuthContext';
import MatchList from '../components/Cards/MatchList';

function GameBoard() {
  const { current } = useUser();


  if (!current) {
    return <div className="loading">Cargando usuario...</div>;
  }

  return (
    <div className="game-board-page">
      <MatchList userId={current.$id} />
    </div>
  );
}

export default GameBoard;
