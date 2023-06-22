'use client'


import React, { useState, useEffect } from 'react';
import Navbartrade from '../components/NavbarTrade';
import { TextInput, Button, Card } from 'flowbite-react';
import { useRouter } from 'next/navigation';
import { firestore } from '../../../firebase/config';
import { useAuth } from '@clerk/nextjs';

export default function MessageHub() {
  const [conversations, setConversations] = useState([]);
  const [userID, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userMap, setUserMap] = useState({});

  const { getToken } = useAuth();
  const { push } = useRouter();

  useEffect(() => {
    fetch(`${process.env.BASE_URL}/trade/api/get-user-id`)
      .then(res => res.json())
      .then(async data => {
        const userId = data.userId;
        setUserId(userId);

        firestore
          .collection('conversations')
          .where('users', 'array-contains', userId)
          .onSnapshot(snapshot => {
            const conversationsArray = snapshot.docs.map(doc => doc.data());
            setConversations(conversationsArray);
            setLoading(false);
          });
      })
      .catch(err => console.log(err));
  }, []);

  const getUserById = async (ID) => {
    const jwt = await getToken();
    fetch(`${process.env.BASE_URL}/trade/api/get-user-by-id?userId=${ID}&token=${jwt}`, {
      method: 'GET',
    })
      .then((res) => res.json())
      .then((data) => {
        const user = data.user;
        setUserMap(prevUserMap => ({ ...prevUserMap, [ID]: user }));
      })
      .catch((err) => console.log(err));
  }

  useEffect(() => {
    conversations.forEach(conversation => {
      const otherUser = conversation.users.find(user => user !== userID);
      if (otherUser && !userMap[otherUser]) {
        getUserById(otherUser);
      }
    });
  }, [conversations]);


  const GoToConversation = (partnerID) => {
    push(`/trade/message-hub/conversation/${partnerID}`)
  }

  return (
    <>
      <Navbartrade />
      <div>
        {loading ? <h1>Loading...</h1>
          :
          <div className='flex justify-center items-center flex-col gap-4'>
            <h1 className='text-2xl mt-4 font-semibold'>Your conversations</h1>
            <div className='grid sm:grid-cols-3 grid-cols-1 gap-4 mx-4 '>
              {conversations.map((conversation, index) => {
                const otherUser = conversation.users.find(user => user !== userID);
                const partner = userMap[otherUser];
                
                return (
                  <Card className='flex justify-center items-center flex-col gap-4' key={index}>
                    <h1 className='text-2xl mt-4 font-semibold'>Conversation with {partner ? partner.username : 'Loading...'}</h1>
                    <Button onClick={() => GoToConversation(partner.id)}>Go to conversation</Button>
                  </Card>
                )
              })}
            </div>
          </div>
        }
      </div>
    </>
  );
}
