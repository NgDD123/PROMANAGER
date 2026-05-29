import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { LogIn, Mail, Lock, Eye, EyeOff, ArrowLeft, AlertCircle } from 'lucide-react';
import proLogo from '../../pro_logo.png';
import { unifiedLogin } from '../services/unifiedLogin.service.js';
import { applyUnifiedLogin } from '../utils/applyUnifiedLogin.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useHospitalAuth } from '../context/HospitalAuthContext.jsx';
import { useHRAuth } from '../context/HRAuthContext.jsx';
import { useStockAuth } from '../context/StockAuthContext.jsx';
import { resolveUserRoleName } from '../config/loginRedirect.js';

export default function CentralLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { hospitalLogin } = useAuth();
  const { login: hospitalAuthLogin } = useHospitalAuth();
  const { login: hrLogin } = useHRAuth();
  const { setAccessToken, setUser } = useStockAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await unifiedLogin(email, password);
      const applied = applyUnifiedLogin(result, {
        hospitalLogin,
        hospitalAuthLogin,
        hrLogin,
        stockLoginState: (token, sessionUser) => {
          setAccessToken(token);
          const roleName = resolveUserRoleName(sessionUser);
          setUser(sessionUser ? { ...sessionUser, role: roleName || sessionUser.role } : null);
        },
      });

      if (applied.requiresPasswordCompletion) {
        const completePath =
          applied.service === 'hospital' ? '/hospital/login' : '/hr/complete-password';
        navigate(completePath, {
          state: { partialToken: applied.partialToken, fromCentralLogin: true },
        });
        return;
      }

      const redirectTo = searchParams.get('redirect') || applied.redirectPath || '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          'Invalid email or password',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-3 mb-6 group"
          >
            <img src={proLogo} alt="PROMANAGER" className="w-12 h-12 object-contain rounded-xl shadow-md" />
            <span className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              PROMANAGER
            </span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign in</h1>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/60 p-8">
          {error && (
            <motionlessLoginPageInner6Error error={error} />
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm disabled:opacity-60"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full border border-gray-300 rounded-xl pl-11 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm disabled:opacity-60"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 text-sm sm:text-base mt-2"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <div className="text-center mt-6 space-y-3">
          <Link
            to="/get-started"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to services
          </Link>
          <p className="text-xs text-gray-500">
            New here?{' '}
            <Link to="/get-started/register" className="text-blue-600 hover:underline font-medium">
              Register your organization
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function motionlessLoginPageInner6Error({ error }) {
  return (
    <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
      <span className="text-red-700 text-sm">{error}</span>
    </div>
  );
}
