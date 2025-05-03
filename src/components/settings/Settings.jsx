import { useEffect, useState } from "react";
import { account } from "../../lib/services/appwrite/appwriteClient";
import {
  getUserProfile,
  updateUserProfile,
  uploadProfileImage
} from "../../lib/services/appwrite/collections";
import Button from "../ui/Button";
import Input from "../ui/InputPerfil";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const [form, setForm] = useState({
    nombre_usuario: "",
    descripcion: "",
    nivel_jugador: "",
    tema_app: "",
    text_size: 12,
    idioma: "",
    foto_perfil_url: ""
  });

  const [file, setFile] = useState(null); // Estado para el archivo de imagen
  const [previewUrl, setPreviewUrl] = useState(""); // Estado para la vista previa de la imagen
  const navigate = useNavigate();

  // Cargar los datos del usuario al montar el componente
  useEffect(() => {
    async function fetchUserData() {
      try {
        const user = await account.get();
        const response = await getUserProfile(user.$id);
        setForm({
          nombre_usuario: response.nombre_usuario,
          descripcion: response.descripcion,
          nivel_jugador: response.nivel_jugador,
          tema_app: response.tema_app,
          text_size: parseInt(response.text_size),
          idioma: response.idioma,
          foto_perfil_url: response.foto_perfil_url || "" // Si no hay foto, poner vacío
        });

        // Si existe foto de perfil, transformar la URL "preview" a "view"
        if (response.foto_perfil_url) {
          const fileId = response.foto_perfil_url.split('/files/')[1]?.split('/')[0];
          const bucketId = '680e342900053bdb9610';

          // Generar URL "view" para la foto de perfil
          const url = `https://fra.cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${fileId}/view?project=680e27de001ffc71f5a7`;
          setPreviewUrl(url);
        } else {
          setPreviewUrl(""); // Si no hay foto, mantener vacío
        }
      } catch (err) {
        console.error("Error al cargar el perfil:", err);
      }
    }
    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen válido");
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      alert("La imagen es demasiado grande (máx. 5MB)");
      return;
    }

    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected)); // Actualizar la vista previa de la imagen
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const user = await account.get();

      let imageUrl = form.foto_perfil_url;
      if (file) {
        imageUrl = await uploadProfileImage(file, user.$id); // Subir la nueva imagen
      }

      await updateUserProfile(user.$id, {
        ...form,
        text_size: parseInt(form.text_size),
        foto_perfil_url: imageUrl
      });
 
      alert("Perfil actualizado correctamente");
    } catch (err) {
      console.error(err);
      alert("Error al actualizar perfil");
    }
  };

  return (
    <div className="settings-page">
      <h2>⚙️ Configuración de Perfil</h2>
      <form onSubmit={handleUpdate}>
        <Input
          label="Nombre de Usuario"
          name="nombre_usuario"
          value={form.nombre_usuario}
          onChange={handleChange}
        />
        <Input
          label="Descripción"
          name="descripcion"
          value={form.descripcion}
          onChange={handleChange}
        />

        <label>Nivel de Jugador</label>
        <select name="nivel_jugador" value={form.nivel_jugador} onChange={handleChange}>
          <option value="principiante">Principiante</option>
          <option value="intermedio">Intermedio</option>
          <option value="veterano">Veterano</option>
        </select>

        <label>Tema</label>
        <select name="tema_app" value={form.tema_app} onChange={handleChange}>
          <option value="claro">Claro</option>
          <option value="oscuro">Oscuro</option>
          <option value="contraste">Contraste</option>
        </select>

        <label>Tamaño de texto</label>
        <select name="text_size" value={form.text_size} onChange={handleChange}>
          <option value={12}>12</option>
          <option value={16}>16</option>
          <option value={18}>18</option>
        </select>

        <label>Idioma</label>
        <select name="idioma" value={form.idioma} onChange={handleChange}>
          <option value="es">Español</option>
          <option value="en">Inglés</option>
        </select>

        {/* Campo para foto de perfil */}
        <label>Foto de Perfil</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />

        {/* Vista previa de la foto de perfil */}
        {previewUrl && (
          <div className="image-preview mt-2">
            <img src={previewUrl} alt="Vista previa" className="preview-image" />
          </div>
        )}

        <Button type="submit">Guardar cambios</Button>
      </form>

      <hr />
    </div>
  );
}
