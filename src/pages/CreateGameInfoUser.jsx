import React from 'react';
import CreateGameInfoUserC from '../components/Profile/CreateGameInfoUserC';
import { useUser } from '../context/AuthContext';

function CreateGameInfoUser() {
  const { current } = useUser();

  if (!current) {
    return <p>Cargando usuario...</p>;
  }

  return (
    <div className="page-container">
      <h1>Configuración de tus Juegos</h1>
      <CreateGameInfoUserC userId={current.$id} />
    </div>
  );
}

export default CreateGameInfoUser;
