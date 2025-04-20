import { Client, Account, Databases,Storage } from 'appwrite';

const client = new Client();
client.setEndpoint('https://fra.cloud.appwrite.io/v1').setProject('680239a80027a81d35fd');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage= new Storage(client);