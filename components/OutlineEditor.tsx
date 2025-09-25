
import React, { useState, useCallback } from 'react';
import { Slide, Strings } from '../types';

interface OutlineEditorProps {
  initialOutline: Slide[];
  onConfirm: (finalOutline: Slide[]) => void;
  strings: Strings;
}

const OutlineEditor: React.FC<OutlineEditorProps> = ({ initialOutline, onConfirm, strings }) => {
  const [outline, setOutline] = useState<Slide[]>(initialOutline);

  const handleTitleChange = useCallback((index: number, value: string) => {
    setOutline(currentOutline => {
      const newOutline = [...currentOutline];
      newOutline[index] = { ...newOutline[index], title: value };
      return newOutline;
    });
  }, []);

  const handleContentChange = useCallback((slideIndex: number, contentIndex: number, value: string) => {
    setOutline(currentOutline => {
      const newOutline = [...currentOutline];
      const newContent = [...newOutline[slideIndex].content];
      newContent[contentIndex] = value;
      newOutline[slideIndex] = { ...newOutline[slideIndex], content: newContent };
      return newOutline;
    });
  }, []);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] flex flex-col">
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{strings.reviewOutline}</h2>
      <p className="text-slate-600 dark:text-slate-400 mb-6">{strings.reviewDescription}</p>
      <div className="flex-grow overflow-y-auto pr-4 space-y-6">
        {outline.map((slide, slideIndex) => (
          <div key={slide.id} className="bg-slate-100 dark:bg-slate-700 p-4 rounded-md">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Slide {slideIndex + 1}: Title</label>
            <input
              type="text"
              value={slide.title}
              onChange={(e) => handleTitleChange(slideIndex, e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md p-2 mt-1 mb-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Content (bullet points)</label>
            {slide.content.map((point, pointIndex) => (
              <input
                key={pointIndex}
                type="text"
                value={point}
                onChange={(e) => handleContentChange(slideIndex, pointIndex, e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md p-2 mt-1 text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-8 flex justify-end">
        <button
          onClick={() => onConfirm(outline)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-md transition-colors text-lg"
        >
          {strings.confirmAndContinue}
        </button>
      </div>
    </div>
  );
};

export default OutlineEditor;
