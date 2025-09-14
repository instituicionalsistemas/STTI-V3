import React from 'react';

const LoadingScreen: React.FC = () => {
    return (
        <div className="loader-wrapper">
            <div className="loader-container">
                <div className="loader triangle">
                    <svg viewBox="0 0 86 80">
                        <polygon points="43 8 79 72 7 72"></polygon>
                    </svg>
                </div>
                <div className="loadingtext">
                    <p>Loading</p>
                </div>
            </div>
            <style>{`
                .loader-wrapper {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    margin: 0;
                    background-color: #0A0F1E; /* dark.background */
                    font-family: sans-serif;
                }

                .loader-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                }

                .loader {
                    --path: #243049; /* dark.border */
                    --dot: #00D1FF; /* dark.primary */
                    --duration: 3s;
                    height: 44px;
                    position: relative;
                    display: inline-block;
                }

                .loader svg {
                    display: block;
                    width: 100%;
                    height: 100%;
                }

                .loader svg polygon {
                    fill: none;
                    stroke: var(--path);
                    stroke-width: 10px;
                    stroke-linejoin: round;
                    stroke-linecap: round;
                    stroke-dasharray: 145 76 145 76;
                    stroke-dashoffset: 0;
                    animation: pathTriangle var(--duration) cubic-bezier(0.785, 0.135, 0.15, 0.86) infinite;
                }

                .loader.triangle {
                    width: 48px;
                }

                .loader.triangle:before {
                    content: "";
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    position: absolute;
                    display: block;
                    background: var(--dot);
                    top: 37px;
                    left: 21px;
                    transform: translate(-10px, -18px);
                    animation: dotTriangle var(--duration) cubic-bezier(0.785, 0.135, 0.15, 0.86) infinite;
                }

                @keyframes pathTriangle {
                    33% {
                        stroke-dashoffset: 74;
                    }

                    66% {
                        stroke-dashoffset: 147;
                    }

                    100% {
                        stroke-dashoffset: 221;
                    }
                }

                @keyframes dotTriangle {
                    33% {
                        transform: translate(0, 0);
                    }

                    66% {
                        transform: translate(10px, -18px);
                    }

                    100% {
                        transform: translate(-10px, -18px);
                    }
                }

                .loadingtext p {
                    color: #E0E0E0; /* dark.text */
                    position: relative;
                    font-size: 1.25rem;
                    margin: 0;
                }

                .loadingtext p::after {
                    position: absolute;
                    animation: b 3s infinite linear;
                    color: #E0E0E0; /* dark.text */
                    content: "";
                    left: 105%;
                }

                @keyframes b {
                    0% {
                        content: "";
                    }

                    10% {
                        content: ".";
                    }

                    40% {
                        content: "..";
                    }

                    70% {
                        content: "...";
                    }

                    100% {
                        content: "";
                    }
                }
            `}</style>
        </div>
    );
};

export default LoadingScreen;
