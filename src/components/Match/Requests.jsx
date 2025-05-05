import React, { useEffect, useState } from 'react';
import { account } from '../../lib/services/appwrite/appwriteClient';
import {
    getPendingLikes,
    updateLike,
    createMatch,
    getUserProfile,
    getUserGamesPreferencesWithNames
} from '../../lib/services/appwrite/collections.js';
import Button from '../ui/Button';

export default function Requests() {
    const [pending, setPending] = useState([]);
    const [profiles, setProfiles] = useState({});
    const [prefsMap, setPrefsMap] = useState({});

    useEffect(() => {
        async function loadPending() {
            try {
                const user = await account.get();
                if (!user?.$id) throw new Error("Usuario no autenticado");
                
                const likes = await getPendingLikes(user.$id);
                setPending(likes);
                
                for (let like of likes) {
                    if (!like?.emisor_id) {
                        console.error("Like sin emisor_id:", like);
                        continue;
                    }
                    
                    try {
                        const prof = await getUserProfile(like.emisor_id.$id);
                        const gamePrefs = await getUserGamesPreferencesWithNames(like.emisor_id.$id);
                        setProfiles(p => ({ ...p, [like.$id]: prof }));
                        setPrefsMap(m => ({ ...m, [like.$id]: gamePrefs }));
                    } catch (error) {
                        console.error(`Error cargando perfil para like ${like.$id}:`, error);
                    }
                }
            } catch (error) {
                console.error("Error cargando solicitudes pendientes:", error);
            }
        }
        loadPending();
    }, []);

    const handleDecision = async (like, decision) => {
        try {
          if (!like?.$id || !like?.emisor_id?.$id) {
            throw new Error("Datos de like incompletos");
          }
      
          const user = await account.get();
          if (!user?.$id) throw new Error("Usuario no autenticado");
      
          if (decision === 'accept') {
            const matchDoc = await createMatch(like.emisor_id.$id, user.$id);
            await updateLike(like.$id, {
              estado: 'aceptado_receptor',
              match_id: matchDoc.$id
            });
          } else {
            await updateLike(like.$id, { estado: 'rechazado_receptor' });
          }
          
          setPending(p => p.filter(l => l.$id !== like.$id));
        } catch (error) {
          console.error("Error al procesar decisión:", error);
          // Puedes mostrar un mensaje de error al usuario aquí
          alert("Error al procesar la solicitud: " + error.message);
        }
      };
          if (!pending.length) return <div>No tienes solicitudes de match pendientes.</div>;

        

    return (
        <div>
            {pending.map(like => {
                const user = profiles[like.$id];
                const games = prefsMap[like.$id] || [];
                if (!user) return null;
                
                return (
                    <div key={like.$id} className="card">
                        {user.foto_perfil_url ? (
                            <img src={user.foto_perfil_url} alt={user.nombre_usuario} />
                        ) : (
                            <div className="no-image">Sin imagen</div>
                        )}
                        <h3>{user.nombre_usuario}</h3>
                        <p>{user.descripcion}</p>
                        <h4>Preferencias de Juego:</h4>
                        <ul>
                            {games.map(g => <li key={g.$id}>{g.nombre}</li>)}
                        </ul>
                        <div className="actions">
                            <Button onClick={() => handleDecision(like, 'reject')}>Rechazar</Button>
                            <Button onClick={() => handleDecision(like, 'accept')}>Aceptar</Button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}