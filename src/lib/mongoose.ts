import mongoose from "mongoose";

let isConnected: boolean = false;

export const connectToDB = async () => {
  mongoose.set("strictQuery", true);

  if (!process.env.NEXT_PUBLIC_MONGODB_URI)
    return console.log("Missing mongodb url");

  if (isConnected) {
    return console.log("\n\nmongodb is already connected\n\n");
  }

  try {
    await mongoose.connect(process.env.NEXT_PUBLIC_MONGODB_URI, {
      dbName: "devflow",
    });

    isConnected = true;

    console.log("MongDb connected successfully");
  } catch (error) {
    console.log("\n\nMongo db connection error: ");
    console.log(error);
  }
};
