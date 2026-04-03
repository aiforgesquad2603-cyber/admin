import mongoose from "mongoose";

async function test() {
  try {
    await mongoose.connect("mongodb+srv://aiforgesquad2603_db_user:OzxtCyOY55Q1Okt1@cluster0.xb7eorv.mongodb.net/quizmaster?appName=Cluster0");
    console.log("Connected successfully");
    process.exit(0);
  } catch (err) {
    console.error("Connection failed:", err);
    process.exit(1);
  }
}

test();
