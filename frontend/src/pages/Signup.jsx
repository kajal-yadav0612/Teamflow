import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';
import { Button, Input } from '../components/ui';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      if (err instanceof ApiError && err.errors?.length) {
        setError(err.errors.map((e) => e.message).join(', '));
      } else {
        setError(err instanceof ApiError ? err.message : 'Signup failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-sidebar via-brand-900 to-brand-700 p-12 flex-col justify-between text-white">
        <div className="flex items-center gap-3">
          <CheckSquare className="w-8 h-8" strokeWidth={2.5} />
          <span className="text-2xl font-bold">TeamFlow</span>
        </div>
        <div>
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Start organizing your team today.
          </h2>
          <p className="text-slate-300 text-lg">
            Free to get started. Create projects, invite members, and assign tasks in minutes.
          </p>
        </div>
        <p className="text-slate-500 text-sm">© 2026 TeamFlow Task Manager</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <CheckSquare className="w-7 h-7 text-brand-600" strokeWidth={2.5} />
            <span className="text-xl font-bold text-slate-900">TeamFlow</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-1">Create account</h1>
          <p className="text-muted mb-8">Get started with your team workspace</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              required
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              minLength={6}
              required
            />
            <Button type="submit" className="w-full py-2.5" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
