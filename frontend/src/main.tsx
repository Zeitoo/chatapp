import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App";
import SignUp from "./SignUp";
import SignIn from "./SignIn";
import Direct from "./Direct.tsx";
import Chat from "./Chat.tsx";
import { Requests } from "./Requests.tsx";
import NewChat from "./NewChat.tsx";
import { AppProvider } from "./Contexts/AppContextProvider.tsx";
import {
	createBrowserRouter,
	createRoutesFromElements,
	Route,
	RouterProvider,
} from "react-router-dom";
import { ChatProvider } from "./Contexts/chatContextProvider.tsx";
import { AuthProvider } from "./Contexts/AuthContext.tsx";

const router = createBrowserRouter(
	createRoutesFromElements(
		<Route
			path="/"
			element={<App />}>
			<Route
				path="signup"
				element={<SignUp />}
			/>
			<Route
				path="signin"
				element={<SignIn />}
			/>
			<Route
				path="login"
				element={<SignIn />}
			/>
			<Route
				path="direct/"
				element={<Direct />}>
				<Route
					path="pedidos"
					element={<Requests />}
				/>
				<Route
					path="new_chat"
					element={<NewChat />}
				/>
				<Route
					path=":chatid"
					element={<Chat />}
				/>
			</Route>
			<Route
				path="*"
				element={<div>404. Pagina nao encontrada</div>}
			/>
		</Route>
	)

);

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<AuthProvider>
			<AppProvider>
			<ChatProvider>
				<RouterProvider router={router} />
			</ChatProvider>
		</AppProvider>
		</AuthProvider>
	</StrictMode>
);
