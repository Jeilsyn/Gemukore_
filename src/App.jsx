import { BrowserRouter as Router } from 'react-router-dom';  
import NavBar from "./components/NavBar.jsx";
import { UserProvider } from "./context/AuthContext";
import AppRoutes from "./components/routes/AppRoutes.jsx";

function App() {
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
