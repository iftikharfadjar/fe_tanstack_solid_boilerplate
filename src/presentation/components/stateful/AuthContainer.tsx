import {  createSignal } from 'solid-js';
import { AuthForm } from '../stateless/AuthForm';
import { loginFn, signupFn } from '../../../server/serverFn/auth';
import { useNavigate } from '@tanstack/solid-router';

export const AuthContainer  = () => {
  const [mode, setMode] = createSignal<'login' | 'signup'>('login');
  const [error, setError] = createSignal<string>();
  const [isLoading, setIsLoading] = createSignal(false);
  const navigate = useNavigate();

  const handleSubmit = async (email: string, password: string) => {
    setError(undefined);
    setIsLoading(true);
    try {
      if (mode() === 'login') {
        await loginFn({ data: { email, password } });
      } else {
        await signupFn({ data: { email, password } });
      }
      navigate({ to: '/dashboard' });
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'signup' : 'login'));
    setError(undefined);
  };

  return (
    <AuthForm
      mode={mode()}
      onSubmit={handleSubmit}
      isLoading={isLoading()}
      error={error()}
      onToggleMode={handleToggleMode}
    />
  );
};
