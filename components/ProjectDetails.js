import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function ProjectDetails({ projectId, token }) {
    const [project, setProject] = useState(null);
    const [userNotes, setUserNotes] = useState([]);
    const [taskContent, setTaskContent] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddUser, setShowAddUser] = useState(false);
    const [editing, setEditing] = useState(false); // Mode édition
    const [updatedProject, setUpdatedProject] = useState({ project: '', description: '' });
    const roles = useSelector((state) => state.user.roles);
    const router = useRouter();

    const fetchProjectDetails = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setProject(response.data);
            setUpdatedProject({ project: response.data.project, description: response.data.description });
        } catch (err) {
            console.error('Error fetching project details:', err);
            setError("Impossible de charger les détails du projet.");
        } finally {
            setLoading(false);
        }
    };

    const fetchUserNotes = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/notes/user/${projectId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUserNotes(response.data);
        } catch (err) {
            console.error("Erreur lors de la récupération des notes de l'utilisateur:", err);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/user', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUsers(response.data);
        } catch (err) {
            console.error('Erreur lors de la récupération des utilisateurs:', err);
        }
    };

    const handleDeleteProject = async () => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) return;

        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/delete`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            alert('Projet supprimé avec succès.');
            router.push('/Start');
        } catch (err) {
            console.error("Erreur lors de la suppression du projet:", err);
            setError("Impossible de supprimer ce projet.");
        }
    };

    const handleUpdateProject = async () => {
        try {
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/edit`,
                updatedProject,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            alert('Projet mis à jour avec succès.');
            fetchProjectDetails();
            setEditing(false);
        } catch (err) {
            console.error("Erreur lors de la mise à jour du projet:", err);
            setError("Impossible de mettre à jour ce projet.");
        }
    };

    const handleAddTask = async () => {
        if (!taskContent.trim()) {
            alert('Le contenu de la tâche est obligatoire.');
            return;
        }

        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/notes/project/${projectId}`,
                { content: taskContent },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setTaskContent('');
            fetchProjectDetails();
            fetchUserNotes();
            alert('Tâche ajoutée avec succès.');
        } catch (err) {
            console.error("Erreur lors de l'ajout de la tâche:", err);
            setError("Impossible d'ajouter cette tâche.");
        }
    };

    const handleDeleteTask = async (noteId) => {
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/notes/${noteId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchProjectDetails();
            fetchUserNotes();
            alert('Tâche supprimée avec succès.');
        } catch (err) {
            console.error("Erreur lors de la suppression de la tâche:", err);
            setError("Impossible de supprimer cette tâche.");
        }
    };

    const handleAddUser = async () => {
        if (!selectedUser) {
            alert('Veuillez sélectionner un utilisateur.');
            return;
        }

        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/add-user`,
                { userId: selectedUser },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            fetchProjectDetails();
            setShowAddUser(false);
            alert('Utilisateur ajouté avec succès.');
        } catch (err) {
            console.error('Erreur lors de l\'ajout de l\'utilisateur:', err);
            setError("Impossible d'ajouter cet utilisateur.");
        }
    };

    useEffect(() => {
        if (!projectId) return;
        fetchProjectDetails();
        fetchUserNotes();
        fetchUsers();
    }, [projectId, token]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white">
                <p className="text-lg font-semibold animate-pulse">Chargement des détails du projet...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white">
                <p className="text-lg text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => router.push('/Start')}
                    className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg text-sm font-medium shadow-md transition-all"
                >
                    ← Retour
                </button>
                <div className="flex items-center space-x-4">
                    <h1 className="text-3xl font-extrabold text-indigo-400 drop-shadow-md">{project.project}</h1>
                    {roles.includes('ROLE_ADMIN') && (
                        <button
                            onClick={handleDeleteProject}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 text-sm font-semibold rounded shadow-md transition-all"
                        >
                            Supprimer
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                {editing ? (
                    <div>
                        <input
                            type="text"
                            value={updatedProject.project}
                            onChange={(e) => setUpdatedProject({ ...updatedProject, project: e.target.value })}
                            placeholder="Nom du projet"
                            className="w-full p-2 mb-4 bg-gray-700 rounded-lg text-white shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        />
                        <textarea
                            value={updatedProject.description}
                            onChange={(e) => setUpdatedProject({ ...updatedProject, description: e.target.value })}
                            placeholder="Description du projet"
                            className="w-full p-2 bg-gray-700 rounded-lg text-white shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        />
                        <div className="mt-4 flex space-x-4">
                            <button
                                onClick={handleUpdateProject}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 text-sm font-semibold rounded shadow-md transition-all"
                            >
                                Sauvegarder
                            </button>
                            <button
                                onClick={() => setEditing(false)}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 text-sm font-semibold rounded shadow-md transition-all"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <p className="text-gray-300 mb-4 text-lg">{project.description}</p>
                        {roles.includes('ROLE_ADMIN') && (
                            <button
                                onClick={() => setEditing(true)}
                                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 text-sm font-semibold rounded shadow-md transition-all"
                            >
                                Modifier
                            </button>
                        )}
                    </div>
                )}
            </div>

            <h2 className="text-2xl font-semibold text-indigo-300 mb-4 mt-6">Tâches</h2>
            <ul className="space-y-4">
                {project.notes.map((note) => (
                    <li
                        key={note.id}
                        className="bg-gray-900 p-4 rounded-lg shadow-md hover:bg-gray-700 transition-colors"
                    >
                        <p className="text-gray-300">{note.content}</p>
                        <p className="text-xs text-gray-500 mt-2">
                            Ajouté par : {note.users}
                        </p>
                        {userNotes.find((userNote) => userNote.id === note.id) && (
                            <button
                                onClick={() => handleDeleteTask(note.id)}
                                className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 text-sm font-semibold rounded shadow-md transition-all"
                            >
                                Supprimer
                            </button>
                        )}
                    </li>
                ))}
            </ul>

            <div className="mt-6">
                <h3 className="text-lg font-semibold text-indigo-300 mb-2">Ajouter une nouvelle tâche</h3>
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={taskContent}
                        onChange={(e) => setTaskContent(e.target.value)}
                        placeholder="Entrez la tâche..."
                        className="w-full p-2 bg-gray-700 rounded-lg text-white shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                    <button
                        onClick={handleAddTask}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 text-sm font-semibold rounded shadow-md transition-all"
                    >
                        Ajouter
                    </button>
                </div>
            </div>

            {roles.includes('ROLE_ADMIN') && (
                <div className="mt-8">
                    <button
                        onClick={() => setShowAddUser(!showAddUser)}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 text-sm font-semibold rounded shadow-md transition-all"
                    >
                        {showAddUser ? 'Fermer' : 'Ajouter un collaborateur'}
                    </button>
                    {showAddUser && (
                        <div className="mt-4">
                            <select
                                value={selectedUser}
                                onChange={(e) => setSelectedUser(e.target.value)}
                                className="w-full p-2 bg-gray-700 rounded-lg text-white shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            >
                                <option value="">Sélectionnez un utilisateur</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.username}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={handleAddUser}
                                className="mt-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 text-sm font-semibold rounded shadow-md transition-all"
                            >
                                Ajouter
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
