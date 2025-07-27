import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import InputField from '../components/InputField';
import { validateEmail } from '../utils/validators';
import { RocketLaunchIcon, CodeBracketIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import Loader from '../components/Loader';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

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
      setLoginAttempts(0);
      navigate('/dashboard');
    } catch (err) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);

      if (newAttempts >= 5) {
        navigate('/login-blocked');
        return;
      }

      setServerError('Failed to log in. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {isLoading && <Loader />}
      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
        {/* Login Form Section */}
        <div className="bg-neutral-light dark:bg-neutral-even-darker flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-md bg-neutral-white dark:bg-neutral-darkest rounded-2xl shadow-xl p-8 space-y-6">
            {/* Logo */}
            <div className="flex justify-center">
                <img
                src="/schmidicars-logo.png"
                alt="Schmidicars Logo"
                className="h-14 mb-2 drop-shadow"
                draggable={false}
                loading="lazy"
                />
            </div>
            <h2 className="text-3xl font-bold text-center text-neutral-darkest dark:text-neutral-lightest">
                Dashboard Login
            </h2>
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
                showPasswordToggle={true}
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword((prev) => !prev)}
              />

              {serverError && (
                <p className="text-sm text-error-dark text-center">{serverError}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`
                  w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium
                  text-neutral-white
                  bg-primary hover:bg-primary-dark
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
                  disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200
                `}
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>

        {/* Promotional Content Section */}
        <div className="hidden md:flex flex-col items-center justify-center bg-neutral-darker text-neutral-white p-12">
          <div className="text-center max-w-lg">
            <a
              href="https://zdzdigital.ch"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-5xl font-extrabold text-primary hover:underline mb-6"
            >
              zdzdigital.ch
            </a>

            <h2 className="text-3xl font-bold mb-10">
              We help small businesses go online — simply and smart.
            </h2>

            <ul className="space-y-5 text-left text-lg max-w-md mx-auto">
              <li className="flex items-start">
                <RocketLaunchIcon className="h-7 w-7 mr-4 flex-shrink-0 text-primary" />
                <span>Booking and management tools tailored to your business — no templates, no SaaS.</span>
              </li>
              <li className="flex items-start">
                <CodeBracketIcon className="h-7 w-7 mr-4 flex-shrink-0 text-primary" />
                <span>Lightweight, secure and easy to use — your clients will love it, and so will you.</span>
              </li>
              <li className="flex items-start">
                <ShieldCheckIcon className="h-7 w-7 mr-4 flex-shrink-0 text-primary" />
                <span>You stay in control — we help you launch, host and maintain it when needed.</span>
              </li>
            </ul>

            <p className="text-sm mt-8">
              Built by <a href="https://zdzdigital.ch" className="underline hover:text-brand-light transition">zdzdigital.ch</a> — practical tools for real businesses.
            </p>
          </div>
        </div>

      </div>
    </>
  );
};  

export default LoginPage;
