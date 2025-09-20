"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { evaluate as mathEvaluate } from "mathjs";


type ButtonType = "digit" | "operator" | "action";

export type ButtonPress = {
	type: ButtonType;
	label: string;
};

export type HistoryItem = {
    id: string;
    expression: string;
    result: string;
    ts: number;
};

type CalculatorContextValue = {
	expression: string;
	result: string;
	setExpression: (v: string) => void;
	handlePress: (press: ButtonPress) => void;
	evaluateNow: () => void;
	clear: () => void;
	history: HistoryItem[];
	clearHistory: () => void;
};

const CalculatorContext = createContext<CalculatorContextValue | null>(null);

function sanitizeExpression(expr: string): string {
	let s = expr
		.replace(/×/g, "*")
		.replace(/÷/g, "/")
		.replace(/−/g, "-");

	s = s.replace(/(\d+(?:\.\d+)?)%/g, "($1/100)");
	return s;
}

export function CalculatorProvider({ children }: { children: React.ReactNode }) {
	const [expression, setExpression] = useState("");
	const [result, setResult] = useState("0");
	const [history, setHistory] = useState<HistoryItem[]>([]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem("calc_history");
            if (raw) {
                const parsed: HistoryItem[] = JSON.parse(raw);
                if (Array.isArray(parsed)) setHistory(parsed);
            }
        } catch {}
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem("calc_history", JSON.stringify(history));
        } catch {}
    }, [history]);

	const clear = useCallback(() => {
		setExpression("");
		setResult("0");
	}, []);

	const evaluateNow = useCallback(() => {
		const expr = expression.trim();
		if (!expr) {
			setResult("0");
			return;
		}
		try {
			const sanitized = sanitizeExpression(expr);
			const value = mathEvaluate(sanitized);
			const out = typeof value === "number" ? String(value) : String(value);

			setHistory((prev) => [
				{ id: crypto.randomUUID(), expression: expr, result: out, ts: Date.now() },
				...prev,
			]);
			setResult(out);
		} catch {
			setResult("Error");
		}
	}, [expression]);

	const handlePress = useCallback(
		(press: ButtonPress) => {
			const { type, label } = press;

			if (type === "action") {
				switch (label) {
					case "AC":
						clear();
						return;
					case "DEL": {
						setExpression((prev) => prev.slice(0, -1));
						return;
					}
					case "+/-": {
						// Toggle sign of the last number in the expression
						setExpression((prev) => {
							if (!prev) return prev;
							const m = prev.match(/(.*?)([\d.]+)$/);
							if (!m) return prev.startsWith("-") ? prev.slice(1) : "-" + prev;
							const head = m[1];
							const num = m[2];
							if (num.startsWith("-")) return head + num.slice(1);
							return head + "-" + num;
						});
						return;
					}
					case "%": {
						// Apply percent to the last number
						setExpression((prev) => {
							const m = prev.match(/(.*?)([\d.]+)$/);
							if (!m) return prev + "%"; // fallback, sanitizer will handle
							const head = m[1];
							const num = m[2];
							return `${head}(${num}/100)`;
						});
						return;
					}
					case "=":
						evaluateNow();
						return;
				}
			}

			if (type === "operator") {
				setExpression((prev) => {
					if (!prev) {
						// allow starting with minus for negative numbers
						if (label === "-") return label;
						return prev;
					}
					// Prevent two operators in a row
					if (/([+\-×÷*/])$/.test(prev)) {
						return prev.slice(0, -1) + label;
					}
					return prev + label;
				});
				return;
			}

			// digits and dot
			setExpression((prev) => prev + label);
		},
		[clear, evaluateNow]
	);


	const clearHistory = useCallback(() => setHistory([]), []);

	const value = useMemo(
		() => ({ expression, result, setExpression, handlePress, evaluateNow, clear, history, clearHistory }),
		[expression, result, handlePress, evaluateNow, clear, history, clearHistory]
	);

	return <CalculatorContext.Provider value={value}>{children}</CalculatorContext.Provider>;
}

export function useCalculator() {
	const ctx = useContext(CalculatorContext);
	if (!ctx) throw new Error("useCalculator must be used within CalculatorProvider");
	return ctx;
}
