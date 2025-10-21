const handleLogin = async (e) => {
  e.preventDefault();
  const API_URL = import.meta.env.VITE_API_URL; // ejemplo: https://.../auth

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Credenciales incorrectas 💕");
      return;
    }

    // ✅ Guardar token y usuario en localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("usuario", JSON.stringify(data.user));

    // ✅ Guardar en contexto
    setUsuario({ ...data.user, token: data.token });

    // 🔹 Sincronizar carrito si hay items locales
    const carritoLocal = JSON.parse(localStorage.getItem("carrito")) || [];
    if (carritoLocal.length > 0) {
      const syncRes = await fetch(`${API_URL}/carrito/sincronizar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.token}`,
        },
        body: JSON.stringify({ carritoLocal }),
      });

      if (syncRes.ok) {
        const carritoFinal = await syncRes.json();
        localStorage.setItem("carrito", JSON.stringify(carritoFinal));
      }
    }

    navigate("/catalogo");
  } catch (err) {
    console.error("❌ Error login:", err);
    setMessage("Error de conexión 💕");
  }
};
