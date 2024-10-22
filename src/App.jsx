import { useState } from 'react';
import './App.css';
import TopNavbar from './components/TopNavbar';
import FormTitle from './components/FormTitle';
import InputField from './components/InputField';
import TextAreaField from './components/TextAreaField';
import FormButton from './components/FormButton';
import { FaPaperPlane, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [dlrResponse, setDlrResponse] = useState([]);
  const [statusDesc, setStatusDesc] = useState('');
  const [isDlrLoading, setIsDlrLoading] = useState(false); // New state for DLR loading
  const [tableData, setTableData] = useState([])
  

  const ws = new WebSocket('wss://nalo-send-sms-server.onrender.com'); 

  ws.onopen = () => {
    console.log('Connected to WebSocket server');
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Message from server:', data);
    setStatusDesc(data.status_desc);
  
    // Update or add the DLR data
    setDlrResponse((prevState) => {
      const existingIndex = prevState.findIndex(dlr => dlr.destination === data.destination);
      if (existingIndex !== -1) {
        // Replace the existing record with the new status
        const updatedState = [...prevState];
        updatedState[existingIndex] = data;
        return updatedState;
      } else {
        // Append the new status if it's not already in the list
        return [...prevState, data];
      }
    });
    setIsDlrLoading(false); // Stop showing spinner when DLR is received
  };
  

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResponseMessage('');
    setIsSuccess(false);

    const trimmedPhoneNumber = phoneNumber.trim();
    const trimmedMessage = message.trim();

    const ghanaPhoneRegex = /^(?:\+233|0)(24|25|26|27|28|29|30|31|32|33|34|35|36|37|38|39|50|51|52|53|54|55|56|57|58|59|60|61|62|63|64|65|66|67|68|69|70|71|72|73|74|75|76|77|78|79|80|81|82|83|84|85|86|87|88|89)\d{7}$/;

    if (!trimmedPhoneNumber || !trimmedMessage) {
      toast.error('Phone number and message cannot be empty.');
      setIsLoading(false);
      return;
    }

    if (!ghanaPhoneRegex.test(trimmedPhoneNumber)) {
      toast.error('Please enter a valid Ghanaian phone number.');
      setIsLoading(false);
      return;
    }

    const url = import.meta.env.VITE_SMS_URL;
    const payload = {
      key: import.meta.env.VITE_SMS_API_KEY,
      msisdn: trimmedPhoneNumber,
      message: trimmedMessage,
      callback_url: 'https://nalo-send-sms-server.onrender.com/',
      sender_id: 'Test',
    };

    try {
      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data.status === '1701') {
        toast.success('Message sent successfully!');
        setResponseMessage('Message sent successfully!');
        setIsSuccess(true);
        setIsDlrLoading(true); // Start showing spinner after message is sent
      } else {
        toast.error("Couldn't send message!");
        setResponseMessage("Couldn't send message !");
        setIsSuccess(false);
      }

      setPhoneNumber('');
      setMessage('');
    } catch (error) {
      setError('Failed to send message. Please try again.');
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
      setResponseMessage('Failed to send message. Please try again.');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (statusDesc) => {
    switch (statusDesc) {
      case 'DELIVRD':
        return 'bg-green-500';
      case 'ACK/':
        return 'bg-blue-500';
      default:
        return 'bg-red-500';
    }
  };

  return (
    <div className='h-screen border overflow-x-hidden max-w-full bg-gray-50'>
      <Toaster />
      <div>
        <TopNavbar />
        <div className='lg:flex block items-center'>
          <div className='lg:w-1/2 w-full p-4 flex justify-center'>
            <form onSubmit={handleSendMessage}>
              <FormTitle title={'Welcome to SMS Send.'} description={'Kindly provide your recipient\'s phone number, a message and hit send.'} />
              <br />
              <InputField
                title={'Recipient\'s Phone Number'}
                placeholder={'Enter recipient\'s phone number'}
                type={'tel'}
                moreClass={'mb-4'}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <TextAreaField
                title={'Message'}
                placeholder={'Type a message ...'}
                moreClass={'mb-3'}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              {isDlrLoading ? (
                <div className="flex items-center justify-center gap-2 p-2">
                  <FaSpinner className="animate-spin text-blue-500" size={24} />
                  <span className="ml-2 text-blue-500">Waiting for delivery report...</span>
                </div>
              ) : (
                dlrResponse.length > 0 && (
                  <div className="overflow-x-auto w-full"> {/* Overflow scrolling only for the table */}
                    <table className="w-full min-w-full table-auto bg-white shadow-md rounded-md">
                      <thead>
                        <tr className="bg-gray-200 text-gray-700">
                          <th className="px-4 py-2">Source</th>
                          <th className="px-4 py-2">Destination</th>
                          <th className="px-4 py-2">Timestamp</th>
                          <th className="px-4 py-2">Status</th>
                          <th className="px-4 py-2">Submit Date</th>
                          <th className="px-4 py-2">Delivery Date</th>
                          <th className="px-4 py-2">Network</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dlrResponse.map((dlr, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-2">{dlr.source}</td>
                            <td className="px-4 py-2">{dlr.destination}</td>
                            <td className="px-4 py-2">{dlr.timestamp}</td>
                            <td className={`px-4 py-2`}>
                              <span className={`${getStatusColor(dlr.status_desc)} rounded-lg text-white px-2`}>{dlr.status_desc}</span>
                            </td>
                            <td className="px-4 py-2">{dlr.submit_date}</td>
                            <td className="px-4 py-2">{dlr.deliv_date}</td>
                            <td className="px-4 py-2">{dlr.network}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}


              <br />
              <FormButton
                title={isLoading ? "Sending..." : `Send`}
                icon={isLoading ? <FaSpinner className='animate-spin' /> : <FaPaperPlane />}
              />
            </form>
          </div>
          <img className='w-1/2 h-[90vh] m-2 hidden lg:block rounded-lg border' src='image.png' alt='SMS illustration' />
        </div>
      </div>
    </div>
  );
}

export default App;
