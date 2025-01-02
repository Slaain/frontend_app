import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import ProjectDetails from '../components/ProjectDetails'; // Garde ce chemin intact

export default function ProjectsDet() {
    const router = useRouter();
    const { id: projectId } = router.query; // Récupère l'ID depuis l'URL
    const { token } = useSelector((state) => state.user);

    if (!projectId) {
        return <p>Chargement...</p>; // Attendez que l'ID soit disponible
    }

    return (
        <ProjectDetails
            projectId={projectId}
            token={token}
            onBack={() => router.push('/')} // Retourne à la page d'accueil
        />
    );
}
