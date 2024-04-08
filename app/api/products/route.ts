import { db } from "@/utils/firebase";
import { addDoc, collection, doc, getDoc, getDocs, limitToLast, query, startAfter } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const data = await request.json();
  const categoryRef = doc(db, "categories", data.categoryId);

  const newProduct = await addDoc(collection(db, "products"), {
    name: "Sản phẩm 1",
    price: 100000,
    description: "Mô tả sản phẩm 1",
    categoryId: categoryRef,
  });

  return NextResponse.json({
    newProduct,
  });
}

export async function GET() {
  const dataSnapshot = await getDocs(collection(db, "products"));

  const products = await Promise.all(
    dataSnapshot.docs.map(async (p) => {
      const product = p.data();
      const category = await getDoc(product.categoryId);
      product.category = { id: category.id, ...(category.data() as object) };
      delete product.categoryId;
      return { ...product, id: p.id };
    })
  );

  return NextResponse.json({
    products,
  });
}


export async function GET_PAGINATED({
  query: { page = "1", limit = "10" },
}: {
  query: { page?: string; limit?: string };
}) {
  const parsedPage = Number(page);
  const parsedLimit = Number(limit);

  if (isNaN(parsedPage) || isNaN(parsedLimit)) {
    return NextResponse.json({ error: "Invalid pagination params" }, { status: 400 });
  }

  const dataSnapshot = await getDocs(
    query(collection(db, "products"), limitToLast(parsedLimit), startAfter(parsedPage * parsedLimit - parsedLimit))
  );

  const products = await Promise.all(
    dataSnapshot.docs.map(async (p) => {
      const product = p.data();
      const category = await getDoc(product.categoryId);
      product.category = { id: category.id, ...(category.data() as object) };
      delete product.categoryId;
      return { ...product, id: p.id };
    })
  );

  return NextResponse.json({
    products,
  });
}
