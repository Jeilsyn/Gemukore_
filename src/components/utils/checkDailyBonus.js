import {
  updateUserProfile,
  getUserProfile,
} from "../lib/services/appwrite/collections";

/* Gestiona el bono diario de los usuarios en la aplicación, comprueba si un usuario puede recibir
su bonificación diaria, si han pasado al menos 24 horas desde la ultima vez que el usuario
recibió la bonificación diaria, si han pasado como mínimo 24 horas desde la ultima vez que
recibió la bonificación, la suma es de 500 thomcoins, y si no han pasado 24 horas no hay bono,
y devuelve true si se aplicó el bono y si no false
 */ 
export const checkDailyBonus = async (userId) => {
  try {
    const profile = await getUserProfile(userId);
    if (!profile) return;

    const now = new Date();
    const lastBonus = new Date(profile.ultima_bonificacion);
    const diffHours = (now - lastBonus) / (1000 * 60 * 60);

    if (diffHours >= 24) {
      await updateUserProfile(userId, {
        thomcoins: profile.thomcoins + 500,
        ultima_bonificacion: now.toISOString(),
      });
      return true; // Se aplicó el bono
    }

    return false; // Aún no ha pasado 24h
  } catch (err) {
    console.error("Error comprobando bonificación diaria:", err);
    return false;
  }
};
