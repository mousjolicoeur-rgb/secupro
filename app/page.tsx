import { redirect } from 'next/navigation';

export default function RootPage() {
  // On envoie tout le monde directement vers la page d'accueil de l'agent
  redirect('/agent');
}