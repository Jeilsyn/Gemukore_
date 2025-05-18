import React, { useState, useEffect } from 'react';
import { 
  getTutorialStats,
  blockUser,
  unblockUser,
  deleteUserAccount,
  getAllUsersAdmin,
  getAllVideoGames
} from '../../lib/services/appwrite/collections';

function HistorialUsuarios() {
  const [tutorialStats, setTutorialStats] = useState({
    tutorialesPopulares: [],
    totalTutoriales: 0
  });
  const [videojuegosMap, setVideojuegosMap] = useState({});
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState({
    users: true,
    stats: true,
    videojuegos: true
  });
  const [error, setError] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);



  // Cargar usuarios
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usuarios = await getAllUsersAdmin();
        setUsers(usuarios);
      } catch (err) {
        setError('Error al cargar usuarios');
        console.error(err);
      } finally {
        setLoading(prev => ({ ...prev, users: false }));
      }
    };
    loadUsers();
  }, []);

const handleDeleteUser = async (userId) => {
  if (actionInProgress) return;
  
  setActionInProgress(true);
  setError(null);
  setDeleteMessage('');

  try {
    if (window.confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
      const result = await deleteUserAccount(userId);
      
      setDeleteMessage(result.message || "Usuario eliminado correctamente");
      setTimeout(() => setDeleteMessage(''), 5000);
      
      // Actualizar lista de usuarios
      setUsers(prevUsers => prevUsers.filter(user => user.$id !== userId));
    }
  } catch (err) {
    setError(err.message || 'Ocurrió un error al eliminar el usuario');
    console.error("Error en handleDeleteUser:", err);
  } finally {
    setActionInProgress(false);
  }
};
const handleBlockUser = async (userId) => {
  if (actionInProgress) return;
  
  setActionInProgress(true);
  setError(null);
  
  try {
    const result = await blockUser(userId);
    console.log("Resultado del bloqueo:", result);
    
    // Actualiza el estado local
    setUsers(users.map(user => 
      user.$id === userId ? { ...user, status: 'blocked' } : user
    ));
  } catch (err) {
    setError(err.message || 'Error al bloquear usuario');
    console.error("Detalles del error:", err);
  } finally {
    setActionInProgress(false);
  }
};

const handleUnblockUser = async (userId) => {
  if (actionInProgress) return;
  setActionInProgress(true);
  setError(null);
  
  try {
    const result = await unblockUser(userId);
    console.log("Resultado del desbloqueo:", result);
    
    // Actualiza el estado local
    setUsers(users.map(user => 
      user.$id === userId ? { ...user, status: 'active' } : user
    ));
  } catch (err) {
    setError(err.message || 'Error al desbloquear usuario');
    console.error("Detalles del error:", err);
  } finally {
    setActionInProgress(false);
  }
};
   return (
    <div className="admin-container">
      <h1 className="admin-title">Panel de Administración</h1>

 
      {/* Sección de usuarios */}
      <section className="users-section">
        <h2>Gestión de Usuarios</h2>
        
        {deleteMessage && (
          <div className="success-message">
            {deleteMessage}
          </div>
        )}

        <div className="table-responsive">
          <table className="users-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.$id} className={user.blocked ? 'blocked-user' : ''}>
                  <td>{user.nombre_usuario || 'Sin nombre'}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`status-badge ${user.blocked ? 'blocked' : 'active'}`}>
                      {user.blocked ? 'Bloqueado' : 'Activo'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    {user.blocked ? (
                      <button
                        onClick={() => handleUnblockUser(user.$id)}
                        disabled={actionInProgress}
                        className="unblock-btn"
                      >
                        Desbloquear
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBlockUser(user.$id)}
                        disabled={actionInProgress}
                        className="block-btn"
                      >
                        Bloquear
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (window.confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
                          handleDeleteUser(user.$id);
                        }
                      }}
                      disabled={actionInProgress}
                      className="delete-btn"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default HistorialUsuarios;
