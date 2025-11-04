import { useEffect, useState } from "react";
import { checkIfCodeExists, createUser, deleteUser, getItems, updateUser, getuser, seedUsers, deleteAll, deleteUsers } from "@/lib/crud";
import { checkIfUserExists } from '../lib/crud';
import { FaEdit, FaSearch, FaTimes, FaTrash, FaUserFriends, FaUserPlus } from "react-icons/fa";
import toast from 'react-hot-toast'
import { AiOutlineBorder, AiOutlineCheckSquare, AiOutlineDelete } from "react-icons/ai";
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

  // Estados separados para cada formulario
  const [formDataCreate, setFormDataCreate] = useState({ name: "", lastname: "", codigo: 1 });
  const [formDataEdit, setFormDataEdit] = useState({ name: "", lastname: "", codigo:  1});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const data = await getItems();
        setUsers(data);
      } catch (err) {
        toast.error("No hay usuarios disponibles para presentar!");
      } finally {
        setLoading(false);
      }
    }
    fetchUsers()

    const intervalId = setInterval(fetchUsers, 1000);

    return () => clearInterval(intervalId);
  }, []);




 const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    try {
      await deleteUsers(selectedIds);
      toast.success(`(${selectedIds.length}) Usuarios eliminados correctamente`);
      // Opcional: refrescar la lista de usuarios
    } catch (error) {
      toast.error('Error eliminando usuarios');
    }
  };







  // Manejar edición
  function handleEditClick(user: any){
    setSelectedIds([])
    setEditingUser(user);
    setFormDataEdit({ name: user.name, lastname: user.lastname, codigo: user.codigo });
    setShowCreateForm(false); // ocultar el formulario de creación
  };

  async function handleUpdateUser(valor : boolean) {
    if (formDataEdit.name === '' || formDataEdit.lastname === ''){
      toast('⚠️ Campo de (Nombre) o (Apellido) vacio, favor de llenar');
      return;
      }
    setSelectedIds([])
    if (!editingUser) return;
    try {
      if (!valor) {
        const codeExists = await checkIfCodeExists(formDataEdit.codigo, "");
      if (codeExists) {
      toast.error('Error al actualizar usuario, ese codigo ya existe!');
        return;
      }
      }

      const updated = await updateUser(editingUser._id, formDataEdit);
      setUsers((prev) =>
        prev.map((u) => (u._id === editingUser._id ? updated : u))
      );
      setEditingUser(null);
      setFormDataEdit({ name: "", lastname: "", codigo: 0 });
      toast.success('Usuario actualizado correctamente');
    } catch (err: any) {
      return;
    }
  };

  function validar(original:any, editado:any){
    const valor = original.codigo === editado.codigo;
    return valor;
  }
  // Crear usuario
  async function handleCreateUser() {
  try {
    setSelectedIds([])
    const codeExists = await checkIfCodeExists(formDataCreate.codigo, "");
    if (codeExists) {
      toast.error('Error al crear usuario, ya existe un usuario con ese código');
      return;
    }
    if (formDataCreate.name === '' || formDataCreate.lastname === ''){
      toast('⚠️ Campo de (Nombre) o (Apellido) vacio, favor de llenar');
      return;
    }
    if (formDataCreate.codigo < 1) {
      toast.error('Error no se puede enviar un numero menor a 1.');
      return;
    }
    await createUser(formDataCreate);
    const data = await getItems();
    setUsers(data);

    setFormDataCreate({ name: "", lastname: "", codigo: 1 });
    setShowCreateForm(false);
    toast.success('Usuario creado correctamente');
  } catch (err: any) {
    toast.error('Error al crear el usuario');
  }
}

  // Generar usuarios
  async function handleSeedUsers() {
    try {
      await seedUsers();
      const data = await getItems(); // refresca la lista
      setUsers(data);
      toast.success('Usuarios de prueba generados correctamente');
    } catch (err) {
      toast.error('Error al generar usuarios de prueba');
    }
}

  // Eliminar Usuarios
async function handleDeleteUsers() {
    try {
      await deleteAll();
      const data = await getItems(); // refresca la lista
      setUsers(data);
      toast.success('Usuarios eliminados correctamente');
      setSelectedIds([])
    } catch (err) {
      toast.error('Error al eliminar usuarios');
    }
}

  // Buscar usuario
  async function handleSearch(){
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
  };

  // Eliminar usuario
  async function handleDeleteUser(id: string){
      try {
        await deleteUser(id);
        setUsers((prev) => prev.filter((u) => u._id !== id));
        toast.success('Usuario eliminado correctamente');
        setSelectedIds([])

      } catch {
        toast.error('Error al eliminar el usuario!');
      }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-black-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center select-none">REGISTRO DE USUARIOS</h1>
      <div className="flex gap-3 mb-6 w-full max-w-3xl mx-auto justify-between items-center">
        {/* Input de búsqueda */}
        <div className="relative flex-1">
              <input
                type="text"
                placeholder="Buscar usuario..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full border border-gray-300 rounded-lg pl-4 pr-12 py-2 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              />
              <button
                onClick={handleSearch}
                disabled={searching}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 p-2 cursor-pointer rounded-full hover:bg-blue-100 hover:text-blue-800 transition disabled:opacity-50"
                title="Buscar"
              >
                {searching ? <span className="animate-pulse"></span> : <FaSearch size={18} />}
              </button>
        </div>
        {/* Botón de crear usuario */}
        <button 
        title="Crear usuario" 
            onClick={() => setShowCreateForm(true)}
            className="flex items-center cursor-pointer gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg shadow-md transition"
          >
            <FaUserPlus size={18} /> {/* Ícono */}
            Crear usuario
        </button>
        {/* Botón para generar usuarios de prueba */}
        {users.length === 0 && (
          <button
          title="Generar usuarios de prueba"
            onClick={handleSeedUsers}
            className="flex items-center gap-2 bg-gray-600 cursor-pointer hover:bg-gray-700 text-white font-medium px-4 py-2 rounded-lg shadow-md transition"
          >
            <FaUserFriends size={18} />
            
          </button>
        )}
        {/* Botón para eliminar usuarios*/}
        {users.length !== 0 && (
      <button
      title="Eliminar todos los usuarios"
        onClick={()=> setUsersToDelete(true)}
        className="flex items-center gap-2 bg-red-600 cursor-pointer hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg shadow-md transition"
      >
        <FaTrash size={18} />
        
      </button>
        )}
        {/* Botón para eliminar usuarios Seleccionados*/}
        {selectedIds.length > 0 && (
          <button
          title="Eliminar usuarios seleccionados"
            onClick={()=>(handleDeleteSelected(), setSelectedIds([]))}
            className="flex items-center gap-2 cursor-pointer bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg shadow-md transition"
          >
            <AiOutlineDelete size={18} />Eliminar ({selectedIds.length})

          </button>
        )}
      </div>

      {/* Usuario encontrado */}
      {foundUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          {/* Card */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl w-11/12 sm:w-96 p-6 relative border border-gray-400">

            {/* Botón cerrar */}
            <button
              onClick={() => setFoundUser(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition rounded-full p-1 hover:bg-red-200"
              title="Cerrar">
              <FaTimes size={20} />
            </button>

            {/* Título */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Usuario</h2>

            {/* Contenido */}
            <div className="grid grid-cols-1 gap-4 text-gray-700">
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="font-semibold text-gray-500">ID:</span>
                <span className="font-medium text-xs">{foundUser._id}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="font-semibold text-gray-500">Nombre:</span>
                <span className="font-medium text-xs">{foundUser.name}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="font-semibold text-gray-500">Apellido:</span>
                <span className="font-medium text-xs">{foundUser.lastname}</span>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="font-semibold text-gray-500">Código:</span>
                <span className="font-medium text-xs">{foundUser.codigo}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Formulario de creación */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          {/* Modal */}
          <div className="bg-white rounded-2xl shadow-xl w-11/12 sm:w-96 p-6 relative border border-gray-200">

            {/* Botón cerrar */}
            <button
              onClick={() => { setShowCreateForm(false);}}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition rounded-full p-1 hover:bg-red-200"
              title="Cerrar">
              <FaTimes size={20} />
            </button>

            {/* Título */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Crear nuevo usuario
            </h2>

            {/* Formulario */}
            <div className="grid grid-cols-1 gap-4">
              <input
                type="text"
                placeholder="Nombre"
                value={formDataCreate.name}
                onChange={(e) => setFormDataCreate({ ...formDataCreate, name: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full"
              />
              <input
                type="text"
                placeholder="Apellido"
                value={formDataCreate.lastname}
                onChange={(e) => setFormDataCreate({ ...formDataCreate, lastname: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full"
              />
              <input
                type="text"
                placeholder="Código"
                value={formDataCreate.codigo}
                onChange={(e) => setFormDataCreate({ ...formDataCreate, codigo: Number(e.target.value) })}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full"
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3 mt-6 justify-center">
              <button
                onClick={handleCreateUser}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg transition">
                Crear usuario
              </button>
              <button
                onClick={() => { setShowCreateForm(false); setFormDataCreate({ name: "", lastname: "", codigo: 1 }); }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium px-5 py-2 rounded-lg transition">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de usuarios */}
      <div className="overflow-x-auto rounded-2xl shadow-lg border border-gray-200 bg-white select-none">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gradient-to-l from-blue-400 to-blue-600 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-center font-semibold text-white uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-4 text-center font-semibold text-white uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-4 text-center font-semibold text-white uppercase tracking-wider">
                Apellido
              </th>
              <th className="px-6 py-4 text-center font-semibold text-white uppercase tracking-wider">
                Código
              </th>
              <th className="px-6 py-4 text-center font-semibold text-white uppercase tracking-wider">
                Acción
              </th>
              <th className="text-center font-semibold text-white uppercase tracking-wider">
                Selecionar
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {users.length > 0 ? (
              users.map((user) => (
                <tr
                  key={user._id || user.codigo}
                  onDoubleClick={() => setFoundUser(user)}
                  className="hover:bg-gray-300 transition-colors duration-200"
                >
                  <td className="px-6 py-3 font-mono text-xs text-center text-gray-500 truncate max-w-[140px]">
                    {user._id}
                  </td>
                  <td className="px-6 py-3 text-center">{user.name}</td>
                  <td className="px-6 py-3 text-center">{user.lastname}</td>
                  <td className="px-6 py-3 text-center">{user.codigo}</td>
                  <td className="px-6 py-3 flex justify-center gap-4">
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
                        ${selectedIds.includes(user._id) ? " text-red-500" : "text-gray-400 hover:text-gray-600"}
                      `}
                      style={{ padding: "2px" }} // pequeño padding solo alrededor del ícono
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
                  className="text-center py-4 text-gray-400 italic "
                >
                  No hay usuarios disponibles
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-11/12 sm:w-96 p-6 relative border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
              ¿Eliminar usuario?
            </h2>
            <p className="text-gray-600 text-center mb-6">
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
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-2 rounded-lg transition"
              >
                Sí, eliminar
              </button>
              <button
                onClick={() => setUserToDelete(null)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium px-5 py-2 rounded-lg transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {usersToDelete &&(
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-11/12 sm:w-96 p-6 relative border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
              ¿Eliminar usuario?
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Estás a punto de eliminar a{" "}
              <span className="font-semibold">
                todos los usuarios
              </span>.
              ¿Deseas continuar?
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  handleDeleteUsers();
                  setUsersToDelete(false);
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-2 rounded-lg transition"
              >
                Sí, eliminar
              </button>
              <button
                onClick={() => setUsersToDelete(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium px-5 py-2 rounded-lg transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Formulario de edición */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          {/* Modal */}
          <div className="bg-white rounded-2xl shadow-xl w-11/12 sm:w-96 p-6 relative border border-gray-200">

            {/* Botón cerrar */}
            <button
              onClick={() => { setEditingUser(null); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition rounded-full p-1 hover:bg-red-200"
              title="Cerrar">
              <FaTimes size={20} />
            </button>

            {/* Título */}
            <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-6 text-center">
              Editando usuario: {editingUser.name} {editingUser.lastname}
            </h2>

            {/* Formulario */}
            <div className="grid grid-cols-1 gap-4">
              <input
                type="text"
                placeholder="Nombre"
                value={formDataEdit.name}
                onChange={(e) => setFormDataEdit({ ...formDataEdit, name: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full"
              />
              <input
                type="text"
                placeholder="Apellido"
                value={formDataEdit.lastname}
                onChange={(e) => setFormDataEdit({ ...formDataEdit, lastname: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full"
              />
              <input
                type="text"
                placeholder="Código"
                value={formDataEdit.codigo}
                onChange={(e) => setFormDataEdit({ ...formDataEdit, codigo: Number(e.target.value) })}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full"
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3 mt-6 justify-center">
              <button
                onClick={() => handleUpdateUser(validar(editingUser, formDataEdit))}
                className="bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2 rounded-lg transition">
                Guardar cambios
              </button>
              <button
                onClick={() => { setEditingUser(null); }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium px-5 py-2 rounded-lg transition">
                Cancelar
              </button>
            </div>
          </div>
        </div>


      )}
    </main>
  );
}