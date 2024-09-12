import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import Register from "./components/register";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState("Loading");
    let history = useHistory();

    useEffect(() => {
        axios
            .get("/api/getUserData")
            .then((res) => {
                setUser(res.data.user);
            })
            .catch((err) => {
                console.log(err);
                setUser(null);
            });
    }, []);

    if(user === "Complete Configuration") { // this throws an error idk but if it works then dont fix it
        return <Register />
    }
    

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;
