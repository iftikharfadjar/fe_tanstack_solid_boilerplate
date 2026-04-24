import { createFileRoute } from '@tanstack/solid-router';
import { Title } from '@solidjs/meta';
import { AuthContainer } from '../presentation/components/stateful/AuthContainer';

export const Route = createFileRoute('/auth')({
  component: AuthPage,
});

function AuthPage() {
  return (
    <main>
      <Title>Authentication - TanStack Solid Boilerplate</Title>
      <AuthContainer />
    </main>
  );
}
