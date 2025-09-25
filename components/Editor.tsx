import React, { useState, useCallback, useRef } from 'react';
import { Presentation, Slide, Strings, AiConfig, Transition } from '../types';
import Header from './Header';
import Sidebar from './Sidebar';
import SlidePreview from './SlidePreview';
import RefineModal from './RefineModal';
import ImageGenerationModal from './ImageGenerationModal';
import PresentationView from './PresentationView';
import { TRANSITIONS } from '../constants';
import { refineText, generateImage } from '../services/aiService';
import { exportToPdf, exportToPptx } from '../services/exportService';

interface EditorProps {
  initialPresentation: Presentation;
  onNewPresentation: () => void;
  strings: Strings;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  aiConfig: AiConfig;
  onBackToOutline: () => void;
}

const Editor: React.FC<EditorProps> = ({ initialPresentation, onNewPresentation, strings, theme, setTheme, aiConfig, onBackToOutline }) => {
  const [presentation, setPresentation] = useState<Presentation>(initialPresentation);
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [refineData, setRefineData] = useState<{ slideIndex: number, contentIndex: number, text: string } | null>(null);
  const [imageGenState, setImageGenState] = useState<{ isOpen: boolean; slideIndex: number | null }>({ isOpen: false, slideIndex: null });
  const [isPresentationMode, setIsPresentationMode] = useState(false);

  const slidesContainerRef = useRef<HTMLDivElement>(null);

  const updateSlide = useCallback((slideIndex: number, updatedSlide: Partial<Slide>) => {
    setPresentation(p => {
      const newSlides = [...p.slides];
      newSlides[slideIndex] = { ...newSlides[slideIndex], ...updatedSlide };
      return { ...p, slides: newSlides };
    });
  }, []);

  const handleSlideReorder = useCallback((dragIndex: number, dropIndex: number) => {
    setPresentation(p => {
        const newSlides = [...p.slides];
        const [removed] = newSlides.splice(dragIndex, 1);
        newSlides.splice(dropIndex, 0, removed);
        
        // Update selected index to follow the dragged slide
        if (selectedSlideIndex === dragIndex) {
            setSelectedSlideIndex(dropIndex);
        } else if (selectedSlideIndex > dragIndex && selectedSlideIndex <= dropIndex) {
            setSelectedSlideIndex(prev => prev - 1);
        } else if (selectedSlideIndex < dragIndex && selectedSlideIndex >= dropIndex) {
            setSelectedSlideIndex(prev => prev + 1);
        }

        return { ...p, slides: newSlides };
    });
  }, [selectedSlideIndex]);


  const handleTitleChange = useCallback((newTitle: string) => {
    setPresentation(p => ({ ...p, title: newTitle }));
  }, []);

  const handleRefineClick = useCallback((slideIndex: number, contentIndex: number, text: string) => {
    setRefineData({ slideIndex, contentIndex, text });
  }, []);

  const handleRefineConfirm = useCallback(async (newText: string) => {
    if (refineData) {
      const { slideIndex, contentIndex } = refineData;
      setPresentation(p => {
        const newSlides = [...p.slides];
        const newContent = [...newSlides[slideIndex].content];
        newContent[contentIndex] = newText;
        newSlides[slideIndex] = { ...newSlides[slideIndex], content: newContent };
        return { ...p, slides: newSlides };
      });
      setRefineData(null);
    }
  }, [refineData]);

  const handleOpenImageGenerator = useCallback((slideIndex: number) => {
    setImageGenState({ isOpen: true, slideIndex });
  }, []);

  const handleImageGenerated = useCallback((imageUrl: string) => {
    if (imageGenState.slideIndex !== null) {
        updateSlide(imageGenState.slideIndex, { imageUrl });
    }
    setImageGenState({ isOpen: false, slideIndex: null });
  }, [imageGenState.slideIndex, updateSlide]);


  const addSlide = useCallback(() => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      title: "New Slide",
      content: ["Your content here."],
      layout: "TITLE_CONTENT",
    };
    setPresentation(p => ({...p, slides: [...p.slides, newSlide]}));
    setSelectedSlideIndex(presentation.slides.length);
  }, [presentation.slides.length]);
  
  const deleteSlide = useCallback((indexToDelete: number) => {
     if (presentation.slides.length <= 1) return; // Cannot delete the last slide
    setPresentation(p => ({ ...p, slides: p.slides.filter((_, i) => i !== indexToDelete) }));
    setSelectedSlideIndex(prev => Math.max(0, prev - 1));
  }, [presentation.slides.length]);


  const handleExport = useCallback((format: 'pdf' | 'pptx') => {
    if (format === 'pdf') {
        if (slidesContainerRef.current) {
            exportToPdf(presentation.title, slidesContainerRef.current);
        }
    } else if (format === 'pptx') {
        exportToPptx(presentation);
    }
  }, [presentation]);
  
  const handleTransitionChange = useCallback((transition: Transition) => {
      updateSlide(selectedSlideIndex, { transition });
  }, [selectedSlideIndex, updateSlide]);


  const selectedSlide = presentation.slides[selectedSlideIndex];
  const transitionClass = TRANSITIONS.find(t => t.id === selectedSlide?.transition)?.className || '';

  return (
    <div className="w-screen h-screen flex flex-col bg-white dark:bg-slate-900">
      <Header
        presentationTitle={presentation.title}
        onTitleChange={handleTitleChange}
        onNewPresentation={onNewPresentation}
        onExport={handleExport}
        strings={strings}
        theme={theme}
        setTheme={setTheme}
        onBackToOutline={onBackToOutline}
        onPresent={() => setIsPresentationMode(true)}
      />
      <div className="flex-grow flex overflow-hidden">
        <Sidebar
          slides={presentation.slides}
          selectedSlideIndex={selectedSlideIndex}
          onSelectSlide={setSelectedSlideIndex}
          template={presentation.template}
          onAddSlide={addSlide}
          onDeleteSlide={deleteSlide}
          onReorderSlides={handleSlideReorder}
          strings={strings}
        />
        <main className="flex-grow flex flex-col items-center justify-center p-8 bg-slate-100 dark:bg-slate-800 overflow-auto">
          <div key={selectedSlideIndex} className={`w-full max-w-6xl ${transitionClass}`}>
            {selectedSlide && (
              <SlidePreview
                slide={selectedSlide}
                template={presentation.template}
                onUpdate={(updatedContent) => updateSlide(selectedSlideIndex, updatedContent)}
                onRefine={handleRefineClick}
                onAddImage={() => handleOpenImageGenerator(selectedSlideIndex)}
                slideIndex={selectedSlideIndex}
                viewMode="editor"
                strings={strings}
                selectedTransition={selectedSlide.transition}
                onSelectTransition={handleTransitionChange}
              />
            )}
          </div>
        </main>
      </div>

      {refineData && (
        <RefineModal
          isOpen={!!refineData}
          onClose={() => setRefineData(null)}
          onConfirm={handleRefineConfirm}
          originalText={refineData.text}
          refineAction={refineText}
          strings={strings}
          aiConfig={aiConfig}
        />
      )}

      {imageGenState.isOpen && (
         <ImageGenerationModal
            isOpen={imageGenState.isOpen}
            onClose={() => setImageGenState({ isOpen: false, slideIndex: null })}
            onConfirm={handleImageGenerated}
            aiConfig={aiConfig}
            generateImageAction={generateImage}
            strings={strings}
         />
      )}

      {isPresentationMode && (
        <PresentationView
            presentation={presentation}
            onExit={() => setIsPresentationMode(false)}
            strings={strings}
        />
      )}


      {/* Hidden container for PDF/PNG export rendering */}
      <div className="absolute -left-[9999px] top-0" ref={slidesContainerRef}>
        {presentation.slides.map((slide, index) => (
          <div key={slide.id} id={`slide-export-${index}`} className="w-[1280px] h-[720px]">
            <SlidePreview
              slide={slide}
              template={presentation.template}
              onUpdate={() => {}}
              onRefine={() => {}}
              onAddImage={() => {}}
              slideIndex={index}
              viewMode="canvas"
              strings={strings}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Editor;