import React from 'react'
import { SignUp } from '@clerk/nextjs'

export default function Signup() {
  return (
    <div className='flex justify-center items-center h-screen w-screen'>
        <SignUp />
    </div>
  )
}
