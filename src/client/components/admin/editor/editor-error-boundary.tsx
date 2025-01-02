// components/admin/editor/editor-error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { Button } from '@/client/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
}

export class EditorErrorBoundary extends Component<Props, State> {
	public state: State = {
		hasError: false,
	};

	public static getDerivedStateFromError(): State {
		return { hasError: true };
	}

	public render() {
		if (this.state.hasError) {
			return (
				<div className="flex min-h-[400px] items-center justify-center">
					<div className="text-center space-y-4">
						<AlertCircle className="h-10 w-10 text-destructive mx-auto" />
						<h2 className="text-xl font-semibold">
							حدث خطأ في المحرر
						</h2>
						<p className="text-muted-foreground">
							حدث خطأ أثناء تحميل المحرر. الرجاء المحاولة مرة
							أخرى.
						</p>
						<Button
							onClick={() => this.setState({ hasError: false })}
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
