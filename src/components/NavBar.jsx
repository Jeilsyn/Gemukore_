import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/AuthContext'
import  ButtonLogOut  from './ui/ButtonLogOut';

//Barra de navegación de la app 

const NavBar = () => {
  const { current, logout } = useUser();
  return (
    <nav className="navbar">
      <ul>
        <li><Link to="/">Inicio</Link></li>
        <li><Link to="/register">Registro</Link></li>
        <li><Link to="/login">Iniciar sesión</Link></li>
        {/* Añadir otros enlaces según lo necesario */}
        {current && (
          <li>
            <ButtonLogOut onClick={logout}>Cerrar Sesion</ButtonLogOut>
          </li>
        )}

      </ul>


    </nav>
  );
};

export default NavBar;
