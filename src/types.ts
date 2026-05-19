export type QuestionType = 'MC' | 'FIB' | 'PO' | 'SE' | 'ORD';

export type Question = {
    id: string;
    world: string;
    unit: string;
    lesson: string;
    q_index: string;
    type: QuestionType;
    prompt: string;
    code: string;
    options: string[];
    answer: string;
    explanation: string;
    ord_items: string[];
    book_ref: string;
    lesson_title: string;
    quote: string;
    source_url: string;
};

export type Lesson = {
    id: string;
    title: string;
    book_ref: string;
    questions: Question[];
};

export type Unit = {
    id: string;
    lessons: Lesson[];
};

export type World = {
    id: string;
    title: string;
    units: Unit[];
};

export type QuestionTree = { worlds: World[] };

export type WorldMeta = {
    id: string;
    title: string;
    blurb?: string;
};

export type Practice = {
    id: string;             // e.g. "w1-practice"
    world: string;          // e.g. "w1"
    title: string;
    prompt: string;
    starterCode: string;
    book_ref: string;
    source_url: string;
};
