// Optional SMS service using Twilio
// To enable, add Twilio credentials to .env file

import twilio from 'twilio';

let twilioClient = null;

// Initialize Twilio client if credentials are available
// Lazy initialization to ensure env vars are loaded
const getTwilioClient = () => {
  if (twilioClient) return twilioClient;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    console.warn('⚠️ Twilio credentials missing in .env file');
    return null;
  }

  try {
    console.log(`🔧 Configuring Twilio with SID: ${accountSid.slice(0, 5)}...`);
    twilioClient = twilio(accountSid, authToken);
    return twilioClient;
  } catch (err) {
    console.error('❌ Failed to initialize Twilio client:', err.message);
    return null;
  }
};

export const sendSMS = async (phoneNumber, message) => {
  const client = getTwilioClient();

  if (!client) {
    console.log('📱 SMS Service Skipped (Not Configured). Message:', message);
    return false;
  }

  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  if (!fromNumber) {
    console.error('❌ Error: TWILIO_PHONE_NUMBER is missing in .env file');
    return false;
  }

  // Ensure E.164 format (Default to India +91 if missing)
  let formattedPhone = phoneNumber.replace(/\s+/g, ''); // Remove spaces
  if (!formattedPhone.startsWith('+')) {
    formattedPhone = `+91${formattedPhone}`;
  }

  // Auto-detect WhatsApp mode
  // If 'From' is whatsapp, 'To' must also be whatsapp
  if (fromNumber.startsWith('whatsapp:') && !formattedPhone.startsWith('whatsapp:')) {
    console.log('🔄 Detected WhatsApp Configuration. formatting destination number...');
    formattedPhone = `whatsapp:${formattedPhone}`;
  }

  try {
    console.log(`📨 Attempting to send message from ${fromNumber} to ${formattedPhone}...`);
    const response = await client.messages.create({
      body: message,
      from: fromNumber,
      to: formattedPhone,
    });
    console.log(`✅ SMS sent successfully! SID: ${response.sid}`);
    return true;
  } catch (error) {
    console.error('❌ Twilio Error:', error.message);
    if (error.code === 21211) console.error('   -> Invalid Phone Number');
    if (error.code === 21608) console.error('   -> Unverified Verified Caller ID (Trial Account limitation?)');
    if (error.code === 20003) console.error('   -> Authentication Error (Check SID/Token)');
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

