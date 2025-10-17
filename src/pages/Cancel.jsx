// src/pages/Cancel.jsx
export default function Cancel() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-6">
      <h1 className="text-3xl font-bold text-red-600 mb-4">
        ❌ Pago cancelado
      </h1>
      <p className="text-red-700 text-lg">
        No te preocupes, puedes intentarlo de nuevo cuando quieras 💳.
      </p>
    </div>
  );
}
