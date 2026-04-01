import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="text-lg font-semibold text-destructive">Algo deu errado</p>
          <p className="max-w-md text-sm text-muted-foreground">
            Ocorreu um erro inesperado nesta seção. Se o problema persistir, tente limpar os dados do
            navegador.
          </p>
          <div className="flex gap-3">
            <button
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              onClick={this.handleReset}
            >
              Tentar novamente
            </button>
            <button
              className="rounded-md border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
              onClick={() => {
                localStorage.removeItem('o-leao-ta-de-olho:operacoes');
                window.location.reload();
              }}
            >
              Limpar dados e recarregar
            </button>
          </div>
          {this.state.error && (
            <p className="mt-2 max-w-md break-all font-mono text-xs text-muted-foreground/50">
              {this.state.error.message}
            </p>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
