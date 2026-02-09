export interface VideoModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  features: string[];
  pricing: string;
  website: string;
  strengths: string[];
  limitations?: string[];
  rating: number;
  popularFor: string[];
  thumbnail?: string;
}

export const aiVideoModels: VideoModel[] = [
  {
    id: 'sora',
    name: 'Sora',
    provider: 'OpenAI',
    description: 'OpenAI\'s text-to-video model capable of generating highly realistic videos up to 60 seconds long with complex camera movements and scene compositions.',
    features: [
      '60-second video generation',
      'Text-to-video conversion',
      'Image-to-video',
      'Complex scene understanding',
      'Physics-accurate motion'
    ],
    pricing: 'Early access / Waitlist',
    website: 'https://openai.com/sora',
    strengths: ['Realistic motion', 'Physics simulation', 'Complex scenes'],
    limitations: ['Limited availability', 'Waitlist only'],
    rating: 4.9,
    popularFor: ['Cinematic content', 'Film pre-production', 'Creative projects']
  },
  {
    id: 'runway-gen-2',
    name: 'Gen-2',
    provider: 'Runway',
    description: 'A multimodal AI system that can generate videos from text, images, or video clips. Known for its artistic capabilities and professional features.',
    features: [
      'Text-to-video',
      'Image-to-video',
      'Video-to-video',
      'Inpainting',
      'Motion brush',
      'Upscaling'
    ],
    pricing: '$12-$76/month',
    website: 'https://runwayml.com/gen2',
    strengths: ['Artistic output', 'Professional tools', 'Iterative editing'],
    limitations: ['Subscription required', 'Variable quality'],
    rating: 4.7,
    popularFor: ['Creative advertising', 'Music videos', 'Art installations']
  },
  {
    id: 'pika-labs',
    name: 'Pika 1.0',
    provider: 'Pika Labs',
    description: 'An AI video generation platform focused on ease of use and quick video creation. Offers both web and Discord-based interfaces.',
    features: [
      'Text-to-video',
      'Image-to-video',
      'Video extension',
      'Style modifications',
      'Discord integration'
    ],
    pricing: 'Free tier + Pro plans',
    website: 'https://pika.art',
    strengths: ['User-friendly', 'Quick generation', 'Discord access'],
    limitations: ['Shorter video lengths', 'Less detailed output'],
    rating: 4.5,
    popularFor: ['Social media content', 'Quick prototypes', 'Experiments']
  },
  {
    id: 'stable-video-diffusion',
    name: 'Stable Video Diffusion',
    provider: 'Stability AI',
    description: 'A latent video diffusion model that generates coherent, consistent videos from images. Part of Stability AI\'s growing video suite.',
    features: [
      'Image-to-video',
      'Text-to-video (via Image)',
      'Consistent motion',
      'High-quality output',
      'Open-source options'
    ],
    pricing: 'Free / API pricing',
    website: 'https://stability.ai/stable-video-diffusion',
    strengths: ['Consistency', 'Image quality', 'Open-source'],
    limitations: ['Requires images first', 'Computational requirements'],
    rating: 4.6,
    popularFor: ['Product visualization', 'Cinematic intros', 'Animation']
  },
  {
    id: 'luma-dream-machine',
    name: 'Dream Machine',
    provider: 'Luma AI',
    description: 'A high-quality video generation model that creates realistic, physics-aware videos from text prompts with impressive motion quality.',
    features: [
      'Text-to-video',
      'Fast generation',
      'High fidelity',
      'Physics-aware motion',
      'Camera controls'
    ],
    pricing: 'Free tier + Credits',
    website: 'https://lumalabs.ai/dream-machine',
    strengths: ['Fast processing', 'Realistic motion', 'Easy prompts'],
    limitations: ['Credit system', 'Occasional artifacts'],
    rating: 4.7,
    popularFor: ['Quick content creation', 'Commercials', 'Storyboards']
  },
  {
    id: 'kling',
    name: 'Kling',
    provider: 'Kuaishou',
    description: 'A powerful text-to-video model capable of generating up to 2-minute videos with complex motion and scene changes. Known for high resolution output.',
    features: [
      'Text-to-video',
      'Up to 2-minute videos',
      'High resolution',
      'Complex motion',
      'Scene transitions'
    ],
    pricing: 'API-based / Subscription',
    website: 'https://klingai.com',
    strengths: ['Long videos', 'High resolution', 'Complex scenes'],
    limitations: ['API access required', 'Region restrictions'],
    rating: 4.8,
    popularFor: ['Long-form content', 'Marketing videos', 'Film clips']
  },
  {
    id: 'hailuo-ai',
    name: 'Hailuo AI',
    provider: 'ByteDance/Minimax',
    description: 'A sophisticated video generation model excelling in character consistency and complex motion sequences with detailed scene understanding.',
    features: [
      'Text-to-video',
      'Character consistency',
      'Complex motion',
      'Scene composition',
      'Multi-shot sequences'
    ],
    pricing: 'Freemium / API',
    website: 'https://hailuo.ai',
    strengths: ['Character consistency', 'Complex motion', 'Scene quality'],
    limitations: ['Newer platform', 'Learning curve'],
    rating: 4.6,
    popularFor: ['Character animation', 'Story-driven content', 'Series creation']
  },
  {
    id: 'meta-cinema',
    name: 'CinemaAI',
    provider: 'Meta',
    description: 'Meta\'s research-level video generation system focused on cinematic quality and controlled camera movements for professional filmmaking.',
    features: [
      'Cinematic camera control',
      'Text-to-video',
      'High fidelity',
      'Camera movement presets',
      'Story coherence'
    ],
    pricing: 'Research/Enterprise',
    website: 'https://meta.ai',
    strengths: ['Cinematic quality', 'Camera control', 'Professional output'],
    limitations: ['Limited access', 'Enterprise focus'],
    rating: 4.8,
    popularFor: ['Film production', 'Professional content', 'Cinematic projects']
  },
  {
    id: 'heygen',
    name: 'HeyGen',
    provider: 'HeyGen',
    description: 'Specializes in AI-powered video creation with talking avatars. Excellent for corporate videos, training content, and personalized communication.',
    features: [
      'Talking avatars',
      'Voice cloning',
      'Instant translation',
      'Custom avatars',
      'Script-to-video'
    ],
    pricing: '$24-$199/month',
    website: 'https://heygen.com',
    strengths: ['Talking avatars', 'Multi-language', 'Corporate ready'],
    limitations: ['Avatar-focused', 'Less creative freedom'],
    rating: 4.5,
    popularFor: ['Corporate training', 'Localization', 'Personalized videos']
  },
  {
    id: 'd-id',
    name: 'Creative Reality Studio',
    provider: 'D-ID',
    description: 'Pioneer in AI video with talking photos and avatars. Great for creating human-like presentations and animated characters.',
    features: [
      'Talking photos',
      'Video avatars',
      'Voice integration',
      'Multiple languages',
      'API access'
    ],
    pricing: '$5.99+/month',
    website: 'https://d-id.com',
    strengths: ['Talking photos', 'Easy setup', 'Quick results'],
    limitations: ['Limited styles', 'Avatar-centric'],
    rating: 4.4,
    popularFor: ['Presentations', 'Educational content', 'Marketing']
  },
  {
    id: 'runway-gen-3',
    name: 'Gen-3 Alpha',
    provider: 'Runway',
    description: 'The latest generation from Runway offering significantly improved fidelity, consistency, and control over video generation with advanced timing controls.',
    features: [
      'Text-to-video',
      'Image-to-video',
      'Advanced timing control',
      'Higher fidelity',
      'Better consistency'
    ],
    pricing: '$12-$76/month',
    website: 'https://runwayml.com/gen3',
    strengths: ['High fidelity', 'Better control', 'Professional grade'],
    limitations: ['Premium pricing', 'Subscription needed'],
    rating: 4.8,
    popularFor: ['Professional content', 'Film', 'High-end commercials']
  },
  {
    id: 'invideo-ai',
    name: 'InVideo AI',
    provider: 'InVideo',
    description: 'AI-powered video creation platform that generates videos from text prompts with automatic script generation, voiceover, and stock footage integration.',
    features: [
      'Script-to-video',
      'AI voiceover',
      'Stock footage',
      'Automatic editing',
      'Multi-language'
    ],
    pricing: '$15-$80/month',
    website: 'https://invideo.io',
    strengths: ['Complete workflow', 'Fast output', 'No editing needed'],
    limitations: ['Template-based', 'Less custom control'],
    rating: 4.3,
    popularFor: ['Social media', 'Quick videos', 'Marketing content']
  }
];

export const categories = [
  { id: 'all', name: 'All Models', icon: '🎬' },
  { id: 'text-to-video', name: 'Text-to-Video', icon: '📝' },
  { id: 'image-to-video', name: 'Image-to-Video', icon: '🖼️' },
  { id: 'avatars', name: 'Talking Avatars', icon: '👤' },
  { id: 'creative', name: 'Creative/Artistic', icon: '🎨' },
  { id: 'professional', name: 'Professional', icon: '🎯' }
];

export const sortOptions = [
  { id: 'rating', name: 'Highest Rated' },
  { id: 'name', name: 'Name A-Z' },
  { id: 'newest', name: 'Newest' },
  { id: 'popular', name: 'Most Popular' }
];
