import { useState, useEffect } from "react";
import { account, storage } from "../../lib/services/appwrite/appwriteClient";
import { createUserProfile } from "../../lib/services/appwrite/collections";
import { useNavigate } from "react-router-dom";
import Input from "../ui/InputPerfil";
import Button from "../ui/Button";
import { ID, Permission } from "appwrite";
import { Link } from "react-router-dom";



// ID de tu bucket 
const BUCKET_ID = "680e342900053bdb9610";

const CrearPerfil = () => {
  const [form, setForm] = useState({
    nombre_usuario: "",
    descripcion: "",
    thomcoins: 0,
    nivel_jugador: "principiante",
    tema_app: "claro",
    text_size: 12,
    idioma: "es",
    foto_perfil_url: "",
    email: "",
    fecha_registro: new Date().toISOString(),
  });

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await account.get();
        setForm((prev) => ({
          ...prev,
          email: user.email,
          nombre_usuario: user.name || "",
        }));
      } catch (err) {
        console.error("Error cargando datos del usuario:", err);
        navigate("/login");
      }
    };

    loadUserData();
  }, [navigate]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/")) {
        alert("Por favor, selecciona un archivo de imagen");
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert("La imagen es demasiado grande (máximo 5MB)");
        return;
      }

      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const uploadImage = async (user) => {
    if (!file) return null;
  
    try {
      const response = await storage.createFile(
        BUCKET_ID,
        ID.unique(),
        file,
        [
          Permission.read(`user:${user.$id}`),
          Permission.update(`user:${user.$id}`),
          Permission.delete(`user:${user.$id}`),
        ]
      );
  
      // Obtener la URL de la imagen - Opción más confiable
      const fileUrl = storage.getFilePreview(
        BUCKET_ID,
        response.$id,
        500, // ancho
        500, // alto
        undefined, // gravedad
        100, // calidad
        undefined, // fondo
        undefined, // borde redondeado
        0, // borde ancho
        undefined, // borde color
        0, // opacidad
        undefined, // rotación
        undefined, // modo
        undefined // formato
      );
      
      return fileUrl.toString(); // Convertir a string explícitamente
    } catch (error) {
      console.error("Error subiendo imagen:", error);
      throw error;
    }
  };  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await account.get(); // Obtén el usuario autenticado
  
      let imageUrl = form.foto_perfil_url;
      if (file) {
        // Si hay un archivo, subimos la imagen y obtenemos la URL
        imageUrl = await uploadImage(user);
      }
  
      console.log("URL de la imagen:", imageUrl);
  
      const profileData = {
        usuario_id: user.$id,  // Asegúrate de que el usuario_id está siendo pasado
        nombre_usuario: form.nombre_usuario,
        descripcion: form.descripcion,
        thomcoins: 0,
        nivel_jugador: form.nivel_jugador,
        tema_app: form.tema_app,
        text_size: parseInt(form.text_size),
        idioma: form.idioma,
        foto_perfil_url: imageUrl || "", // Aquí almacenamos la URL de la imagen
        email: user.email,
        fecha_registro: new Date().toISOString(),
      };
  
      await createUserProfile(profileData, user.$id); // Pasar el user.$id como document_id
      alert("Perfil creado con éxito");
      navigate("/LoadingPage");
    } catch (err) {
      console.error("Error al crear perfil:", err);
      alert(`Error al crear perfil: ${err.message}`);
    }
  };
  
  return (
    <div className="profile-form-container">
      <h2>Completa tu perfil {form.nombre_usuario}</h2>
      <form onSubmit={handleSubmit}>
        <Input
          label="Nombre de Usuario"
          name="nombre_usuario"
          type="text"
          value={form.nombre_usuario}
          onChange={handleChange}
          required
        />

        <Input
          label="Descripción"
          name="descripcion"
          type="textarea"
          value={form.descripcion}
          onChange={handleChange}
        />

        <div className="form-group">
          <label>Nivel de Jugador</label>
          <select
            name="nivel_jugador"
            value={form.nivel_jugador}
            onChange={handleSelectChange}
            className="form-control"
          >
            <option value="principiante">Principiante</option>
            <option value="intermedio">Intermedio</option>
            <option value="veterano">Veterano</option>
          </select>
        </div>

        <div className="form-group">
          <label>Tema de la Aplicación</label>
          <select
            name="tema_app"
            value={form.tema_app}
            onChange={handleSelectChange}
            className="form-control"
          >
            <option value="claro">Claro</option>
            <option value="oscuro">Oscuro</option>
            <option value="contraste">Contraste</option>
          </select>
        </div>

        <div className="form-group">
          <label>Tamaño de Texto</label>
          <select
            name="text_size"
            value={form.text_size}
            onChange={handleSelectChange}
            className="form-control"
          >
            <option value={12}>12</option>
            <option value={16}>16</option>
            <option value={18}>18</option>
          </select>
        </div>

        <div className="form-group">
          <label>Idioma</label>
          <select
            name="idioma"
            value={form.idioma}
            onChange={handleSelectChange}
            className="form-control"
          >
            <option value="es">Español</option>
            <option value="en">Inglés</option>
          </select>
        </div>

        <div className="form-group">
          <label>Foto de Perfil</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="form-control"
          />

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${uploadProgress}%` }}
              >
                {uploadProgress}%
              </div>
            </div>
          )}

          {previewUrl && (
            <div className="image-preview mt-2">
              <img src={previewUrl} alt="Vista previa" className="preview-image" />
            </div>
          )}
        </div>

        <Button type="submit">Guardar Perfil</Button>
      </form>
    </div> 
  );
};

export default CrearPerfil;
