import api from "@/lib/axios";

// Obtener todos los usuarios
export const getItems = async () => {
  try {
    const response = await api.get("/user");
    return response.data; // Retorna los datos de los usuarios
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    throw new Error("Error al obtener usuarios");
  }
};

export const deleteAll = async () => {
  try {
    await api.delete("/user");
  } catch (err) {
    console.error("Error al eliminar:", err);
    throw new Error("Error al eliminar usuarios");
  }
};

// crud.ts
export async function seedUsers() {
  try{
    const res = await api.get('seed'); // Endpoint que crea usuarios de prueba
    return res;
  }catch(err){
    throw new Error('Error al generar usuarios de prueba');
  }
}


// Obtener un único usuario por ID, nombre o código
export const getuser = async (searchTerm: string) => {
  try {
    const response = await api.get(`/user/${searchTerm}`);
    return response.data;
  } catch (err:any) {
   console.error("Error al buscar usuario:", err);
    throw new Error("No se pudo encontrar el usuario");
  }
};

// Crear un nuevo usuario
export const createUser = async (userData: { name: string; lastname: string; codigo: number }) => {
  try {
    const response = await api.post("/user", userData);
    return response.data; // Devuelve el usuario creado
  } catch (err) {
    console.error("Error al crear usuario:", err);
    throw new Error("No se pudo crear el usuario");
  }
};

// Actualizar un usuario
export const updateUser = async (id: string, updatedData: { name?: string; lastname?: string; codigo?: number }) => {
  try {
    const response = await api.patch(`/user/${id}`, updatedData);
    return response.data; // Devuelve el usuario actualizado
  } catch (err) {
    console.error("Error al actualizar usuario:", err);
    throw new Error("No se pudo actualizar el usuario");
  }
};

// Eliminar un usuario
export const deleteUser = async (id: string) => {
  try {
    await api.delete(`/user/${id}`);
  } catch (err) {
    console.error("Error al eliminar usuario:", err);
    throw new Error("No se pudo eliminar el usuario");
  }
};

// Función para verificar si un código ya existe
export const checkIfCodeExists = async (codigo: number, currentUserId: string = "") => {
  try {
    const response = await api.get("/user");
    const users = response.data;
    return users.some(
      (user: { codigo: number; _id: string }) => user.codigo === codigo && user._id !== currentUserId
    );
  } catch (err) {
    console.error("Error al verificar código:", err);
    throw new Error("Error al verificar código");
  }
};

// Función para verificar si el usuario existe
export const checkIfUserExists = async (valor: string, currentUserId: string = "") => {
  try {
    const response = await api.get("/user");
    const users = response.data;

    // Convertimos valor a número si es posible, para comparar con codigo
    const numericValue = Number(valor);
    const isNumeric = !isNaN(numericValue);

    // Buscar coincidencias por codigo, name o id
    return users.some(
      (user: { codigo: number; name: string; _id: string }) =>
        user._id !== currentUserId && (
          (isNumeric && user.codigo === numericValue) ||
          user.name.toLowerCase().trim() === valor.toLowerCase().trim() ||
          user._id === valor
        )
    );
  } catch (err) {
    console.error("Error al verificar usuario:", err);
    throw new Error("Error al verificar usuario");
  }
};





// Eliminar múltiples usuarios
export const deleteUsers = async (ids: string[]) => {
  try {
    const response = await api.delete('/user/user/usersd',{
      data: ids})
    return response.data; // Devuelve el resultado del backend
  } catch (err) {
    console.error("Error al eliminar usuarios:", err);
    throw new Error("No se pudo eliminar los usuarios");
  }
};
