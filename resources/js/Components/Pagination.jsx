import { Link } from '@inertiajs/react';
import { useState, useCallback, memo, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const Pagination = memo(({ links = [], showSpinnerOnClick = false, onClick = null }) => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// Reset loading state if links change
	useEffect(() => {
		setLoading(false);
		setError(null);
	}, [links]);

	if (!Array.isArray(links) || links.length === 0) {
		return null;
	}

	const handleClick = useCallback(async (e, url) => {
		if (!url) return;
		
		e.preventDefault();
		
		if (onClick) {
			try {
				setError(null);
				if (showSpinnerOnClick) {
			setLoading(true);
		}
				await onClick(url);
			} catch (err) {
				setError('Failed to load page');
				console.error('Pagination error:', err);
			} finally {
				// Reset loading state after a short delay
				setTimeout(() => setLoading(false), 500);
			}
		}
	}, [onClick, showSpinnerOnClick]);

	// Filter out unnecessary page numbers for better UI
	const filteredLinks = links.filter(link => {
		if (!link.url) return true;
		if (link.label === '&laquo; Previous' || link.label === 'Next &raquo;') return true;
		if (link.active) return true;
		// Keep immediate neighbors of active page
		const currentPage = links.findIndex(l => l.active);
		const thisIndex = links.indexOf(link);
		return Math.abs(currentPage - thisIndex) <= 1;
	});

	return (
		<div className="relative flex flex-col items-center justify-center gap-2">
			{error && (
				<div className="text-red-400 text-sm mb-2">{error}</div>
			)}
		<div className="relative flex items-center justify-center gap-1">
			{loading && (
				<div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10 rounded-lg">
					<svg className="animate-spin h-5 w-5 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
						<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
						<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
				</div>
			)}
			<nav className="flex items-center gap-1" aria-label="Pagination">
					{filteredLinks.map((link, key) => {
					// Special styling for Previous/Next buttons
					if (link.label.includes('Previous') || link.label.includes('Next')) {
						return (
							<div key={key}>
								{link.url ? (
										<button
											onClick={(e) => handleClick(e, link.url)}
										className="relative inline-flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:z-20 focus:outline-offset-0 border border-white/10 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
											disabled={loading}
									>
										<span className="sr-only">{link.label}</span>
										{link.label.includes('Previous') ? (
											<ChevronLeftIcon className="h-4 w-4 text-gray-400" />
										) : (
											<ChevronRightIcon className="h-4 w-4 text-gray-400" />
										)}
										</button>
								) : (
									<button
										className="relative inline-flex items-center px-2 py-2 text-sm font-medium rounded-lg border border-white/10 bg-white/5 opacity-50 cursor-not-allowed"
										disabled
									>
										<span className="sr-only">{link.label}</span>
										{link.label.includes('Previous') ? (
											<ChevronLeftIcon className="h-4 w-4 text-gray-400" />
										) : (
											<ChevronRightIcon className="h-4 w-4 text-gray-400" />
										)}
									</button>
								)}
							</div>
						);
					}

					// Render active page number or dots
					return (
						<div key={key}>
							{link.url ? (
									<button
										onClick={(e) => handleClick(e, link.url)}
									className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:z-20 focus:outline-offset-0 border ${
										link.active
											? 'z-10 bg-cyan-500/20 border-cyan-500/30 text-cyan-400'
											: 'border-white/10 hover:bg-white/5 text-gray-400'
									}`}
									aria-current={link.active ? 'page' : undefined}
										disabled={loading}
								>
									{link.label}
									</button>
							) : (
								<span className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-400 border border-white/10 rounded-lg bg-white/5">
									{link.label}
								</span>
							)}
						</div>
					);
				})}
			</nav>
			</div>
		</div>
	);
});

Pagination.displayName = 'Pagination';

export default Pagination;
