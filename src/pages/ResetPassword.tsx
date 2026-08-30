import { useState, type FormEvent } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import axios from 'axios';

import showIcon from '../assets/show password.svg';
import hideIcon from '../assets/hide password.svg';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return setError('პაროლები ერთმანეთს არ ემთხვევა');
    }

    if (!token) {
      return setError('არასწორი ბმული');
    }

    setError('');
    setLoading(true);

    try {
      await API.post('/auth/reset-password', {
        token,
        newPassword,
      });

      setMessage('Password successfully changed! Redirecting...');

      setTimeout(() => navigate('/login'), 2500);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
          'Error while changing password'
        );
      } else {
        setError('unknown error');
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
          Reset Your Password
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
              new password
            </label>

            <div
              className="
                relative
              "
            >
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="
                  w-full

                  rounded-xl
                  border
                  border-gray-700/60
                  bg-[#1c1f26]/60

                  p-3
                  pr-10

                  text-white
                  placeholder-gray-500

                  focus:border-blue-500
                  focus:outline-none
                "
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="
                  absolute
                  right-3
                  top-1/2

                  -translate-y-1/2

                  opacity-70
                  transition

                  hover:opacity-100
                "
              >
                <img
                  src={showPassword ? hideIcon : showIcon}
                  alt="toggle new password"
                  className="
                    h-5
                    w-5
                  "
                />
              </button>
            </div>
          </div>

          <div>
            <label
              className="
                mb-1
                block
                text-sm
                font-medium
              "
            >
              Repeat Password
            </label>

            <div
              className="
                relative
              "
            >
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="
                  w-full

                  rounded-xl
                  border
                  border-gray-700/60
                  bg-[#1c1f26]/60

                  p-3
                  pr-10

                  text-white
                  placeholder-gray-500

                  focus:border-blue-500
                  focus:outline-none
                "
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="
                  absolute
                  right-3
                  top-1/2

                  -translate-y-1/2

                  opacity-70
                  transition

                  hover:opacity-100
                "
              >
                <img
                  src={showConfirmPassword ? hideIcon : showIcon}
                  alt="toggle confirm password"
                  className="
                    h-5
                    w-5
                  "
                />
              </button>
            </div>
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
            {loading ? 'Save...' : 'Update password'}
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
          <Link
            to="/login"
            className="
              text-blue-400
              hover:underline
            "
          >
            Back to Login page
          </Link>
        </p>
      </div>
    </div>
  );
}