import React, { useState } from 'react';
import { Slide, PresentationTemplate, Strings, Transition } from '../types';
import TransitionSelector from './TransitionSelector';

interface SlidePreviewProps {
  slide: Slide;
  template: PresentationTemplate;
  onUpdate: (updatedContent: Partial<Slide>) => void;
  onRefine: (slideIndex: number, contentIndex: number, text: string) => void;
  onAddImage: () => void;
  slideIndex: number;
  viewMode: 'editor' | 'canvas';
  strings: Strings;
  selectedTransition?: Transition;
  onSelectTransition?: (transition: Transition) => void;
}

const AiRefineIcon: React.FC<{ className?: string }> = ({ className }) => (
    //<!-- License: CC Attribution. Made by boxicons: https://github.com/atisawd/boxicons -->
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className={className}>
      <path d="m11 4-.5-1-.5 1-1 .125.834.708L9.5 6l1-.666 1 .666-.334-1.167.834-.708zm8.334 10.666L18.5 13l-.834 1.666-1.666.209 1.389 1.181L16.834 18l1.666-1.111L20.166 18l-.555-1.944L21 14.875zM6.667 6.333 6 5l-.667 1.333L4 6.5l1.111.944L4.667 9 6 8.111 7.333 9l-.444-1.556L8 6.5zM3.414 17c0 .534.208 1.036.586 1.414L5.586 20c.378.378.88.586 1.414.586s1.036-.208 1.414-.586L20 8.414c.378-.378.586-.88.586-1.414S20.378 5.964 20 5.586L18.414 4c-.756-.756-2.072-.756-2.828 0L4 15.586c-.378.378-.586.88-.586 1.414zM17 5.414 18.586 7 15 10.586 13.414 9 17 5.414z"/>
    </svg>
);

const SlidePreview: React.FC<SlidePreviewProps> = ({ slide, template, onUpdate, onRefine, onAddImage, slideIndex, viewMode, strings, selectedTransition, onSelectTransition }) => {
  const { styles } = template;
  const hasImage = !!slide.imageUrl;
  const isEditor = viewMode === 'editor';
  const [isRefineMode, setIsRefineMode] = useState(false);


  const RefineButton: React.FC<{ onClick: () => void, strings: Strings, isVisible: boolean }> = ({ onClick, strings, isVisible }) => (
    <button
      onClick={onClick}
      className={`absolute top-1/2 -translate-y-1/2 right-3 z-10 bg-indigo-600 text-white p-1.5 rounded-full hover:bg-indigo-500 transition-all ${isVisible ? 'opacity-0 group-hover:opacity-100' : 'hidden'}`}
      title={strings.refineText}
      contentEditable={false}
    >
        <AiRefineIcon className="w-5 h-5" />
    </button>
  );


  const EditableField: React.FC<{
      value: string;
      onChange: (newValue: string) => void;
      className: string;
      onRefineClick: () => void;
      onDelete?: () => void;
      isReadOnly?: boolean;
      isRefineMode?: boolean;
      strings: Strings;
  }> = ({ value, onChange, className, onRefineClick, onDelete, isReadOnly, isRefineMode, strings }) => {
      
      const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
          if (onDelete && e.key === 'Backspace' && e.currentTarget.innerText.trim() === '') {
              e.preventDefault();
              onDelete();
          }
      };
      
      if (isReadOnly) {
          return <div className={className}>{value}</div>;
      }
      
      return (
          <div className="relative group">
              <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={e => onChange(e.currentTarget.innerText)}
                  onKeyDown={onDelete ? handleKeyDown : undefined}
                  className={`outline-none focus:ring-2 focus:ring-indigo-500/50 rounded-md px-2 ${className}`}
                  dangerouslySetInnerHTML={{ __html: value }}
              />
              <RefineButton onClick={onRefineClick} strings={strings} isVisible={!!isRefineMode} />
          </div>
      );
  };


  const handleTitleChange = (newTitle: string) => {
    onUpdate({ title: newTitle });
  };

  const handleContentChange = (contentIndex: number, newText: string) => {
    const newContent = [...slide.content];
    newContent[contentIndex] = newText;
    onUpdate({ content: newContent });
  };

  const handleContentAdd = () => {
    onUpdate({ content: [...slide.content, "New bullet point."] });
  };

  const handleContentDelete = (indexToDelete: number) => {
    const newContent = slide.content.filter((_, i) => i !== indexToDelete);
    onUpdate({ content: newContent });
  };


  const renderLayoutContent = () => {
    switch (slide.layout) {
      case 'TITLE_SLIDE':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
             <EditableField
                value={slide.title}
                onChange={handleTitleChange}
                className={styles.title}
                onRefineClick={() => onRefine(slideIndex, -1, slide.title)} // -1 for title
                isReadOnly={!isEditor}
                isRefineMode={isRefineMode}
                strings={strings}
             />
             {slide.content[0] && (
                 <EditableField
                    value={slide.content[0]}
                    onChange={(newText) => handleContentChange(0, newText)}
                    className={`${styles.subtitle} mt-4`}
                    onRefineClick={() => onRefine(slideIndex, 0, slide.content[0])}
                    isReadOnly={!isEditor}
                    isRefineMode={isRefineMode}
                    strings={strings}
                 />
             )}
          </div>
        );
      case 'SECTION_HEADER':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
             <EditableField
                value={slide.title}
                onChange={handleTitleChange}
                className={`${styles.title} text-4xl`}
                onRefineClick={() => onRefine(slideIndex, -1, slide.title)}
                isReadOnly={!isEditor}
                isRefineMode={isRefineMode}
                strings={strings}
             />
             <div className={`w-1/4 h-1 mt-4 rounded-full ${styles.bg === 'bg-black' ? 'bg-fuchsia-400' : 'bg-current'} opacity-50`}></div>
             {slide.content[0] && (
                 <EditableField
                    value={slide.content[0]}
                    onChange={(newText) => handleContentChange(0, newText)}
                    className={`${styles.subtitle} mt-4 text-xl`}
                    onRefineClick={() => onRefine(slideIndex, 0, slide.content[0])}
                    isReadOnly={!isEditor}
                    isRefineMode={isRefineMode}
                    strings={strings}
                 />
             )}
          </div>
        );
      case 'TWO_COLUMN':
        const middleIndex = Math.ceil(slide.content.length / 2);
        const leftContent = slide.content.slice(0, middleIndex);
        const rightContent = slide.content.slice(middleIndex);
        return (
          <div className="flex flex-col h-full text-left">
            <EditableField
              value={slide.title}
              onChange={handleTitleChange}
              className={`${styles.title} text-4xl mb-8`}
              onRefineClick={() => onRefine(slideIndex, -1, slide.title)}
              isReadOnly={!isEditor}
              isRefineMode={isRefineMode}
              strings={strings}
            />
            <div className="flex-grow grid grid-cols-2 gap-8 overflow-y-auto">
              <ul className="space-y-4 list-disc pl-5">
                {leftContent.map((point, index) => (
                  <li key={index} className="relative group p-1 -m-1 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/30">
                    <EditableField
                      value={point}
                      onChange={(newText) => handleContentChange(index, newText)}
                      onDelete={() => handleContentDelete(index)}
                      className={`${styles.text} pr-8`}
                      onRefineClick={() => onRefine(slideIndex, index, point)}
                      isReadOnly={!isEditor}
                      isRefineMode={isRefineMode}
                      strings={strings}
                    />
                    {isEditor && (
                      <button
                        onClick={() => handleContentDelete(index)}
                        className="absolute top-1/2 right-1 -translate-y-1/2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all text-lg font-bold leading-none"
                        title="Delete bullet"
                        contentEditable={false}
                      >
                        &times;
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              <ul className="space-y-4 list-disc pl-5">
                {rightContent.map((point, index) => (
                  <li key={index + middleIndex} className="relative group p-1 -m-1 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/30">
                    <EditableField
                      value={point}
                      onChange={(newText) => handleContentChange(middleIndex + index, newText)}
                      onDelete={() => handleContentDelete(middleIndex + index)}
                      className={`${styles.text} pr-8`}
                      onRefineClick={() => onRefine(slideIndex, middleIndex + index, point)}
                      isReadOnly={!isEditor}
                      isRefineMode={isRefineMode}
                      strings={strings}
                    />
                     {isEditor && (
                        <button
                          onClick={() => handleContentDelete(middleIndex + index)}
                          className="absolute top-1/2 right-1 -translate-y-1/2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all text-lg font-bold leading-none"
                          title="Delete bullet"
                          contentEditable={false}
                        >
                            &times;
                        </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
             {isEditor && (
                <div className="pl-5 pt-2 flex-shrink-0">
                    <button onClick={handleContentAdd} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">+ Add bullet point</button>
                </div>
            )}
          </div>
        );
      case 'BLANK':
        return (
          <div className="flex items-center justify-center h-full">
            {/* Blank slide can have a title if needed, or be truly empty */}
            {slide.title && (
              <EditableField
                value={slide.title}
                onChange={handleTitleChange}
                className={`${styles.subtitle} text-center`}
                onRefineClick={() => onRefine(slideIndex, -1, slide.title)}
                isReadOnly={!isEditor}
                isRefineMode={isRefineMode}
                strings={strings}
              />
            )}
          </div>
        );
      case 'TITLE_CONTENT':
      default:
        return (
            <div className="flex flex-col h-full text-left">
                 <EditableField
                    value={slide.title}
                    onChange={handleTitleChange}
                    className={`${styles.title} text-4xl mb-8`}
                    onRefineClick={() => onRefine(slideIndex, -1, slide.title)}
                    isReadOnly={!isEditor}
                    isRefineMode={isRefineMode}
                    strings={strings}
                 />
                <div className="flex-grow overflow-y-auto">
                  <ul className="space-y-4 list-disc pl-5">
                      {slide.content.map((point, index) => (
                          <li key={index} className="relative group p-1 -m-1 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/30">
                              <EditableField
                                  value={point}
                                  onChange={(newText) => handleContentChange(index, newText)}
                                  onDelete={() => handleContentDelete(index)}
                                  className={`${styles.text} pr-8`}
                                  onRefineClick={() => onRefine(slideIndex, index, point)}
                                  isReadOnly={!isEditor}
                                  isRefineMode={isRefineMode}
                                  strings={strings}
                              />
                              {isEditor && (
                                <button
                                  onClick={() => handleContentDelete(index)}
                                  className="absolute top-1/2 right-1 -translate-y-1/2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all text-lg font-bold leading-none"
                                  title="Delete bullet"
                                  contentEditable={false}
                                >
                                    &times;
                                </button>
                              )}
                          </li>
                      ))}
                  </ul>
                </div>
                {isEditor && (
                  <div className="pl-5 pt-2 flex-shrink-0">
                      <button onClick={handleContentAdd} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">+ Add bullet point</button>
                  </div>
                )}
            </div>
        );
    }
  };

  const layout = slide.layout;
  const paddingClass = (layout === 'TITLE_SLIDE' || layout === 'SECTION_HEADER') ? 'p-8' : 
                       (layout === 'TITLE_CONTENT' || layout === 'TWO_COLUMN') ? 'p-16' : '';
  
  const editorBgClass = 'bg-white dark:bg-slate-800';

  const containerClasses = viewMode === 'editor'
    ? `aspect-video w-full max-w-6xl shadow-2xl rounded-lg ${editorBgClass} transition-colors duration-300 relative`
    : `w-full h-full ${styles.bg} overflow-hidden`;

  return (
    <div className={containerClasses}>
       {isEditor && (
        <div className="absolute top-6 right-6 z-20 flex items-center gap-4">
            {onSelectTransition && (
                <TransitionSelector
                    selectedTransition={selectedTransition}
                    onSelectTransition={onSelectTransition}
                    strings={strings}
                />
            )}
            <button
                onClick={() => setIsRefineMode(prev => !prev)}
                className={`p-2 rounded-full transition-all duration-300 ${isRefineMode ? 'bg-indigo-600 text-white' : 'bg-white/50 dark:bg-slate-700/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-slate-600'}`}
                title={strings.refineText}
            >
                <AiRefineIcon className="w-6 h-6" />
            </button>
        </div>
      )}
      <div className={`w-full h-full flex items-stretch ${hasImage ? 'p-16 gap-8' : ''}`}>
        <div className={`${hasImage ? 'w-2/3' : 'w-full'} h-full flex flex-col ${!hasImage ? paddingClass : ''}`}>
           {renderLayoutContent()}
        </div>
        {hasImage && (
          <div className="w-1/3 h-full relative group flex items-center justify-center bg-black/10 rounded-lg">
            <img src={slide.imageUrl} alt={slide.title} className="max-w-full max-h-full object-contain rounded-md shadow-lg" />
            {isEditor && (
                <button 
                  onClick={() => onUpdate({ imageUrl: undefined })}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  title={strings.removeImage}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="http://www.w3.org/2000/svg" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            )}
          </div>
        )}
      </div>
      {!hasImage && isEditor && (
          <button
              onClick={onAddImage}
              className="absolute bottom-6 right-6 bg-indigo-600 text-white rounded-full p-3 hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center"
              title={strings.addImage}
          >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="http://www.w3.org/2000/svg" fill="currentColor">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
          </button>
      )}
    </div>
  );
};

export default SlidePreview;