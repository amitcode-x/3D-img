import React, { useState, useEffect, useRef } from 'react';

const Carousel3D = () => {
  // Sample images - replace with your own
  const images = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1484591974057-265bb767ef71?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=800&h=600&fit=crop',
  ];

  const [baseRotationY, setBaseRotationY] = useState(0);
  const [scrollRotationY, setScrollRotationY] = useState(0);
  const [rotationX, setRotationX] = useState(0);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);

  const totalImages = images.length;
  const centerAngle = 360 / totalImages;
  const autoRotateSpeed = 0.15;

  // Get responsive dimensions
  const getResponsiveDimensions = () => {
    const width = windowSize.width || (typeof window !== 'undefined' ? window.innerWidth : 1920);
    const height = windowSize.height || (typeof window !== 'undefined' ? window.innerHeight : 1080);
    
    let imageWidth, imageHeight, radius;
    
    if (width <= 640) { // Mobile
      imageWidth = Math.min(width * 0.7, 200);
      imageHeight = imageWidth * 1.3;
      radius = Math.max(width * 0.6, 250);
    } else if (width <= 1024) { // Tablet
      imageWidth = Math.min(width * 0.25, 280);
      imageHeight = imageWidth * 1.2;
      radius = Math.max(width * 0.5, 350);
    } else { // Desktop
      imageWidth = Math.min(width * 0.18, 320);
      imageHeight = imageWidth * 1.15;
      radius = Math.max(width * 0.35, 450);
    }
    
    return { imageWidth, imageHeight, radius };
  };

  const { imageWidth, imageHeight, radius } = getResponsiveDimensions();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Scroll handler with responsive sensitivity
  useEffect(() => {
    const handleScroll = (e) => {
      e.preventDefault();
      
      const scrollSensitivity = windowSize.width <= 640 ? 0.3 : 0.5;
      const deltaY = e.deltaY;
      
      // Vertical scroll rotates Y-axis (horizontal rotation)
      setScrollRotationY(prev => prev + deltaY * scrollSensitivity);
      
      // Horizontal scroll (if available) rotates X-axis (vertical rotation)
      if (e.deltaX) {
        const maxRotationX = windowSize.width <= 640 ? 45 : 60;
        setRotationX(prev => Math.max(-maxRotationX, Math.min(maxRotationX, prev + e.deltaX * scrollSensitivity * 0.3)));
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
  }, [windowSize.width]);

  // Enhanced touch controls for mobile
  useEffect(() => {
    let startY = 0;
    let startX = 0;
    let isTouch = false;

    const handleTouchStart = (e) => {
      isTouch = true;
      startY = e.touches[0].clientY;
      startX = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
      if (!isTouch) return;
      e.preventDefault();
      
      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;
      const deltaY = startY - currentY;
      const deltaX = startX - currentX;
      
      const touchSensitivity = windowSize.width <= 640 ? 1.5 : 1;
      const maxRotationX = windowSize.width <= 640 ? 45 : 60;
      
      setScrollRotationY(prev => prev + deltaY * touchSensitivity);
      setRotationX(prev => Math.max(-maxRotationX, Math.min(maxRotationX, prev + deltaX * touchSensitivity * 0.3)));
      
      startY = currentY;
      startX = currentX;
    };

    const handleTouchEnd = () => {
      isTouch = false;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('touchstart', handleTouchStart, { passive: false });
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
      container.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    return () => {
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [windowSize.width]);

  const totalRotationY = baseRotationY + scrollRotationY;
  
  const getCurrentIndex = () => {
    const normalizedRotation = (((-totalRotationY % 360) + 360) % 360);
    return Math.floor(normalizedRotation / centerAngle);
  };

  const currentIndex = getCurrentIndex();

  // Responsive perspective
  const perspectiveValue = windowSize.width <= 640 ? '1000px' : windowSize.width <= 1024 ? '1500px' : '2000px';

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden"
      style={{ height: '100vh', width: '100vw', touchAction: 'none' }}
    >
      {/* Enhanced background particles effect */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(windowSize.width <= 640 ? 30 : 60)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              width: windowSize.width <= 640 ? '2px' : '3px',
              height: windowSize.width <= 640 ? '2px' : '3px',
              backgroundColor: i % 3 === 0 ? '#fff' : i % 3 === 1 ? '#a855f7' : '#06b6d4',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Floating gradient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(windowSize.width <= 640 ? 3 : 5)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-10 animate-pulse"
            style={{
              width: windowSize.width <= 640 ? '200px' : '300px',
              height: windowSize.width <= 640 ? '200px' : '300px',
              background: `radial-gradient(circle, ${
                i % 2 === 0 ? 'rgba(168, 85, 247, 0.3)' : 'rgba(6, 182, 212, 0.3)'
              } 0%, transparent 70%)`,
              left: `${20 + (i * 20)}%`,
              top: `${10 + (i * 15)}%`,
              animationDelay: `${i * 2}s`,
              animationDuration: '6s',
              filter: 'blur(1px)'
            }}
          />
        ))}
      </div>

      {/* Main Carousel Container */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="relative w-full h-full flex items-center justify-center"
          style={{ 
            perspective: perspectiveValue,
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
            {/* Center 3D Cube */}
            <div 
              className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
              style={{ 
                perspective: '800px',
                perspectiveOrigin: 'center center'
              }}
            >
              <div 
                className="relative group"
                style={{
                  width: windowSize.width <= 640 ? '120px' : windowSize.width <= 1024 ? '160px' : '200px',
                  height: windowSize.width <= 640 ? '120px' : windowSize.width <= 1024 ? '160px' : '200px',
                  transformStyle: 'preserve-3d',
                  transform: `rotateX(${rotationX * 0.5}deg) rotateY(${totalRotationY * 0.8}deg)`,
                  transition: 'transform 0.1s ease-out'
                }}
              >
                {/* Cube faces */}
                {[
                  { face: 'front', transform: 'translateZ(100px)', image: images[0] },
                  { face: 'back', transform: 'rotateY(180deg) translateZ(100px)', image: images[1] },
                  { face: 'right', transform: 'rotateY(90deg) translateZ(100px)', image: images[2] },
                  { face: 'left', transform: 'rotateY(-90deg) translateZ(100px)', image: images[3] },
                  { face: 'top', transform: 'rotateX(90deg) translateZ(100px)', image: images[4] },
                  { face: 'bottom', transform: 'rotateX(-90deg) translateZ(100px)', image: images[5] }
                ].map((face, index) => (
                  <div
                    key={face.face}
                    className="absolute inset-0"
                    style={{
                      transform: face.transform,
                      transformOrigin: 'center center'
                    }}
                  >
                    <img
                      src={face.image}
                      alt={`Cube ${face.face}`}
                      className="w-full h-full object-cover rounded-lg shadow-xl"
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                      loading="eager"
                    />
                    
                    {/* Face overlay with gradient */}
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-transparent via-transparent to-black/20 pointer-events-none"></div>
                  </div>
                ))}
                
                {/* Cube glow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none"
                     style={{
                       transform: 'translateZ(101px)',
                       boxShadow: '0 0 30px rgba(255, 215, 0, 0.6), inset 0 0 30px rgba(255, 215, 0, 0.2)',
                       borderRadius: '8px'
                     }}>
                </div>
              </div>
            </div>

            {images.map((image, index) => {
              const angle = index * centerAngle;
              const isCenter = Math.abs(((angle - totalRotationY) % 360 + 540) % 360 - 180) < centerAngle / 2;
              const distanceFromCenter = Math.abs(((angle - totalRotationY) % 360 + 540) % 360 - 180);
              const opacity = Math.max(0.4, 1 - (distanceFromCenter / 180) * 0.6);
              
              return (
                <div
                  key={index}
                  className="absolute select-none"
                  style={{
                    left: '50%',
                    top: '50%',
                    width: `${imageWidth}px`,
                    height: `${imageHeight}px`,
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
                      className={`w-full h-full object-cover rounded-xl sm:rounded-2xl shadow-2xl transition-all duration-700 ${
                        isCenter ? 'scale-110 sm:scale-110' : 'scale-100'
                      }`}
                      style={{ opacity }}
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                      loading="lazy"
                    />
                    
                    {/* Enhanced glow for hovered image */}
                    <div className="absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 ring-2 sm:ring-4 ring-white/60 shadow-2xl shadow-white/40 pointer-events-none"></div>
                    <div className="absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 bg-gradient-to-t from-transparent via-transparent to-white/10 pointer-events-none"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Minimal dot indicators - only visible on larger screens */}
      <div className="hidden sm:block fixed bottom-6 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex gap-2 bg-black/20 backdrop-blur-md rounded-full px-4 py-2">
          {images.map((_, index) => (
            <div
              key={index}
              className={`rounded-full transition-all duration-500 ${
                index === currentIndex
                  ? 'w-3 h-3 bg-white shadow-lg shadow-white/50 scale-110'
                  : 'w-2 h-2 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Mobile-friendly touch hint */}
      <div className="sm:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-black/30 backdrop-blur-md rounded-full px-4 py-2 text-white text-xs animate-bounce">
          Swipe to explore
        </div>
      </div>

      {/* Subtle title overlay */}
      <div className="absolute top-4 sm:top-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="text-center">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-300 to-cyan-300 animate-pulse">
            3D Gallery
          </h1>
        </div>
      </div>
    </div>
  );
};

export default Carousel3D;