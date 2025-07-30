import React, { useState } from 'react';
import { getProducts, getOrders, getCompatibilityReport, getCustomizerSuggestions } from '@/lib/firestore-service';

const commands = [
	{
		name: 'search products',
		description: 'Find products by keyword',
		run: async (query: string) => {
			const products = await getProducts();
			return products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
		},
	},
	{
		name: 'order status',
		description: 'Get status of your orders',
		run: async (userEmail: string) => {
			const orders = await getOrders();
			return orders.filter((o) => o.user === userEmail);
		},
	},
	{
		name: 'compatibility',
		description: 'Check compatibility for selected products',
		run: async (productIds: string[]) => {
			return await getCompatibilityReport(productIds);
		},
	},
	{
		name: 'customizer',
		description: 'Get AI build suggestions',
		run: async (input: string) => {
			return await getCustomizerSuggestions(input);
		},
	},
];

export default function Assistant() {
	const [command, setCommand] = useState('');
	const [input, setInput] = useState('');
	const [result, setResult] = useState<any>(null);
	const [loading, setLoading] = useState(false);

	const handleRun = async () => {
		setLoading(true);
		const cmd = commands.find((c) => c.name === command);
		if (cmd) {
			let cmdInput: any = input;
			if (command === 'compatibility') {
				// Expecting a comma-separated list of product IDs
				cmdInput = input.split(',').map((id) => id.trim());
			}
			const res = await cmd.run(cmdInput);
			setResult(res);
		} else {
			setResult('Unknown command');
		}
		setLoading(false);
	};

	return (
		<div className="bg-[#18182c]/80 p-4 rounded-xl shadow-lg text-cyan-100">
			<h2 className="font-bold text-lg mb-2">AI Assistant</h2>
			<select
				value={command}
				onChange={(e) => setCommand(e.target.value)}
				className="mb-2 px-2 py-1 rounded bg-[#10102a] border-cyan-400/30"
			>
				<option value="">Select command...</option>
				{commands.map((c) => (
					<option key={c.name} value={c.name}>
						{c.name}
					</option>
				))}
			</select>
			<input
				value={input}
				onChange={(e) => setInput(e.target.value)}
				placeholder="Input..."
				className="mb-2 px-2 py-1 rounded w-full bg-[#10102a] border-cyan-400/30"
				aria-label="AI Assistant Input"
				tabIndex={0}
			/>
			<button
				onClick={handleRun}
				disabled={loading || !command}
				className="bg-cyan-400/20 px-4 py-2 rounded"
			>
				Run
			</button>
			{loading && (
				<div className="mt-2 text-pink-400 animate-pulse">Loading...</div>
			)}
			{result && (
				<pre className="bg-black/30 p-2 rounded text-xs mt-2">
					{JSON.stringify(result, null, 2)}
				</pre>
			)}
		</div>
	);
}