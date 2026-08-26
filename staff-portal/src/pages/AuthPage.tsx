import React, { useState } from 'react';
import { useStaffAuth } from '../stores/staffAuthStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ShieldCheck, Lock } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login } = useStaffAuth();
  const [email, setEmail] = useState('admin@wunabuy.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const success = await login(email, password);
    setLoading(false);

    if (!success) {
      setError('Invalid staff credentials. Please check your admin email and password.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-8">
        {/* Brand Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center text-white font-extrabold text-2xl mx-auto shadow-lg mb-3 font-heading">
            W
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 font-heading">Wunabuy Staff Portal</h2>
          <p className="text-xs text-slate-500 mt-1">Enterprise Admin & Adjudication Console</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Staff Admin Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@wunabuy.com"
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            leftIcon={<Lock className="w-4 h-4" />}
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full py-2.5"
            loading={loading}
            leftIcon={<ShieldCheck className="w-4 h-4" />}
          >
            Authenticate & Access Portal
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            Protected Wunabuy Infrastructure • 48-Hour Escrow System Operations
          </p>
        </div>
      </div>
    </div>
  );
};

