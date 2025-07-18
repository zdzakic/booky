import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import InputField from '../components/InputField';
import { validateEmail } from '../utils/validators';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    const emailRequiredMsg = 'Email is required.';
    const emailInvalidMsg = 'Invalid email format.';
    const passwordRequiredMsg = 'Password is required.';

    if (!email.trim()) {
      newErrors.email = emailRequiredMsg;
    } else {
      const emailError = validateEmail(email, emailInvalidMsg);
      if (emailError) {
        newErrors.email = emailError;
      }
    }

    if (!password.trim()) {
      newErrors.password = passwordRequiredMsg;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setErrors({ api: 'Failed to log in. Please check your credentials.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center w-full">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 space-y-6">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">Dashboard Login</h2>
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <InputField
            name="email"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />
          <InputField
            name="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          {errors.api && <p className="text-sm text-red-600 text-center">{errors.api}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2.5 font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-orange-300 transition-colors"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </main>
  );
};

export default LoginPage;
