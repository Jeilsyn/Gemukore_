import { updateUserProfile, getUserProfile } from "../lib/services/appwrite/collections";

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
