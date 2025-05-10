'use client';

import React from 'react';
import { Button } from '@/client/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ErrorBoundaryProps {
	children: React.ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error?: Error;
}

export class ErrorBoundary extends React.Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return {
			hasError: true,
			error,
		};
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error('ErrorBoundary caught an error:', error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="min-h-[400px] flex items-center justify-center">
					<div className="text-center space-y-4">
						<AlertCircle className="h-10 w-10 text-destructive mx-auto" />
						<h2 className="text-xl font-semibold">
							عذراً، حدث خطأ ما
						</h2>
						<p className="text-muted-foreground">
							حدث خطأ أثناء تحميل المحتوى. الرجاء المحاولة مرة
							أخرى.
						</p>
						<Button
							onClick={() => window.location.reload()}
							variant="outline"
						>
							إعادة المحاولة
						</Button>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}
