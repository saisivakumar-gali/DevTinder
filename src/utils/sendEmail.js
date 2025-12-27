const { Resend } = require("resend");

// Initialize Resend with your API Key
const resend = new Resend(process.env.RESEND_API_KEY);

const sendRequestEmail = async (toEmail, firstName, requestCount) => {
  try {
    const data = await resend.emails.send({
      from: "DevTinder <onboarding@resend.dev>", // Change this once you verify a domain
      to: toEmail,
      subject: "New Connection Requests on DevTinder! 🚀",
      html: `
        <div style="font-family: sans-serif; line-height: 1.5;">
          <h2>Hi ${firstName},</h2>
          <p>You have <strong>${requestCount}</strong> new connection requests waiting for your approval.</p>
          <p>Log in now to see who wants to connect with you!</p>
          <a href="https://dev-tinder-web-dusky.vercel.app/requests" 
             style="background: #E91E63; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
             View Requests
          </a>
        </div>
      `,
    });
    return data;
  } catch (error) {
    console.error("Resend Error:", error);
  }
};

module.exports = sendRequestEmail;