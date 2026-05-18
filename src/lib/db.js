const MONGODB_URI = process.env.MONGODB_URI;

if(!MONGODB_URI){
    throw new Error("Mongodb url not present");
}

let cached = globalThis.mongoose;

if(!cached){
    cached = global.mongoose = { conn: null, promise: null };
}
export async function connectDb(){
    if(cached.conn){
        return cached.conn;
    }
}