import React,{useState} from 'react'
import logo from '../assets/logo.png'
import { v4 as uuidV4 } from 'uuid';
import {toast} from 'react-hot-toast'

import { useNavigate } from 'react-router-dom';
import './HomePage.css'

const HomePage = () => {

    const navigate = useNavigate();

    const [roomId,setRoomId] = useState("")
    const [userName,setUserName] = useState("")


    const handleNewRoom = (e) =>{
        e.preventDefault();
        const id = uuidV4();
        setRoomId(id)
        toast.success('Room Id created')
    }

    const handleEnter = (e)=>{
        if(e.code==="Enter")
        {
            handleJoin()
        }
    }

    const handleJoin =(e) =>{
        if(!roomId || !userName)
        {
            toast.error("Room Id or UserName is missing");
            return
        }

                // Redirect
        navigate(`/editor/${roomId}`, {
                    state: {
                        userName,
                    },
                });
    }
 

  return (
    <div className='homeWarpper'>
        <div className='formwrapper'>
            <img className='logoimg' src={logo} alt="" />

             <h2 className='mainlabel'>Please past ROOM ID</h2>
             <div className='inputGroup'>
                <input 
                    type="text" 
                    placeholder='ROOM ID' 
                    className='inputfelid' 
                    value={roomId} 
                    onChange={(e) => setRoomId(e.target.value)}
                    onKeyUp={handleEnter}
                
                />
                <input 
                    type="text" 
                    placeholder='User Name' 
                    className='inputfelid' 
                    value={userName} 
                    onChange={(e) => setUserName(e.target.value)}
                    onKeyUp={handleEnter}
                
                />

                <button className='joinBtn' onClick={handleJoin}> JOIN</button>
             </div>

             <span>
                <h2>If you don't have invaite thrn create &nbsp; <a href='' onClick={handleNewRoom}  className='newRoom'>New Room</a></h2>
             </span>

        </div>
        <footer>
            <h2>Bulit with 💛 <a href='https://github.com/varun-official' className='bulit' target="_blank">Varun</a></h2>
        </footer>

    </div>
  )
}

export default HomePage