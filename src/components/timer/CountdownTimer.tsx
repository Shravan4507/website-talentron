import React, { useState, useEffect } from 'react';
import './CountdownTimer.css';

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

interface CountdownTimerProps {
    targetDate: string;
    label: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate, label }) => {
    const calculateTimeLeft = (): TimeLeft => {
        const difference = +new Date(targetDate) - +new Date();
        let timeLeft: TimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }

        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    const formatNumber = (num: number) => num.toString().padStart(2, '0');

    return (
        <div className="countdown-container">
            <h4 className="countdown-label">{label}</h4>
            <div className="timer-grid">
                <div className="timer-segment">
                    <span className="time-val">{formatNumber(timeLeft.days)}</span>
                    <span className="time-unit">Days</span>
                </div>
                <div className="timer-sep">:</div>
                <div className="timer-segment">
                    <span className="time-val">{formatNumber(timeLeft.hours)}</span>
                    <span className="time-unit">Hours</span>
                </div>
                <div className="timer-sep">:</div>
                <div className="timer-segment">
                    <span className="time-val">{formatNumber(timeLeft.minutes)}</span>
                    <span className="time-unit">Mins</span>
                </div>
                <div className="timer-sep">:</div>
                <div className="timer-segment">
                    <span className="time-val">{formatNumber(timeLeft.seconds)}</span>
                    <span className="time-unit">Secs</span>
                </div>
            </div>
        </div>
    );
};

export default CountdownTimer;
