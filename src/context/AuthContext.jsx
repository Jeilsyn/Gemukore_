import { ID } from "appwrite";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { account } from "../lib/services/appwrite/appwriteClient";
import { updateUserProfile, getUserProfile } from '../lib/services/appwrite/collections';
const UserContext = createContext();

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider(props) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [canAccessCreatePerfil, setcanAccessCreatePerfil] = useState(false);

  async function login(email, password, isRegistering = false) {
    try {
      await account.createEmailPasswordSession(email, password);
      const loggedIn = await account.get(); // Datos del usuario
      setUser(loggedIn);
      setcanAccessCreatePerfil(false);

      if (!isRegistering) {
        try {
          const profile = await getUserProfile(loggedIn.$id);
          if (profile) {
            await bonificarSiCorresponde(loggedIn.$id); //  Bonificación
           
            const updatedProfile = await getUserProfile(loggedIn.$id); // Obtener perfil actualizado
            setUser((prevState) => ({
              ...prevState,
              thomcoins: updatedProfile.thomcoins, // Actualizamos los thomcoins
            }));
          } else {
            console.warn("No se encontró perfil del usuario.");
          }
        } catch (err) {
          console.warn("Perfil aún no creado:", err.message);
        }

        navigate("/");
      }

      return true;
    } catch (err) {
      throw err;
    }
  }
  async function bonificarSiCorresponde(userId) {
    try {
      const profile = await getUserProfile(userId);
      const now = new Date();
      const ultimaBonificacion = new Date(profile.ultima_bonificacion);
      const diffHours = (now - ultimaBonificacion) / (1000 * 60 * 60);

      if (diffHours >= 24) {
        await updateUserProfile(userId, {
          thomcoins: profile.thomcoins + 2500,
          ultima_bonificacion: now.toISOString()
        });
        console.log(` Bonificación aplicada a ${userId}.`);
      }
    } catch (error) {
      console.error(" Error al aplicar bonificación:", error);
    }
  }
  async function logout() {
    await account.deleteSession("current");
    setUser(null);
    navigate("/login");
  }

  async function register(email, password, username) {
    await account.create(ID.unique(), email, password, username);
    await login(email, password, true);
    navigate("/crearPerfil"); // Aquí se creará el perfil del usuario
  }

  async function init() {
    try {
      const loggedIn = await account.get();
      setUser(loggedIn);
    } catch {
      setUser(null);
    }
  }

  useEffect(() => {
    init();
  }, []);

  return (
    <UserContext.Provider value={{
      current: user,
      login,
      logout,
      register,
      canAccessCreatePerfil,
      setcanAccessCreatePerfil
    }}>
      {props.children}
    </UserContext.Provider>
  );
}
