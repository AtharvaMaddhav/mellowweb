import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkAuthState, loginWithEmail, loginWithGoogle } from "../../services/authService.js"

export default function AuthenticationPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = checkAuthState((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        navigate("/home");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const loggedInUser = await loginWithEmail(email, password);
    if (loggedInUser) {
      navigate("/home");
    }
  };

  const handleLoginWithGoogle = async () => {
    const googleUser = await loginWithGoogle();
    if (googleUser) {
      navigate("/home");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full py-2 bg-blue-500 text-white cursor-pointer rounded-md hover:bg-blue-600 transition"
          >
            Login
          </button>
        </form>
        <button
          onClick={handleLoginWithGoogle}
          className="mt-3 w-full py-2 bg-red-500 text-white cursor-pointer rounded-md hover:bg-red-600 transition"
        >
          Continue with Google
        </button>
        <p className="text-center text-sm text-gray-600 mt-4">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-500 hover:underline">Sign Up</a>
        </p>
      </div>
    </div>
  );
}
