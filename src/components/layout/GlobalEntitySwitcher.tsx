import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Globe,
  ChevronDown,
  Building2,
  Scale,
  ShieldCheck,
  Check,
  Search,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { CORPORATE_ENTITIES, CorporateEntity } from '../../types/entityScope';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';

interface GlobalEntitySwitcherProps {
  theme?: string;
  className?: string;
  onEntityChanged?: (entity: CorporateEntity) => void;
}

export const GlobalEntitySwitcher: React.FC<GlobalEntitySwitcherProps> = ({
  theme = 'dark',
  className = '',
  onEntityChanged
}) => {
  const { selectedFramework, setSelectedFramework, setActiveModule } = useGRC();
  const { showToast } = useToast();

  const [activeEntityId, setActiveEntityId] = useState<string>(() => {
    return localStorage.getItem('skanda_active_entity_id') || 'entity_uk_global';
  });
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  const activeEntity = CORPORATE_ENTITIES.find(e => e.id === activeEntityId) || CORPORATE_ENTITIES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectEntity = (entity: CorporateEntity) => {
    setActiveEntityId(entity.id);
    localStorage.setItem('skanda_active_entity_id', entity.id);
    setIsOpen(false);

    if (onEntityChanged) {
      onEntityChanged(entity);
    }

    // Dispatch global event for listeners
    window.dispatchEvent(
      new CustomEvent('corporate-entity-changed', {
        detail: { entity }
      })
    );

    // Contextual toast notification with quick jump
    showToast({
      title: `Scope Switched: ${entity.name}`,
      message: `Jurisdiction: ${entity.regulatoryJurisdiction} • Regulated by ${entity.primaryRegulator}`,
      type: 'info'
    });
  };

  const filteredEntities = CORPORATE_ENTITIES.filter(
    e =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.countryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.regulatoryJurisdiction.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.mandatedFrameworks.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        id="global-entity-switcher-btn"
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={`h-9 px-2 sm:px-2.5 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 transition focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer select-none max-w-[110px] sm:max-w-[140px] xl:max-w-[165px] shrink-0 ${
          theme === 'light'
            ? 'bg-slate-100 hover:bg-slate-200/80 text-slate-900 border-slate-300 shadow-2xs'
            : 'bg-slate-900 hover:bg-slate-850 text-slate-100 border-slate-800'
        }`}
        title={`Active Legal Entity & Regional Jurisdiction: ${activeEntity.name} (${activeEntity.regulatoryJurisdiction})`}
      >
        <span className="text-sm shrink-0 leading-none" role="img" aria-label={activeEntity.countryName}>
          {activeEntity.flag}
        </span>
        <span className="truncate text-xs font-bold leading-none min-w-0">
          {activeEntity.name.replace('SKANDA ', '').replace('Apex ', '').replace(' Ltd', '').replace(' Inc', '').replace(' Pte', '')}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 opacity-60 transition-transform duration-200 ${
            isOpen ? 'rotate-180 opacity-100 text-indigo-400' : ''
          }`}
        />
      </button>

      {/* Popover Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border shadow-2xl p-3 z-50 backdrop-blur-xl ${
              theme === 'light'
                ? 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/50'
                : 'bg-slate-900/95 border-slate-800 text-white shadow-black/80'
            }`}
          >
            {/* Header / Title */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800 mb-2">
              <div className="flex items-center space-x-1.5">
                <Globe className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Entity & Jurisdiction Scope
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
                {CORPORATE_ENTITIES.length} Entities
              </span>
            </div>

            {/* Search Input */}
            <div className="relative mb-2.5">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Filter by country, entity, or regulator..."
                className={`w-full pl-8 pr-3 py-1.5 rounded-xl text-xs border outline-none transition ${
                  theme === 'light'
                    ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-500'
                    : 'bg-slate-950 border-slate-850 text-white focus:border-indigo-500'
                }`}
                autoFocus
              />
            </div>

            {/* Entity List */}
            <div className="max-h-72 overflow-y-auto space-y-1.5 pr-0.5">
              {filteredEntities.map(entity => {
                const isSelected = entity.id === activeEntity.id;
                return (
                  <button
                    key={entity.id}
                    onClick={() => handleSelectEntity(entity)}
                    className={`w-full p-2.5 rounded-xl text-left border transition cursor-pointer flex flex-col gap-1.5 ${
                      isSelected
                        ? theme === 'light'
                          ? 'bg-indigo-50/90 border-indigo-300 text-indigo-950 ring-1 ring-indigo-400/40'
                          : 'bg-indigo-950/40 border-indigo-600/50 text-white ring-1 ring-indigo-500/40'
                        : theme === 'light'
                        ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
                        : 'bg-slate-950/60 hover:bg-slate-850 border-slate-850 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg leading-none">{entity.flag}</span>
                        <div>
                          <div className="font-bold text-xs flex items-center space-x-1.5 leading-snug">
                            <span>{entity.name}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {entity.legalIdentifier} • {entity.countryName}
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <span className="px-1.5 py-0.5 rounded bg-indigo-500 text-white text-[10px] font-bold flex items-center space-x-1">
                          <Check className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      )}
                    </div>

                    {/* Regulatory Tags */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono border ${
                        theme === 'light'
                          ? 'bg-slate-100 text-slate-700 border-slate-200'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700/50'
                      }`}>
                        Regulator: {entity.primaryRegulator.split('(')[0].trim()}
                      </span>
                      {entity.readinessScore ? (
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono border font-bold ${
                          theme === 'light'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          Score: {entity.readinessScore}%
                        </span>
                      ) : (
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono border ${
                          theme === 'light'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          Data collection required
                        </span>
                      )}
                    </div>

                    <div className="text-[10px] text-slate-400 flex items-center space-x-1 mt-0.5">
                      <Scale className="w-3 h-3 text-slate-500" />
                      <span>{entity.mandatedFrameworks.slice(0, 3).join(' • ')}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer Summary / Quick Action */}
            <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[11px] ${
              theme === 'light' ? 'border-slate-200 text-slate-600' : 'border-slate-800 text-slate-400'
            }`}>
              <span>Currency: <strong className={theme === 'light' ? 'text-slate-900 font-bold' : 'text-slate-200'}>{activeEntity.currency}</strong></span>
              <button
                onClick={() => {
                  setIsOpen(false);
                  if (activeEntity.id === 'entity_sg') setActiveModule('mas_trm');
                  else if (activeEntity.id === 'entity_in') setActiveModule('dpdp_act');
                  else setActiveModule('iso27001_workbench');
                }}
                className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center space-x-1 cursor-pointer"
              >
                <span>Open {activeEntity.recommendedFrameworkId}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
