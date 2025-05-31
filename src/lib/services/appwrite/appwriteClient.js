import { Client, Account, Databases,Storage,Teams } from 'appwrite';

const client = new Client();
client.setEndpoint('https://fra.cloud.appwrite.io/v1').setProject('680e27de001ffc71f5a7');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage= new Storage(client);
export const teams = new Teams(client);


async function listarColecciones() {
  try {
    const response = await databases.listCollections('tu_database_id');
    console.log('Listando colecciones:', response);
  } catch (error) {
    console.error('Error al listar colecciones:', error.message);
  }
}

