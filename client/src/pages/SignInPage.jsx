import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { MdAlternateEmail } from "react-icons/md";
import { FiEye, FiEyeOff, FiLock } from "react-icons/fi";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { Link } from "react-router-dom";

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // TODO: Redirect to dashboard or home page after successful sign-in
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#050d1a] to-[#10182a]">
      <div className="w-full max-w-md bg-[#181f2e] rounded-xl shadow-lg p-8 flex flex-col items-center border border-gray-800">
        {/* Logo Placeholder */}
        <div className="mb-6 mt-2 w-40 h-10 bg-gray-700 rounded flex items-center justify-center font-bold text-2xl tracking-widest text-white">
          LOGO
        </div>
        <h1 className="text-3xl font-bold text-white mb-2 text-center">Welcome Back</h1>
        <div className="mb-4 text-gray-300 text-center w-full">
          First time here? <Link to="/sign-up" className="text-blue-400 hover:underline">Sign up for free</Link>
        </div>
        {/* Google Sign In Button (disabled for now) */}
        <button className="w-full flex items-center justify-center gap-2 bg-black text-white rounded-full py-3 mb-4 border border-gray-700 hover:bg-gray-900 transition opacity-50 cursor-not-allowed" disabled>
          <FcGoogle className="w-5 h-5" />
          <span>Sign in with Google</span>
        </button>
        {/* Divider */}
        <div className="flex items-center w-full my-4">
          <div className="flex-1 h-px bg-gray-700" />
          <span className="mx-3 text-gray-400">Or</span>
          <div className="flex-1 h-px bg-gray-700" />
        </div>
        {/* Sign In Form */}
        <form onSubmit={handleSignIn} className="w-full">
          <div className="w-full mb-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <MdAlternateEmail className="w-5 h-5" />
              </span>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-black text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-500"
                autoComplete="email"
                required
              />
            </div>
          </div>
          <div className="w-full mb-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <FiLock className="w-5 h-5" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-lg bg-black text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-500"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <FiEyeOff className="w-5 h-5" />
                ) : (
                  <FiEye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          <div className="w-full mb-6 text-right">
            <a href="#" className="text-blue-400 hover:underline text-sm">Forgot your password?</a>
          </div>
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-full flex items-center justify-center gap-2 transition mb-4"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </button>
        </form>
        {/* Terms and Privacy */}
        <div className="text-gray-500 text-xs text-center mt-2">
          By using our services you agree to our{' '}
          <a href="#" className="text-blue-400 hover:underline">Terms of Service</a> and{' '}
          <a href="#" className="text-blue-400 hover:underline">Privacy Policy</a>
        </div>
      </div>
    </div>
  );
};

export default SignInPage; 