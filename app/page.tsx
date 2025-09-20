'use client'

import { CalculatorProvider, useCalculator } from "./context/CalculatorContext";
import CalculatorButton from "./components/CalculatorButton";
import { useCallback } from "react";

function Display() {
	const { expression, setExpression, result, evaluateNow } = useCalculator();

	const onKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === "Enter") {
				e.preventDefault();
				evaluateNow();
			}
		},
		[evaluateNow]
	);

	return (
		<div className="mb-4">
			<input
				className="w-full bg-transparent text-white text-2xl outline-none text-right placeholder:text-neutral-500"
				placeholder="Type expression..."
				value={expression}
				onChange={(e) => setExpression(e.target.value)}
				onKeyDown={onKeyDown}
				aria-label="Expression"
			/>
			<div className="w-full text-right text-5xl font-light mt-2 select-text" aria-live="polite">
				{result}
			</div>
		</div>
	);
}

function Keypad() {
	return (
		<div className="grid grid-cols-4 gap-3">
			{/* Row 1 */}
			<CalculatorButton label="AC" type="action" className="text-xl" />
			<CalculatorButton label="+/-" type="action" />
			<CalculatorButton label="%" type="action" />
			<CalculatorButton label="÷" type="operator" />
			{/* Row 2 */}
			<CalculatorButton label="7" type="digit" />
			<CalculatorButton label="8" type="digit" />
			<CalculatorButton label="9" type="digit" />
			<CalculatorButton label="×" type="operator" />
			{/* Row 3 */}
			<CalculatorButton label="4" type="digit" />
			<CalculatorButton label="5" type="digit" />
			<CalculatorButton label="6" type="digit" />
			<CalculatorButton label="-" type="operator" />
			{/* Row 4 */}
			<CalculatorButton label="1" type="digit" />
			<CalculatorButton label="2" type="digit" />
			<CalculatorButton label="3" type="digit" />
			<CalculatorButton label="+" type="operator" />
			{/* Row 5 */}
			<CalculatorButton label="0" type="digit" />
			<CalculatorButton label="." type="digit" />
			<CalculatorButton label="=" type="action" className="bg-orange-500 text-white" />
		</div>
	);
}

function Calculator() {
	return (
		<div className="mx-auto w-full max-w-xs sm:max-w-sm">
			<div className="bg-black text-white rounded-3xl p-5 shadow-xl border border-neutral-800">
				<Display />
				<Keypad />
			</div>
		</div>
	);
}

export default function Home() {
	return (
		<div className="min-h-dvh w-full flex items-center justify-center bg-neutral-900 p-4">
			<CalculatorProvider>
				<Calculator />
			</CalculatorProvider>
		</div>
	);
}
