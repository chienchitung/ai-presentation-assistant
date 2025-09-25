import React, { useState } from 'react';
import { Slide, PresentationTemplate, Strings } from '../types';
import SlidePreview from './SlidePreview';

const THUMBNAIL_WIDTH_PX = 224;
const THUMBNAIL_SCALE = THUMBNAIL_WIDTH_PX / 1280;

// Use React.memo for performance, as these thumbnails won't change often.
const SlideThumbnail: React.FC<{ slide: Slide; template: PresentationTemplate; strings: Strings }> = React.memo(({ slide, template, strings }) => (
    <div
      className="rounded-md overflow-hidden shadow-md bg-white"
      style={{
        width: `${THUMBNAIL_WIDTH_PX}px`,
        height: `${720 * THUMBNAIL_SCALE}px`,
        pointerEvents: 'none', // Prevent interaction with the scaled preview
      }}
    >
      <div
        style={{
          transform: `scale(${THUMBNAIL_SCALE})`,
          transformOrigin: 'top left',
        }}
      >
        <div style={{ width: '1280px', height: '720px' }}>
            <SlidePreview
              slide={slide}
              template={template}
              onUpdate={() => {}}
              onRefine={() => {}}
              onAddImage={() => {}}
              slideIndex={-1}
              viewMode="canvas"
              strings={strings}
            />
        </div>
      </div>
    </div>
));

// FIX: Define SidebarProps interface
interface SidebarProps {
  slides: Slide[];
  selectedSlideIndex: number;
  onSelectSlide: (index: number) => void;
  template: PresentationTemplate;
  onAddSlide: () => void;
  onDeleteSlide: (index: number) => void;
  onReorderSlides: (dragIndex: number, dropIndex: number) => void;
  strings: Strings;
}

const Sidebar: React.FC<SidebarProps> = ({ slides, selectedSlideIndex, onSelectSlide, template, onAddSlide, onDeleteSlide, onReorderSlides, strings }) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;
    onReorderSlides(draggedIndex, dropIndex);
    setDraggedIndex(null);
  };

  return (
    <aside className="w-80 bg-slate-100/50 dark:bg-slate-800/50 flex-col flex-shrink-0 border-r border-slate-200 dark:border-slate-700 hidden md:flex">
      <div className="p-4 flex-grow overflow-y-auto">
        <div className="space-y-4">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              draggable="true"
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={() => setDraggedIndex(null)}
              onClick={() => onSelectSlide(index)}
              className={`group flex items-center gap-4 p-2 rounded-lg cursor-pointer transition-all ${draggedIndex === index ? 'opacity-40' : ''}`}
            >
              <span className="text-4xl font-light text-slate-400 dark:text-slate-500 w-12 text-center select-none">{index + 1}</span>
              <div className="flex-1 relative">
                <div
                    className={`rounded-lg overflow-hidden transition-all p-1 border-4 ${selectedSlideIndex === index ? 'border-indigo-500' : 'border-transparent group-hover:border-indigo-500/50'}`}
                >
                    <SlideThumbnail slide={slide} template={template} strings={strings} />
                </div>
                 <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSlide(index);
                    }}
                    className="absolute top-0 left-0 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xl font-bold leading-none z-10 hover:bg-red-500 transform -translate-y-1/2 -translate-x-1/2"
                    title={strings.deleteSlide}
                >
                    &times;
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={onAddSlide}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-base"
        >
          {strings.addSlide}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;