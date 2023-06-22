'use client'

import { Button } from 'flowbite-react'
import React from 'react'

export default function Home() {
  return (
    <div className='flex h-screen flex-col w-screen justify-center items-center gap-4'>
      <h1 className='text-3xl font-bold'>Want To Trade Your Old Books?</h1>
      <p className='text-center w-1/2'>PageSwap is a web-based application designed to facilitate book exchanges and foster a vibrant community of book lovers. This platform provides a convenient and interactive environment for users to discover, trade, and share books with fellow enthusiasts.</p>
      <Button className='mt-4' href='/sign-up'>Trade Books</Button>
    </div>
  )
}
