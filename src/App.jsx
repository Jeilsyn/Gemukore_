import { BrowserRouter as Router } from 'react-router-dom';
import NavBar from "./components/NavBar.jsx";
import { UserProvider } from "./context/AuthContext";
import AppRoutes from "./components/routes/AppRoutes.jsx";
import { useEffect } from 'react';
import { fillVideojuegos, } from '../src/lib/services/appwrite/collections.js'; // tu ruta correcta

function App() {
  /*   useEffect(() => {
      fillVideojuegos();
    }, []); */
  return (
    <Router>
      <UserProvider>
        <NavBar />
        <AppRoutes />
      </UserProvider>
    </Router>
  );
}


export default App;
