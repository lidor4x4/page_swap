'use client'

import React, { useState, useEffect } from 'react';
import NavbarTrade from './components/NavbarTrade';
import { Button, Card, Label, TextInput } from 'flowbite-react';
import { firestore } from '@/firebase/config';
import { GeoPoint } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

import Axios from 'axios';
import { useAuth } from '@clerk/nextjs';

interface Coordinates {
  latitude: number;
  longitude: number;
}

const MAX_DISTANCE = 80; // Replace with your desired maximum distance

export default function Home() {
  const [search, setSearch] = useState('');
  const [books, setBooks] = useState<any[]>([]);
  const [userID, setUserID] = useState('');
  const [tradersNames, setTradersNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
    const { push } = useRouter();

  const { getToken } = useAuth();

  useEffect(() => {
    const fetchAllBooksNearUser = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error);
      } else {
        console.log('Geolocation not supported');
      }

      async function success(position: GeolocationPosition) {
        const { latitude, longitude } = position.coords;
            const {data} = await Axios.get(`${process.env.BASE_URL}/trade/api/get-user-id`);
          const userIDLocal = data.userId;
        console.log('User position:', latitude, longitude);
        const booksRef = firestore.collection('books');
        let query = booksRef;


        if (search) {
          query = query.where('title', '==', search);
        }

        const snapshot = await query.get();
        let booksNearUser: any[] = [];

        snapshot.forEach((doc) => {
          const { geopoint } = doc.data();
          const distance = calculateDistance(latitude, longitude, geopoint.latitude, geopoint.longitude);

          if (distance <= MAX_DISTANCE) {
            booksNearUser.push({ id: doc.id, ...doc.data() });
          }
        });


        // remove books where the user is the trader
        booksNearUser = booksNearUser.filter((book) => book.trader !== userIDLocal);

        booksNearUser.sort((a, b) => {
          return b.createdAt.seconds - a.createdAt.seconds;
        });

        console.log('Books near the user:', booksNearUser);
        const tradersIDS = booksNearUser.map((book) => book.trader);
        console.log(tradersIDS);
        await getTradersNames(tradersIDS);
        setBooks(booksNearUser);
        setLoading(false);
      }

      function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        return Math.sqrt((lat2 - lat1) ** 2 + (lon2 - lon1) ** 2);
      }

      function error() {
        console.log('Unable to retrieve your location');
      }
    };

    fetchAllBooksNearUser();
  }, [search]);

  const getTradersNames = async (traderIds: string[]) => {
    console.log(traderIds);
    const tradersNames: string[] = [];
    for (let i = 0; i < traderIds.length; i++) {
      console.log(traderIds[i]);
      const jwt = await getToken();
      const { data } = await Axios.get(`${process.env.BASE_URL}/trade/api/get-user-by-id?userId=${traderIds[i]}&token=${jwt}`);
      console.log(data.user.username);
      tradersNames.push(data.user.username);
    }
    setTradersNames(tradersNames);
  };

  const createConversation = async ( traderID) => {
    //  check if the conversation already exists between the two users
    console.log(traderID, userID);
    const {data} = await Axios.get(`${process.env.BASE_URL}/trade/api/get-user-id`);
    const userIDLocal = data.userId;
    
      const conversationSnapshot = await firestore.collection('conversations')
      conversationSnapshot.where('users', 'array-contains', userIDLocal)
      conversationSnapshot.where('users', 'array-contains', traderID)
      .get()
      .then(async (querySnapshot) => {
        if (querySnapshot.empty) {
          // create the conversation
                const conversation = {
        createdAt: new Date(),
        messages: [],
        users: [userIDLocal, traderID]
      }
        await firestore.collection('conversations').add(conversation);
        console.log('conversation created');
        // redirect to the conversation page
        push(`/trade/message-hub/conversation/${traderID}`);
      
        } else {
          push(`/trade/message-hub/conversation/${traderID}`);

        }
      })


    }
 

  return (
    <>
      <NavbarTrade />
      {loading ? (
        <h1>Loading...</h1>
      ) : (
        <div className="flex justify-center items-center flex-col">
          <h1 className="font-bold text-2xl">Trade Books</h1>
          <div className="flex flex-col sm:w-1/3 w-1/2">
            <div className="mb-2 block">
              <Label htmlFor="search" value="Search for a book" />
            </div>
            <TextInput id="search" required type="email" onChange={(e) => setSearch(e.target.value)} />
          </div>
          <hr className="sm:w-1/3 w-1/2 h-1 mx-auto my-4 bg-gray-100 border-0 rounded md:my-10 dark:bg-gray-700" />
          <div className="flex justify-center items-center flex-col w-screen">
            <h2 className="font-bold text-xl mb-4">Books near you</h2>
            {books.length === 0 ? (
              <h3>No books found</h3>
            ) : (
              <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {books.map((book, index) => (
                  <Card key={book.id}>
                    <h3>{book.title}</h3>
                    <p>{book.description}</p>
                    <p>{tradersNames[index]}</p>
                    <Button onClick={() => createConversation( book.trader)}>Start Chat</Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
