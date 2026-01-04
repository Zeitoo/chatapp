import "./App.css";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useUser } from "./useUser";

function App() {
	const navigate = useNavigate();
	const route = useLocation();

	const { user, setUser } = useUser();

	const host = import.meta.env.VITE_API_URL;
	type userType = {
		id: number;
		user_name: string;
		email_address: string;
		profile_img: Blob;
		created_at: Date;
	};

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
			<p>{user?.user_name}</p>
			<p>{user?.email_address}</p>
			<Outlet />
		</div>
	);
}

export default App;
