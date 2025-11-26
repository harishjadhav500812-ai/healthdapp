
import React from 'react';

export const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#020408] perspective-1000">
      
      {/* Moving Cyber Grid */}
      <div className="absolute inset-0 opacity-20 transform-gpu"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(6, 182, 212, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
          transform: 'perspective(500px) rotateX(60deg) translateY(-100px) scale(2)',
          animation: 'gridMove 20s linear infinite'
        }}
      />
      
      <style>{`
        @keyframes gridMove {
          0% { background-position: 0 0; }
          100% { background-position: 0 40px; }
        }
        @keyframes float-particle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.8; }
        }
      `}</style>

      {/* Deep Atmosphere Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] rounded-full bg-neonIndigo/5 blur-[150px] animate-pulse-slow" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[80vw] h-[80vw] rounded-full bg-neonCyan/5 blur-[150px] animate-pulse-slow" style={{ animationDelay: '4s' }} />

      {/* Floating DNA/Data Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute flex items-center gap-1 opacity-20"
            style={{
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animation: `float-particle ${Math.random() * 10 + 10}s ease-in-out infinite`,
              animationDelay: Math.random() * 5 + 's',
            }}
          >
             <div className="w-1 h-1 bg-neonCyan rounded-full box-shadow-glow"></div>
             {Math.random() > 0.5 && <div className="w-8 h-[1px] bg-gradient-to-r from-neonCyan/50 to-transparent"></div>}
          </div>
        ))}
      </div>
      
      {/* Noise Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>
    </div>
  );
};
