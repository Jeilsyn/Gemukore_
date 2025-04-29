import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Register } from "../../pages/Register";
import { Login } from "../../pages/Login";
import { Home } from "../../pages/Home";
import { CreatePerfil } from '../../pages/CreatePerfil'
import {CreatePrefGame} from '../../pages/CreatePrefGame'

import LoadingPage from '../../pages/loadingPage'

//Todas las rutas están aqui
function AppRoutes() {

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Home />} />
            <Route path="/crearPerfil" element={<CreatePerfil />} />
            <Route path="/CrearPrefJuegos" element={<CreatePrefGame />} />
            <Route path='/LoadingPage' element={<LoadingPage/>}/>
        </Routes>
    )

}

export default AppRoutes;