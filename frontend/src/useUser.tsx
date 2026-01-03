import { useContext } from "react";
import { appContext } from "./appContext";

export function useUser() {
	const context = useContext(appContext);

	if (!context) {
		throw new Error("USE user deve ser usado dentro do provider");
	}

	return context;
}
