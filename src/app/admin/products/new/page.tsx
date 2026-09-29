import type { Metadata } from "next";
import { ProductForm } from "@/components/product-form";

export const metadata: Metadata = { title: "New product" };

export default function NewProduct() {
  return (
    <>
      <h1 className="page-title">New product</h1>
      <ProductForm />
    </>
  );
}
