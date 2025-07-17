import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import ValidatedInput from '../components/ValidatedInput';

const ResetPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('If an account exists for this email, a password reset link has been sent.');
      setEmail('');
    } catch (err) {
      let msg = err.message;
      if (err.code === 'auth/invalid-email') msg = 'Invalid email address format.';
      setError(msg);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#050d1a] to-[#10182a]">
      <div className="w-full max-w-md bg-[#181f2e] rounded-xl shadow-lg p-8 flex flex-col items-center border border-gray-800">
        <h2 className="text-3xl font-bold text-white mb-2 text-center">Reset your password</h2>
        <div className="text-gray-400 text-sm mb-6 text-center max-w-xs">Enter the email address you used to sign up, we'll send you an email with instructions.</div>
        <form onSubmit={handleResetPassword} className="w-full flex flex-col items-center">
          <ValidatedInput
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email Address"
            error={error}
            className="w-full"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-full flex items-center justify-center gap-2 transition mt-4 mb-2"
            disabled={loading || !email}
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
          {success && <div className="text-green-500 text-sm mb-2 text-center">{success}</div>}
        </form>
        <button
          type="button"
          className="flex items-center text-blue-400 hover:underline text-sm mt-2 bg-transparent border-none p-0"
          onClick={() => navigate('/sign-in')}
        >
          <span className="mr-1">&#8592;</span> Sign in options
        </button>
      </div>
    </div>
  );
};

export default ResetPasswordPage; 