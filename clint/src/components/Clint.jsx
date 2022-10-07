import React from 'react'
import Avatar from 'react-avatar';
import './Clint.css'
const Clint = ({Name}) => {
  return (
    <div className='clint'>
        <Avatar name={Name} size="60" round="14px" />
        <h2>{Name}</h2>
    </div>
  )
}

export default Clint