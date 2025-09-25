
import React from 'react';
import { PresentationTemplate, Strings } from '../types';

interface TemplateSelectorProps {
  templates: PresentationTemplate[];
  onSelect: (template: PresentationTemplate) => void;
  onBack: () => void;
  strings: Strings;
}

const TemplatePreview: React.FC<{ template: PresentationTemplate }> = ({ template }) => (
  <div className={`w-full h-48 rounded-lg p-4 flex flex-col justify-center items-center text-center ${template.preview.bg}`}>
    <div className={`font-bold text-2xl ${template.preview.title}`}>Title</div>
    <div className={`mt-1 text-sm ${template.preview.subtitle}`}>Subtitle</div>
    <div className="w-full h-px bg-current opacity-50 my-4"></div>
    <div className={`text-xs ${template.preview.text}`}>• Key point one</div>
    <div className={`text-xs ${template.preview.text}`}>• Key point two</div>
  </div>
);


const TemplateSelector: React.FC<TemplateSelectorProps> = ({ templates, onSelect, onBack, strings }) => {
  return (
    <div className="w-full max-w-5xl">
       <div className="relative text-center">
         <button onClick={onBack} className="absolute left-0 top-1/2 -translate-y-1/2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold py-2 px-4 rounded-md transition-colors flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {strings.backToOutline}
         </button>
        <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{strings.selectTemplate}</h2>
      </div>

      <p className="text-lg text-slate-600 dark:text-slate-400 text-center mb-10">{strings.templateDescription}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {templates.map(template => (
          <div
            key={template.id}
            onClick={() => onSelect(template)}
            className="cursor-pointer bg-white dark:bg-slate-800 rounded-lg p-3 group hover:ring-2 hover:ring-indigo-500 transition-all shadow-md hover:shadow-xl"
          >
            <TemplatePreview template={template} />
            <h3 className="text-center font-semibold text-slate-800 dark:text-white mt-3 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">{template.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;
