import { useState,useEffect } from 'react'
import './App.css'
import { use } from 'react';

function App() {
  const [currentView, setCurrentView] = useState('login');
  const [token,setToken]=useState(localStorage.getItem('token'));
  const [username,setUsername]=useState(localStorage.getItem('username'));
  const API_URL='http://localhost:5000/api';
  useEffect(()=>{
    if(token) setCurrentView('dashboard');
  },[token]);
  const handleLogout=()=>{
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUsername(null);
    setCurrentView('login');
  }
  const Register=()=>{
    const [formData,setFormData]=useState({username:'',email:'',password:''});
    const [error,setError]=useState('');
    const handleSubmit=async(e)=>{
      e.preventDefault();
      try{
        const response=await fetch('http://localhost:5000/api/register',{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify(formData),
        });
        if(response.ok){
          setCurrentView('login');
        }else{    
          const data=await response.json();
          setError(data.error||'Registration failed');
        }
      }catch(err){
        setError('Failed to connect to server');
      }
    }
    return(
      <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md space-y-4 mt-20 border">
        <h2 className="text-2xl font-bold text-center">Register</h2>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
          <input required type="text" placeholder="Username" className="border p-2 rounded" 
            onChange={e=>setFormData({...formData,username:e.target.value})}/>
          <input required type="email" placeholder="Email" className="border p-2 rounded" 
            onChange={e=>setFormData({...formData,email:e.target.value})}/>
          <input required type="password" placeholder="Password" className="border p-2 rounded" 
            onChange={e=>setFormData({...formData,password:e.target.value})}/>
          <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Register</button>
        </form>
        <p className="text-sm text-center cursor-pointer text-blue-600" onClick={()=>setCurrentView('login')}>
          Already have an account? Login
        </p>
      </div>
    );
  }
const Login=()=>{
  const [formData,setFormData]=useState({username:'',password:''});
  const [error,setError]=useState('');
  const handleSubmit=async(e)=>{
    e.preventDefault();
    try{
      const response=await fetch('http://localhost:5000/api/login',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(formData),
      });
      if(response.ok){
        const data=await response.json();
        localStorage.setItem('token',data.token);
        localStorage.setItem('username',data.username);
        setToken(data.token);
        setUsername(data.username);
        setCurrentView('dashboard');
      }else{
        const data=await response.json();
        setError(data.error||'Login failed');
      }
    }catch(err){
      setError('Failed to connect to server');
    }
  }
  return(
    <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md space-y-4 mt-20 border">
      <h2 className="text-2xl font-bold text-center">Login</h2>
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
        <input required type="text" placeholder="Username" className="border p-2 rounded" 
          onChange={e=>setFormData({...formData,username:e.target.value})}/>
        <input required type="password" placeholder="Password" className="border p-2 rounded" 
          onChange={e=>setFormData({... formData,password:e.target.value})}/>
        <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Login</button>
      </form>
      <p className="text-sm text-center cursor-pointer text-blue-600" onClick={()=>setCurrentView('register')}>
        Don't have an account? Register
      </p>
    </div>
  );
}
const Dashboard=()=>{
  const [message,setMessage]=useState('');
  useEffect(()=>{
    const fetchData=async()=>{
      try{
        const response=await fetch('http://localhost:5000/api/dashboard',{
          headers:{'Authorization':`Bearer ${token}`},
        });
        if(response.ok){
          const data=await response.json();
          setMessage(data.message);
        }else{
          setMessage('Failed to load dashboard');
        }
      }catch(err){
        setMessage('Failed to connect to server');
      }
    }
    fetchData();
  },[token]);
  return(
    <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md space-y-4 mt-20 border text-center">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <p>{message}</p>
      <button onClick={handleLogout} className="bg-red-600 text-white p-2 rounded hover:bg-red-700">Logout</button>
    </div>
  );
} 
  return (  
    <>
    {currentView === 'login' && <Login />}
    {currentView === 'register' && <Register />}
    {currentView === 'dashboard' && <Dashboard />}
    </>
  )
}

export default App
