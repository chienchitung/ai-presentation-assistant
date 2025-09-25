
import React from 'react';
import { TRANSITIONS } from '../constants';
import { Transition, Strings } from '../types';

interface TransitionSelectorProps {
  selectedTransition: Transition | undefined;
  onSelectTransition: (transition: Transition) => void;
  strings: Strings;
}

const TransitionSelector: React.FC<TransitionSelectorProps> = ({ selectedTransition, onSelectTransition, strings }) => {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="transition-select" className="text-sm font-medium text-slate-700 dark:text-slate-300">{strings.transition}:</label>
      <select
        id="transition-select"
        value={selectedTransition || 'none'}
        onChange={(e) => onSelectTransition(e.target.value as Transition)}
        className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md p-1.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
      >
        {TRANSITIONS.map(t => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>
    </div>
  );
};

export default TransitionSelector;
