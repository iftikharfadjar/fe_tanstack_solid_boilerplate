import { createFileRoute } from '@tanstack/solid-router';
import { AuthContainer } from '../presentation/components/stateful/AuthContainer';

export const Route = createFileRoute('/auth')({
  head: () => ({
    meta: [{ title: 'Authentication - TanStack Solid Boilerplate' }],
  }),
  component: AuthPage,
});

function AuthPage() {
  return (
    <main>
      <AuthContainer />
    </main>
  );
}
