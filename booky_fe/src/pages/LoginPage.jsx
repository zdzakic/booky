import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import InputField from '../components/InputField';
import { validateEmail } from '../utils/validators';
import { theme } from '../config/theme';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0); // Counter for failed attempts
  const navigate = useNavigate();
  const { login } = useAuth();

  const validate = () => {
    const newErrors = {};
    const emailRequiredMsg = 'Email is required.';
    const emailInvalidMsg = 'Invalid email format.';
    const passwordRequiredMsg = 'Password is required.';

    if (!formData.email.trim()) {
      newErrors.email = emailRequiredMsg;
    } else {
      const emailError = validateEmail(formData.email, emailInvalidMsg);
      if (emailError) {
        newErrors.email = emailError;
      }
    }

    if (!formData.password.trim()) {
      newErrors.password = passwordRequiredMsg;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await login(formData.email, formData.password);
      setLoginAttempts(0); // Reset on success
      navigate('/dashboard');
    } catch (err) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);

      if (newAttempts >= 5) {
        navigate('/login-blocked');
        return; // Stop further execution
      }

      setServerError('Failed to log in. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const buttonClasses = [
    `bg-${theme.colors.primary}-500`,
    `hover:bg-${theme.colors.primary}-600`,
    `focus:ring-${theme.colors.primary}-500`,
    `disabled:bg-${theme.colors.primary}-300`,
  ].join(' ');

  const errorTextColor = `text-${theme.colors.error}-600`;

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center w-full">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 space-y-6">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">Dashboard Login</h2>
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <InputField
            name="email"
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
          />
          <InputField
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={errors.password}
          />
          {serverError && (
            <p className={`text-sm ${errorTextColor} text-center`}>{serverError}</p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full px-4 py-2.5 font-semibold text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${buttonClasses}`}
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </main>
  );
};

export default LoginPage;
