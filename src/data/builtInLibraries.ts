import { Library, Word } from '../types';
import core3000Data from './core3000.json';
import pepGrade5Data from './pepGrade5.json';

export const BUILT_IN_LIBRARIES: Library[] = [
  {
    id: 'pepGrade5',
    name: 'PEP人教版五年级词汇',
    description: '人教版 PEP 英语五年级上下册核心词汇 (118 词)',
    wordCount: pepGrade5Data.length,
  },
  {
    id: 'core3000',
    name: '英语核心 3000 词',
    description: '精选英语高频核心 3000 词库',
    wordCount: core3000Data.length,
  },
];

export function getInitialWordsForLibrary(libId: string): Omit<Word, 'id' | 'count_practiced' | 'streak_correct' | 'is_passed' | 'error_count'>[] {
  if (libId === 'pepGrade5') {
    return pepGrade5Data;
  }
  return core3000Data;
}

