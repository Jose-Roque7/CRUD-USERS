 import { useEffect, useState, useRef, useCallback } from "react";
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
    <main className="min-h-screen bg-gray-900 text-white font-sans">

  {/* NAVBAR */}
  <header className="w-full px-6 py-6 bg-gray-900 text-white border-b border-white/10 sticky top-0 z-50">

    <div className="
        max-w-7xl mx-auto 
        flex flex-col items-center gap-4
        sm:flex-row sm:justify-between sm:items-center
    ">

      {/* TÍTULO CENTRADO EN MÓVIL */}
      <h1 className="text-3xl font-bold tracking-tight text-center sm:text-left">
        Gestión de Usuarios
      </h1>

      {/* ACCIONES CENTRADAS */}
      <div className="
          flex flex-wrap gap-3 justify-center
          sm:justify-end
      ">

        {/* BUSCADOR */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar usuario..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-64 bg-gray-800 border border-white/20 rounded-xl pl-4 pr-12 py-2
                       text-white placeholder-white/40 shadow-sm 
                       focus:outline-none focus:ring-2 focus:ring-white transition"
          />
          <button
            onClick={handleSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
          >
            <FaSearch size={18} />
          </button>
        </div>

        {/* CREAR */}
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 rounded-xl bg-white text-gray-900 font-medium hover:bg-gray-200
                     transition flex items-center gap-2"
        >
          <FaUserPlus size={18} /> Crear
        </button>

        {/* SALIR */}
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-xl border border-white/30 hover:bg-white/10 
                     transition text-white flex items-center gap-2"
        >
          <FaSignOutAlt size={18} /> Salir
        </button>

      </div>
    </div>
  </header>

  {/* CONTENIDO */}
  <div className="max-w-screen-2xl mx-auto px-4 py-10">

    {/* ACCIONES EXTRA */}
    <div className="flex flex-wrap gap-4 mb-8">

      {users.length === 0 && (
        <button
          onClick={handleSeedUsers}
          className="px-4 py-2 rounded-xl border border-white/20 hover:bg-white/10 
                     transition flex items-center gap-2 text-white"
        >
          <FaUserFriends /> Generar prueba
        </button>
      )}

      {users.length !== 0 && (
        <button
          onClick={() => setUsersToDelete(true)}
          className="px-4 py-2 rounded-xl bg-white text-gray-900 hover:bg-gray-200
                     transition flex items-center gap-2"
        >
          <FaTrash /> Borrar todo
        </button>
      )}

      {selectedIds.length > 0 && (
        <button
          onClick={() => (handleDeleteSelected(), setSelectedIds([]))}
          className="px-4 py-2 rounded-xl bg-gray-200 text-gray-900 hover:bg-white 
                     transition flex items-center gap-2"
        >
          <AiOutlineDelete /> Eliminar ({selectedIds.length})
        </button>
      )}

    </div>

    {/* ============================ */}
    {/* TABLA FULL DESKTOP           */}
    {/* ============================ */}
    <div className="hidden md:block w-full rounded-xl overflow-hidden border border-white/10 bg-gray-800">

      <table className="w-full text-left">
        <thead className="bg-gray-900 text-white">
          <tr>
            <th className="p-4">ID</th>
            <th className="p-4">Nombre</th>
            <th className="p-4">Apellido</th>
            <th className="p-4 text-center">Código</th>
            <th className="p-4 text-center">Acciones</th>
            <th className="p-4 text-center">Sel</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-white/10 bg-gray-800">
          {users.length > 0 ? (
            users.map((user) => (
              <tr
                key={user._id}
                onDoubleClick={() => setFoundUser(user)}
                className="hover:bg-gray-700 transition cursor-pointer"
              >
                <td className="p-4 text-xs text-white/60">{user._id}</td>
                <td className="p-4">{user.name}</td>
                <td className="p-4">{user.lastname}</td>
                <td className="p-4 text-center">{user.codigo}</td>

                <td className="p-4 text-center flex justify-center gap-5">
                  <button onClick={() => handleEditClick(user)} className="text-white hover:opacity-70">
                    <FaEdit size={20} />
                  </button>
                  <button onClick={() => setUserToDelete(user)} className="text-white hover:opacity-70">
                    <FaTrash size={20} />
                  </button>
                </td>

                <td className="text-center">
                  <button
                    onClick={() => toggleSelect(user._id)}
                    className={selectedIds.includes(user._id)
                      ? "text-white"
                      : "text-white/50 hover:text-white"
                    }
                  >
                    {selectedIds.includes(user._id)
                      ? <AiOutlineCheckSquare size={26} />
                      : <AiOutlineBorder size={26} />}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center py-6 text-white/40">
                No hay usuarios
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    {/* ============================ */}
    {/* MOBILE CARDS (DARK)          */}
    {/* ============================ */}
   <div className="md:hidden space-y-6">
  {users.length > 0 ? (
    users.map((user) => {
      let pressTimer: NodeJS.Timeout;

      const handleMouseDown = () => {
        // Inicia timer para selección con long press
        pressTimer = setTimeout(() => {
          toggleSelect(user._id);
        }, 600); // 600ms presionado
      };

      const handleMouseUp = () => {
        clearTimeout(pressTimer);
      };

      return (
        <div
          key={user._id}
          className={`bg-gray-800 border ${
            selectedIds.includes(user._id)
              ? "border-blue-500"
              : "border-white/10"
          } rounded-2xl p-5 shadow-sm text-center cursor-pointer transition transform hover:scale-[1.02]`}
          onDoubleClick={() => setFoundUser(user)}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
        >
          {/* ID */}
          <p className="text-xs text-white/40 truncate mb-2">{user._id}</p>

          {/* Información principal */}
          <h3 className="text-xl font-semibold text-white">{user.name}</h3>
          <p className="text-white/70">{user.lastname}</p>
          <p className="text-white mt-1 font-medium">Código: {user.codigo}</p>

          {/* Indicador de selección */}
          {selectedIds.includes(user._id) && (
            <p className="mt-3 text-blue-400 font-semibold">Seleccionado</p>
          )}
        </div>
      );
    })
  ) : (
    <p className="text-center text-white/40">No hay usuarios</p>
  )}
</div>






    </div>
      {/* MODAL: Crear Usuario */}
{showCreateForm && (
  <div className="fixed inset-0 z-50 flex items-center justify-center 
                  bg-gray-900/70 backdrop-blur-sm p-4">
    <div className="bg-gray-800 w-full max-w-sm rounded-2xl shadow-xl p-6 
                    relative border border-white/10 max-h-[90vh] overflow-y-auto">

      <button
        onClick={() => setShowCreateForm(false)}
        className="absolute top-4 right-4 text-white/70 hover:text-red-400 
                   rounded-full p-1 hover:bg-white/10 transition"
      >
        <FaTimes size={20} />
      </button>

      <h2 className="text-2xl font-bold text-white mb-6 text-center">
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
          className="bg-gray-900 border border-white/20 rounded-lg px-3 py-2 w-full 
                     text-white placeholder-white/40"
        />

        <input
          type="text"
          placeholder="Apellido"
          value={formDataCreate.lastname}
          onChange={(e) =>
            setFormDataCreate({ ...formDataCreate, lastname: e.target.value })
          }
          className="bg-gray-900 border border-white/20 rounded-lg px-3 py-2 w-full 
                     text-white placeholder-white/40"
        />

        <input
          type="number"
          placeholder="Código"
          value={formDataCreate.codigo}
          onChange={(e) =>
            setFormDataCreate({ ...formDataCreate, codigo: Number(e.target.value) })
          }
          className="bg-gray-900 border border-white/20 rounded-lg px-3 py-2 w-full 
                     text-white placeholder-white/40"
        />
      </div>

      <div className="flex gap-3 mt-6 justify-center">
        <button
          onClick={handleCreateUser}
          className="bg-white text-gray-900 font-medium px-5 py-2 
                     rounded-lg transition hover:bg-gray-200 w-full"
        >
          Crear
        </button>

        <button
          onClick={() => {
            setShowCreateForm(false);
            setFormDataCreate({ name: '', lastname: '', codigo: 1 });
          }}
          className="bg-gray-700 hover:bg-gray-600 text-white font-medium px-5 py-2 
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
                  bg-gray-900/70 backdrop-blur-sm p-4">
    <div className="bg-gray-800 w-full max-w-sm rounded-2xl shadow-xl p-6 
                    relative border border-white/10">

      <h2 className="text-xl font-bold text-white mb-4 text-center">
        ¿Eliminar usuario?
      </h2>

      <p className="text-white/70 text-center mb-6 text-sm">
        Estás a punto de eliminar a{' '}
        <span className="font-semibold text-white">
          {userToDelete.name} {userToDelete.lastname}
        </span>.
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
          className="bg-gray-700 hover:bg-gray-600 text-white font-medium px-5 py-2 
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
                  bg-gray-900/70 backdrop-blur-sm p-4">
    <div className="bg-gray-800 w-full max-w-sm rounded-2xl shadow-xl p-6 
                    relative border border-white/10">

      <h2 className="text-xl font-bold text-white mb-4 text-center">
        ¿Eliminar todos los usuarios?
      </h2>

      <p className="text-white/70 text-center mb-6 text-sm">
        Esta acción eliminará <b className="text-white">todos los usuarios</b>.
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
          className="bg-gray-700 hover:bg-gray-600 text-white font-medium px-5 py-2 
                     rounded-lg transition w-full"
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
)}

{foundUser && (
  <div className="fixed inset-0 z-50 flex items-center justify-center 
                  bg-gray-900/70 backdrop-blur-sm p-4">

    <div className="bg-gray-800 w-full max-w-sm rounded-2xl shadow-xl p-6 
                    relative border border-white/10 flex flex-col items-center text-center">

      {/* Cerrar */}
      <button
        onClick={() => setFoundUser(null)}
        className="absolute top-4 right-4 text-white/70 hover:text-red-400 
                   rounded-full p-1 hover:bg-white/10 transition"
      >
        <FaTimes size={20} />
      </button>

      {/* Título */}
      <h2 className="text-2xl font-bold text-white text-center mb-4">
        Usuario encontrado
      </h2>

      {/* ID */}
      <p className="text-white/50 text-xs mb-4 truncate w-full">{foundUser._id}</p>

      {/* Información principal */}
      <div className="w-full mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-white/80 font-medium">Nombre:</span>
          <span className="text-white font-semibold">{foundUser.name}</span>
        </div>

        <div className="flex justify-between mb-2">
          <span className="text-white/80 font-medium">Apellido:</span>
          <span className="text-white font-semibold">{foundUser.lastname}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-white/80 font-medium">Código:</span>
          <span className="text-white font-semibold">{foundUser.codigo}</span>
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-between gap-4 w-full">
        <button
          onClick={() => {
            handleEditClick(foundUser);
            setFoundUser(null);
          }}
          className="flex-1 bg-white text-gray-900 font-medium px-4 py-2 
                     rounded-lg transition hover:bg-gray-200"
        >
          Editar
        </button>

        <button
          onClick={() => {
            setUserToDelete(foundUser);
            setFoundUser(null);
          }}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 
                     rounded-lg transition"
        >
          Eliminar
        </button>
      </div>
    </div>
  </div>
)}


{/* MODAL: Editar Usuario */}
{editingUser && (
  <div className="fixed inset-0 z-50 flex items-center justify-center 
                  bg-gray-900/70 backdrop-blur-sm p-4">
    <div className="bg-gray-800 w-full max-w-sm rounded-2xl shadow-xl p-6 
                    relative border border-white/10 max-h-[90vh] overflow-y-auto">

      <button
        onClick={() => setEditingUser(null)}
        className="absolute top-4 right-4 text-white/70 hover:text-red-400 
                   transition rounded-full p-1 hover:bg-white/10"
      >
        <FaTimes size={20} />
      </button>

      <h2 className="text-xl font-bold text-white mb-6 text-center">
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
          className="bg-gray-900 border border-white/20 rounded-lg px-3 py-2 w-full 
                     text-white placeholder-white/40"
        />

        <input
          type="text"
          placeholder="Apellido"
          value={formDataEdit.lastname}
          onChange={(e) =>
            setFormDataEdit({ ...formDataEdit, lastname: e.target.value })
          }
          className="bg-gray-900 border border-white/20 rounded-lg px-3 py-2 w-full 
                     text-white placeholder-white/40"
        />

        <input
          type="number"
          placeholder="Código"
          value={formDataEdit.codigo}
          onChange={(e) =>
            setFormDataEdit({ ...formDataEdit, codigo: Number(e.target.value) })
          }
          className="bg-gray-900 border border-white/20 rounded-lg px-3 py-2 w-full 
                     text-white placeholder-white/40"
        />
      </div>

      <div className="flex gap-3 mt-6 justify-center">
        <button
          onClick={() =>
            handleUpdateUser(validar(editingUser, formDataEdit))
          }
          className="bg-white text-gray-900 font-medium px-5 py-2 
                     rounded-lg transition hover:bg-gray-200 w-full"
        >
          Guardar cambios
        </button>

        <button
          onClick={() => setEditingUser(null)}
          className="bg-gray-700 hover:bg-gray-600 text-white font-medium px-5 py-2 
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
