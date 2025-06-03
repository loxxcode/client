// pages/api/auth/login.js (for Next.js on Vercel)

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // handle login logic
    // authentication logic would use req.body here
    // const { email, password } = req.body;
    return res.status(200).json({ message: 'Logged in' });
  } else {
    // method not allowed
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
