import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Presentation, Strings } from '../types';
import { TRANSITIONS } from '../constants';
import SlidePreview from './SlidePreview';

interface PresentationViewProps {
  presentation: Presentation;
  onExit: () => void;
  strings: Strings;
}

const PresentationView: React.FC<PresentationViewProps> = ({ presentation, onExit, strings }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'ArrowRight' || event.key === ' ') {
      setCurrentIndex(prev => Math.min(prev + 1, presentation.slides.length - 1));
    } else if (event.key === 'ArrowLeft') {
      setCurrentIndex(prev => Math.max(prev - 1, 0));
    } else if (event.key === 'Escape') {
      onExit();
    }
  }, [presentation.slides.length, onExit]);

  const updateScale = useCallback(() => {
      if (containerRef.current) {
          const { width, height } = containerRef.current.getBoundingClientRect();
          const scaleX = width / 1280;
          const scaleY = height / 720;
          setScale(Math.min(scaleX, scaleY));
      }
  }, []);

  useEffect(() => {
      updateScale();
      window.addEventListener('resize', updateScale);
      return () => {
        window.removeEventListener('resize', updateScale);
        window.removeEventListener('keydown', handleKeyDown);
      };
  }, [updateScale, handleKeyDown]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const currentSlide = presentation.slides[currentIndex];
  const transitionClass = TRANSITIONS.find(t => t.id === currentSlide?.transition)?.className || '';

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col">
      <div ref={containerRef} className="flex-grow flex items-center justify-center p-4 overflow-hidden">
        <div
          key={currentIndex}
          className={transitionClass}
          style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
        >
          <div className="w-[1280px] h-[720px] shadow-2xl rounded-lg overflow-hidden">
            <SlidePreview
                slide={currentSlide}
                template={presentation.template}
                onUpdate={() => {}}
                onRefine={() => {}}
                onAddImage={() => {}}
                slideIndex={currentIndex}
                viewMode='canvas'
                strings={strings}
            />
          </div>
        </div>
      </div>
      <footer className="flex-shrink-0 bg-black/30 text-white p-3 flex items-center justify-between">
        <div className="w-1/3 text-left font-semibold">
          {currentIndex + 1} / {presentation.slides.length}
        </div>
        <div className="w-1/3 flex items-center justify-center gap-4">
            <button
              onClick={() => setCurrentIndex(prev => Math.max(prev - 1, 0))}
              disabled={currentIndex === 0}
              className="p-2 rounded-full hover:bg-white/20 disabled:opacity-50 transition-colors"
              title="Previous Slide"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
              onClick={() => setCurrentIndex(prev => Math.min(prev + 1, presentation.slides.length - 1))}
              disabled={currentIndex === presentation.slides.length - 1}
              className="p-2 rounded-full hover:bg-white/20 disabled:opacity-50 transition-colors"
              title="Next Slide"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
        </div>
        <div className="w-1/3 flex justify-end">
            <button
            onClick={onExit}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
            {strings.exitPresent}
            </button>
        </div>
      </footer>
    </div>
  );
};

export default PresentationView;
