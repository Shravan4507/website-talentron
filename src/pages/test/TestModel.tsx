import React, { useState } from 'react';
import ModelPortal from '../../components/modal/ModelPortal';
import OutlinedTitle from '../../components/heading/OutlinedTitle';
import './TestModel.css';
import { assetPath } from '../../utils/assetPath';

const TestModel: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="test-model-page">
            <div className="test-header">
                <OutlinedTitle 
                    text="MODEL COMPONENT TEST" 
                    fillColor="linear-gradient(180deg, #00d4ff 0%, #0044ff 100%)"
                    hasGrain={true}
                />
                <p className="test-desc">
                    Testing the new unified ModelPortal component with high-fidelity glassmorphism.
                </p>
                <button 
                    className="open-modal-btn"
                    onClick={() => setIsModalOpen(true)}
                >
                    Show overlay model
                </button>
            </div>

            <ModelPortal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                image={assetPath("/assets/cards/drama.webp")}
            >
                <div className="test-modal-content">
                    <div className="test-modal-header">
                        <h2>System Verification</h2>
                        <div className="status-badge">Ready</div>
                    </div>
                    
                    <div className="test-modal-body">
                        <p>The ModelPortal is now active. This component features:</p>
                        <ul>
                            <li>20px High-Fidelity Backdrop Blur</li>
                            <li>React Portal Architecture</li>
                            <li>Automatic Scroll Locking</li>
                            <li>Synchronized Entrance Animations</li>
                            <li>Unified Close Button System</li>
                        </ul>
                    </div>

                    <div className="test-modal-footer">
                        <button 
                            className="close-confirm-btn"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Understood
                        </button>
                    </div>
                </div>
            </ModelPortal>
        </div>
    );
};

export default TestModel;
