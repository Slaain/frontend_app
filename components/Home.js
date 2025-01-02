import styles from '../styles/Home.module.css';
import axios from 'axios';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../reducers/user';

function Home() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:8000/user/login', {
                username,
                password,
            });
            console.log("Connexion établie", response.data.token);
            dispatch(login({ token: response.data.token, username })); // Utilise le username local
            window.location.href = '/Start'; // Redirection après connexion
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-black">
            <h1 className="text-4xl font-bold text-white mb-6">Bienvenue sur TeamBoard !</h1>

            <form
                onSubmit={handleSubmit}
                className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <div className="mb-4">
                    <label
                        htmlFor="username"
                        className="block text-gray-700 text-sm font-bold mb-2">
                        Nom d'utilisateur
                    </label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        placeholder="Entrez votre nom d'utilisateur"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>

                <div className="mb-6">
                    <label
                        htmlFor="password"
                        className="block text-gray-700 text-sm font-bold mb-2">
                        Mot de passe
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Entrez votre mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <button
                        type="submit"
                        className="bg-black text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:bg-red-700">
                        Connexion
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Home;
