import React, { useEffect, useState } from 'react';
import { account } from '../../lib/services/appwrite/appwriteClient';
import {
    getAllUsers,
    getUserGamesPreferencesWithNames,
    createLike,
    skipUser
} from '../../lib/services/appwrite/collections.js';
import Button from '../ui/Button';

export default function Matches() {
    const [candidates, setCandidates] = useState([]);
    const [index, setIndex] = useState(0);
    const [prefs, setPrefs] = useState([]);

    useEffect(() => {
        async function loadCandidates() {
            try {
                const user = await account.get();
                if (!user?.$id) throw new Error("No se pudo obtener el ID del usuario");
                const all = await getAllUsers(user.$id);
                setCandidates(all);
            } catch (error) {
                console.error("Error cargando candidatos:", error);
            }
        }
        loadCandidates();
    }, []);

    useEffect(() => {
        if (candidates[index]?.$id) {
            getUserGamesPreferencesWithNames(candidates[index].$id)
                .then(prefs => {
                    setPrefs(prefs);
                })
                .catch(error => {
                    console.error("Error cargando preferencias:", error);
                });
        }
    }, [candidates, index]);

    const handleMatch = async () => {
        try {
            const currentUser = await account.get();
            if (!currentUser?.$id) throw new Error("Usuario no autenticado");
            
            const other = candidates[index];
            if (!other?.$id) throw new Error("Candidato inválido");
            
            await createLike(currentUser.$id, other.$id, 'pendiente_receptor');
            nextCandidate();
        } catch (error) {
            console.error("Error al hacer match:", error);
        }
    };

    const handleSkip = async () => {
        try {
            const currentUser = await account.get();
            if (!currentUser?.$id) throw new Error("Usuario no autenticado");
            
            const other = candidates[index];
            if (!other?.$id) throw new Error("Candidato inválido");
            
            await skipUser(currentUser.$id, other.$id);
            nextCandidate();
        } catch (error) {
            console.error("Error al saltar usuario:", error);
        }
    };

    const nextCandidate = () => {
        setIndex(i => (i + 1 < candidates.length ? i + 1 : 0));
    };

    if (!candidates.length) return <div>Cargando candidatos...</div>;
    const user = candidates[index];

    return (
        <div className="card">
            <img src={user.foto_perfil_url} className="profile-img" alt="Perfil" />
            <h3>{user.nombre_usuario}</h3>
            <p>{user.descripcion}</p>
            <h4>Preferencias de Juego:</h4>
            <ul>
                {prefs.map(pref => (
                    <li key={pref.$id}>
                        {pref.nombre} — Nivel: {pref.nivel_juego} {pref.favorito ? "❤️" : ""}
                    </li>
                ))}
            </ul>
            <div className="actions">
                <Button onClick={handleSkip}>Skip</Button>
                <Button onClick={handleMatch}>Match</Button>
            </div>
        </div>
    );
}