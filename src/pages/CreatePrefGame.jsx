import CreatePrefGameForm from '../components/Profile/CreatePrefGameForm';
import { useUser } from '../context/AuthContext'; // Si tienes tu user context

export function CreatePrefGame() {
  const { current } = useUser(); // current.$id es tu ID usuario Appwrite
  if (!current) return <p>Cargando usuario...</p>;
  console.log(current.$id)
  return <CreatePrefGameForm userId={current.$id} />;
}
