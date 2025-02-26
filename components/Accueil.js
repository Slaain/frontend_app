
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../reducers/user';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

function Accueil() {
    // Sélection des données utilisateur depuis le store Redux
    const { token, username, roles } = useSelector((state) => state.user);
    const dispatch = useDispatch(); // Hook pour dispatcher des actions Redux
    const router = useRouter();
    const [projects, setProjects] = useState([]); // État pour stocker les projets
    const [showModal, setShowModal] = useState(false); // État pour afficher ou cacher la modal
    const [projectName, setProjectName] = useState(''); // État pour le nom du projet
    const [description, setDescription] = useState(''); // État pour la description du projet
    const [users, setUsers] = useState([]); // Liste des utilisateurs
    const [selectedUsers, setSelectedUsers] = useState([]); // Utilisateurs sélectionnés pour un projet

    console.log(token); // Debug : Affichage du token dans la console

    // Fonction pour déconnecter l'utilisateur
    const handleLogout = () => {
        dispatch(logout()); // Déclenchement de l'action logout
        router.push('/'); // Redirection vers la page d'accueil
    };

    // Hook pour récupérer les projets à l'ouverture de la page
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/projects', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                let allProjects = response.data;
                // Si l'utilisateur n'est pas admin, filtrer les projets où il est membre
                if (!roles.includes('ROLE_ADMIN')) {
                    allProjects = allProjects.filter((project) => project.users.includes(username));
                }
                // Affichage des 5 derniers projets, dans l'ordre inverse
                setProjects(allProjects.slice(-5).reverse());
            } catch (error) {
                console.error('Error fetching projects:', error);
            }
        };

        if (token) {
            fetchProjects(); // Appeler la fonction si un token est disponible
        }
    }, [token, username, roles]); // Dépendances pour déclencher l'effet

    // Fonction pour récupérer les utilisateurs
    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/user', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(response.data); // Stocker les utilisateurs récupérés
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs:', error);
        }
    };


    // Fonction pour naviguer vers les détails d'un projet
    const handleProjectClick = (projectId) => {
        router.push(`/ProjectsDet?id=${projectId}`);
    };

    // Navigation vers la page "Mes Projets"
    const handleMyProjectsClick = () => {
        router.push('/Projects');
    };

    // Navigation vers la page "Options"
    const handleOptionClick = () => {
        router.push('/Options');
    };

    // Fonction pour créer un nouveau projet
    const handleCreateProjectClick = async () => {
        if (!projectName) {
            alert('Le nom du projet est obligatoire'); // Validation
            return;
        }

        try {
            // Envoi des données pour créer un projet via l'API
            const response = await axios.post(
                'http://127.0.0.1:8000/projects/new',
                { project: projectName, description, users: selectedUsers },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setShowModal(false); // Fermer la modal après création
            setProjects((prevProjects) => [response.data, ...prevProjects]); // Ajouter le projet créé à la liste
        } catch (error) {
            console.error('Erreur lors de la création du projet:', error);
        }
    };

    // Fonction pour fermer la modal
    const closeModal = () => {
        setShowModal(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            {/* Barre de navigation */}
            <nav className="w-full bg-gray-900/80 backdrop-blur-md py-4 px-8 flex justify-between items-center shadow-md">
                <h1 className="text-3xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-600">
                    TeamBoard
                </h1>
                <div className="flex items-center space-x-6">
                    {/* Bouton pour "Mes Projets" */}
                    <button
                        onClick={handleMyProjectsClick}
                        className="bg-gradient-to-r from-indigo-500 to-indigo-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:from-indigo-600 hover:to-indigo-800 focus:outline-none">
                        Mes Projets
                    </button>
                    {/* Boutons visibles uniquement pour les administrateurs */}
                    {roles.includes('ROLE_ADMIN') && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:from-green-600 hover:to-green-800 focus:outline-none">
                            Créer un Projet
                        </button>
                    )}
                    {roles?.includes('ROLE_ADMIN') && (
                        <button
                            onClick={handleOptionClick}
                            className="bg-gradient-to-r from-indigo-500 to-indigo-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:from-indigo-600 hover:to-indigo-800 focus:outline-none"
                        >
                            Gestion
                        </button>
                    )}
                    {/* Bouton pour déconnexion */}
                    <button
                        onClick={handleLogout}
                        className="bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:from-red-600 hover:to-red-800 focus:outline-none">
                        Déconnexion
                    </button>
                </div>
            </nav>

            {/* Modal pour création de projet */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg w-96">
                        <h2 className="text-2xl font-semibold mb-4 text-black">Créer un Projet</h2>
                        <input
                            type="text"
                            placeholder="Nom du projet"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            className="w-full p-2 mb-4 border border-gray-300 rounded text-black"
                        />
                        <textarea
                            placeholder="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-2 mb-4 border border-gray-300 rounded text-black"
                        ></textarea>

                        <div className="flex justify-between">
                            <button
                                onClick={closeModal}
                                className="bg-gray-500 text-white py-2 px-6 rounded-lg focus:outline-none">
                                Annuler
                            </button>
                            <button
                                onClick={handleCreateProjectClick}
                                className="bg-green-500 text-white py-2 px-6 rounded-lg focus:outline-none">
                                Créer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Section principale */}
            <main className="flex flex-col items-center justify-center flex-1 w-full px-6 py-12">
                <h1 className="text-5xl font-bold mb-10 text-center">
                    {username ? `Bienvenue, ${username} !` : 'Bienvenue sur TeamBoard !'}
                </h1>

                <section className="w-full max-w-5xl">
                    <h2 className="text-3xl font-semibold mb-6 text-indigo-400">Les derniers projets</h2>
                    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <li
                                key={project.id}
                                className="bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                                onClick={() => handleProjectClick(project.id)}
                            >
                                <h3 className="text-xl font-bold text-indigo-300 mb-2">{project.project}</h3>
                                <p className="text-sm text-gray-300 mb-4">{project.description}</p>
                                <p className="text-xs text-gray-500">Utilisateurs : {Array.isArray(project.users) ? project.users.join(', ') : 'Aucun utilisateur'}</p>
                            </li>
                        ))}
                    </ul>
                </section>
            </main>
        </div>
    );
}

export default Accueil;
