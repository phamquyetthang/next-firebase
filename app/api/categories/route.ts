import { db } from "@/utils/firebase";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET() {
  const categories = (await getDocs(collection(db, "categories"))).docs;
  const data = categories.map((c) => ({ id: c.id, ...c.data() }));

  return NextResponse.json({
    data,
  });
}

export async function POST(request: Request){
  const data = await request.json()
  const newCate = await addDoc(collection(db, "categories"), data);
  return NextResponse.json({
    newCate
  })
}