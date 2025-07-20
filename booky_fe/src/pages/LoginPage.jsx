import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import InputField from '../components/InputField';
import { validateEmail } from '../utils/validators';
import { theme } from '../config/theme';
import { ShieldCheckIcon, CodeBracketIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

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
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left Column: Login Form */}
      <div className="bg-gray-100 dark:bg-gray-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
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
      </div>

      {/* Right Column: Promotional Panel */}
      <div className="hidden md:flex flex-col items-center justify-center bg-gray-800 dark:bg-gray-900 p-10 text-white">
        <div className="text-center max-w-md">
          <a 
            href="https://zdzdigital.ch" 
            target="_blank" 
            rel="noopener noreferrer"
            className={`text-4xl font-bold mb-6 inline-block text-${theme.colors.primary}-500 hover:text-${theme.colors.primary}-400 transition-colors`}
          >
            zdzdigital.ch
          </a>
          <p className="text-lg mb-8 text-gray-300">
            Empowering Small & Medium Businesses to Thrive Online.
          </p>
          
          <ul className="space-y-4 text-left mb-10">
            <li className="flex items-start">
              <RocketLaunchIcon className={`h-6 w-6 mr-3 flex-shrink-0 text-${theme.colors.primary}-500`} />
              <span>Custom web applications and digital strategy to fuel your growth.</span>
            </li>
            <li className="flex items-start">
              <CodeBracketIcon className={`h-6 w-6 mr-3 flex-shrink-0 text-${theme.colors.primary}-500`} />
              <span>From simple websites to complex platforms, we build solutions that perform.</span>
            </li>
            <li className="flex items-start">
              <ShieldCheckIcon className={`h-6 w-6 mr-3 flex-shrink-0 text-${theme.colors.primary}-500`} />
              <span>Reliable support and maintenance to keep your digital presence secure.</span>
            </li>
          </ul>

          <a 
            href="https://zdzdigital.ch" 
            target="_blank" 
            rel="noopener noreferrer"
            className={`w-full max-w-xs mx-auto px-6 py-3 font-semibold text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors ${buttonClasses}`}
          >
            Learn More
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
