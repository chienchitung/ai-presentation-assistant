import React from 'react';
import { Slide, PresentationTemplate, Strings } from '../types';

interface SlidePreviewProps {
  slide: Slide;
  template: PresentationTemplate;
  onUpdate: (updatedContent: Partial<Slide>) => void;
  onRefine: (slideIndex: number, contentIndex: number, text: string) => void;
  onAddImage: () => void;
  slideIndex: number;
  isExporting?: boolean;
  isPresenting?: boolean;
  strings: Strings;
}

const RefineButton: React.FC<{ onClick: () => void, strings: Strings }> = ({ onClick, strings }) => (
    <button
      onClick={onClick}
      className="absolute -top-2 -right-2 z-10 bg-indigo-600 text-white p-1.5 rounded-full hover:bg-indigo-500 transition-all opacity-0 group-hover:opacity-100"
      title={strings.refineText}
      contentEditable={false}
    >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="http://www.w3.org/2000/svg" fill="currentColor">
            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
        </svg>
    </button>
);


const EditableField: React.FC<{
    value: string;
    onChange: (newValue: string) => void;
    className: string;
    onRefineClick: () => void;
    onDelete?: () => void;
    isReadOnly?: boolean;
    strings: Strings;
}> = ({ value, onChange, className, onRefineClick, onDelete, isReadOnly, strings }) => {
    
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
            <RefineButton onClick={onRefineClick} strings={strings} />
        </div>
    );
};


const SlidePreview: React.FC<SlidePreviewProps> = ({ slide, template, onUpdate, onRefine, onAddImage, slideIndex, isExporting = false, isPresenting = false, strings }) => {
  const { styles } = template;
  const hasImage = !!slide.imageUrl;
  const isReadOnly = isExporting || isPresenting;

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
                isReadOnly={isReadOnly}
                strings={strings}
             />
             {slide.content[0] && (
                 <EditableField
                    value={slide.content[0]}
                    onChange={(newText) => handleContentChange(0, newText)}
                    className={`${styles.subtitle} mt-4`}
                    onRefineClick={() => onRefine(slideIndex, 0, slide.content[0])}
                    isReadOnly={isReadOnly}
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
                isReadOnly={isReadOnly}
                strings={strings}
             />
             <div className={`w-1/4 h-1 mt-4 rounded-full ${styles.bg === 'bg-black' ? 'bg-fuchsia-400' : 'bg-current'} opacity-50`}></div>
             {slide.content[0] && (
                 <EditableField
                    value={slide.content[0]}
                    onChange={(newText) => handleContentChange(0, newText)}
                    className={`${styles.subtitle} mt-4 text-xl`}
                    onRefineClick={() => onRefine(slideIndex, 0, slide.content[0])}
                    isReadOnly={isReadOnly}
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
              isReadOnly={isReadOnly}
              strings={strings}
            />
            <div className="flex-grow grid grid-cols-2 gap-8 overflow-y-auto">
              <ul className="space-y-4 list-disc pl-5">
                {leftContent.map((point, index) => (
                  <li key={index} className="relative group">
                    <EditableField
                      value={point}
                      onChange={(newText) => handleContentChange(index, newText)}
                      onDelete={() => handleContentDelete(index)}
                      className={styles.text}
                      onRefineClick={() => onRefine(slideIndex, index, point)}
                      isReadOnly={isReadOnly}
                      strings={strings}
                    />
                    {!isReadOnly && (
                      <button
                        onClick={() => handleContentDelete(index)}
                        className="absolute top-1/2 -right-3 -translate-y-1/2 bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all"
                        title="Delete bullet"
                        contentEditable={false}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="http://www.w3.org/2000/svg" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              <ul className="space-y-4 list-disc pl-5">
                {rightContent.map((point, index) => (
                  <li key={index + middleIndex} className="relative group">
                    <EditableField
                      value={point}
                      onChange={(newText) => handleContentChange(middleIndex + index, newText)}
                      onDelete={() => handleContentDelete(middleIndex + index)}
                      className={styles.text}
                      onRefineClick={() => onRefine(slideIndex, middleIndex + index, point)}
                      isReadOnly={isReadOnly}
                      strings={strings}
                    />
                     {!isReadOnly && (
                        <button
                          onClick={() => handleContentDelete(middleIndex + index)}
                          className="absolute top-1/2 -right-3 -translate-y-1/2 bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all"
                          title="Delete bullet"
                          contentEditable={false}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="http://www.w3.org/2000/svg" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
             {!isReadOnly && (
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
                isReadOnly={isReadOnly}
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
                    isReadOnly={isReadOnly}
                    strings={strings}
                 />
                <div className="flex-grow overflow-y-auto">
                  <ul className="space-y-4 list-disc pl-5">
                      {slide.content.map((point, index) => (
                          <li key={index} className="relative group">
                              <EditableField
                                  value={point}
                                  onChange={(newText) => handleContentChange(index, newText)}
                                  onDelete={() => handleContentDelete(index)}
                                  className={styles.text}
                                  onRefineClick={() => onRefine(slideIndex, index, point)}
                                  isReadOnly={isReadOnly}
                                  strings={strings}
                              />
                              {!isReadOnly && (
                                <button
                                  onClick={() => handleContentDelete(index)}
                                  className="absolute top-1/2 -right-3 -translate-y-1/2 bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all"
                                  title="Delete bullet"
                                  contentEditable={false}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="http://www.w3.org/2000/svg" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                              )}
                          </li>
                      ))}
                  </ul>
                </div>
                {!isReadOnly && (
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
  
  const editorBgClass = isReadOnly ? styles.bg : 'bg-white dark:bg-slate-800';

  const containerClasses = isPresenting
    ? `w-full h-full ${styles.bg}`
    : `aspect-video w-full max-w-6xl shadow-2xl rounded-lg ${editorBgClass} transition-colors duration-300 relative`;
  
  const containerStyle = isExporting && !isPresenting
    ? { width: '1280px', height: '720px' } 
    : {};

  return (
    <div
      className={containerClasses}
      style={containerStyle}
    >
      <div className={`w-full h-full flex items-stretch ${hasImage ? 'p-16 gap-8' : ''}`}>
        <div className={`${hasImage ? 'w-2/3' : 'w-full'} h-full flex flex-col ${!hasImage ? paddingClass : ''}`}>
           {renderLayoutContent()}
        </div>
        {hasImage && (
          <div className="w-1/3 h-full relative group flex items-center justify-center bg-black/10 rounded-lg">
            <img src={slide.imageUrl} alt={slide.title} className="max-w-full max-h-full object-contain rounded-md shadow-lg" />
            {!isReadOnly && (
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
      {!hasImage && !isReadOnly && (
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