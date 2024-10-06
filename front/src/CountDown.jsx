import { useState, useEffect } from 'react';

const useCountdown = (seconds) => {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    if (!timeLeft) return;

    const intervalId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft]);

  return timeLeft;
};

// Usage in your component:
const CountdownClock = ({ seconds, onComplete }) => {
  const timeLeft = useCountdown(seconds);

  useEffect(() => {
    if (timeLeft === 0) {
      onComplete();
    }
  }, [timeLeft, onComplete]);

  return (
    <div style={{
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      backgroundColor: '#FF1493',
      opacity: 0.7,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      fontSize: '20px'
    }}>
      {timeLeft}
    </div>
  );
};

export default CountdownClock;