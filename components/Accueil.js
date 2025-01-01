import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../reducers/user';
import { useState, useEffect } from 'react';
import axios from 'axios';

function Accueil() {
    const { token, username } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const [projects, setProjects] = useState([]);

    const handleLogout = () => {
        dispatch(logout());
        window.location.href = '/';
    };

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/projects');
                const userProjects = response.data.filter((project) => project.users.includes(username)); // Filtre les projets de l'utilisateur
                setProjects(userProjects.slice(0, 3)); // Récupère les 3 projets les plus récents de l'utilisateur
            } catch (error) {
                console.error('Error fetching projects:', error);
            }
        };
        fetchProjects();
    }, [username]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <nav className="w-full bg-gray-900/80 backdrop-blur-md py-4 px-8 flex justify-between items-center shadow-md">
                <h1 className="text-3xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-600">
                    TeamBoard
                </h1>
                <div className="flex items-center space-x-6">
                    <a href="/Projects" className="text-indigo-400 hover:text-purple-600 transition-colors">Mes Projets</a>
                    <button
                        onClick={handleLogout}
                        className="bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:from-red-600 hover:to-red-800 focus:outline-none">
                        Déconnexion
                    </button>
                </div>
            </nav>

            <main className="flex flex-col items-center justify-center flex-1 w-full px-6 py-12">
                <h1 className="text-5xl font-bold mb-10 text-center">
                    {username ? `Bienvenue, ${username} !` : 'Bienvenue sur TeamBoard !'}
                </h1>

                <section className="w-full max-w-5xl">
                    <h2 className="text-3xl font-semibold mb-6 text-indigo-400">Projets récents</h2>
                    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <li key={project.id} className="bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                                <h3 className="text-xl font-bold text-indigo-300 mb-2">{project.project}</h3>
                                <p className="text-sm text-gray-300 mb-4">{project.description}</p>
                                <p className="text-xs text-gray-500">Utilisateurs : {project.users.join(', ')}</p>
                            </li>
                        ))}
                    </ul>
                </section>
            </main>
        </div>
    );
}

export default Accueil;
