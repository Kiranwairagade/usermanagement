import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000/chatbot'; // Flask API URL

// Function to send a message to the chatbot API
export const sendMessageToChatbot = async (message) => {
  try {
    const response = await axios.post(API_URL, { message });
    return response.data; // Returns response data from Flask
  } catch (error) {
    console.error('Error sending message to chatbot:', error);
    throw error; // Throw error to be handled later
  }
};
