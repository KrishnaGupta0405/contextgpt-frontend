'use client';

import React, { useState, useEffect, useRef } from 'react';
// import Image from 'next/image';
import { LayoutDashboard, BarChart2, MessageSquare, Settings, Plug } from 'lucide-react';

const tabs = [
  { id: 'dashboard',     label: 'Dashboard',     icon: LayoutDashboard, image: '/landing/dashboard.avif' },
  { id: 'analytics',    label: 'Analytics',     icon: BarChart2,        image: '/landing/analytics.avif' },
  { id: 'conversations', label: 'Conversations', icon: MessageSquare,   image: '/landing/conversations.avif' },
  // { id: 'settings',     label: 'Settings',      icon: Settings,         image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=675&fit=crop' },
  { id: 'integrations', label: 'Integrations',  icon: Plug,             image: '/landing/integrations.avif' },
];

const ANIMATION_DURATION = 1400;
const INDICATOR_SCALE = 0.1;
const INDICATOR_WIDTH = 1200;

const tabBarStyles = `
  .tab-indicator {
    transform: translateX(0) scaleX(${INDICATOR_SCALE});
    transform-origin: center;
    will-change: transform, width;
  }
`;

const ShowcaseCarousel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [exitingTab, setExitingTab] = useState(null);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const tabRefs = useRef({});
  const navRef = useRef(null);
  const exitTimer = useRef(null);
  const gapTimer = useRef(null);
  const activeTabRef = useRef('dashboard');
  const indicatorRef = useRef(null);
  const indicatorAnim = useRef(null);
  const currentX = useRef(0);
  const currentWidth = useRef(0);

  const measure = (tabId) => {
    const btn = tabRefs.current[tabId];
    const nav = navRef.current;
    if (!btn || !nav) return null;
    const navRect = nav.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    return { x: btnRect.left - navRect.left, width: btnRect.width };
  };

  const setIndicatorTo = (tabId) => {
    const m = measure(tabId);
    const el = indicatorRef.current;
    if (!m || !el) return;
    const centerX = m.x + m.width / 2 - INDICATOR_WIDTH / 2;
    currentX.current = centerX;
    currentWidth.current = INDICATOR_WIDTH;
    el.style.width = `${INDICATOR_WIDTH}px`;
    el.style.transform = `translateX(${centerX}px) scaleX(${INDICATOR_SCALE})`;
  };

  const animateIndicatorTo = (tabId) => {
    const el = indicatorRef.current;
    const m = measure(tabId);
    if (!el || !m) return;

    if (indicatorAnim.current) indicatorAnim.current.cancel();

    const fromX = currentX.current;
    const toX = m.x + m.width / 2 - INDICATOR_WIDTH / 2;
    const dx = toX - fromX;

    indicatorAnim.current = el.animate(
      [
        { transform: `translateX(${fromX}px) scaleX(${INDICATOR_SCALE})`, offset: 0 },
        { transform: `translateX(${toX + dx * 0.20}px) scaleX(${INDICATOR_SCALE})`, offset: 0.4 },
        { transform: `translateX(${toX - dx * 0.07}px) scaleX(${INDICATOR_SCALE})`, offset: 0.7 },
        { transform: `translateX(${toX + dx * 0.01}px) scaleX(${INDICATOR_SCALE})`, offset: 0.9 },
        { transform: `translateX(${toX}px) scaleX(${INDICATOR_SCALE})`, offset: 1 },
      ],
      {
        duration: ANIMATION_DURATION,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'forwards',
      }
    );

    indicatorAnim.current.onfinish = () => {
      el.style.transform = `translateX(${toX}px) scaleX(${INDICATOR_SCALE})`;
      currentX.current = toX;
      currentWidth.current = INDICATOR_WIDTH;
    };

    currentX.current = toX;
    currentWidth.current = INDICATOR_WIDTH;
  };

  const switchTab = (nextId) => {
    if (nextId === activeTabRef.current) return;
    clearTimeout(exitTimer.current);
    clearTimeout(gapTimer.current);
    setExitingTab(activeTabRef.current);
    animateIndicatorTo(nextId);
    const gapMs = ANIMATION_DURATION * 0.1;
    const fadeOutMs = ANIMATION_DURATION * 0.5;
    gapTimer.current = setTimeout(() => {
      setActiveTab(nextId);
      activeTabRef.current = nextId;
      exitTimer.current = setTimeout(() => setExitingTab(null), fadeOutMs);
    }, gapMs);
  };

  useEffect(() => {
    setIndicatorTo('dashboard');
    const onResize = () => setIndicatorTo(activeTabRef.current);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentIndex = tabs.findIndex((tab) => tab.id === activeTabRef.current);
      const nextId = tabs[(currentIndex + 1) % tabs.length].id;
      switchTab(nextId);
    }, ANIMATION_DURATION + 800);
    return () => {
      clearInterval(interval);
      clearTimeout(exitTimer.current);
      clearTimeout(gapTimer.current);
    };
  }, []);

  const handleImageLoad = (imageId) => {
    setLoadedImages((prev) => new Set(prev).add(imageId));
  };

  const getTabClass = (tabId) => {
    if (tabId === exitingTab) return 'tab-exit';
    if (tabId === activeTab) return 'tab-enter';
    return 'tab-hidden';
  };

  return (
    <>
      <style>{`
        @keyframes fadeOutShrink {
          0%   { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.94); }
        }

        @keyframes fadeInGrow {
          0%   { opacity: 0; transform: scale(0.97); }
          100% { opacity: 1; transform: scale(1); }
        }

        .tab-hidden { visibility: hidden; pointer-events: none; position: absolute; inset: 0; }

        .tab-exit {
          position: absolute; inset: 0;
          animation: fadeOutShrink ${ANIMATION_DURATION * 0.5}ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
          pointer-events: none;
        }

        .tab-enter {
          position: absolute; inset: 0;
          animation: fadeInGrow ${ANIMATION_DURATION * 0.2}ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }


        .gradient-container::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image:
            url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise" /></filter><rect width="100" height="100" fill="rgba(0,0,0,0.02)" filter="url(%23noise)" /></svg>');
          pointer-events: none;
        }

        ${tabBarStyles}
      `}</style>

      <div className="w-full py-16 px-4 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">

        {/* Header Section */}
        <div className="mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-2 rounded-full border border-gray-200 bg-white">
              <span className="w-2 h-2 rounded-full bg-pink-500"></span>
              <span className="text-sm font-medium text-gray-700">Highlights</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white leading-[1.1] tracking-tight">
              Discover the ContextGPT platform
            </h2>
          </div>
        </div>
          {/* Tab bar */}
          <div className="rounded-xl overflow-hidden">
            <div ref={navRef} className="relative flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    ref={(el) => { tabRefs.current[tab.id] = el; }}
                    onClick={() => switchTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-1 text-lg font-medium whitespace-nowrap transition-colors duration-200 ${
                      isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <Icon size={15} strokeWidth={1.8} />
                    {tab.label}
                  </button>
                );
              })}

              {/* Sliding bottom indicator */}
              <span
                ref={indicatorRef}
                className="tab-indicator absolute bottom-0 left-0 h-[2px] bg-white rounded-full"
              />
            </div>
          </div>

          {/* Image container with dummy background */}
          <div className="relative w-full h-[32rem] aspect-video rounded-xl overflow-hidden">
            {/* Gradient background with effects */}
            <div className=" absolute inset-0">
              <img src="/landing/carousel-bg.avif" alt="Showcase" className="absolute inset-0 w-full h-full object-cover" />
            </div>

            {/* Real image overlay */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="relative w-full h-full max-w-4xl rounded-lg overflow-hidden">
                {tabs.map((tab) => (
                  <div key={tab.id} className={getTabClass(tab.id)}>
                    <img
                      src={tab.image}
                      alt={tab.label}
                      className={`absolute inset-0 w-full my-auto object-contain transition-opacity duration-300 ${loadedImages.has(tab.id) ? 'opacity-100' : 'opacity-0'}`}
                      onLoad={() => handleImageLoad(tab.id)}
                    />
                    {!loadedImages.has(tab.id) && (
                      <div className="absolute inset-0 bg-zinc-200 animate-pulse" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default ShowcaseCarousel;
