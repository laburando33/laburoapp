// app/admin/comprar/page.tsx
import { redirect } from "next/navigation";

export default function RedirectToShop() {
  redirect("/admin/shop");
}
