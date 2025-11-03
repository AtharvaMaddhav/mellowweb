// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { handleSignUp, handleSignUpWithGoogle } from "../../services/signUpService.js";

// export default function SignUpPage() {
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//   });
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate(); // ✅ Get navigate inside the component

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     const errorMessage = await handleSignUp(formData, navigate); // ✅ Pass navigate
//     if (errorMessage) {
//       setError(errorMessage);
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="flex justify-center items-center h-screen bg-gray-100">
//       <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
//         <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
//           Sign Up
//         </h2>

//         {error && <p className="text-red-500 text-sm text-center">{error}</p>}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <input
//             type="text"
//             name="name"
//             placeholder="Full Name"
//             className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
//             value={formData.name}
//             onChange={handleChange}
//             required
//           />
//           <input
//             type="email"
//             name="email"
//             placeholder="Email"
//             className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
//             value={formData.email}
//             onChange={handleChange}
//             required
//           />
//           <input
//             type="password"
//             name="password"
//             placeholder="Password"
//             className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
//             value={formData.password}
//             onChange={handleChange}
//             required
//           />
//           <input
//             type="password"
//             name="confirmPassword"
//             placeholder="Confirm Password"
//             className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
//             value={formData.confirmPassword}
//             onChange={handleChange}
//             required
//           />
//           <button
//             type="submit"
//             disabled={loading}
//             className={`w-full py-2 text-white cursor-pointer rounded-md transition ${
//               loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
//             }`}
//           >
//             {loading ? "Signing Up..." : "Sign Up"}
//           </button>
//         </form>

//         <button
//           type="button"
//           onClick={async () => {
//             setError("");
//             setLoading(true);
//             const errorMessage = await handleSignUpWithGoogle(navigate); // ✅ Pass navigate
//             if (errorMessage) {
//               setError(errorMessage);
//             }
//             setLoading(false);
//           }}
//           disabled={loading}
//           className={`mt-3 w-full py-2 text-white cursor-pointer rounded-md transition ${
//             loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"
//           }`}
//         >
//           {loading ? "Processing..." : "Continue with Google"}
//         </button>

//         <p className="text-center text-sm text-gray-600 mt-4">
//           Already have an account?{" "}
//           <Link to="/auth" className="text-blue-500 hover:underline">
//             Login
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }


import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { handleSignUp, handleSignUpWithGoogle } from "../../services/signUpService.js";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    interests: "",
  });
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const suggestedInterests = [
    "Fitness",
    "Music",
    "Tech",
    "Finance",
    "Art",
    "Photography",
    "Travel",
    "Gaming",
    "Cooking",
    "Books",
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleInterest = (interest) => {
    let updated = [];
    if (selectedInterests.includes(interest)) {
      updated = selectedInterests.filter((item) => item !== interest);
    } else {
      updated = [...selectedInterests, interest];
    }
    setSelectedInterests(updated);
    setFormData({ ...formData, interests: updated.join(", ") });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const errorMessage = await handleSignUp(formData, navigate);
    if (errorMessage) setError(errorMessage);

    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-purple-100">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          Create Your Account
        </h2>

        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          {/* ✅ Suggested Interests Section */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Select Your Interests
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {suggestedInterests.map((interest) => (
                <button
                  type="button"
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-3 py-1 rounded-full border text-sm transition ${
                    selectedInterests.includes(interest)
                      ? "bg-indigo-500 text-white border-indigo-500"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>

            <textarea
              name="interests"
              placeholder="Or type your interests (comma separated)"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={formData.interests}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 text-white font-medium rounded-md transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        <button
          type="button"
          onClick={async () => {
            setError("");
            setLoading(true);
            const errorMessage = await handleSignUpWithGoogle(navigate);
            if (errorMessage) setError(errorMessage);
            setLoading(false);
          }}
          disabled={loading}
          className={`mt-4 w-full py-2 text-white font-medium rounded-md transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-600"
          }`}
        >
          {loading ? "Processing..." : "Continue with Google"}
        </button>

        <p className="text-center text-sm text-gray-600 mt-5">
          Already have an account?{" "}
          <Link to="/auth" className="text-indigo-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
