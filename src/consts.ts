// Site-wide settings (ported from the Jekyll _config.yml).
export const SITE = {
  title: 'Minjae Isaac Kwon',
  description: 'Personal Website',
  url: 'https://isaack.dev',
  locale: 'ko_KR',
  lang: 'ko',
  titleSeparator: '-',
  gaId: 'G-894XVHGPT3',
  heroEyebrow: 'PHYSICS · ENGINEERING · NOTES',
  // Default accent hue (OKLCH, 0-360); must match --hue in styles/global.css.
  hue: 258,
};

export const AUTHOR = {
  name: 'Minjae Isaac Kwon',
  avatar: '/assets/img/profile_sq.jpg',
  bio: 'Physicist, Engineer, Mechanics',
  location: 'Turin, Italy',
  links: [
    { label: 'Email (Work)', url: 'mailto:isaac@uos.ac.kr' },
    { label: 'Website', url: 'https://isaack.dev' },
    { label: 'Facebook', url: 'https://facebook.com/Minjae.Isaac.Kwon' },
    { label: 'GitHub', url: 'https://github.com/Isaac-Kwon' },
  ],
};

export const NAV = [
  { title: 'About', url: '/about/', icon: 'user' },
  { title: 'Posts', url: '/posts/', icon: 'posts' },
  { title: 'Projects', url: '/projects/', icon: 'projects' },
  { title: 'Publications', url: '/publications/', icon: 'paper' },
  { title: 'GPLAB', url: '/gplab/', icon: 'lab' },
] as const;

// Presets offered by the colour picker (hue values, OKLCH).
export const HUE_PRESETS = [
  { name: 'Sky', hue: 258 },
  { name: 'Indigo', hue: 282 },
  { name: 'Violet', hue: 305 },
  { name: 'Rose', hue: 355 },
  { name: 'Coral', hue: 32 },
  { name: 'Amber', hue: 75 },
  { name: 'Green', hue: 145 },
  { name: 'Teal', hue: 185 },
  { name: 'Cyan', hue: 220 },
] as const;
