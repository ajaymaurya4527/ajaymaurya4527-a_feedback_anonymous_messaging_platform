"use client"
import { useSession,signIn, signOut } from "next-auth/react"

function page() {
    const {data:session}=useSession()
    if(session){
        return(
        <>
        Signed in as {session.user.email}<br/>
        <button onClick={()=>signOut()}>Sign out</button>

        </>)
    }return (
        <>
        Not signed in <br/>
        <button onClick={()=>signIn()}>sign In</button>
        </>
    )
  
}

export default page
