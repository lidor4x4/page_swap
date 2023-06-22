'use client'



import { firestore } from '@/firebase/config'
import { GeoPoint } from 'firebase/firestore'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Axios from 'axios'
import NavbarTrade from '../components/NavbarTrade'
import { Button, Textarea, Label, TextInput } from 'flowbite-react';

export default function CreateTrade() {
    const [userID, setUserID] = useState('')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const { push } = useRouter()
    useEffect(() => {
        const fetchUserID = async () => {
            const { data } = await Axios.get(`${process.env.BASE_URL}/trade/api/get-user-id`)
            setUserID(data.userId)
        }
        fetchUserID()
    }, [])

    const createATrade = async () => {
        if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error);
        } else {
        console.log("Geolocation not supported");
        }

        async function success(position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const tradeRef = firestore.collection('books')
            const trade = {
                title: title,
                description:
                    description,
                trader: userID,
                geopoint: new GeoPoint(latitude, longitude),
                createdAt: new Date()
            }
            await tradeRef.add(trade)
            push('/trade')

        }

        function error() {
        console.log("Unable to retrieve your location");
        }





    }
    return (
        <>
            <NavbarTrade />
            <div className='flex justify-center items-center flex-col w-screen gap-4'>
                <h1>Create Trade</h1>
                <div className='shadow-sm rounded-md p-4  '>
                    <form className="flex max-w-md flex-col gap-4  ">
                        <div>
                            <div className="mb-2 block">
                            <Label
                                htmlFor="title"
                                value="Book's Title"
                            />
                            </div>
                            <TextInput
                            id="title"
                            placeholder="title..."
                            required
                            type="text"
                            onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                                                <div>
                            <div className="mb-2 block">
                            <Label
                                htmlFor="description"
                                value="Book's Description"
                            />
                            </div>
                            <Textarea
                            id="description"
                            placeholder="Description..."
                            required
                            type="text"
                            cols={40}
                            rows={10}
                            onChange={(e) => setDescription(e.target.value)}

                            />
                        </div>
                        <Button onClick={createATrade}>Create Trade</Button>


            </form>
            </div>
            </div>
        </>
    )
}
