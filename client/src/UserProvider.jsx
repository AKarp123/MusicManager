import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState("Loading");
    

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

    
    if(user === "Loading") {    
        return <></>;
    }
    

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;
