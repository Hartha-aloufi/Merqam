'use client';

import React, { useState, useCallback } from 'react';
import { ArrowRight } from 'lucide-react';

const Search = ({
	placeholder,
	onSearch,
	isLoading = false,
}: {
	placeholder: string;
	onSearch: (value: string) => void;
	isLoading?: boolean;
}) => {
	const [input, setInput] = useState('');

	// Handle form submission
	const handleSubmit = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();
			if (input.trim()) {
				onSearch(input);
			}
		},
		[input, onSearch]
	);

	return (
		<form onSubmit={handleSubmit} className="relative flex w-full">
			<input
				type="text"
				placeholder={placeholder}
				value={input}
				onChange={(e) => setInput(e.target.value)}
				className="w-full h-12 px-4 pr-14 text-lg bg-background border border-muted-foreground rounded-lg focus:outline-none focus:border-primary focus:bg-white transition-colors"
				disabled={isLoading}
			/>
			<button
				type="submit"
				disabled={isLoading || !input.trim()}
				className="absolute inset-y-0 right-0 flex items-center justify-center w-12 h-12 bg-primary rounded-r-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				aria-label="Search"
			>
				{isLoading ? (
					<div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
				) : (
					<ArrowRight className="h-5 w-5 text-white" />
				)}
			</button>
		</form>
	);
};

export default Search;
