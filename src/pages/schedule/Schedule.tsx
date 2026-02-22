import React from 'react';
import { scheduleData } from '../../data/scheduleData';
import OutlinedTitle from '../../components/heading/OutlinedTitle';
import CountdownTimer from '../../components/timer/CountdownTimer';
import './Schedule.css';

const Schedule: React.FC = () => {
    return (
        <div className="schedule-page">
            <div className="schedule-header">
                <div className="subtitle-wrapper">
                    <OutlinedTitle 
                        text="MARK YOUR CALENDAR" 
                        className="small"
                        fillColor="linear-gradient(180deg, #00d1ff 0%, #0047ff 100%)" 
                        outlineColor="#000000" 
                        shadowColor="#000000"
                        hasGrain={true}
                    />
                </div>
                <div className="main-title-wrapper">
                    <OutlinedTitle 
                        text="FESTIVAL LINEUP" 
                        fillColor="linear-gradient(180deg, #f0ff00 0%, #ff00ea 100%)" 
                        outlineColor="#000000" 
                        shadowColor="#000000"
                        hasGrain={true}
                    />
                </div>
                <div className="venue-bar">
                    <span className="location-icon">📍</span>
                    <p>Zeal College of Engineering and Research, Narhe, Pune</p>
                </div>
            </div>

            <div className="milestones-grid">
                <CountdownTimer 
                    label="Registrations Close" 
                    targetDate="March 15, 2026 23:59:59" 
                />
                <CountdownTimer 
                    label="Elimination Rounds" 
                    targetDate="March 16, 2026 09:00:00" 
                />
                <CountdownTimer 
                    label="The Main Event" 
                    targetDate="March 23, 2026 09:00:00" 
                />
            </div>

            <div className="timeline-container">
                <div className="timeline-track"></div>
                
                <div className="events-list">
                    {scheduleData.map((day) => (
                        <div key={day.day} className="day-group">
                            <div className="timeline-date-header">
                                <span>{day.date}</span>
                            </div>
                            {day.events.map((event, idx) => (
                                <div 
                                    key={event.id} 
                                    className={`schedule-card-wrapper ${(day.day + idx) % 2 === 0 ? 'left' : 'right'}`}
                                >
                                    <div className={`schedule-card ${event.type}`}>
                                        <div className="event-time">{event.time}</div>
                                        <div className="card-main">
                                            <span className="event-category">{event.category}</span>
                                            <h3>{event.name}</h3>
                                            <p className="event-venue">📍 {event.venue}</p>
                                            <div className="event-divider"></div>
                                            <p className="event-desc">{event.description}</p>
                                        </div>
                                        {event.type === 'flagship' && <div className="flagship-mark">FLAGSHIP</div>}
                                    </div>
                                    <div className="timeline-node"></div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Schedule;
