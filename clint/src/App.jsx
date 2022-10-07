import { useState } from 'react'
import './App.css'

import {BrowserRouter,Routes,Route} from 'react-router-dom'

import HomePage from './Pages/HomePage'
import EditorPage from './Pages/EditorPage'

import {Toaster} from 'react-hot-toast'


function App() {

  return (
  <>
  <div>
<Toaster
                    position="top-center"
                    toastOptions={{
                        success: {
                            theme: {
                                primary: '#4aed88',
                            },
                        },
                    }}
                ></Toaster>
  </div>

  <BrowserRouter>
  <Routes>
   <Route path='/' element={<HomePage/>} ></Route>
   <Route path='/editor/:roomid' element={<EditorPage/>}></Route>

  </Routes>
  
  </BrowserRouter>

  </>
  )
}

export default App
