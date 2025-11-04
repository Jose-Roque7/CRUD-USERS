"use client";
import { Toaster } from "react-hot-toast";
import  Inicio  from "../component/div-inicio";


export default function UsersPage() {
  return(
    <>
     <Toaster position="top-right" toastOptions={{
          duration: 3000,
          style: {
            background: "#1a1a1aff",
            color: "#fff",
            borderRadius: "20px",
          },
        }}
      />
    <Inicio />
    </>
  )

}

