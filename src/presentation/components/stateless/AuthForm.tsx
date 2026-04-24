import { Component, createSignal } from 'solid-js';

interface AuthFormProps {
  mode: 'login' | 'signup';
  onSubmit: (email: string, password: string) => void;
  isLoading: boolean;
  error?: string;
  onToggleMode: () => void;
}

export const AuthForm: Component<AuthFormProps> = (props) => {
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    props.onSubmit(email(), password());
  };

  return (
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {props.mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
          </h2>
        </div>
        
        {props.error && (
          <div class="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <p class="text-sm text-red-700">{props.error}</p>
          </div>
        )}

        <form class="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div class="rounded-md shadow-sm space-y-4">
            <div>
              <label for="email-address" class="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autocomplete="email"
                required
                class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email()}
                onInput={(e) => setEmail(e.currentTarget.value)}
              />
            </div>
            <div>
              <label for="password" class="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
                class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password()}
                onInput={(e) => setPassword(e.currentTarget.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={props.isLoading}
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
            >
              {props.isLoading ? 'Processing...' : (props.mode === 'login' ? 'Sign In' : 'Sign Up')}
            </button>
          </div>
        </form>

        <div class="text-center mt-4">
          <button
            type="button"
            class="font-medium text-primary hover:text-blue-500 text-sm"
            onClick={props.onToggleMode}
          >
            {props.mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};
