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
import { FaBars, FaEdit, FaSearch, FaSignOutAlt, FaTimes, FaTrash, FaUserFriends, FaUserPlus } from "react-icons/fa";
import toast from "react-hot-toast";
import { AiOutlineBorder, AiOutlineCheckSquare, AiOutlineDelete } from "react-icons/ai";
import { useAuthStore } from "@/lib/authStore";
import { useRouter } from "next/navigation";

// Definir interfaz para el usuario
interface User {
  _id: string;
  name: string;
  lastname: string;
  codigo: number;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
}

export default function DivInicio() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchValue, setSearchValue] = useState("");
  const [foundUser, setFoundUser] = useState<User | null>(null);
  const [searching, setSearching] = useState(false);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [usersToDelete, setUsersToDelete] = useState(false);

  // Estados de paginación
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasNext: false,
    hasPrev: false,
    limit: 10
  });
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentSearch, setCurrentSearch] = useState("");

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
  const { isLoggedIn, checkAuth, logout } = useAuthStore();
  const router = useRouter();

  // Estados para navbar móvil
  const [mobileMenu, setMobileMenu] = useState(false);

  // Hook para detectar dispositivo
  const useDeviceDetection = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const checkDevice = () => {
        setIsMobile(window.innerWidth < 768);
      };

      checkDevice();
      window.addEventListener('resize', checkDevice);

      return () => window.removeEventListener('resize', checkDevice);
    }, []);

    return isMobile;
  };

  const isMobile = useDeviceDetection();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const currentState = useAuthStore.getState();
      
      if (!currentState.isLoggedIn) {
        router.push('/');
      }
    };

    checkAuthAndRedirect();
  }, [router]);

  // Ajustar items por página según dispositivo
  useEffect(() => {
    if (isMobile) {
      setItemsPerPage(5);
    } else {
      setItemsPerPage(10);
    }
  }, [isMobile]);

  const fetchUsers = async (page: number = pagination.currentPage, limit: number = itemsPerPage, search: string = currentSearch) => {
  try {
    const data = await getItems(page, limit, search);
    if (data.pagination) {
      // Si viene con paginación (nuevo formato)
      setUsers(data.users);
      setPagination(data.pagination);
    } else {
      // Si viene sin paginación (formato antiguo - array directo)
      setUsers(data);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalUsers: data.length,
        hasNext: false,
        hasPrev: false,
        limit: limit
      });
    }
  } catch  {
    return;
  }finally {
    setLoading(false);
  }
};

// Cargar usuarios - efecto principal SOLO para cambios de búsqueda o items por página
useEffect(() => {
  if (!isLoggedIn) return;
  
  // Solo recargar cuando cambie la búsqueda o items por página, manteniendo la página actual
  fetchUsers(1, itemsPerPage, currentSearch);
}, [isLoggedIn, itemsPerPage, currentSearch]); // pagination.currentPage removido

// Función para cambiar página
const handlePageChange = (newPage: number) => {
  fetchUsers(newPage, itemsPerPage, currentSearch);
};

// Función para cambiar items por página
const handleItemsPerPageChange = (newLimit: number) => {
  setItemsPerPage(newLimit);
  // Al cambiar items por página, ir a la página 1
  fetchUsers(1, newLimit, currentSearch);
};

// Función para búsqueda
const handleSearch = async () => {
  if (!searchValue.trim()) {
    setCurrentSearch("");
    // Al limpiar búsqueda, ir a la página 1
    fetchUsers(1, itemsPerPage, "");
    return;
  }

  setSearching(true);
  try {
    setCurrentSearch(searchValue);
    // Al buscar, ir a la página 1
    fetchUsers(1, itemsPerPage, searchValue);
  } catch (error) {
    toast.error("Error al buscar usuarios");
  } finally {
    setSearching(false);
  }
};
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
      setSelectedIds([]);
      toast.success(`${selectedIds.length} usuarios eliminados correctamente`);
      // Recargar la página actual después de eliminar
      fetchUsers(pagination.currentPage, itemsPerPage, currentSearch);
    } catch (error) {
      toast.error("Error eliminando usuarios");
    }
  };

  // --- EDITAR ---
  function handleEditClick(user: User) {
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

      // Recargar datos actualizados
      fetchUsers(pagination.currentPage, itemsPerPage, currentSearch);

    } catch (err) {
      toast.error("Error al actualizar usuario");
    }
  }

  function validar(original: User, editado: typeof formDataEdit) {
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

      // Recargar la primera página para ver el nuevo usuario
      fetchUsers(1, itemsPerPage, currentSearch);

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
      fetchUsers(1, itemsPerPage, currentSearch);
      toast.success("Usuarios de prueba generados correctamente");
    } catch (err) {
      toast.error("Error al generar usuarios de prueba");
    }
  }

  // --- ELIMINAR TODOS ---
  async function handleDeleteAllUsers() {
    try {
      await deleteAll();
      fetchUsers(1, itemsPerPage, currentSearch);
      toast.success("Usuarios eliminados correctamente");
      setSelectedIds([]);
    } catch (err) {
      toast.error("Error al eliminar usuarios");
    }
  }


  // --- ELIMINAR UNO ---
  async function handleDeleteUser(id: string) {
    try {
      await deleteUser(id);
      
      // Si queda solo un usuario en la página actual y no es la primera página, retroceder
      if (users.length === 1 && pagination.currentPage > 1) {
        fetchUsers(pagination.currentPage - 1, itemsPerPage, currentSearch);
      } else {
        fetchUsers(pagination.currentPage, itemsPerPage, currentSearch);
      }
      
      toast.success("Usuario eliminado correctamente");
      setSelectedIds([]);
    } catch {
      toast.error("Error al eliminar el usuario!");
    }
  }

  const handleLogout = async () => {
    await logout();
    router.push("/");
  }

  // --- LOADING ---
  if (!isLoggedIn || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="w-12 h-12 border-4 border-gray-700 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white font-sans"> 
      {/* NAVBAR ELEGANTE */}
      <header
        className={`w-full fixed top-0 z-50 bg-black border-b border-gray-600 backdrop-blur-sm transition-all duration-300`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
          {/* Logo con estilo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <FaUserFriends className="text-black text-sm" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Gestión de <span className="text-white">Usuarios</span>
            </h1>
          </div>

          {/* Botón mobile toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="text-white p-2 rounded-lg border border-gray-600 hover:border-white transition-all duration-200"
            >
              {mobileMenu ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex gap-3 items-center">
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2.5 rounded-xl bg-white text-black font-semibold hover:bg-gray-200 
                       transition-all duration-200 flex items-center gap-2 hover:scale-105 border border-white"
            >
              <FaUserPlus size={16} />
              Crear Usuario
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl border border-gray-600 text-white font-medium 
                       hover:bg-white hover:text-black transition-all duration-200 flex items-center gap-2 hover:scale-105"
            >
              <FaSignOutAlt size={16} />
              Salir
            </button>
          </nav>
        </div>

        {/* Mobile Menu Mejorado */}
        {mobileMenu && (
          <div className="md:hidden bg-black border-t border-gray-600 backdrop-blur-sm">
            <div className="px-4 py-3 space-y-2">
              <button
                onClick={() => {
                  setShowCreateForm(true);
                  setMobileMenu(false);
                }}
                className="w-full text-left px-4 py-3 rounded-xl bg-white text-black font-semibold 
                         transition-all duration-200 flex items-center gap-3 hover:scale-[1.02] border border-white"
              >
                <FaUserPlus size={18} />
                Crear Usuario
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenu(false);
                }}
                className="w-full text-left px-4 py-3 rounded-xl border border-gray-600 text-white 
                         font-medium transition-all duration-200 flex items-center gap-3 hover:bg-white hover:text-black"
              >
                <FaSignOutAlt size={18} />
                Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </header>

      {/* BUSCADOR ELEGANTE */}
      <div className="w-full px-4 py-6 pt-20 flex justify-center">
        <div className="relative w-full max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o código..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full bg-black border border-gray-600 rounded-xl pl-12 pr-3  py-3
                       text-white placeholder-gray-400 shadow-lg
                       focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20 transition-all duration-200"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <FaSearch size={16} />
            </div>
            </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6">
        {/* ACCIONES RÁPIDAS MEJORADAS */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center md:justify-start">
          {users.length === 0 && !currentSearch && (
            <button
              onClick={handleSeedUsers}
              className="px-5 py-2.5 rounded-xl border border-gray-600 text-white font-medium 
                       hover:bg-white hover:text-black transition-all duration-200 flex items-center gap-2 hover:scale-105"
            >
              <FaUserFriends size={16} />
              Generar Datos de Prueba
            </button>
          )}

          {users.length > 0 && (
            <button
              onClick={() => setUsersToDelete(true)}
              className="px-5 py-2.5 rounded-xl bg-white text-black font-semibold 
                       hover:bg-gray-200 transition-all duration-200 flex items-center gap-2 hover:scale-105 border border-white"
            >
              <FaTrash size={16} />
              Borrar Todos
            </button>
          )}

          {selectedIds.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-semibold 
                       hover:bg-red-700 transition-all duration-200 flex items-center gap-2 hover:scale-105 border border-red-600"
            >
              <AiOutlineDelete size={18} />
              Eliminar ({selectedIds.length})
            </button>
          )}

          {/* Contador de usuarios */}
          {users.length > 0 && (
            <div className="px-4 py-2.5 rounded-xl border border-gray-600 text-white font-medium flex items-center gap-2">
              <FaUserFriends size={14} />
              <span>Total: <strong>{pagination.totalUsers}</strong></span>
              {selectedIds.length > 0 && (
                <span className="ml-2">| Seleccionados: <strong>{selectedIds.length}</strong></span>
              )}
            </div>
          )}

          {/* Selector de items por página */}
          {users.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-600">
              <span className="text-gray-400 text-sm">Mostrar:</span>
              <select 
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="bg-black border-none text-white text-sm focus:outline-none focus:ring-0"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          )}
        </div>

        {/* TABLA DESKTOP */}
        <div className="hidden md:block w-full rounded-2xl overflow-hidden border border-gray-600 bg-black shadow-2xl">
          <table className="w-full">
            <thead className="bg-black border-b border-gray-600">
              <tr>
                <th className="p-4 text-left">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-white font-semibold text-sm uppercase tracking-wider">ID</span>
                  </div>
                </th>
                <th className="p-4 text-left">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-white font-semibold text-sm uppercase tracking-wider">Nombre</span>
                  </div>
                </th>
                <th className="p-4 text-left">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-white font-semibold text-sm uppercase tracking-wider">Apellido</span>
                  </div>
                </th>
                <th className="p-4 text-center">
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-white font-semibold text-sm uppercase tracking-wider">Código</span>
                  </div>
                </th>
                <th className="p-4 text-center">
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-white font-semibold text-sm uppercase tracking-wider">Acciones</span>
                  </div>
                </th>
                <th className="p-4 text-center">
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-white font-semibold text-sm uppercase tracking-wider">Seleccionar</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users.length > 0 ? (
                users.map((user, index) => {
                  const isSelected = selectedIds.includes(user._id);
                  return (
                    <tr
                      key={user._id}
                      onDoubleClick={() => setFoundUser(user)}
                      className={`
                        group transition-all duration-200 border-l-4
                        ${isSelected 
                          ? 'bg-white/5 border-l-white hover:bg-white/10' 
                          : 'bg-transparent border-l-transparent hover:bg-white/5'
                        }
                        ${index % 2 === 0 ? 'bg-black/50' : 'bg-black/30'}
                      `}
                    >
                      {/* ID */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`
                            w-2 h-2 rounded-full transition-all duration-200
                            ${isSelected ? 'bg-white animate-pulse' : 'bg-gray-500'}
                          `}></div>
                          <span className="font-mono text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded">
                            {user._id.slice(-8)}
                          </span>
                        </div>
                      </td>

                      {/* Nombre */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`
                            w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border
                            ${isSelected 
                              ? 'bg-white text-black border-white' 
                              : 'bg-gray-800 text-white border-gray-600 group-hover:border-gray-400'
                            }
                          `}>
                            {user.name.charAt(0)}
                          </div>
                          <span className="text-white font-medium">{user.name}</span>
                        </div>
                      </td>

                      {/* Apellido */}
                      <td className="p-4">
                        <span className="text-gray-200">{user.lastname}</span>
                      </td>

                      {/* Código */}
                      <td className="p-4 text-center">
                        <span className={`
                          font-mono font-bold px-3 py-1.5 rounded-lg border text-sm
                          ${isSelected 
                            ? 'bg-white text-black border-white' 
                            : 'bg-gray-800 text-white border-gray-600'
                          }
                        `}>
                          {user.codigo}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(user)}
                            className={`
                              p-2 rounded-lg border transition-all duration-200 transform hover:scale-110
                              ${isSelected 
                                ? 'bg-white text-black border-white hover:bg-gray-100' 
                                : 'bg-gray-800 text-white border-gray-600 hover:bg-gray-700 hover:border-gray-400'
                              }
                            `}
                            title="Editar usuario"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button
                            onClick={() => setUserToDelete(user)}
                            className={`
                              p-2 rounded-lg border transition-all duration-200 transform hover:scale-110
                              ${isSelected 
                                ? 'bg-black text-white border-white hover:bg-gray-800' 
                                : 'bg-gray-800 text-white border-gray-600 hover:bg-red-500/20 hover:border-red-400'
                              }
                            `}
                            title="Eliminar usuario"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </td>

                      {/* Selección */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => toggleSelect(user._id)}
                          className={`
                            p-2 rounded-lg border-2 transition-all duration-200 transform hover:scale-110
                            ${isSelected 
                              ? 'bg-white text-black border-white shadow-lg' 
                              : 'bg-transparent text-white border-gray-500 hover:border-white'
                            }
                          `}
                          title={isSelected ? "Deseleccionar" : "Seleccionar"}
                        >
                          {isSelected ? 
                            <AiOutlineCheckSquare size={20} /> : 
                            <AiOutlineBorder size={20} />
                          }
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 border border-gray-600">
                        <FaUserFriends size={24} />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {currentSearch ? 'No se encontraron usuarios' : 'No hay usuarios'}
                      </h3>
                      <p className="text-sm mb-4">
                        {currentSearch ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando el primer usuario'}
                      </p>
                      {!currentSearch && (
                        <button
                          onClick={() => setShowCreateForm(true)}
                          className="bg-white hover:bg-gray-200 text-black px-6 py-2 rounded-lg font-medium 
                                   transition-all duration-200 border border-white hover:scale-105 flex items-center gap-2"
                        >
                          <FaUserPlus size={14} />
                          Crear Usuario
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Footer de la tabla con paginación */}
          {users.length > 0 && (
            <div className="bg-black border-t border-gray-600 px-4 py-3">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-400">
                  Mostrando {(pagination.currentPage - 1) * itemsPerPage + 1} - {Math.min(pagination.currentPage * itemsPerPage, pagination.totalUsers)} de {pagination.totalUsers} usuarios
                  {selectedIds.length > 0 && (
                    <span className="ml-4">
                      | Seleccionados: <span className="text-white font-semibold">{selectedIds.length}</span>
                    </span>
                  )}
                </div>
                
                {/* Controles de paginación */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    className={`px-3 py-2 rounded-lg border text-sm transition-all duration-200 ${
                      pagination.hasPrev 
                        ? 'border-gray-600 text-white hover:bg-white hover:text-black' 
                        : 'border-gray-800 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    Anterior
                  </button>

                  <div className="flex items-center gap-1">
                    <span className="text-gray-400 text-sm mx-2">
                      Página {pagination.currentPage} de {pagination.totalPages}
                    </span>
                  </div>

                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className={`px-3 py-2 rounded-lg border text-sm transition-all duration-200 ${
                      pagination.hasNext 
                        ? 'border-gray-600 text-white hover:bg-white hover:text-black' 
                        : 'border-gray-800 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    Siguiente
                  </button>
                </div>

                {selectedIds.length > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm 
                             font-medium transition-all duration-200 flex items-center gap-2 hover:scale-105"
                  >
                    <AiOutlineDelete size={16} />
                    Eliminar ({selectedIds.length})
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* MOBILE CARDS */}
        <div className="md:hidden space-y-3 px-2">
          {users.length > 0 ? (
            users.map((user) => {
              let pressTimer: NodeJS.Timeout;

              const handleMouseDown = () => {
                pressTimer = setTimeout(() => toggleSelect(user._id), 500);
              };

              const handleMouseUp = () => {
                clearTimeout(pressTimer);
              };

              const isSelected = selectedIds.includes(user._id);

              return (
                <div
                  key={user._id}
                  className={`
                    relative group overflow-hidden rounded-xl p-3 cursor-pointer 
                    transition-all duration-200 border min-h-[100px]
                    ${isSelected
                      ? "bg-black border-2 border-white shadow-lg"
                      : "bg-black border border-gray-600 hover:border-gray-400"
                    }
                  `}
                  onDoubleClick={() => setFoundUser(user)}
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp}
                  onTouchStart={handleMouseDown}
                  onTouchEnd={handleMouseUp}
                >
                  <div className="flex items-start gap-3">
                    <div className={`
                      relative flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
                      border font-bold text-sm
                      ${isSelected
                        ? "bg-white text-black border-white"
                        : "bg-gray-800 text-white border-gray-500"
                      }
                    `}>
                      {user.name.charAt(0)}{user.lastname.charAt(0)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-base font-bold text-white truncate pr-2">
                          {user.name} {user.lastname}
                        </h3>
                        {isSelected && (
                          <div className="bg-white text-black p-1 rounded-full flex-shrink-0">
                            <AiOutlineCheckSquare size={12} />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-gray-400">Código:</span>
                          <span className="text-xs font-mono font-bold text-white bg-gray-800 px-1.5 py-0.5 rounded">
                            {user.codigo}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500 font-mono bg-gray-800/50 px-1.5 py-0.5 rounded">
                            ID: {user._id.slice(-6)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-700">
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(user);
                            }}
                            className="flex items-center gap-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 
                                     text-white border border-gray-600 rounded text-xs transition-colors"
                          >
                            <FaEdit size={10} />
                            Editar
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setUserToDelete(user);
                            }}
                            className="flex items-center gap-1 px-2 py-1 bg-black hover:bg-gray-800 
                                     text-white border border-gray-600 rounded text-xs transition-colors"
                          >
                            <FaTrash size={10} />
                            Borrar
                          </button>
                        </div>

                        <div className="text-[10px] text-gray-500 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
                          Presiona
                        </div>
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="absolute inset-0 border-2 border-white rounded-xl pointer-events-none"></div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 px-4">
              <div className="bg-black rounded-xl p-6 border border-gray-600 mx-auto max-w-xs">
                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 border border-gray-600">
                  <FaUserFriends className="text-gray-400 text-lg" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">
                  {currentSearch ? 'No se encontraron usuarios' : 'No hay usuarios'}
                </h3>
                <p className="text-gray-400 text-xs mb-4">
                  {currentSearch ? 'Intenta con otros términos de búsqueda' : 'Crea el primer usuario'}
                </p>
                {!currentSearch && (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-white hover:bg-gray-200 text-black px-4 py-2 rounded-lg text-sm font-medium 
                             transition-all duration-200 border border-white w-full flex items-center justify-center gap-2"
                  >
                    <FaUserPlus size={12} />
                    Crear Usuario
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Paginación móvil */}
        {users.length > 0 && (
          <div className="md:hidden flex flex-col gap-4 mt-6 p-4 bg-black rounded-xl border border-gray-600">
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-400">
                Página {pagination.currentPage} de {pagination.totalPages}
              </div>
              <div className="text-xs text-gray-400">
                {pagination.totalUsers} usuarios
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
                className={`px-3 py-2 rounded-lg border text-xs transition-all duration-200 ${
                  pagination.hasPrev 
                    ? 'border-gray-600 text-white hover:bg-white hover:text-black' 
                    : 'border-gray-800 text-gray-600 cursor-not-allowed'
                }`}
              >
                Anterior
              </button>

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                className={`px-3 py-2 rounded-lg border text-xs transition-all duration-200 ${
                  pagination.hasNext 
                    ? 'border-gray-600 text-white hover:bg-white hover:text-black' 
                    : 'border-gray-800 text-gray-600 cursor-not-allowed'
                }`}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODALES (se mantienen igual que antes) */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3">
          <div className="bg-black w-full max-w-xs rounded-xl border border-gray-600 shadow-2xl p-4 relative">
            <button
              onClick={() => setShowCreateForm(false)}
              className="absolute top-3 right-3 text-white/70 hover:text-white rounded-lg p-1 transition"
            >
              <FaTimes size={18} />
            </button>
            <h2 className="text-lg font-bold text-white mb-4 text-center">Crear Usuario</h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nombre"
                value={formDataCreate.name}
                onChange={(e) => setFormDataCreate({ ...formDataCreate, name: e.target.value })}
                className="bg-black border border-gray-600 rounded-lg px-3 py-2 w-full text-white 
                         placeholder-gray-400 focus:outline-none focus:border-white text-sm"
              />
              <input
                type="text"
                placeholder="Apellido"
                value={formDataCreate.lastname}
                onChange={(e) => setFormDataCreate({ ...formDataCreate, lastname: e.target.value })}
                className="bg-black border border-gray-600 rounded-lg px-3 py-2 w-full text-white 
                         placeholder-gray-400 focus:outline-none focus:border-white text-sm"
              />
              <input
                type="number"
                placeholder="Código"
                value={formDataCreate.codigo}
                onChange={(e) => setFormDataCreate({ ...formDataCreate, codigo: Number(e.target.value) })}
                className="bg-black border border-gray-600 rounded-lg px-3 py-2 w-full text-white 
                         placeholder-gray-400 focus:outline-none focus:border-white text-sm"
              />
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={handleCreateUser}
                className="bg-white text-black font-medium px-4 py-2 rounded-lg transition hover:bg-gray-200 
                         active:scale-95 text-sm flex-1"
              >
                Crear
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setFormDataCreate({ name: '', lastname: '', codigo: 1 });
                }}
                className="bg-gray-800 hover:bg-gray-700 text-white font-medium px-4 py-2 rounded-lg 
                         transition active:scale-95 text-sm flex-1 border border-gray-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resto de modales... */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3">
          <div className="bg-black w-full max-w-xs rounded-xl border border-gray-600 shadow-2xl p-4 relative">
            <h2 className="text-lg font-bold text-white mb-3 text-center">¿Eliminar usuario?</h2>
            <div className="bg-gray-800/50 rounded-lg p-3 mb-4 border border-gray-600">
              <p className="text-white text-center text-sm">
                <span className="font-semibold">{userToDelete.name} {userToDelete.lastname}</span>
              </p>
              <p className="text-gray-400 text-xs text-center mt-1">Código: {userToDelete.codigo}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  handleDeleteUser(userToDelete._id);
                  setUserToDelete(null);
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg 
                         transition active:scale-95 text-sm flex-1"
              >
                Eliminar
              </button>
              <button
                onClick={() => setUserToDelete(null)}
                className="bg-gray-800 hover:bg-gray-700 text-white font-medium px-4 py-2 rounded-lg 
                         transition active:scale-95 text-sm flex-1 border border-gray-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {usersToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3">
          <div className="bg-black w-full max-w-xs rounded-xl border border-gray-600 shadow-2xl p-4 relative">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaTrash className="text-red-400 text-lg" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">¿Eliminar todo?</h2>
              <p className="text-gray-400 text-xs">
                Se eliminarán <b className="text-white">{pagination.totalUsers} usuarios</b>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  handleDeleteAllUsers();
                  setUsersToDelete(false);
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg 
                         transition active:scale-95 text-sm flex-1"
              >
                Sí, eliminar
              </button>
              <button
                onClick={() => setUsersToDelete(false)}
                className="bg-gray-800 hover:bg-gray-700 text-white font-medium px-4 py-2 rounded-lg 
                         transition active:scale-95 text-sm flex-1 border border-gray-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {foundUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3">
          <div className="bg-black w-full max-w-xs rounded-xl border border-gray-600 shadow-2xl p-4 relative">
            <button
              onClick={() => setFoundUser(null)}
              className="absolute top-3 right-3 text-white/70 hover:text-white rounded-lg p-1 transition"
            >
              <FaTimes size={18} />
            </button>
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 border border-gray-600">
                <span className="text-white font-bold text-lg">
                  {foundUser.name.charAt(0)}{foundUser.lastname.charAt(0)}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white">Usuario encontrado</h2>
              <p className="text-gray-400 text-xs mt-1 truncate">{foundUser._id}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 mb-4 border border-gray-600">
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-400 text-sm">Nombre:</span>
                <span className="text-white font-semibold text-sm">{foundUser.name}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-400 text-sm">Apellido:</span>
                <span className="text-white font-semibold text-sm">{foundUser.lastname}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-400 text-sm">Código:</span>
                <span className="text-white font-semibold text-sm">{foundUser.codigo}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  handleEditClick(foundUser);
                  setFoundUser(null);
                }}
                className="bg-white text-black font-medium px-4 py-2 rounded-lg transition hover:bg-gray-200 
                         active:scale-95 text-sm flex-1"
              >
                Editar
              </button>
              <button
                onClick={() => {
                  setUserToDelete(foundUser);
                  setFoundUser(null);
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg 
                         transition active:scale-95 text-sm flex-1"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3">
          <div className="bg-black w-full max-w-xs rounded-xl border border-gray-600 shadow-2xl p-4 relative">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-3 right-3 text-white/70 hover:text-white rounded-lg p-1 transition"
            >
              <FaTimes size={18} />
            </button>
            <h2 className="text-lg font-bold text-white mb-4 text-center">Editar usuario</h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nombre"
                value={formDataEdit.name}
                onChange={(e) => setFormDataEdit({ ...formDataEdit, name: e.target.value })}
                className="bg-black border border-gray-600 rounded-lg px-3 py-2 w-full text-white 
                         placeholder-gray-400 focus:outline-none focus:border-white text-sm"
              />
              <input
                type="text"
                placeholder="Apellido"
                value={formDataEdit.lastname}
                onChange={(e) => setFormDataEdit({ ...formDataEdit, lastname: e.target.value })}
                className="bg-black border border-gray-600 rounded-lg px-3 py-2 w-full text-white 
                         placeholder-gray-400 focus:outline-none focus:border-white text-sm"
              />
              <input
                type="number"
                placeholder="Código"
                value={formDataEdit.codigo}
                onChange={(e) => setFormDataEdit({ ...formDataEdit, codigo: Number(e.target.value) })}
                className="bg-black border border-gray-600 rounded-lg px-3 py-2 w-full text-white 
                         placeholder-gray-400 focus:outline-none focus:border-white text-sm"
              />
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => handleUpdateUser(validar(editingUser, formDataEdit))}
                className="bg-white text-black font-medium px-4 py-2 rounded-lg transition hover:bg-gray-200 
                         active:scale-95 text-sm flex-1"
              >
                Guardar
              </button>
              <button
                onClick={() => setEditingUser(null)}
                className="bg-gray-800 hover:bg-gray-700 text-white font-medium px-4 py-2 rounded-lg 
                         transition active:scale-95 text-sm flex-1 border border-gray-600"
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