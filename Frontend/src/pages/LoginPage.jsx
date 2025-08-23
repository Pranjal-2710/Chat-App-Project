import React, { useContext, useState } from 'react'
import logo_big from '../assets/logo_big.svg'
import arrow_icon from '../assets/arrow_icon.png'
import { AuthContext } from '../../context/Auth'
const LoginPage = () => {
  
  const [currentState, setCurrentState] = useState("Sign Up")
  const [fullName, setFullName] = useState("")
  const [email,setEmail]=useState("")
  const [password,setPassword]=useState("")
  const [bio,setBio]=useState("")
  const [isDataSubmitted, setIsDataSubmitted]= useState(false)

  const {login}= useContext(AuthContext)

  const onSubmitHandler=(event)=>{
    event.preventDefault()
    if(currentState==="Sign Up" && !isDataSubmitted){
      setIsDataSubmitted(true)
      return;
    }

    login(currentState=="Sign Up" ? 'signup':'login',{fullName,email,password,bio})
  }
  return (
    <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl '>
      <img src={logo_big} className='w-[min(30vw,250px)]' alt='' />



      <form onSubmit={onSubmitHandler} className='border-2 bg-white/8 text-white border-gray-600 p-6 flex flex-col gap-6 rounded-lg shadow-lg'>
        <h2 className='font-medium text-2xl flex justify-between items-center'>
          {currentState}
          {isDataSubmitted && <img onClick={()=>setIsDataSubmitted(false)} src={arrow_icon} alt='' className='w-5 cursor-pointer'/>}
          
        </h2>
        {currentState ==="Sign Up" && !isDataSubmitted && (<input onChange={(e)=>setFullName(e.target.value)} value={fullName} type="text" className='p-2 border border-gray-500 rounded-md focus:ring-2 focus:ring-indigo-500' placeholder='Enter Full Name....' required />)}

        {!isDataSubmitted && (
          <>
            <input onChange={(e)=>setEmail(e.target.value)} value={email} type="email" placeholder='Enter Email....' required className='p-2 border border-gray-500 rounded-md  focus:ring-2 focus:ring-indigo-500'/>

            <input onChange={(e)=>setPassword(e.target.value)} value={password} type="password" placeholder='Enter Password....' required className='p-2 border border-gray-500 rounded-md focus:ring-2 focus:ring-indigo-500'/>
          </>
        )}

        {
          currentState==="Sign Up" && isDataSubmitted &&(
            <textarea onChange={(e)=>setBio(e.target.value)} value={bio}
             rows={4} className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ' placeholder='Provide a short bio......'></textarea>
          )
        }

        <button type="submit" className='py-3 bg-gradient-to-r from-purple-400 to-violet-600'>
          {currentState==="Sign Up" ? "Create Account" : "Login"}
        </button>

        <div className='flex items-center gap-2 text-sm text-gray-500'>
          <input type="checkbox" required />
          <p>Agree to the terms of use & privacy policy</p>
        </div>

        <div className='flex flex-col gap-2'>
          {currentState==="Sign Up" ? (
            <p className='text-sm text-gray-700 '>Already have an account ? <span
            onClick={()=>{setCurrentState("Login");
              setIsDataSubmitted(false);
              setEmail("");
              setPassword("");
              setFullName("");
              setBio("");}}
            className='font-medium text-violet-500 cursor-pointer hover:underline'>Login Here</span></p>
          ) : (
            <p className='text-sm text-gray-700'>Create an Account <span
            onClick={()=>{setCurrentState("Sign Up");
              setEmail("");
              setPassword("");
              setFullName("");
              SetBio("");
            }}
            className='font-medium text-violet-500 cursor-pointer hover:underline'>Register here</span></p>
          )}
        </div>
      </form>
    </div>
  )
}

export default LoginPage