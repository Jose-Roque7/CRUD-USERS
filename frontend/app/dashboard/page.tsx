"use client";
import { Toaster } from "react-hot-toast";
import  Inicio  from "../../component/div-inicio";


export default function UsersPage() {
  return(
    <>
      <Toaster
    position="top-right"
    toastOptions={{
      duration: 3000,
      style: {
        background: "#000000",
        color: "#fff",
        borderRadius: "12px",
        border: "1px solid #333",
        padding: "12px 16px",
        fontSize: "14px",
        fontWeight: "500",
        boxShadow: "0 8px 25px rgba(0, 0, 0, 0.5)",
      },
      success: {
        style: {
          background: "#000000",
          color: "#fff",
          border: "1px solid #22c55e",
        },
        iconTheme: {
          primary: "#22c55e",
          secondary: "#000000",
        },
      },
      error: {
        style: {
          background: "#000000",
          color: "#fff",
          border: "1px solid #ef4444",
        },
        iconTheme: {
          primary: "#ef4444",
          secondary: "#000000",
        },
      },
    }}
  />
    <Inicio />
    </>
  )

}

