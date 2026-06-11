import type { Patient } from '@alternativa/types';

const samplePatient: Partial<Patient> = {
  name: 'Paciente Exemplo',
};

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold">Sistema Alternativa</h1>
      <p className="mt-4 text-gray-500">Bem-vindo, {samplePatient.name}</p>
    </main>
  );
}
