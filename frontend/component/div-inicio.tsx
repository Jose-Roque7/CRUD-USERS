 import { useEffect, useState } from "react";
import { 
  checkIfCodeExists, 
  createUser, 
  deleteUser, 
  getItems, 
  updateUser, 
  getuser, 
  seedUsers, 
  deleteAll, 
  deleteUsers 
} from "@/lib/crud";

import { checkIfUserExists } from "../lib/crud";
import { FaEdit, FaSearch, FaSignOutAlt, FaTimes, FaTrash, FaUserFriends, FaUserPlus } from "react-icons/fa";
import toast from "react-hot-toast";
import { AiOutlineBorder, AiOutlineCheckSquare, AiOutlineDelete } from "react-icons/ai";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/authStore";
import { audio } from "framer-motion/client";

export default function divInicio() {

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchValue, setSearchValue] = useState("");
  const [foundUser, setFoundUser] = useState<any | null>(null);
  const [searching, setSearching] = useState(false);

  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [usersToDelete, setUsersToDelete] = useState(false);

  // Formularios
  const [formDataCreate, setFormDataCreate] = useState({
    name: "",
    lastname: "",
    codigo: 1
  });

  const [formDataEdit, setFormDataEdit] = useState({
    name: "",
    lastname: "",
    codigo: 1
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { token, logout } = useAuthStore();  // Asumiendo que el token está en el store
  const router = useRouter();

  useEffect(() => {
    // Evitar redirección si el token es null en el primer render
    if (token === null) {
      router.push('/');  // Redirigir a la página de inicio
    }
  }, [token, router]);  // Dependencias para que la redirección ocurra cuando cambie el token

  if (token === null) {
    // Mientras esperamos la comprobación de autenticación, puedes mostrar un loading
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

 

  // Cargar usuarios
  useEffect(() => {
    async function fetchUsers() {
      try {
        const data = await getItems();
        setUsers(data);
      } catch (err) {
        return null
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
    const intervalId = setInterval(fetchUsers, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Selección múltiple
  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;

    try {
      await deleteUsers(selectedIds);
      toast.success(`${selectedIds.length} Usuarios eliminados correctamente`);
    } catch (error) {
      toast.error("Error eliminando usuarios");
    }
  };

  // --- EDITAR ---
  function handleEditClick(user: any) {
    setSelectedIds([]);
    setEditingUser(user);
    setFormDataEdit({
      name: user.name,
      lastname: user.lastname,
      codigo: user.codigo
    });
    setShowCreateForm(false);
  }

  async function handleUpdateUser(valor: boolean) {
    if (formDataEdit.name === "" || formDataEdit.lastname === "") {
      toast("⚠️ Campo de (Nombre) o (Apellido) vacío, favor de llenar");
      return;
    }

    if (!editingUser) return;
    setSelectedIds([]);

    try {
      if (!valor) {
        const codeExists = await checkIfCodeExists(formDataEdit.codigo, "");
        if (codeExists) {
          toast.error("Error al actualizar usuario, ese código ya existe!");
          return;
        }
      }

      const updated = await updateUser(editingUser._id, formDataEdit);

      setUsers(prev =>
        prev.map(u => (u._id === editingUser._id ? updated : u))
      );

      setEditingUser(null);
      setFormDataEdit({ name: "", lastname: "", codigo: 0 });

      toast.success("Usuario actualizado correctamente");

    } catch (err) {
      return;
    }
  }

  function validar(original: any, editado: any) {
    return original.codigo === editado.codigo;
  }

  // --- CREAR ---
  async function handleCreateUser() {
    try {
      setSelectedIds([]);

      const codeExists = await checkIfCodeExists(formDataCreate.codigo, "");
      if (codeExists) {
        toast.error("Error al crear usuario, ya existe un usuario con ese código");
        return;
      }

      if (formDataCreate.name === "" || formDataCreate.lastname === "") {
        toast("⚠️ Campo de (Nombre) o (Apellido) vacío, favor de llenar");
        return;
      }

      if (formDataCreate.codigo < 1) {
        toast.error("Error: no se puede enviar un número menor a 1.");
        return;
      }

      await createUser(formDataCreate);

      const data = await getItems();
      setUsers(data);

      setFormDataCreate({ name: "", lastname: "", codigo: 1 });
      setShowCreateForm(false);

      toast.success("Usuario creado correctamente");

    } catch (err) {
      toast.error("Error al crear el usuario");
    }
  }

  // --- GENERAR ---
  async function handleSeedUsers() {
    try {
      await seedUsers();
      const data = await getItems();
      setUsers(data);
      toast.success("Usuarios de prueba generados correctamente");
    } catch (err) {
      toast.error("Error al generar usuarios de prueba");
    }
  }

  // --- ELIMINAR TODOS ---
  async function handleDeleteUsers() {
    try {
      await deleteAll();
      const data = await getItems();
      setUsers(data);
      toast.success("Usuarios eliminados correctamente");
      setSelectedIds([]);
    } catch (err) {
      toast.error("Error al eliminar usuarios");
    }
  }

  // --- BUSCAR ---
  async function handleSearch() {
    if (!searchValue.trim()) return;

    setSearching(true);
    setFoundUser(null);

    try {
      const userExists = await checkIfUserExists(searchValue, "");
      if (!userExists) {
        toast.error(`No se encontró ningún usuario con el valor "${searchValue}"`);
        return;
      }

      const data = await getuser(searchValue);
      setFoundUser(data);

    } catch {
      return;
    } finally {
      setSearching(false);
    }
  }

  // --- ELIMINAR UNO ---
  async function handleDeleteUser(id: string) {
    try {
      await deleteUser(id);
      setUsers(prev => prev.filter(u => u._id !== id));
      toast.success("Usuario eliminado correctamente");
      setSelectedIds([]);
    } catch {
      toast.error("Error al eliminar el usuario!");
    }
  }
  function handleLogout() {
    logout();
  }

  // --- LOADING ---
  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  // --- AQUI CONTINÚA TU JSX ---
  return ( 
    <main className="min-h-screen bg-gray-50 px-3 sm:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 text-center select-none">
        REGISTRO DE USUARIOS
      </h1>

      {/* CONTENEDOR DE ACCIONES */}
      <div className="flex flex-wrap gap-3 mb-6 w-full max-w-4xl mx-auto justify-between items-center">

        {/* BUSCADOR */}
        <div className="relative flex-1 min-w-[240px]">
          <input
            type="text"
            placeholder="Buscar usuario..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full border border-gray-300 rounded-lg pl-4 pr-12 py-2 text-gray-700 shadow-sm 
                       focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 p-2 cursor-pointer 
                       rounded-full hover:bg-blue-100 hover:text-blue-800 transition disabled:opacity-50"
            title="Buscar"
          >
            {searching ? <span className="animate-pulse"></span> : <FaSearch size={18} />}
          </button>
        </div>

        {/* CREAR USUARIO */}
        <button 
          title="Crear usuario"
          onClick={() => setShowCreateForm(true)}
          className="flex items-center cursor-pointer gap-2 bg-green-600 hover:bg-green-700 
                     text-white font-medium px-4 py-2 rounded-lg shadow-md transition min-w-max"
        >
          <FaUserPlus size={18} />
          Crear usuario
        </button>

        {/* CERRAR SESION */}
        <button 
          title="Cerrar Sesion"
          onClick={() => handleLogout()}
          className="flex items-center cursor-pointer gap-2 bg-orange-600 hover:bg-orange-700 
                     text-white font-medium px-4 py-2 rounded-lg shadow-md transition min-w-max"
        >
          <FaSignOutAlt size={18} />
          Cerrar Sesion
        </button>

        {/* GENERAR USUARIOS */}
        {users.length === 0 && (
          <button
            title="Generar usuarios de prueba"
            onClick={handleSeedUsers}
            className="flex items-center gap-2 bg-gray-600 cursor-pointer hover:bg-gray-700 
                       text-white font-medium px-4 py-2 rounded-lg shadow-md transition min-w-max"
          >
            <FaUserFriends size={18} />
            Prueba
          </button>
        )}

        {/* ELIMINAR TODOS */}
        {users.length !== 0 && (
          <button
            title="Eliminar todos los usuarios"
            onClick={() => setUsersToDelete(true)}
            className="flex items-center gap-2 bg-red-600 cursor-pointer hover:bg-red-700 
                       text-white font-medium px-4 py-2 rounded-lg shadow-md transition min-w-max"
          >
            <FaTrash size={18} />
            Borrar todo
          </button>
        )}

        {/* ELIMINAR SELECCIONADOS */}
        {selectedIds.length > 0 && (
          <button
            title="Eliminar usuarios seleccionados"
            onClick={() => (handleDeleteSelected(), setSelectedIds([]))}
            className="flex items-center gap-2 cursor-pointer bg-red-500 hover:bg-red-600 
                       text-white font-medium px-4 py-2 rounded-lg shadow-md transition min-w-max"
          >
            <AiOutlineDelete size={18} />
            Eliminar ({selectedIds.length})
          </button>
        )}
      </div>


      {/* TABLA RESPONSIVE */}
      <div className="overflow-x-auto rounded-2xl shadow-lg border border-gray-200 bg-white select-none">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gradient-to-l from-blue-400 to-blue-600 border-b border-gray-200">
            <tr>
              <th className="px-4 sm:px-6 py-4 text-center font-semibold text-white uppercase tracking-wider">
                ID
              </th>
              <th className="px-4 sm:px-6 py-4 text-center font-semibold text-white uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-4 sm:px-6 py-4 text-center font-semibold text-white uppercase tracking-wider">
                Apellido
              </th>
              <th className="px-4 sm:px-6 py-4 text-center font-semibold text-white uppercase tracking-wider">
                Código
              </th>
              <th className="px-4 sm:px-6 py-4 text-center font-semibold text-white uppercase tracking-wider">
                Acción
              </th>
              <th className="px-2 sm:px-4 py-4 text-center font-semibold text-white uppercase tracking-wider">
                Seleccionar
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {users.length > 0 ? (
              users.map((user) => (
                <tr
                  key={user._id || user.codigo}
                  onDoubleClick={() => setFoundUser(user)}
                  className="hover:bg-gray-100 transition-colors duration-200"
                >
                  <td className="px-4 sm:px-6 py-3 font-mono text-xs text-center text-gray-500 truncate max-w-[140px]">
                    {user._id}
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-center">{user.name}</td>
                  <td className="px-4 sm:px-6 py-3 text-center">{user.lastname}</td>
                  <td className="px-4 sm:px-6 py-3 text-center">{user.codigo}</td>

                  <td className="px-2 sm:px-6 py-3 flex justify-center gap-3 sm:gap-4">
                    <button
                      onClick={() => handleEditClick(user)}
                      className="p-2 cursor-pointer rounded-full text-blue-500 hover:bg-blue-100 hover:text-blue-700 transition"
                      title="Editar"
                    >
                      <FaEdit size={18} />
                    </button>

                    <button
                      onClick={() => setUserToDelete(user)}
                      className="p-2 rounded-full cursor-pointer text-red-500 hover:bg-red-100 hover:text-red-700 transition"
                      title="Eliminar"
                    >
                      <FaTrash size={18} />
                    </button>
                  </td>

                  <td className="text-center">
                    <button
                      onClick={() => toggleSelect(user._id)}
                      className={`
                        inline-flex items-center justify-center 
                        rounded transition-colors
                        ${selectedIds.includes(user._id)
                          ? "text-red-500"
                          : "text-gray-400 hover:text-gray-600"}
                      `}
                      style={{ padding: "2px" }}
                      aria-label={`Seleccionar usuario ${user.name}`}
                    >
                      {selectedIds.includes(user._id) ? (
                        <AiOutlineCheckSquare size={24} />
                      ) : (
                        <AiOutlineBorder size={24} />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-4 text-gray-400 italic"
                >
                  No hay usuarios disponibles
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* MODAL: Usuario encontrado */}
      {foundUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center 
                        bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 
                          relative border border-gray-300 max-h-[90vh] overflow-y-auto">

            <button
              onClick={() => setFoundUser(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-600 
                         transition rounded-full p-1 hover:bg-red-200"
            >
              <FaTimes size={20} />
            </button>

            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
              Información del Usuario
            </h2>

            <div className="grid grid-cols-1 gap-4 text-gray-700">
              <div className="border-b pb-2 flex justify-between text-sm">
                <span className="font-semibold text-gray-500">ID:</span>
                <span className="font-mono text-xs">{foundUser._id}</span>
              </div>
              <div className="border-b pb-2 flex justify-between text-sm">
                <span className="font-semibold text-gray-500">Nombre:</span>
                <span>{foundUser.name}</span>
              </div>
              <div className="border-b pb-2 flex justify-between text-sm">
                <span className="font-semibold text-gray-500">Apellido:</span>
                <span>{foundUser.lastname}</span>
              </div>
              <div className="pb-2 flex justify-between text-sm">
                <span className="font-semibold text-gray-500">Código:</span>
                <span>{foundUser.codigo}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Crear Usuario */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center 
                        bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 
                          relative border border-gray-300 max-h-[90vh] overflow-y-auto">

            <button
              onClick={() => setShowCreateForm(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-600 
                         rounded-full p-1 hover:bg-red-200 transition"
            >
              <FaTimes size={20} />
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Crear Usuario
            </h2>

            <div className="grid grid-cols-1 gap-4">
              <input
                type="text"
                placeholder="Nombre"
                value={formDataCreate.name}
                onChange={(e) =>
                  setFormDataCreate({ ...formDataCreate, name: e.target.value })
                }
                className="border border-gray-300 rounded-lg px-3 py-2 w-full"
              />

              <input
                type="text"
                placeholder="Apellido"
                value={formDataCreate.lastname}
                onChange={(e) =>
                  setFormDataCreate({ ...formDataCreate, lastname: e.target.value })
                }
                className="border border-gray-300 rounded-lg px-3 py-2 w-full"
              />

              <input
                type="number"
                placeholder="Código"
                value={formDataCreate.codigo}
                onChange={(e) =>
                  setFormDataCreate({ ...formDataCreate, codigo: Number(e.target.value) })
                }
                className="border border-gray-300 rounded-lg px-3 py-2 w-full"
              />
            </div>

            <div className="flex gap-3 mt-6 justify-center">
              <button
                onClick={handleCreateUser}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 
                           rounded-lg transition w-full"
              >
                Crear
              </button>

              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setFormDataCreate({ name: "", lastname: "", codigo: 1 });
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium px-5 py-2 
                           rounded-lg transition w-full"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Eliminar un usuario */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center 
                        bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 
                          relative border border-gray-300">

            <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
              ¿Eliminar usuario?
            </h2>

            <p className="text-gray-600 text-center mb-6 text-sm">
              Estás a punto de eliminar a{" "}
              <span className="font-semibold">
                {userToDelete.name} {userToDelete.lastname}
              </span>.  
              ¿Deseas continuar?
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  handleDeleteUser(userToDelete._id);
                  setUserToDelete(null);
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-2 
                           rounded-lg transition w-full"
              >
                Sí, eliminar
              </button>

              <button
                onClick={() => setUserToDelete(null)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium px-5 py-2 
                           rounded-lg transition w-full"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Eliminar todos */}
      {usersToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center 
                        bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 
                          relative border border-gray-300">

            <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
              ¿Eliminar todos los usuarios?
            </h2>

            <p className="text-gray-600 text-center mb-6 text-sm">
              Esta acción eliminará <b>todos los usuarios</b> del sistema.
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  handleDeleteUsers();
                  setUsersToDelete(false);
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-2 
                           rounded-lg transition w-full"
              >
                Sí, eliminar todo
              </button>

              <button
                onClick={() => setUsersToDelete(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium px-5 py-2 
                           rounded-lg transition w-full"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Editar Usuario */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center 
                        bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 
                          relative border border-gray-300 max-h-[90vh] overflow-y-auto">

            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-600 
                         transition rounded-full p-1 hover:bg-red-200"
            >
              <FaTimes size={20} />
            </button>

            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
              Editar usuario
            </h2>

            <div className="grid grid-cols-1 gap-4">
              <input
                type="text"
                placeholder="Nombre"
                value={formDataEdit.name}
                onChange={(e) =>
                  setFormDataEdit({ ...formDataEdit, name: e.target.value })
                }
                className="border border-gray-300 rounded-lg px-3 py-2 w-full"
              />

              <input
                type="text"
                placeholder="Apellido"
                value={formDataEdit.lastname}
                onChange={(e) =>
                  setFormDataEdit({ ...formDataEdit, lastname: e.target.value })
                }
                className="border border-gray-300 rounded-lg px-3 py-2 w-full"
              />

              <input
                type="number"
                placeholder="Código"
                value={formDataEdit.codigo}
                onChange={(e) =>
                  setFormDataEdit({ ...formDataEdit, codigo: Number(e.target.value) })
                }
                className="border border-gray-300 rounded-lg px-3 py-2 w-full"
              />
            </div>

            <div className="flex gap-3 mt-6 justify-center">
              <button
                onClick={() => handleUpdateUser(validar(editingUser, formDataEdit))}
                className="bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2 
                           rounded-lg transition w-full"
              >
                Guardar cambios
              </button>

              <button
                onClick={() => setEditingUser(null)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium px-5 py-2 
                           rounded-lg transition w-full"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
