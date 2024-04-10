import { db } from "@/utils/firebase";
import {
  addDoc,
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  Query,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const keyword = searchParams.get("keyword") || "";
  const page = Number(searchParams.get("page") || 1);
  const size = Number(searchParams.get("size") || 3);
  const colRef = collection(db, "products");

  let q = query(colRef);
  if (keyword) {
    q = query(
      colRef,
      orderBy("name"),
      where("name", ">=", keyword),
      where("name", "<=", keyword + "\uf8ff")
    );
  }

  if (page > 1) {
    const lastVisibleDoc = await getLastVisibleDoc(q, page, size);
    console.log("🚀 ~ GET ~ lastVisibleDoc:", lastVisibleDoc);

    if (lastVisibleDoc) {
      q = query(q, startAfter(lastVisibleDoc));
    }
  }

  const dataSnapshot = await getDocs(query(q, limit(size)));

  const products = await Promise.all(
    dataSnapshot.docs.map(async (p) => {
      const product = p.data();
      const category = await getDoc(product.categoryId);
      product.category = { id: category.id, ...(category.data() as object) };
      delete product.categoryId;
      return { ...product, id: p.id };
    })
  );

  const totalSnapshot = await getCountFromServer(collection(db, "products"));

  return NextResponse.json({
    meta: {
      total: totalSnapshot.data().count,
    },
    data: products,
  });
}

async function getLastVisibleDoc(
  queryRef: Query,
  page: number,
  pageSize: number
) {
  const q = query(queryRef, limit((page - 1) * pageSize));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs[querySnapshot.docs.length - 1];
}
