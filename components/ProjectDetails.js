import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function ProjectDetails({ projectId, onBack, token }) {
    const [project, setProject] = useState(null);
    const [newTask, setNewTask] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();
    const addTaskRef = useRef(null); // Référence à la section d'ajout de tâche

    const fetchProjectDetails = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setProject(response.data);
        } catch (err) {
            console.error('Error fetching project details:', err);
            setError("Impossible de charger les détails du projet.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!projectId) return;
        fetchProjectDetails();
    }, [projectId, token]);

    const handleAddTask = async () => {
        if (!newTask.trim()) return;

        try {
            const response = await axios.post(
                `http://127.0.0.1:8000/notes/project/${projectId}`,
                { content: newTask },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setNewTask('');
            fetchProjectDetails();
        } catch (err) {
            console.error('Error adding task:', err);
            setError("Impossible d'ajouter une tâche.");
        }
    };

    const handleScrollToAddTask = () => {
        // Scrolle jusqu'à la section d'ajout de tâche
        addTaskRef.current.scrollIntoView({ behavior: 'smooth' });
    };

    const handleBack = () => {
        router.push('/Start');
    };

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
                    onClick={handleBack}
                    className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg text-sm font-medium shadow-md transition-all"
                >
                    ← Retour
                </button>
                <div className="flex items-center space-x-4">
                    <h1 className="text-3xl font-extrabold text-indigo-400 drop-shadow-md">
                        {project.project}
                    </h1>
                    <button
                        onClick={handleScrollToAddTask}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 text-sm font-semibold rounded shadow-md transition-all"
                    >
                        Ajouter une tâche
                    </button>

                </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <p className="text-gray-300 mb-4 text-lg">{project.description}</p>
                <p className="text-sm text-gray-500 mb-6">
                    <strong>Utilisateurs : </strong>
                    {project.users.join(', ')}
                </p>

                <h2 className="text-2xl font-semibold text-indigo-300 mb-4">Tâches</h2>
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
                        </li>
                    ))}
                </ul>
            </div>

            {/* Section ajout de tâche */}
            <div className="mt-8" ref={addTaskRef}>
                <textarea
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    className="w-full p-3 bg-gray-700 rounded-lg text-white resize-none shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    placeholder="Ajouter une nouvelle tâche..."
                    rows="3"
                ></textarea>
                <button
                    onClick={handleAddTask}
                    className="mt-4 w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg"
                >
                    Ajouter une tâche
                </button>
            </div>
        </div>
    );
}
