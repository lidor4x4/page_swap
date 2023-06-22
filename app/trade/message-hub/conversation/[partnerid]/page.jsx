'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Button, Card, TextInput, Alert } from 'flowbite-react';
import { firestore } from '../../../../../firebase/config';
import Navbartrade from '../../../components/NavbarTrade';

export default function ChatRoom() {
  const params = useParams();
  const { partnerid } = params;
  const [userID, setUserID] = useState();
  const [messages, setMessages] = useState()
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [listener, setListener] = useState(0);
  const { getToken } = useAuth();
  const [userMap, setUserMap] = useState({});
  
    const bottomRef = useRef(null);



  useEffect(() => {

        const getMessages = async (ID) => {
        // fetch the user id from the api
        const res = await fetch(`${process.env.BASE_URL}/trade/api/get-user-id`);
        const data = await res.json();
        console.log(data.userId);
        const userIDEffect = data.userId;
        setUserID(data.userId);

        // get the partner ID
        const jwt = await getToken();
        fetch(`${process.env.BASE_URL}/trade/api/get-user-by-id?userId=${ID}&token=${jwt}`, {
            method: 'GET',
        })
            .then((res) => res.json())
            .then((data) => {
            const user = data.user;
            setUserMap((prevUserMap) => ({ ...prevUserMap, [ID]: user }));
            })
            .catch((err) => console.log(err));

        // get the messages
        const conversationSnapshot = await firestore.collection('conversations')
        conversationSnapshot.where('users', 'array-contains', userIDEffect)
        conversationSnapshot.where('users', 'array-contains', partnerid)
        .onSnapshot((querySnapshot) => {
            const messagesData = [];
            querySnapshot.forEach((doc) => {
                console.log(doc.data());
                const conversation = doc.data();
                const messages = conversation.messages;
                const messages2d = [];
                console.log(messages.length);
                for (let i = 0; i < messages.length; i += 2) {
                messages2d.push(messages.slice(i, i + 2));
                }
                console.log(messages2d);
                messagesData.push(...messages2d);
            });
            setMessages(messagesData);
            setLoading(false);
        });
    };


    


    getMessages(partnerid);

  }, [getToken, partnerid, listener]);

      useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

    const sendMessage = async () => {
        // check to see if the message isnt empty
        if (message === '') {
            setError('Please enter a message');
            return;
        }

        
        // get the conversation snapshot
        const conversationSnapshot = await firestore.collection('conversations')
        conversationSnapshot.where('users', 'array-contains', userID)
        conversationSnapshot.where('users', 'array-contains', partnerid)
        conversationSnapshot.get()
        // update the messages array
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                console.log(doc.data());
                const conversation = doc.data();
                const newMessages = [...conversation.messages, userID, message]
                firestore.collection('conversations').doc(doc.id).update({
                    messages: newMessages,

                })
            });
            setListener(listener + 1);
            setMessage('');
            setError('');
            })
        
    
    }

    const handleKeyDown = (e) => {
        if (e.keyCode === 13) {
        e.preventDefault(); // Prevents line break in the text input
        sendMessage(); // Trigger the button click event
        }
    };


return (
  <>
    <Navbartrade />
    {loading ? (
      <h1>Loading...</h1>
    ) : (
<div className='flex flex-col justify-center items-center'>
  <h1 className='text-2xl mt-4 text-center'>
    Chat with{' '}
    {userMap[partnerid]?.firstName && userMap[partnerid]?.lastName
      ? `${userMap[partnerid].firstName} ${userMap[partnerid].lastName}`
      : 'Loading...'}
  </h1>
  <div className='w-full mx-auto'>
    {/* render the messages here */}
    {messages.map((message, index) => {
      const isUserMessage = message[0] === userID;
      const partnerUser = userMap[partnerid];

      return (
        <div
          className={`flex flex-col ${
            isUserMessage ? 'justify-start items-start ml-4' : 'justify-end items-end mr-4'
          }`}
          key={index}
        >
          <p className='py-1 px-2 my-4  text-white bg-blue-500 rounded-md'>
            {isUserMessage ? 'You' : partnerUser ? `${partnerUser.firstName} ${partnerUser.lastName}` : 'Loading...'}
          </p>
          <Card>{message[1]}</Card>
        </div>
      );
    })}

    <div className='flex flex-col justify-center items-center my-6 gap-4' ref={bottomRef}>
      <Alert className={`${error.length === 0 ? 'hidden' : 'block'}`}>{error}</Alert>
      <div className=''>
        <TextInput
          value={message}
          size={50}
          className='text-lg'
          onChange={(e) => setMessage(e.target.value)}
          placeholder='Type your message here'
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  </div>
</div>

    )}
  </>
);
}
