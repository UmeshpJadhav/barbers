# Twilio SMS & WhatsApp Support Guide

Here is how the notification system works and how to set it up.

## 🔄 How it Works
1.  **Trigger**: A customer clicks **"Join Queue"** or the Barber clicks **"Serve Customer"**.
2.  **Backend**: The server (`queue.js`) detects this event.
3.  **Service**: The code (`smsService.js`) sends a request to Twilio.
4.  **Delivery**: Twilio sends the SMS or WhatsApp message to the customer's phone `+91...`.

---

## 📱 SMS vs WhatsApp (Important!)

### Option A: Standard SMS (Recommended for Starters)
*   **Pros**: Works instantly with any text. No approvals needed.
*   **Cons**: Costs money per SMS (around ₹0.20 - ₹2.00 depending on carrier).
*   **Setup**: Buy a phone number on Twilio ($1/month).

### Option B: WhatsApp API
*   **Pros**: Everyone uses WhatsApp. Richer experience.
*   **Cons**: **Strict Rules**. You cannot send *any* text to a user first. You MUST use **Templates** approved by Facebook (e.g., *"Your appointment is confirmed"*).
*   **Sandbox**: For testing, you can use the Twilio WhatsApp Sandbox, but users must message "join <code-word>" to your bot first.

---

## 🛠️ Step-by-Step Setup (For SMS)

1.  **Sign Up**: Go to [Twilio.com](https://www.twilio.com/) and create a free account.
2.  **Get Number**: Get a trial phone number.
3.  **Get Credentials**: Copy your:
    *   **Account SID**
    *   **Auth Token**
4.  **Add to Render**:
    *   Go to Render Dashboard -> Environment Variables.
    *   Add `TWILIO_ACCOUNT_SID`: (paste value)
    *   Add `TWILIO_AUTH_TOKEN`: (paste value)
    *   Add `TWILIO_PHONE_NUMBER`: (your twilio number, e.g., `+12025550123`)

## 💻 Enabling WhatsApp in Code
To switch from SMS to WhatsApp, we only need to change one line in `backend/services/smsService.js`:

```javascript
// Current (SMS)
from: process.env.TWILIO_PHONE_NUMBER,
to: phoneNumber

// WhatsApp Change
from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
to: `whatsapp:${phoneNumber}`
```

*I recommend starting with SMS first to test, as WhatsApp requires Template approval for production.*
