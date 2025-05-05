import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/AuthContext';
import ButtonLogOut from './ui/ButtonLogOut';
import { getUserProfile } from '../lib/services/appwrite/collections';
import { Client, Storage } from 'appwrite';

const NavBar = () => {
  const { current, logout } = useUser();
  const [profile, setProfile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (current) {
        try {
          const data = await getUserProfile(current.$id);
          console.log("Perfil cargado:", data);
          setProfile(data);

          // SDK de Appwrite: generar URL segura
          const client = new Client()
            .setEndpoint('https://fra.cloud.appwrite.io/v1')
            .setProject('680e27de001ffc71f5a7');

          const storage = new Storage(client);

          // Suponiendo que el campo `foto_perfil_url` contiene el ID del archivo, no la URL completa
          const fileId = data.foto_perfil_url.split('/files/')[1]?.split('/')[0];
          const bucketId = '680e342900053bdb9610';

          if (fileId) {
            // Cambiar la URL de "preview" a "view" para obtener una URL válida para imágenes
            const url = `https://fra.cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${fileId}/view?project=680e27de001ffc71f5a7`;

            setPreviewUrl(url);
          }
        } catch (error) {
          console.error("Error obteniendo perfil:", error);
        }
      }
    };

    fetchProfile();
  }, [current]);

  return (
    <nav className="navbar">
      <ul>
        <li><Link to="/">Inicio</Link></li>
        {!current && <li><Link to="/login">Iniciar sesión</Link></li>}

        {current && profile && (
          <>
            <li><Link to="/settings">Configuración</Link></li>
            <li><Link to="/match">Match</Link></li>
            <li><Link to="/requests">Requests</Link></li>
            <li className="nav-info">
              🪙 {profile.thomcoins} Thomcoins
            </li>
            <li className="nav-profile">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Foto de perfil"
                  style={{ width: "32px", height: "32px", borderRadius: "50%" }}
                />
              )}
            </li>
            <li>
              <ButtonLogOut onClick={logout}>Cerrar Sesión</ButtonLogOut>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default NavBar;
