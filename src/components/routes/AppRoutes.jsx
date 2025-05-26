import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Register } from "../../pages/Register";
import { Login } from "../../pages/Login";
import { Home } from "../../pages/Home";
import { CreatePerfil } from '../../pages/CreatePerfil'
import { CreatePrefGame } from '../../pages/CreatePrefGame'
import SettingsPage from '../../pages/SettingsPage';
import LoadingPage from '../../pages/loadingPage'

import LoadingPageRemain from '../animations/LoadingScreenRemain';
import Matches from '../../pages/Match';
import Requests from '../../pages/MatchRequests'; 
import GameBoard from '../../pages/GameBoard';
import CreateGameInfoUser from '../../pages/CreateGameInfoUser';
import Tutoriales from '../../pages/Tutoriales';


//Admin
import TutorialesAdmin from '../../pages/TutorialesAdmin';
import HistorialUsuariosPage from '../../pages/HistorialUsuariosPage';
function AppRoutes() {

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Home />} />
            <Route path="/crearPerfil" element={<CreatePerfil />} />
            <Route path="/CrearPrefJuegos" element={<CreatePrefGame />} />
            <Route path='/LoadingPage' element={<LoadingPage />} />
            <Route path='/settings' element={<SettingsPage />} />
            <Route path="/match" element={<Matches />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/gameBoard" element={<GameBoard />} />
            <Route path="/createGameInfoUser" element={<CreateGameInfoUser />} />
            <Route path="/tutoriales" element={<Tutoriales />} />
            <Route path="/loadingPageRemain" element={<LoadingPageRemain />} />
            <Route path="/tutorialesAdmin" element={<TutorialesAdmin />} />
            <Route path="/historialUsuarios" element={<HistorialUsuariosPage />} />
        </Routes>
    )

}

export default AppRoutes;