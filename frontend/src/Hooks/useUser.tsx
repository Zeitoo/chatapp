import { useContext } from "react";
import { appContext } from "../appContext";

export function useUser() {
	const ctx = useContext(appContext);

	if (!ctx) {
		throw new Error("useUser usado fora do AppProvider");
	}

	return ctx;
}
