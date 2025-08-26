'use client'
// status admin e technician tem acesso
import { Plus } from "lucide-react";
import { useState } from "react";
// tabelas
import TabelaDeUsuarios from "../Tables/UsersTable";
import TabelaDePatrimonios from "../Tables/PatrimonyTable";
import TabelaDeCategorias from "../Tables/CategoryTable";

// modais usuarios
import NewUserModal from "../Modals/Admin/NewUserModal";
import SeeUsersModal from "../Modals/Admin/SeeUsersModal";

// modais patrimonio
import NewPatrimonyModal from "../Modals/Admin/NewPatrimonyModal";

// modais categorias
import NewCategoryModal from "../Modals/Admin/NewCategoryModal";
import EditCategoryModal from "../Modals/Admin/EditCategoryModal";

export default function AdminPage() {
    // modais usuarios
    const [isOpenNewUser, setIsOpenNewUser] = useState(false);
    const [isOpenSeeUsers, setIsOpenSeeUsers] = useState(false);

    // modais patrimonio
    const [isOpenNewPatrimony, setIsOpenNewPatrimony] = useState(false);


    // modais categorias
    const [isOpenNewCategory, setIsOpenNewCategory] = useState(false);
    const [isOpenEditCategory, setIsOpenEditCategory] = useState(false);


    //  usuário selecionado
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedPatrimony, setSelectedPatrimony] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);

    // Handlers para os modais

    //users
    const handleViewUser = (user) => {
        setSelectedUser(user);
        setIsOpenSeeUsers(true);
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setIsOpenSeeUsers(true);
    };

    const handleCloseNewUser = () => {
        setIsOpenNewUser(false);
    };

    const handleCloseSeeUsers = () => {
        setIsOpenSeeUsers(false);
        setSelectedUser(null);
    };

    //patrimony

    const handleCloseNewPatimony = () => {
        setIsOpenNewPatrimony(false);
    };

    //category
    const handleViewCategory = (category) => {
        setSelectedCategory(category);
        setIsOpenEditCategory(true);
    };

    const handleCloseNewCategory = () => {
        setIsOpenNewCategory(false);
    };

    const handleCloseEditCategory = () => {
        setIsOpenEditCategory(false);
    };



    return (
        <div className="w-full px-4 py-8">
            <div className="mb-8">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    {/* titulo e descrição */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-12 bg-gradient-to-b from-red-600 to-red-800 rounded-full"></div>
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-bold text-white">
                                    Gestão de Dados
                                </h1>
                                <p className="text-gray-400 text-sm mt-1">
                                    Gerencie os dados do banco
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* lista de botoes de ativar os modais de post*/}
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Usuários */}
                        <button
                            onClick={() => setIsOpenNewUser(true)}
                            className="relative w-50 h-12 cursor-pointer flex items-center border border-red-700 bg-red-700 group rounded-lg overflow-hidden"
                        >
                            {/* Texto */}
                            <span className="text-white font-semibold ml-8 transform group-hover:translate-x-20 transition-all duration-300">
                                Novo Usuário
                            </span>

                            {/* Ícone */}
                            <span className="absolute right-0 h-full w-12 rounded-lg bg-red-700 flex items-center justify-center transform group-hover:translate-x-0 group-hover:w-full transition-all duration-300">
                                <Plus size={20} color="white" />
                            </span>
                        </button>

                        {/* Patrimônio */}
                        <button
                            onClick={() => setIsOpenNewPatrimony(true)}
                            className="relative w-53 h-12 cursor-pointer flex items-center border border-red-700 bg-red-700 group rounded-lg overflow-hidden"
                        >
                            {/* Texto */}
                            <span className="text-white font-semibold ml-8 transform group-hover:translate-x-20 transition-all duration-300">
                                Novo Patrimônio
                            </span>

                            {/* Ícone */}
                            <span className="absolute right-0 h-full w-12 rounded-lg bg-red-700 flex items-center justify-center transform group-hover:translate-x-0 group-hover:w-full transition-all duration-300">
                                <Plus size={20} color="white" />
                            </span>
                        </button>

                        {/* Categorias */}
                        <button
                            onClick={() => setIsOpenNewCategory(true)}
                            className="relative w-50 h-12 cursor-pointer flex items-center border border-red-700 bg-red-700 group rounded-lg overflow-hidden"
                        >
                            {/* Texto */}
                            <span className="text-white font-semibold ml-8 transform group-hover:translate-x-20 transition-all duration-300">
                                Nova Categoria
                            </span>

                            {/* Ícone */}
                            <span className="absolute right-0 h-full w-12 rounded-lg bg-red-700 flex items-center justify-center transform group-hover:translate-x-0 group-hover:w-full transition-all duration-300">
                                <Plus size={20} color="white" />
                            </span>
                        </button>
                    </div>

                </div>
            </div>



            {/* componentes usuarios */}
            <TabelaDeUsuarios
                onViewUser={handleViewUser}
                onEditUser={handleEditUser}
            />

            <NewUserModal
                isOpen={isOpenNewUser}
                onClose={handleCloseNewUser}
            />

            <SeeUsersModal
                isOpen={isOpenSeeUsers}
                onClose={handleCloseSeeUsers}
                user={selectedUser}
            />

            {/* componentes patrimonios */}
            <TabelaDePatrimonios />

            <NewPatrimonyModal
                isOpen={isOpenNewPatrimony}
                onClose={handleCloseNewPatimony}
            />

            {/* componentes categorias */}
            <TabelaDeCategorias
                onEditCategoria={handleViewCategory}

            />

            <NewCategoryModal
                isOpen={isOpenNewCategory}
                onClose={handleCloseNewCategory}
            />

            <EditCategoryModal
                isOpen={isOpenEditCategory}
                onClose={handleCloseEditCategory}
                categoryData={selectedCategory}  
            />

        </div>
    );
}