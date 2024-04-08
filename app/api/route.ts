import { NextResponse } from "next/server";
import f, { getFirestore, getDocs, addDoc, collection } from "firebase/firestore";
import firebase_app from "@/utils/firebase";
const db = getFirestore(firebase_app);

export const GET = async () => {
  const users = (await getDocs(collection(db, "users"))).docs;

  return NextResponse.json({
    message: "hello",
    users: users.map((d) => ({ ...d.data(), id: d.id })),
  });
};

export const POST = async () => {
  const newUser = await addDoc(collection(db, "users"), {
    name: "Hello new user"
  });

  return NextResponse.json({
    users: newUser.id,
  });
}