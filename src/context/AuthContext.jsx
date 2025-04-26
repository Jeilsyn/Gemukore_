import { ID } from "appwrite";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { account } from "../lib/services/appwrite/appwriteClient";

//Crear un contexto para compartir datos de usuario en toda la app(Muy parecido al funcionamiento de mantenimiento de una sesión)
const UserContext = createContext();

//Hook para acceder al contexto desde cualquier componente 
export function useUser() {
  return useContext(UserContext);
}

//Estado que almacena los datos del usuario autenticado 
export function UserProvider(props) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
      const [canAccessCreatePerfil, setcanAccessCreatePerfil] = useState(false);

  //Intentar inicio de sesión con Appwrite
  async function login(email, password, isRegistering = false) {
    try {
      const loggedIn = await account.createEmailPasswordSession(email, password);

      //guarda en el estado 
      setUser(loggedIn);
      setcanAccessCreatePerfil(false);

      // Redirección específica a Home.jsx después de 1.5 segundos
      if (!isRegistering) {
        setTimeout(() => {
        }, 2500);
        navigate("/")
      }


      return true;
    } catch (err) {
      throw err;
    }

  }

  //Eliminar sesión 
  async function logout() {
    await account.deleteSession("current");
    setUser(null);
  }

  //Registra usuario nuevo-->A tener en cuenta era la generación del ID único para cada usuario,(problema surgió con esto )
  async function register(email, password, username,) {
    await account.create(ID.unique(), email, password, username);
    await login(email, password,true);
    navigate("/crearPerfil")
  }

  //COn esto verificamos si hay sesión iniciada en Appwrite al iniciar Gemukore
  async function init() {
    try {
      const loggedIn = await account.get();
      setUser(loggedIn);
    } catch (err) {
      setUser(null);
    }
  }

  //Ejecuta init()
  useEffect(() => {
    init();
  }, []);

  //Devuelve los componentes hijos(current-->(actual usuario ), login,logout,register)
  return (
    <UserContext.Provider value={{ current: user, login, logout, register,canAccessCreatePerfil,setcanAccessCreatePerfil }}>
      {props.children}
    </UserContext.Provider>
  );
}