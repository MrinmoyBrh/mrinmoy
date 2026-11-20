export interface SkillGroup {
  category: string;
  skills: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    category: 'Backend Development',
    skills: ['Node.js', 'TypeScript', 'Express.js', 'Fastify', 'Python', 'Laravel', 'PHP', 'REST APIs'],
  },
  {
    category: 'Databases',
    skills: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis'],
  },
  {
    category: 'Cloud & Infrastructure',
    skills: ['Docker', 'Linux', 'Nginx', 'Git & GitHub'],
  },
  {
    category: 'Developer Tools',
    skills: ['Postman', 'VS Code', 'npm', 'Vite'],
  },
];
