import { ComponentType } from 'react';

export interface ExperimentMeta {
  id: string;
  title: string;
  description: string;
  author?: string;
  created: string;
  updated?: string;
  tags: string[];
  thumbnailUrl: string;
  fullPath: string;
}

export interface ExperimentRegistryItem extends ExperimentMeta {
  component: () => Promise<{ default: ComponentType<object> }>;
}

export const experiments: ExperimentRegistryItem[] = [
  {
    id: 'gravity-balls',
    title: 'Gravity Balls Game',
    description: 'Drop balls and watch them bounce with realistic gravity and collisions.',
    author: 'Unknown',
    created: '2024-07-17',
    tags: ['physics', 'canvas', 'game'],
    thumbnailUrl: '/thumbnails/gravity-balls.png',
    fullPath: '/experiments/gravity-balls',
    component: () => import('./first_experiment'),
  },
  {
    id: 'crazy-calculator',
    title: 'Crazy Calculator',
    description: 'A calculator that sometimes gives you wild results and effects!',
    author: 'AI',
    created: '2024-07-17',
    tags: ['math', 'fun', 'ui'],
    thumbnailUrl: '/thumbnails/crazy-calculator.png',
    fullPath: '/experiments/crazy-calculator',
    component: () => import('./crazy_calculator'),
  },
  {
    id: 'liquid-gravity',
    title: 'Liquid Gravity',
    description: 'A mesmerizing simulation of liquid particles under gravity.',
    author: 'AI',
    created: '2024-07-17',
    tags: ['physics', 'canvas', 'liquid'],
    thumbnailUrl: '/thumbnails/liquid-gravity.png',
    fullPath: '/experiments/liquid-gravity',
    component: () => import('./liquid_gravity'),
  },
  {
    id: 'magnet-sim',
    title: 'Magnet Simulation',
    description: 'Drag the red magnet to move the particles!',
    author: 'AI',
    created: '2024-07-17',
    tags: ['physics', 'canvas', 'magnet'],
    thumbnailUrl: '/thumbnails/magnet-sim.png',
    fullPath: '/experiments/magnet-sim',
    component: () => import('./magnet_sim'),
  },
  {
    id: 'motorcycle-game',
    title: 'Motorcycle Game',
    description: 'Ride a motorcycle over hills! Use arrows to move, space to jump.',
    author: 'AI',
    created: '2024-07-17',
    tags: ['game', 'canvas', 'motorcycle'],
    thumbnailUrl: '/thumbnails/motorcycle-game.png',
    fullPath: '/experiments/motorcycle-game',
    component: () => import('./motorcycle_game'),
  },
  {
    id: 'octagon-bounce',
    title: 'Octagon Bounce',
    description: 'Balls bounce inside a spinning octagon boundary. Minimal, robust demo.',
    author: 'AI',
    created: '2024-07-17',
    tags: ['physics', 'canvas', 'octagon', 'minimal'],
    thumbnailUrl: '/thumbnails/octagon-bounce.png',
    fullPath: '/experiments/octagon-bounce',
    component: () => import('./octagon_bounce'),
  },
  {
    id: 'planetary-sim',
    title: 'Planetary Simulation',
    description: 'Simulate planets orbiting a sun. Add planets and watch stable orbits!',
    author: 'AI',
    created: '2024-07-17',
    tags: ['physics', 'canvas', 'gravity', 'orbit', 'solar system'],
    thumbnailUrl: '/thumbnails/planetary-sim.png',
    fullPath: '/experiments/planetary-sim',
    component: () => import('./planetary_sim'),
  },
  {
    id: 'galaxy-3d',
    title: '3D Galaxy Simulator',
    description: 'Experience planets orbiting in true 3D space with depth, perspective, and rotation!',
    author: 'AI',
    created: '2025-01-24',
    tags: ['physics', 'canvas', '3d', 'galaxy', 'orbit', 'perspective'],
    thumbnailUrl: '/thumbnails/galaxy-3d.png',
    fullPath: '/experiments/galaxy-3d',
    component: () => import('./galaxy_3d'),
  },
];

export function getExperimentById(id: string) {
  return experiments.find(e => e.id === id);
}

export function getExperimentsByTag(tag: string) {
  return experiments.filter(e => e.tags.includes(tag));
} 