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
  const [responseMessage, setResponseMessage] = useState(''); // New state for response message
  const [isSuccess, setIsSuccess] = useState(false); // New state to track success status
  const [dlrResponse, setDlrResponse] = useState(""); // DLR response
  const [statusDesc, setStatusDesc] = useState(''); // Status description from WebSocket

  const ws = new WebSocket('ws://localhost:5000'); // Your backend WebSocket URL

  // Connection open
  ws.onopen = () => {
    console.log('Connected to WebSocket server');
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Message from server:', data);
    setDlrResponse(event.data);
    setStatusDesc(data.status_desc); // Extract status_desc from the WebSocket message
  };

  // Error handling
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null); // Reset error state
    setResponseMessage(''); // Reset response message
    setIsSuccess(false); // Reset success state

    // Trim values
    const trimmedPhoneNumber = phoneNumber.trim();
    const trimmedMessage = message.trim();

    // Basic validation
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
      callback_url: 'https://2645-154-160-0-198.ngrok-free.app/',
      sender_id: 'Test',
    };

    try {
      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data.status === '1701') { // Ensure you're checking the correct response property
        toast.success('Message sent successfully!');
        setResponseMessage('Message sent successfully!'); // Set success message
        setIsSuccess(true); // Set success state
      } else {
        toast.error("Couldn't send message!");
        setResponseMessage("Couldn't send message !"); // Set error message
        setIsSuccess(false); // Set success state to false
      }

      // Reset fields after successful send
      setPhoneNumber('');
      setMessage('');
    } catch (error) {
      setError('Failed to send message. Please try again.');
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
      setResponseMessage('Failed to send message. Please try again.'); // Set error message
      setIsSuccess(false); // Set success state to false
    } finally {
      setIsLoading(false);
    }
  };

  // Function to return the appropriate class based on status_desc
  const getStatusColor = (statusDesc) => {
    switch (statusDesc) {
      case 'DELIVRD':
        return 'bg-green-500'; // Green for delivered
      case 'ACK':
        return 'bg-blue-500'; // Blue for acknowledgment
      default:
        return 'bg-red-500'; // Red for others
    }
  };

  return (
    <div className='h-screen border bg-gray-50'>
      <Toaster /> {/* Include the Toaster component here */}
      <div>
        <TopNavbar />
        <div className='flex items-center'>
          <div className='w-1/2 flex justify-center'>
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
              {dlrResponse && (
                <div className={`p-4 mb-4 rounded-md text-white ${getStatusColor(statusDesc)}`}>
                  {dlrResponse}
                </div>
              )}

              <FormButton
                title={isLoading ? "Sending..." : `Send`}
                icon={isLoading ? <FaSpinner className='animate-spin' /> : <FaPaperPlane />}
              />
            </form>
          </div>
          <img className='w-1/2 h-[90vh] m-2 rounded-lg border' src='image.png' alt='SMS illustration' />
        </div>
      </div>
    </div>
  );
}

export default App;
