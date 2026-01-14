import "./styles/App.css";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useUser } from "./Hooks/useUser";

function App() {
	const navigate = useNavigate();
	const route = useLocation();

	const { setUser } = useUser();

	const host = import.meta.env.VITE_API_URL;

	useEffect(() => {
		if (!route.pathname.includes("sign")) {
			fetch(`${host}/status`, { credentials: "include" }).then((res) => {
				if (res.status !== 200) {
					navigate("/signin");
				} else {
					res.json().then((data) => {
						setUser(data[0]);
					});

					if (route.pathname === "/") {
						navigate("/direct");
					}
				}
			});
		}
	}, [route.pathname]);

	return (
		<div>
			<Outlet />
		</div>
	);
}

export default App;
