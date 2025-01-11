
import mongoose from 'mongoose';

let isConnected: boolean = false;
const DB_URL = process.env.MONGODB_URL;

export const connectToDB = async () => {
    mongoose.set('strictQuery', true);

    if (!DB_URL) return console.log('DB URL not found');
    if(isConnected) return console.log('Already connected to DB');

    try {
        await mongoose.connect(DB_URL);
        isConnected = true;
        console.log('Connected to DB');
    } catch(err) {
        console.log(err)
    }
}