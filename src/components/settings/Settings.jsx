import { useEffect, useState } from "react";
import { account } from "../../lib/services/appwrite/appwriteClient";
import {
  getUserProfile,
  updateUserProfile,
  uploadProfileImage,
  deleteUserAccountAndRedirect
} from "../../lib/services/appwrite/collections";
import Button from "../ui/Button";
import Input from "../ui/InputPerfil";
import { useNavigate } from "react-router-dom";
import Modal from "../ui/Modal";
import { useTranslation } from "react-i18next";
import { useFontSize } from "../../context/FontSizeContext";
import "../../styles/Settings/seetings.css";

export default function Settings() {
  const [form, setForm] = useState({
    nombre_usuario: "",
    descripcion: "",
    nivel_jugador: "principiante",
    tema_app: "claro",
    text_size: 12,
    idioma: "es",
    foto_perfil_url: ""
  });

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { fontSize, setFontSize } = useFontSize();

  useEffect(() => {
    async function loadUserAndLanguage() {
      try {
        const user = await account.get();
        const response = await getUserProfile(user.$id);
        
        if (response.idioma) {
          await i18n.changeLanguage(response.idioma);
        }

        setForm({
          nombre_usuario: response.nombre_usuario || "",
          descripcion: response.descripcion || "",
          nivel_jugador: response.nivel_jugador || "principiante",
          tema_app: response.tema_app || "claro",
          text_size: parseInt(response.text_size) || 12,
          idioma: response.idioma || "es",
          foto_perfil_url: response.foto_perfil_url || ""
        });

        if (response.foto_perfil_url) {
          const fileId = response.foto_perfil_url.split('/files/')[1]?.split('/')[0];
          const bucketId = '680e342900053bdb9610';
          const url = `https://fra.cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${fileId}/view?project=680e27de001ffc71f5a7`;
          setPreviewUrl(url);
        }
      } catch (err) {
        console.error(t("error.cargarPerfil"), err);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserAndLanguage();
  }, []);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    if (name === "text_size") {
      const size = parseInt(value);
      setFontSize(size);
    }

    if (name === "idioma") {
      try {
        await i18n.changeLanguage(value);
        const user = await account.get();
        await updateUserProfile(user.$id, { idioma: value });
      } catch (err) {
        console.error("Error al cambiar idioma:", err);
      }
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      alert(t("error.archivoNoImagen"));
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      alert(t("error.imagenGrande"));
      return;
    }

    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const user = await account.get();
      let imageUrl = form.foto_perfil_url;
      
      if (file) {
        imageUrl = await uploadProfileImage(file, user.$id);
      }

      await updateUserProfile(user.$id, {
        ...form,
        text_size: parseInt(form.text_size),
        foto_perfil_url: imageUrl
      });

      alert(t("perfil.actualizado"));
      navigate("/LoadingPageRemain", { state: { from: 'settings' } });
    } catch (err) {
      console.error(err);
      alert(t("error.actualizarPerfil"));
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const user = await account.get();
      const confirmed = window.confirm(t("perfil.confirmarEliminacion"));
      
      if (!confirmed) {
        setIsDeleting(false);
        return;
      }

      await deleteUserAccountAndRedirect(user.$id, navigate);
      alert(t("perfil.eliminado"));
    } catch (error) {
      console.error(t("error.eliminarCuenta"), error);
      alert(error.message || t("error.eliminarCuenta"));
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <div>Cargando configuración...</div>;
  }

  return (
    <div className="settings-page">
      <h2> {t("configuracion.titulo")}</h2>
      <form onSubmit={handleUpdate}>

        <Input 
          label={t("configuracion.nombre")} 
          name="nombre_usuario" 
          value={form.nombre_usuario} 
          onChange={handleChange} 
          style={{ fontSize: `${fontSize}px` }}
        />

        <Input 
          label={t("configuracion.descripcion")} 
          name="descripcion" 
          value={form.descripcion} 
          onChange={handleChange} 
          type="textarea"
          style={{ fontSize: `${fontSize}px` }}
        />

        <div className="input-group">
          <label htmlFor="nivel_jugador" style={{ fontSize: `${fontSize}px` }}>{t("configuracion.nivel")}</label>
          <select
            id="nivel_jugador"
            name="nivel_jugador"
            value={form.nivel_jugador}
            onChange={handleChange}
            className="form-input"
            style={{ fontSize: `${fontSize}px` }}
          >
            <option value="principiante">{t("niveles.principiante")}</option>
            <option value="intermedio">{t("niveles.intermedio")}</option>
            <option value="veterano">{t("niveles.veterano")}</option>
          </select>
        </div>

        <div className="input-group">
          <label htmlFor="tema_app" style={{ fontSize: `${fontSize}px` }}>{t("configuracion.tema")}</label>
          <select
            id="tema_app"
            name="tema_app"
            value={form.tema_app}
            onChange={handleChange}
            className="form-input"
            style={{ fontSize: `${fontSize}px` }}
          >
            <option value="claro">{t("temas.claro")}</option>
            <option value="oscuro">{t("temas.oscuro")}</option>
            <option value="contraste">{t("temas.contraste")}</option>
          </select>
        </div>

        <div className="input-group">
          <label htmlFor="text_size" style={{ fontSize: `${fontSize}px` }}>{t("configuracion.texto")}</label>
          <select
            id="text_size"
            name="text_size"
            value={form.text_size}
            onChange={handleChange}
            className="form-input"
            style={{ fontSize: `${fontSize}px` }}
          >
            <option value={12}>12</option>
            <option value={16}>16</option>
            <option value={18}>18</option>
          </select>
        </div>

        <div className="input-group">
          <label htmlFor="idioma" style={{ fontSize: `${fontSize}px` }}>{t("configuracion.idioma")}</label>
          <select
            id="idioma"
            name="idioma"
            value={form.idioma}
            onChange={handleChange}
            className="form-input"
            style={{ fontSize: `${fontSize}px` }}
          >
            <option value="es">{t("idiomas.es")}</option>
            <option value="en">{t("idiomas.en")}</option>
          </select>
        </div>

        <div className="input-group">
          <label htmlFor="foto_perfil" style={{ fontSize: `${fontSize}px` }}>{t("configuracion.foto")}</label>
          <input
            id="foto_perfil"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="form-input"
            style={{ fontSize: `${fontSize}px` }}
          />
        </div>

        {previewUrl && (
          <div className="image-preview">
            <img src={previewUrl} alt="Preview" className="preview-image" />
          </div>
        )}

        <Button type="submit" style={{ fontSize: `${fontSize}px` }}>{t("configuracion.guardar")}</Button>
      </form>

      <div className="danger-zone" style={{ fontSize: `${fontSize}px` }}>
        <h3>{t("zonaPeligrosa.titulo")}</h3>
        <p>{t("zonaPeligrosa.descripcion")}</p>
        <Button 
          variant="danger" 
          onClick={() => setShowDeleteModal(true)}
          style={{ fontSize: `${fontSize}px` }}
        >
          {t("zonaPeligrosa.boton")}
        </Button>
      </div>

      {showDeleteModal && (
        <Modal onClose={() => setShowDeleteModal(false)}>
          <h3 style={{ fontSize: `${fontSize}px` }}>{t("modal.titulo")}</h3>
          <p style={{ fontSize: `${fontSize}px` }}>{t("modal.descripcion")}</p>
          <ul style={{ fontSize: `${fontSize}px` }}>
            <li>{t("modal.item1")}</li>
            <li>{t("modal.item2")}</li>
            <li>{t("modal.item3")}</li>
          </ul>
          <p style={{ fontSize: `${fontSize}px` }}>{t("modal.advertencia")}</p>
          <div className="modal-actions">
            <Button 
              variant="secondary" 
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
              style={{ fontSize: `${fontSize}px` }}
              className="EliminarSec1"
            >
              {t("modal.cancelar")}
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              style={{ fontSize: `${fontSize}px` }}
              className="EliminarSec"
            >
              {isDeleting ? t("modal.eliminando") : t("modal.confirmar")}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
