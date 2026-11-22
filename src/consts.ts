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
  { title: 'About', url: '/about/' },
  { title: 'Posts', url: '/posts/' },
  { title: 'Projects', url: '/projects/' },
  { title: 'GPLAB', url: '/gplab/' },
];
