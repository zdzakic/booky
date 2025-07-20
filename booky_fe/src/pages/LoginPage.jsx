import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import InputField from '../components/InputField';
import { validateEmail } from '../utils/validators';
import { theme } from '../config/theme';
import { RocketLaunchIcon, CodeBracketIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

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

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Login Form Section */}
      <div className="bg-neutral-light dark:bg-neutral-even-darker flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md bg-white dark:bg-neutral-darkest rounded-2xl shadow-xl p-8 space-y-6">
          <h2 className="text-3xl font-bold text-center text-neutral-darkest dark:text-neutral-lightest">Dashboard Login</h2>
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <InputField
              id="email"
              name="email"
              type="email"
              label="Email"
              placeholder="Email address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              autoComplete="email"
            />
            <InputField
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={errors.password}
              autoComplete="current-password"
            />

            {serverError && (
              <p className="text-sm text-error-dark text-center">{serverError}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>

      {/* Promotional Content Section */}
      <div className="hidden md:flex flex-col items-center justify-center bg-neutral-darker text-white p-12">
        <div className="text-center max-w-lg">
          <a 
            href="https://zdzdigital.ch" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block text-5xl font-extrabold text-primary hover:text-primary-light transition-colors duration-300 mb-6"
          >
            zdzdigital.ch
          </a>
          <h2 className="text-3xl font-bold text-neutral-lightest mb-10">From simple websites to complex platforms, we build solutions that perform.</h2>
          
          <ul className="space-y-5 text-left text-lg max-w-md mx-auto">
            <li className="flex items-start">
              <RocketLaunchIcon className="h-7 w-7 mr-4 flex-shrink-0 text-primary" />
              <span>Custom web applications and digital strategy to fuel your growth.</span>
            </li>
            <li className="flex items-start">
              <CodeBracketIcon className="h-7 w-7 mr-4 flex-shrink-0 text-primary" />
              <span>From simple websites to complex platforms, we build solutions that perform.</span>
            </li>
            <li className="flex items-start">
              <ShieldCheckIcon className="h-7 w-7 mr-4 flex-shrink-0 text-primary" />
              <span>Reliable support and maintenance to keep your digital presence secure.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
