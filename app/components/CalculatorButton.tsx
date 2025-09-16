"use client";

import { ButtonPress, useCalculator } from "../context/CalculatorContext";
import React from "react";

type Props = {
	label: string;
	type: ButtonPress["type"];
	className?: string;
	span?: number; // grid column span
};

export default function CalculatorButton({ label, type, className = "", span }: Props) {
	const { handlePress } = useCalculator();

	const base =
		"rounded-full flex items-center justify-center select-none text-2xl active:scale-95 transition-transform";

	const variant =
		type === "operator"
			? "bg-orange-500 text-white"
			: type === "action"
			? "bg-neutral-400 text-black"
			: "bg-neutral-700 text-white";

	const widthHeight = "aspect-square w-full";

	return (
		<button
			className={`${base} ${variant} ${widthHeight} ${className}`} 
			style={span ? ({ gridColumn: `span ${span} / span ${span}` } as React.CSSProperties) : undefined}
			onClick={() => handlePress({ type, label })}
			aria-label={label}
		>
			{label}
		</button>
	);
}

