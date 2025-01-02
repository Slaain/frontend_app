import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function ProjectDetails({ projectId, onBack, token }) {
    const [project, setProject] = useState(null);
    const [newTask, setNewTask] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

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

    const handleBack = () => {
        router.push('/Start');
    };

    if (loading) return <p>Chargement des détails du projet...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
            <button
                onClick={handleBack}
                className="mb-4 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded transition-colors"
            >
                Retour
            </button>
            <h1 className="text-4xl font-bold mb-4">{project.project}</h1>
            <p className="text-gray-300 mb-4">{project.description}</p>
            <p className="text-gray-400 mb-6">Utilisateurs : {project.users.join(', ')}</p>

            <h2 className="text-2xl font-semibold mb-4">Tâches</h2>
            <ul className="space-y-4">
                {project.notes.map((note) => (
                    <li key={note.id} className="bg-gray-800 p-4 rounded shadow">
                        <p className="text-gray-300">{note.content}</p>
                        <p className="text-xs text-gray-500 mt-2">Ajouté par : {note.users}</p>
                    </li>
                ))}
            </ul>

            <div className="mt-6">
                <textarea
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    className="w-full p-2 bg-gray-700 rounded text-white"
                    placeholder="Ajouter une tâche..."
                ></textarea>
                <button
                    onClick={handleAddTask}
                    className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded mt-2 hover:bg-indigo-700 transition-colors"
                >
                    Ajouter
                </button>
            </div>
        </div>
    );
}
