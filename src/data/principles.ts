export interface Principle {
  number: string;
  title: string;
  description: string;
}

export const principles: Principle[] = [
  {
    number: '01',
    title: 'Expect Things to Go Wrong',
    description: "Sometimes an API fails, a request takes too long, or something simply doesn't work the way I expected. I've learned that thinking about these situations early can save a lot of trouble later.",
  },
  {
    number: '02',
    title: 'Keep Things Simple',
    description: "I believe good solutions don't always need complicated technologies. I try to understand the problem first and choose an approach that's practical, clear, and easy to maintain.",
  },
  {
    number: '03',
    title: 'Learn from What Breaks',
    description: "Some of my best learning experiences have come from debugging problems. Every error teaches me something new and helps me approach the next challenge with a better understanding.",
  },
];
