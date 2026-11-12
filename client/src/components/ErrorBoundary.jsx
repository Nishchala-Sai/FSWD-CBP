import { Component } from 'react';

// Class component: catches errors thrown while rendering any page inside it
export default class ErrorBoundary extends Component {
  state = { error: null };

  // Lifecycle (render phase): a child threw, so switch to the fallback UI
  static getDerivedStateFromError(error) {
    return { error };
  }

  // Lifecycle (commit phase): the fallback is on screen, now log the details
  componentDidCatch(error, info) {
    console.error('Page crashed:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="card">
        <h2>Something went wrong</h2>
        <p className="error">{this.state.error.message}</p>
        <button className="button" onClick={() => this.setState({ error: null })}>Try again</button>
      </div>
    );
  }
}
