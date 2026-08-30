import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import API from '../api/axios';
import axios from 'axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await API.post('/auth/forgot-password', { email });

      const {
        resetLink,
        to_email,
        to_name,
      } = res.data;

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          to_name: to_name || 'User',
          to_email: to_email,
          reset_link: resetLink,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      setMessage(
        'Password reset instructions sent to your email!'
      );
    } catch (err: unknown) {
      console.log(
        'Forgot Password Catch Error:',
        err
      );

      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
          'Something went wrong.'
        );
      } else {
        setError('Failed to send email.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        relative
        w-full
        max-w-md
      "
    >
      <div
        className="
          absolute
          -inset-1

          rounded-3xl
          bg-linear-to-r
          from-blue-600/30
          via-indigo-500/20
          to-blue-600/30

          opacity-70
          blur-2xl
        "
      />

      <div
        className="
          relative

          rounded-3xl
          border
          border-gray-800/80

          bg-[#13151b]/70
          p-8

          text-white
          shadow-2xl
          backdrop-blur-md
        "
      >
        <h2
          className="
            mb-6

            text-center
            text-3xl
            font-bold
          "
        >
          Password Reset
        </h2>

        {message && (
          <div
            className="
              mb-4

              rounded-lg
              border
              border-green-500
              bg-green-500/20

              p-3

              text-center
              text-sm
              text-green-400
            "
          >
            {message}
          </div>
        )}

        {error && (
          <div
            className="
              mb-4

              rounded-lg
              border
              border-red-500
              bg-red-500/20

              p-3

              text-center
              text-sm
              text-red-400
            "
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="
            space-y-4
          "
        >
          <div>
            <label
              className="
                mb-1
                block

                text-sm
                font-medium
              "
            >
              Your Email
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              className="
                w-full

                rounded-xl
                border
                border-gray-700/60
                bg-[#1c1f26]/60

                p-3

                text-white
                placeholder-gray-500

                focus:border-blue-500
                focus:outline-none
              "
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="
              w-full

              rounded-xl
              bg-blue-600

              py-3

              font-semibold
              transition
              duration-200

              hover:bg-blue-700

              disabled:opacity-50
            "
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </form>

        <p
          className="
            mt-6

            text-center
            text-sm
            text-gray-400
          "
        >
          Remember Password?{' '}

          <Link
            to="/login"
            className="
              text-blue-400
              hover:underline
            "
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}