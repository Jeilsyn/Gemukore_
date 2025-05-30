import { ID } from "appwrite";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { account } from "../lib/services/appwrite/appwriteClient";
import { updateUserProfile, getUserProfile } from '../lib/services/appwrite/collections';
const UserContext = createContext();

export function useUser() {
  return useContext(UserContext);
}
// Componente proveedor del contexto de usuario
export function UserProvider(props) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [canAccessCreatePerfil, setcanAccessCreatePerfil] = useState(false);
  // Función para iniciar sesión o también se usa en registro
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
      throw "No está registrado el usuario introducido";
    }
  }
    // Función para aplicar bonificación si ha pasado más de 24 horas desde la última
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

    // Función para cerrar sesión
  async function logout() {
    await account.deleteSession("current");
    setUser(null);
    navigate("/login");
  }
  // Función para registrar un nuevo usuario
  async function register(email, password, username) {
    await account.create(ID.unique(), email, password, username);
    await login(email, password, true);
    navigate("/crearPerfil"); // Aquí se creará el perfil del usuario
  }
  // Función para inicializar estado al montar componente
  async function init() {
    try {
      const loggedIn = await account.get();
      setUser(loggedIn);
    } catch {
      setUser(null);
    }
  }
  // Ejecutar la inicialización solo una vez al montar el componente
  useEffect(() => {
    init();
  }, []);

    // Proveer el contexto con datos y funciones
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
