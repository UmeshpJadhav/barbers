// Optional SMS service using Twilio
// To enable, add Twilio credentials to .env file

import twilio from 'twilio';

let twilioClient = null;

// Initialize Twilio client if credentials are available
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

export const sendSMS = async (phoneNumber, message) => {
  if (!twilioClient) {
    console.log('📱 SMS not configured. Message would be:', message);
    return false;
  }

  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
    console.log(`✅ SMS sent to ${phoneNumber}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending SMS:', error);
    return false;
  }
};

export const notifyCustomerTurn = async (customerName, phoneNumber, queueNumber) => {
  const message = `Hello ${customerName}! Your turn has come. Queue number: ${queueNumber}. Please come to the barbershop.`;
  return await sendSMS(phoneNumber, message);
};

export const notifyQueueJoined = async (customerName, phoneNumber, queueNumber, position, waitTime) => {
  const message = `Hello ${customerName}! You've joined the queue. Your number is ${queueNumber}, position: ${position}. Estimated wait: ${waitTime} minutes.`;
  return await sendSMS(phoneNumber, message);
};

