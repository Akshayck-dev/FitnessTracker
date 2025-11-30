import React from 'react';
import { Star, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Studio } from '../types';

interface StudioCardProps {
  studio: Studio;
}

export const StudioCard: React.FC<StudioCardProps> = ({ studio }) => {
  return (
    <Link to={`/studio/${studio.id}`} className="block group">
      <div className="bg-surface rounded-2xl overflow-hidden border border-secondary hover:border-gray-700 transition-colors">
        <div className="relative h-48">
          <img
            src={studio.image}
            alt={studio.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1">
             <Star size={12} className="text-yellow-400 fill-yellow-400" />
             <span className="text-xs font-bold text-white">{studio.rating}</span>
          </div>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-start mb-1">
             <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{studio.name}</h3>
          </div>
          
          <p className="text-muted text-xs mb-3 flex items-center gap-1">
             <MapPin size={12} /> {studio.address}
          </p>

          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-2">
               <span className="text-xs text-white bg-secondary px-2 py-1 rounded-md border border-gray-800">{studio.distance} away</span>
            </div>
            <div className="flex items-center gap-2">
               <span className={`w-2 h-2 rounded-full ${studio.isOpen ? 'bg-primary' : 'bg-red-500'}`}></span>
               <span className={`text-xs font-medium ${studio.isOpen ? 'text-primary' : 'text-red-500'}`}>
                  {studio.isOpen ? 'Open' : 'Closed'}
               </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};