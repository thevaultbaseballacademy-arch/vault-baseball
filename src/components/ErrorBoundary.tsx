import { Component, ReactNode, ErrorInfo } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Top-level React error boundary. Catches render-time errors from any
 * lazy-loaded route or component and shows a recoverable fallback instead
 * of a white screen.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log so it shows up in console + any wired-up error tracking
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <AlertTriangle className="w-12 h-12 mx-auto text-destructive" />
          <h1 className="text-2xl font-display tracking-wide">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">
            The page hit an unexpected error. You can try again or reload — your work in
            other tabs is safe.
          </p>
          {this.state.error?.message && (
            <p className="text-xs text-muted-foreground/70 font-mono break-words border border-border rounded p-2">
              {this.state.error.message}
            </p>
          )}
          <div className="flex gap-2 justify-center pt-2">
            <Button variant="outline" onClick={this.handleReset}>Try again</Button>
            <Button onClick={this.handleReload}>Reload page</Button>
          </div>
          <p className="text-xs text-muted-foreground pt-4">
            Need help? Email <a href="mailto:staff@methods22.com" className="underline">staff@methods22.com</a>
          </p>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
