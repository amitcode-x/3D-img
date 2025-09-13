import React, { useState, useEffect, useRef } from 'react';

const Carousel3D = () => {
  // Sample images - replace with your own
  const images = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=400&fit=crop',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=500&h=400&fit=crop',
    'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=500&h=400&fit=crop',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&h=400&fit=crop',
    'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=500&h=400&fit=crop',
    'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=500&h=400&fit=crop',
    'https://images.unsplash.com/photo-1484591974057-265bb767ef71?w=500&h=400&fit=crop',
    'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=500&h=400&fit=crop',
    'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=500&h=400&fit=crop',
    'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=500&h=400&fit=crop',
  ];

  const [baseRotationY, setBaseRotationY] = useState(0);
  const [scrollRotationY, setScrollRotationY] = useState(0);
  const [rotationX, setRotationX] = useState(0);
  const containerRef = useRef(null);

  const totalImages = images.length;
  const radius = 400;
  const centerAngle = 360 / totalImages;
  const autoRotateSpeed = 0.2;

  // Auto rotation effect
  useEffect(() => {
    let animationId;
    const animate = () => {
      setBaseRotationY(prev => prev + autoRotateSpeed);
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  // Scroll handler
  useEffect(() => {
    const handleScroll = (e) => {
      e.preventDefault();
      
      const scrollSensitivity = 0.5;
      const deltaY = e.deltaY;
      
      // Vertical scroll rotates Y-axis (horizontal rotation)
      setScrollRotationY(prev => prev + deltaY * scrollSensitivity);
      
      // Horizontal scroll (if available) rotates X-axis (vertical rotation)
      if (e.deltaX) {
        setRotationX(prev => Math.max(-60, Math.min(60, prev + e.deltaX * scrollSensitivity * 0.3)));
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleScroll, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleScroll);
      }
    };
  }, []);

  // Touch scroll for mobile
  useEffect(() => {
    let startY = 0;
    let startX = 0;

    const handleTouchStart = (e) => {
      startY = e.touches[0].clientY;
      startX = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;
      const deltaY = startY - currentY;
      const deltaX = startX - currentX;
      
      const touchSensitivity = 1;
      setScrollRotationY(prev => prev + deltaY * touchSensitivity);
      setRotationX(prev => Math.max(-60, Math.min(60, prev + deltaX * touchSensitivity * 0.3)));
      
      startY = currentY;
      startX = currentX;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('touchstart', handleTouchStart, { passive: false });
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
      }
    };
  }, []);

  const totalRotationY = baseRotationY + scrollRotationY;
  
  const getCurrentIndex = () => {
    const normalizedRotation = (((-totalRotationY % 360) + 360) % 360);
    return Math.floor(normalizedRotation / centerAngle);
  };

  const currentIndex = getCurrentIndex();

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden"
      style={{ height: '100vh', width: '100vw' }}
    >
      {/* Background particles effect */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Main Carousel Container */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="relative w-full h-full flex items-center justify-center"
          style={{ 
            perspective: '2000px',
            perspectiveOrigin: 'center center'
          }}
        >
          <div
            className="relative"
            style={{
              transformStyle: 'preserve-3d',
              transform: `rotateX(${rotationX}deg) rotateY(${totalRotationY}deg)`,
              width: '100%',
              height: '100%'
            }}
          >
            {images.map((image, index) => {
              const angle = index * centerAngle;
              const isCenter = Math.abs(((angle - totalRotationY) % 360 + 540) % 360 - 180) < centerAngle / 2;
              
              return (
                <div
                  key={index}
                  className="absolute select-none"
                  style={{
                    left: '50%',
                    top: '50%',
                    width: '320px',
                    height: '240px',
                    transformOrigin: '50% 50%',
                    transform: `
                      translate(-50%, -50%)
                      rotateY(${angle}deg)
                      translateZ(${radius}px)
                    `,
                  }}
                >
                  <div className="relative w-full h-full group">
                    <img
                      src={image}
                      alt={`Slide ${index + 1}`}
                      className={`w-full h-full object-cover rounded-2xl shadow-2xl transition-all duration-500 ${
                        isCenter ? 'opacity-100 scale-110' : 'opacity-70 scale-100'
                      }`}
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                    />
                    
                    {/* Enhanced glow for center image */}
                    {isCenter && (
                      <div className="absolute inset-0 rounded-2xl ring-4 ring-white/50 shadow-2xl shadow-white/30 animate-pulse"></div>
                    )}
                    
                    {/* Image indicator */}
                    <div className={`absolute bottom-4 right-4 px-3 py-2 rounded-full font-bold transition-all duration-300 ${
                      isCenter 
                        ? 'bg-white text-black shadow-lg scale-110' 
                        : 'bg-black/70 text-white'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fixed UI Elements */}
      <div className="fixed top-8 left-8 z-10">
        <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 text-white">
          <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-300">
            3D Carousel
          </h1>
          <p className="text-sm opacity-80 mb-4">Auto-rotating + Scroll Control</p>
          
          {/* Current image info */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs opacity-70">Current:</span>
              <span className="text-lg font-bold text-yellow-300">#{currentIndex + 1}</span>
            </div>
            <div className="text-xs opacity-70">
              <div>Y: {Math.round(totalRotationY)}°</div>
              <div>X: {Math.round(rotationX)}°</div>
            </div>
          </div>
        </div>
      </div>

      {/* Dot indicators */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex gap-3 bg-black/30 backdrop-blur-md rounded-full px-6 py-3">
          {images.map((_, index) => (
            <div
              key={index}
              className={`rounded-full transition-all duration-500 ${
                index === currentIndex
                  ? 'w-4 h-4 bg-white shadow-lg shadow-white/50 scale-125'
                  : 'w-3 h-3 bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="fixed bottom-8 right-8 z-10">
        <div className="bg-black/30 backdrop-blur-md rounded-2xl p-4 text-white text-sm max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="font-semibold">3D Carousel</span>
          </div>
          <div className="space-y-1 text-xs opacity-80">
            <div>🖱️ <strong>Scroll Up/Down:</strong> Tilt carousel vertically</div>
            <div>🖱️ <strong>Scroll Left/Right:</strong> Rotate carousel</div>
            <div>📱 <strong>Swipe:</strong> Full 3D control</div>
            <div>✨ <strong>Hover:</strong> Glow effects</div>
            <div>🔄 <strong>Auto-rotate:</strong> Always active</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Carousel3D;