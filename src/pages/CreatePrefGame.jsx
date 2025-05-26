import CreatePrefGameForm from '../components/Profile/CreatePrefGameForm';
import { useUser } from '../context/AuthContext'; 

export function CreatePrefGame() {
  const { current } = useUser(); 
  if (!current) return <p>Cargando usuario...</p>;
  console.log(current.$id)
  return <CreatePrefGameForm userId={current.$id} />;
}
