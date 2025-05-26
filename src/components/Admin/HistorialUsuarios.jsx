import React, { useState, useEffect } from 'react';
import {
/*   getTutorialStats,
 */  blockUser,
/*   unblockUser,
 */  deleteUserAccount,
  getAllUsersAdmin,
/*   getAllVideoGames
 */} from '../../lib/services/appwrite/collections';
import "../../styles/Admin/historial.css";
import { motion } from 'framer-motion';

//En este componente genero una tabla con los usuarios y el admin puede bloquearlos 
function HistorialUsuarios() {

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState({
    users: true,
    stats: true,
    videojuegos: true
  });
  const [error, setError] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);

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
        setUsers(prevUsers => prevUsers.filter(user => user.$id !== userId));
      }
    } catch (err) {
      setError(err.message || 'Ocurrió un error al eliminar el usuario');
      //Depuro el codigo para ver donde puede fallar 
      console.error("Error en handleDeleteUser:", err);
    } finally {
      setActionInProgress(false);
    }
  };


  /* 
  Parte que no funciona de la parte de bloquear usuarios: codigo correcto pero parece un porblema de Appwrite 

  const handleUnblockUser = async (userId) => {
    if (actionInProgress) return;
    setActionInProgress(true);
    setError(null);

    try {
      const result = await unblockUser(userId);
      console.log("Resultado del desbloqueo:", result);
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
  */

  return (
    <div className="admin-container">
      <h1 className="admin-title">Panel de Administración</h1>

      <section className="users-section">
        <h2>Gestión de Usuarios</h2>

        {deleteMessage && (
          <div className="success-message">
            {deleteMessage}
          </div>
        )}

        <motion.div
          className="table-responsive"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <table className="users-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.$id} className={user.blocked ? 'blocked-user' : ''}>
                  <td>{user.nombre_usuario || 'Sin nombre'}</td>
                  <td>{user.email}</td>
                  {/* 
                  <td>
                    <span className={`status-badge ${user.blocked ? 'blocked' : 'active'}`}>
                      {user.blocked ? 'Bloqueado' : 'Activo'}
                    </span>
                  </td> 
                  */}
                  {/**No se activara porque no se bloquea usuarios*/}
                  <td className="actions-cell">
                    {user.blocked ? (
                      <button
                        // onClick={() => handleUnblockUser(user.$id)}
                        disabled={actionInProgress}
                        className="unblock-btn"
                      >
                        Desbloquear
                      </button>
                    ) : (
                      <>
                        {/* 
                        <button 
                          onClick={() => handleBlockUser(user.$id)}
                          disabled={actionInProgress}
                          className="block-btn"
                        >
                          Bloquear
                        </button> 
                        */}
                      </>
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
        </motion.div>
      </section>
    </div>
  );
}

export default HistorialUsuarios;
