import "./App.css";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { appContext } from "./appContext";
import { useState, useEffect } from "react";
function App() {
	const navigate = useNavigate();
	const route = useLocation();

	const host = "http://192.168.219.132:3000";

	useEffect(() => {
		if (!route.pathname.includes("sign")) {
			fetch(`${host}/status`, { credentials: "include" }).then((res) => {
				if (res.status != 200) {
					navigate("/signin");
				} else if (res.status === 200) {
					if (route.pathname === "/") {
						navigate("/direct");
					}
				}
			});
		}
	});

	type userType = {
		id: number;
		user_name: string;
		email_address: string;
		profile_img: Blob;
		created_at: Date;
	};

	const [user, setUser] = useState<userType | null>(null);

	return (
		<>
			<appContext.Provider value={{ user, setUser }}>
				<div>
					<p>{user?.user_name}</p>
					<p>{user?.email_address}</p>
					<Outlet />
				</div>
			</appContext.Provider>
		</>
	);
}

export default App;
