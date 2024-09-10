import { createContext, useState, useEffect } from "react";
import axios from "axios";


const UserContext = createContext();

export const UserProvider = ({children}) => {
    const [user, setUser] = useState("Loading");

    useEffect(() => {
        axios.get("/api/getUser").then((res) => {
            setUser(res.data.user);
        }).catch((err) => {
            console.log(err)
            setUser(null);
        })
    })




    return (
        <UserContext.Provider value={{user, setUser}}>
            {children}
        </UserContext.Provider>
    )
}

export default UserContext;