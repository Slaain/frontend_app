import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';

export default function ManageOptions() {
    // Déclaration des états locaux
    const [users, setUsers] = useState([]); // Liste des utilisateurs
    const [newUser, setNewUser] = useState({ username: '', password: '' }); // Nouvel utilisateur à créer
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // État de chargement
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(5);
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState('');

    // Récupération des données utilisateur depuis le store Redux
    const roles = useSelector((state) => state.user.roles); // Rôles de l'utilisateur
    const token = useSelector((state) => state.user.token); // Token d'authentification
    const router = useRouter(); // Initialisation du router pour la navigation

    // Effet pour récupérer la liste des utilisateurs au montage du composant
    useEffect(() => {
        if (token) {
            fetchUsers(); // Appel de la fonction pour récupérer les utilisateurs
        } else {
            setError("Token manquant. Veuillez vous connecter.");
        }
    }, [token]); // Dépendance sur le token pour recharger les utilisateurs

    // Fonction pour récupérer les utilisateurs via l'API
    const fetchUsers = async () => {
        try {
            setLoading(true); // Activer l'état de chargement
            const response = await axios.get('http://127.0.0.1:8000/user', {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log('Réponse API:', response.data);
            setUsers(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs:', error);
            setError("Impossible de récupérer les utilisateurs. Vérifiez votre connexion ou vos autorisations.");
        } finally {
            setLoading(false);
        }
    };

    // Fonction pour créer un nouvel utilisateur
    const createUser = async () => {
        if (!newUser.username || !newUser.password) {
            setError('Veuillez fournir un nom d’utilisateur et un mot de passe.');
            return;
        }

        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/user/admin/create`,
                newUser,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            // Mise à jour de la liste des utilisateurs avec le nouvel utilisateur
            setUsers([...users, { id: response.data.user_id, username: newUser.username }]);
            setNewUser({ username: '', password: '' });
            setShowModal(false);
        } catch (err) {
            console.error('Erreur lors de la création de l’utilisateur:', err);
            setError('Impossible de créer un utilisateur.');
        }
    };

    // Fonction pour supprimer un utilisateur
    const deleteUser = async (userId) => {
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/user/remove/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }, // En-tête d'authentification
            });
            // Filtrage pour retirer l'utilisateur supprimé de la liste
            setUsers(users.filter((user) => user.id !== userId));
        } catch (err) {
            console.error('Erreur lors de la suppression de l’utilisateur:', err);
            setError('Impossible de supprimer l’utilisateur.');
        }
    };

    // Fonction pour assigner un rôle à un utilisateur
    const assignRoleToUser = async (userId, roleId) => {
        try {
            await axios.post(
                `http://127.0.0.1:8000/user/${userId}/assign-role/${roleId}`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }, // En-tête d'authentification
                }
            );
            alert('Rôle assigné avec succès.');
            fetchUsers(); // Actualisation de la liste des utilisateurs après l'assignation
        } catch (err) {
            console.error('Erreur lors de lassignation du rôle:', err);
            setError('Impossible d’assigner le rôle.');
        }
    };

    // Gestion de la pagination
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

    // Fonction pour changer de page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
            {/* En-tête de la page */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Gestion des utilisateurs</h1>
                <button
                    onClick={() => router.push('/Start')} // Bouton pour revenir au menu principal
                    className="bg-blue-500 px-4 py-2 rounded text-white hover:bg-blue-600 transition"
                >
                    Retour au menu
                </button>
            </div>

            {/* Message d'erreur */}
            {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

            {/* Indicateur de chargement ou liste des utilisateurs */}
            {loading ? (
                <p className="text-gray-400 text-center">Chargement...</p>
            ) : (
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Utilisateurs</h2>
                    {/* Liste des utilisateurs affichés */}
                    <ul className="space-y-4 mb-8">
                        {currentUsers.map((user) => (
                            <li key={user.id} className="bg-gray-800 p-4 rounded shadow-md">
                                <div className="flex justify-between">
                                    <span>{user.username}</span>
                                    <div>
                                        {/* Bouton pour supprimer un utilisateur */}
                                        <button
                                            onClick={() => deleteUser(user.id)}
                                            className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition mr-2"
                                        >
                                            Supprimer
                                        </button>
                                        {/* Bouton pour assigner un rôle */}
                                        <button
                                            onClick={() => setSelectedUser(user.id)}
                                            className="bg-yellow-500 px-4 py-2 rounded hover:bg-yellow-600 transition"
                                        >
                                            Assigner un rôle
                                        </button>
                                    </div>
                                </div>
                                {/* Affichage des rôles associés à l'utilisateur */}
                                {user.roles && user.roles.length > 0 && (
                                    <p className="text-sm text-gray-400 mt-2">
                                        Rôle(s): {user.roles.join(', ')}
                                    </p>
                                )}
                            </li>
                        ))}
                    </ul>

                    {/* Pagination */}
                    <div className="flex justify-center space-x-2 mb-8">
                        {Array.from({ length: Math.ceil(users.length / usersPerPage) }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => paginate(page)}
                                className={`px-4 py-2 rounded ${
                                    currentPage === page ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'
                                } transition`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    {/* Bouton pour ajouter un utilisateur */}
                    {roles.includes('ROLE_ADMIN') && (
                        <div className="text-center">
                            <button
                                onClick={() => setShowModal(true)}
                                className="bg-green-500 px-6 py-2 rounded text-white hover:bg-green-600 transition"
                            >
                                Ajouter un utilisateur
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Modals pour création et assignation */}
            {/* Modal de création d'utilisateur */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75">
                    <div className="bg-gray-800 p-6 rounded shadow-md w-96">
                        <h2 className="text-2xl font-semibold mb-4">Créer un utilisateur</h2>
                        <input
                            type="text"
                            placeholder="Nom d'utilisateur"
                            value={newUser.username}
                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                            className="w-full p-2 mb-4 bg-gray-700 rounded text-white placeholder-gray-400"
                        />
                        <input
                            type="password"
                            placeholder="Mot de passe"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            className="w-full p-2 mb-4 bg-gray-700 rounded text-white placeholder-gray-400"
                        />
                        <div className="flex justify-between">
                            <button
                                onClick={createUser}
                                className="bg-green-500 px-4 py-2 rounded text-white hover:bg-green-600 transition"
                            >
                                Créer
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-red-500 px-4 py-2 rounded text-white hover:bg-red-600 transition"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal d'assignation de rôle */}
            {selectedUser && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75">
                    <div className="bg-gray-800 p-6 rounded shadow-md w-96">
                        <h2 className="text-2xl font-semibold mb-4">Assigner un rôle</h2>
                        <input
                            type="text"
                            placeholder="ID du rôle"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="w-full p-2 mb-4 bg-gray-700 rounded text-white placeholder-gray-400"
                        />
                        <div className="flex justify-between">
                            <button
                                onClick={() => assignRoleToUser(selectedUser, selectedRole)}
                                className="bg-green-500 px-4 py-2 rounded text-white hover:bg-green-600 transition"
                            >
                                Assigner
                            </button>
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="bg-red-500 px-4 py-2 rounded text-white hover:bg-red-600 transition"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
