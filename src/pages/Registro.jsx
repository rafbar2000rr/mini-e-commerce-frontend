// ✅ Componente de Registro
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

//-----------------------------------------
//Registra al usuario en la base de datos.
//-----------------------------------------
function Registro() {
  // ✅ Estados para controlar los campos del formulario
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // ✅ Estado para mostrar mensajes de error o éxito
  const [mensaje, setMensaje] = useState('');

  // ✅ Hook de navegación de React Router
  const navigate = useNavigate();

  // ✅ Función que maneja el registro del usuario
  const handleRegistro = async (e) => {
    e.preventDefault(); // prevenimos recarga de la página

    try {
      // enviamos datos al backend
      const res = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // enviamos JSON
        },
        body: JSON.stringify({ nombre, email, password }), // convertimos datos a JSON
      });

      // obtenemos la respuesta en JSON
      const data = await res.json();

      if (res.ok) {
        // ✅ si el registro es exitoso, guardamos el token
        localStorage.setItem('token', data.token);

        // ✅ redirigimos al usuario a la página principal (o al login si prefieres)
        navigate('/');
      } else {
        // si hay error, mostramos mensaje
        setMensaje(data.error || 'Error en el registro.');
      }
    } catch {
      // error de conexión o servidor caído
      setMensaje('Error de red');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Título */}
      <h2 className="text-xl font-bold mb-4">Registro</h2>

      {/* Formulario */}
      <form onSubmit={handleRegistro} className="space-y-4">
        {/* Campo Nombre */}
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        {/* Campo Correo */}
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        {/* Campo Contraseña */}
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        {/* Botón de registro */}
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Registrarse
        </button>
      </form>

      {/* Mensaje de error si existe */}
      {mensaje && <p className="mt-4 text-center text-red-600">{mensaje}</p>}
    </div>
  );
}

export default Registro;
