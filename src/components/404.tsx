import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@heroui/button";

const NotFound = () => {
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    if (countdown === 0) {
      navigate('/');
    }

    return () => clearInterval(timer);
  }, [countdown, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-black">
      <div className="text-center">
        <div className="mb-8">
          <div className="flex justify-center items-center">
            <img
              src="/sadcow.webp"
              alt="404 cow"
              className="w-48 h-auto object-contain"
            />
          </div>
          <h1 className="text-8xl font-black text-red-600 dark:text-red-400">
            404
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 mt-4">
            Oops! The page you were looking for doesn't exist.
          </p>
          <p className="text-gray-500 dark:text-gray-400 mt-4">
            Redirecting you back to home in{' '}
            <span className="font-semibold">{countdown}</span> seconds...
          </p>
          <Button
            className="mt-6"
            onClick={() => navigate('/')}
            variant="bordered"
            size="lg"
          >
            Or go back now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
