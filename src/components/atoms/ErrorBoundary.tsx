import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }


  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[300px] flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 select-none">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl max-w-md w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {this.props.fallbackTitle || 'Ocurrió un error en esta vista'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {this.props.fallbackMessage ||
                  'No te preocupes, los datos de tu mapa siguen seguros en el almacenamiento local.'}
              </p>
            </div>

            {this.state.error && (
              <div className="p-2.5 bg-slate-100 dark:bg-slate-900/80 rounded-xl text-[11px] font-mono text-slate-600 dark:text-slate-400 text-left overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center justify-center gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={this.handleReset}>
                Reintentar
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<RotateCcw className="w-3.5 h-3.5" />}
                onClick={this.handleReload}
              >
                Recargar Aplicación
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
