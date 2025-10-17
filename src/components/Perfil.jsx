import { useEffect, useState } from 'react';

function Perfil() {
  const [perfil, setPerfil] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setError('No estás logueada');
      return;
    }

    fetch('http://localhost:5000/perfil', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setPerfil(data.user);
        }
      })
      .catch(() => {
        setError('Error al obtener perfil');
      });
  }, []);

  return (
    <div className="max-w-md mx-auto mt-8 p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Mi Perfil</h2>

      {error && <p className="text-red-500">{error}</p>}

      {perfil && (
        <div className="space-y-2">
          <p><strong>ID:</strong> {perfil.id}</p>
          <p><strong>Email:</strong> {perfil.email}</p>
        </div>
      )}
    </div>
  );
}

export default Perfil;
