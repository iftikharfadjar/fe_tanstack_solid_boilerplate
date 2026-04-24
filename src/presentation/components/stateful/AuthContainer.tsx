import { Component, createSignal } from 'solid-js';
import { AuthForm } from '../stateless/AuthForm';
import { useSubmission } from '@tanstack/solid-start';
import { loginFn, signupFn } from '../../../server/serverFn/auth';
import { useNavigate } from '@tanstack/solid-start';

export const AuthContainer: Component = () => {
  const [mode, setMode] = createSignal<'login' | 'signup'>('login');
  const [error, setError] = createSignal<string>();
  const navigate = useNavigate();

  const loginSubmission = useSubmission(loginFn);
  const signupSubmission = useSubmission(signupFn);

  const handleSubmit = async (email: string, password: string) => {
    setError(undefined);
    try {
      if (mode() === 'login') {
        await loginSubmission.submit({ email, password });
        navigate({ to: '/dashboard' });
      } else {
        await signupSubmission.submit({ email, password });
        navigate({ to: '/dashboard' });
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
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
      isLoading={loginSubmission.pending || signupSubmission.pending}
      error={error()}
      onToggleMode={handleToggleMode}
    />
  );
};
