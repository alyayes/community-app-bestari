import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends (Component as any) {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React Error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    sessionStorage.clear();
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF6EE] flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 border border-[#E6E1D5] shadow-xl text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="font-title font-bold text-xl text-[#2C4219]">Terjadi Kendala Tampilan</h2>
              <p className="text-xs text-[#7A7062]">
                Sistem menemukan kendala saat memuat komponen ini.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-3 text-left overflow-auto max-h-40">
                <p className="text-xs font-mono font-bold text-rose-800 break-words">
                  {this.state.error.name}: {this.state.error.message}
                </p>
                {this.state.errorInfo?.componentStack && (
                  <pre className="text-[10px] font-mono text-rose-700/80 mt-2 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack.slice(0, 300)}
                  </pre>
                )}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="px-4 py-2.5 rounded-xl bg-[#2C4219] text-white text-xs font-bold flex items-center gap-2 hover:bg-[#1f2f11] transition-all shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Muat Ulang Halaman
              </button>
              <button
                onClick={this.handleReset}
                className="px-4 py-2.5 rounded-xl bg-[#FAF6EE] text-[#433A30] border border-[#E6E1D5] text-xs font-bold flex items-center gap-2 hover:bg-[#F3EEDB] transition-all"
              >
                <Home className="w-3.5 h-3.5" />
                Reset ke Beranda
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
