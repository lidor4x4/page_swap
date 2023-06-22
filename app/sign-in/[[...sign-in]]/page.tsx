import React from 'react'
import { SignIn } from '@clerk/nextjs'

export default function Signin() {
  return (
    <div className='flex justify-center items-center h-screen w-screen'>
        <SignIn />
    </div>
  )
}
