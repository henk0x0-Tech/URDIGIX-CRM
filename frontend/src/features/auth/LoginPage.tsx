import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/dataService';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@urdigix.com');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      login(response.user as any, response.token);
      toast.success('Logged in successfully!');
      navigate('/');
    } catch (error) {
      const rawMessage = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
      const message = rawMessage?.includes('Authentication failed against database server')
        ? 'Database authentication failed. Please check DATABASE_URL in .env.'
        : rawMessage || `Error: ${error instanceof Error ? error.message : 'Unknown'} | Please check the API.`;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Welcome back</h2>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          type="email"
          label="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@urdigix.com"
          iconLeft={<Mail className="h-4 w-4" />}
          required
        />

        <Input
          type="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          iconLeft={<Lock className="h-4 w-4" />}
          required
        />

        <div className="flex items-center justify-between text-xs font-semibold text-primary-600 dark:text-primary-400 mt-1">
          <label className="flex items-center gap-2 text-slate-500 cursor-pointer select-none">
            <input type="checkbox" className="rounded border-slate-300 dark:border-slate-800 text-primary-600 focus:ring-primary-500" />
            Remember me
          </label>
          <Link to="/forgot-password" className="hover:underline">Forgot password?</Link>
        </div>

        <Button type="submit" loading={loading} className="w-full mt-2">
          Sign In
        </Button>
      </form>

      <div className="text-center text-xs font-semibold text-slate-400 mt-4">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary-600 dark:text-primary-400 hover:underline">
          Sign Up
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
