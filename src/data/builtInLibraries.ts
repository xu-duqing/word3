import { Library, Word } from '../types';

export const BUILT_IN_LIBRARIES: Library[] = [
  {
    id: 'cet4',
    name: 'CET-4 四级核心词汇',
    description: '大学英语四级高频大纲核心词汇包',
    wordCount: 1500,
  },
  {
    id: 'cet6',
    name: 'CET-6 六级必背词汇',
    description: '大学英语六级高频与阅读重点词',
    wordCount: 2000,
  },
  {
    id: 'kaoyan',
    name: '考研英语 3500 词',
    description: '全国硕士研究生招生考试重点真题词汇',
    wordCount: 3500,
  },
  {
    id: 'ielts',
    name: '雅思 IELTS 进阶词汇',
    description: '雅思听力、阅读与学术写作必备词',
    wordCount: 3000,
  },
  {
    id: 'toefl',
    name: '托福 TOEFL 冲分词汇',
    description: '托福学术背景与听读全真高频词',
    wordCount: 3200,
  },
  {
    id: 'gre',
    name: 'GRE 核心高频词汇',
    description: 'GRE 语文难词与学术逻辑高频词',
    wordCount: 3000,
  },
  {
    id: 'common3000',
    name: '常用 3000 高频词',
    description: '日常交流与美剧高频通用基础词汇',
    wordCount: 3000,
  }
];

// Helper to seed standard initial words for each vocabulary list
export function getInitialWordsForLibrary(libId: string): Omit<Word, 'count_practiced' | 'streak_correct' | 'is_passed' | 'error_count'>[] {
  const rawData: Record<string, { word: string; meaning: string; pos: string; phonetic: string; example?: string }[]> = {
    cet4: [
      { word: 'abandon', pos: 'v.', meaning: '放弃，抛弃，遗弃', phonetic: "/ə'bændən/", example: 'Never abandon your dreams.' },
      { word: 'ability', pos: 'n.', meaning: '能力，本领，才干', phonetic: "/ə'bɪləti/", example: 'She has a remarkable ability in math.' },
      { word: 'abnormal', pos: 'adj.', meaning: '反常的，异常的，不正常的', phonetic: "/æb'nɔːml/", example: 'The weather has been abnormal this month.' },
      { word: 'abundant', pos: 'adj.', meaning: '丰富的，充裕的，大量的', phonetic: "/ə'bʌndənt/", example: 'The country has abundant natural resources.' },
      { word: 'academic', pos: 'adj.', meaning: '学术的，教学的，理论的', phonetic: "/ˌækə'demɪk/", example: 'He has an outstanding academic record.' },
      { word: 'accelerate', pos: 'v.', meaning: '加速，促进，增加', phonetic: "/ək'seləreɪt/", example: 'Exposure to sunlight accelerates aging.' },
      { word: 'accommodate', pos: 'v.', meaning: '容纳，提供住宿，适应', phonetic: "/ə'kɒmədeɪt/", example: 'The hotel can accommodate up to 500 guests.' },
      { word: 'accompany', pos: 'v.', meaning: '陪同，陪伴，伴随', phonetic: "/ə'kʌmpəni/", example: 'May I accompany you to the station?' },
      { word: 'accomplish', pos: 'v.', meaning: '完成，实现，达到', phonetic: "/ə'kʌmplɪʃ/", example: 'We can accomplish anything with team work.' },
      { word: 'accumulate', pos: 'v.', meaning: '积累，积聚，堆积', phonetic: "/ə'kjuːmjəleɪt/", example: 'Dust began to accumulate on the shelf.' },
      { word: 'accurate', pos: 'adj.', meaning: '准确的，精确的', phonetic: "/'ækjərət/", example: 'Provide an accurate calculation.' },
      { word: 'acknowledge', pos: 'v.', meaning: '承认，对…表示感谢，确认收悉', phonetic: "/ək'nɒlɪdʒ/", example: 'He failed to acknowledge his error.' },
      { word: 'acquire', pos: 'v.', meaning: '获得，取得，学到', phonetic: "/ə'kwaɪə(r)/", example: 'Students acquire valuable skills.' },
      { word: 'adapt', pos: 'v.', meaning: '使适应，改编，改写', phonetic: "/ə'dæpt/", example: 'We must adapt to new circumstances.' },
      { word: 'adequate', pos: 'adj.', meaning: '足够的，胜任的，尚可的', phonetic: "/'ædɪkwət/", example: 'Ensure an adequate supply of water.' },
      { word: 'advocate', pos: 'v.', meaning: '提倡，主张，拥护', phonetic: "/'ædvəkeɪt/", example: 'They advocate for environmental protection.' },
      { word: 'affordable', pos: 'adj.', meaning: '负担得起的，价格合理的', phonetic: "/ə'fɔːdəbl/", example: 'We need affordable housing for all.' },
      { word: 'aggressive', pos: 'adj.', meaning: '好斗的，有进取心的，侵略性的', phonetic: "/ə'ɡresɪv/", example: 'An aggressive marketing strategy was launched.' },
      { word: 'allocate', pos: 'v.', meaning: '分配，分派，拨出', phonetic: "/'æləkeɪt/", example: 'Resources were allocated fairly.' },
      { word: 'alter', pos: 'v.', meaning: '改变，变更，修改', phonetic: "/'ɔːltə(r)/", example: 'Nothing can alter my decision.' },
      { word: 'ambiguous', pos: 'adj.', meaning: '模棱两可的，含糊不清的', phonetic: "/æm'bɪɡjuəs/", example: 'His instructions were quite ambiguous.' },
      { word: 'analyze', pos: 'v.', meaning: '分析，分解，细查', phonetic: "/'ænəlaɪz/", example: 'Scientists analyzed the collected samples.' },
      { word: 'annoy', pos: 'v.', meaning: '打扰，使烦恼，使恼怒', phonetic: "/ə'nɔɪ/", example: 'Loud noises really annoy me.' },
      { word: 'anticipate', pos: 'v.', meaning: '预期，期望，预料', phonetic: "/æn'tɪsɪpeɪt/", example: 'We anticipate a sharp increase in sales.' },
      { word: 'apparent', pos: 'adj.', meaning: '显而易见的，表面上的', phonetic: "/ə'pærənt/", example: 'It became apparent that he was right.' },
      { word: 'applaud', pos: 'v.', meaning: '鼓掌，称赞，赞许', phonetic: "/ə'plɔːd/", example: 'The audience applauded enthusiastically.' },
      { word: 'applicant', pos: 'n.', meaning: '申请人，求职者', phonetic: "/'æplɪkənt/", example: 'There were fifty applicants for the job.' },
      { word: 'appoint', pos: 'v.', meaning: '任命，委派，约定', phonetic: "/ə'pɔɪnt/", example: 'She was appointed as the new director.' },
      { word: 'appreciate', pos: 'v.', meaning: '感激，赏识，理解，增值', phonetic: "/ə'priːʃieɪt/", example: 'I really appreciate your kind support.' },
      { word: 'approach', pos: 'v.', meaning: '靠近，接近；n. 方法，途径', phonetic: "/ə'prəʊtʃ/", example: 'A fresh approach to solving problems.' }
    ],
    cet6: [
      { word: 'benevolent', pos: 'adj.', meaning: '仁慈的，善意的，慈善的', phonetic: "/bə'nevələnt/", example: 'A benevolent smile crossed his face.' },
      { word: 'ephemeral', pos: 'adj.', meaning: '短暂的，瞬息的，朝生暮死的', phonetic: "/ɪ'femərəl/", example: 'Fame in modern media is often ephemeral.' },
      { word: 'melancholy', pos: 'adj.', meaning: '忧郁的，悲伤的；n. 忧郁', phonetic: "/'melənkəli/", example: 'Soft melancholy music played in the room.' },
      { word: 'ubiquitous', pos: 'adj.', meaning: '无处不在的，普遍存在的', phonetic: "/juː'bɪkwɪtəs/", example: 'Smartphones have become ubiquitous.' },
      { word: 'serendipity', pos: 'n.', meaning: '意外发现珍贵事物的运气，机缘巧合', phonetic: "/ˌserən'dɪpəti/", example: 'Finding the rare book was pure serendipity.' },
      { word: 'aesthetic', pos: 'adj.', meaning: '审美的，美学的，有美感的', phonetic: "/iːs'θetɪk/", example: 'The building has great aesthetic appeal.' },
      { word: 'ambivalence', pos: 'n.', meaning: '矛盾心理，犹豫不决', phonetic: "/æm'bɪvələns/", example: 'She felt ambivalence toward her promotion.' },
      { word: 'anecdote', pos: 'n.', meaning: '奇闻轶事，短小故事', phonetic: "/'ænɪkdəʊt/", example: 'He entertained us with funny anecdotes.' },
      { word: 'anomaly', pos: 'n.', meaning: '异常，不规则，异常现象', phonetic: "/ə'nɒməli/", example: 'The sudden cold snap was a climate anomaly.' },
      { word: 'articulate', pos: 'v.', meaning: '清楚表达；adj. 表达清晰的', phonetic: "/ɑː'tɪkjuleɪt/", example: 'She articulated her thoughts clearly.' },
      { word: 'audacious', pos: 'adj.', meaning: '大胆的，鲁莽的，敢于冒险的', phonetic: "/ɔː'deɪʃəs/", example: 'He made an audacious rescue attempt.' },
      { word: 'austere', pos: 'adj.', meaning: '朴素的，严厉的，苦行的', phonetic: "/ɔː'stɪə(r)/", example: 'The monk led a quiet, austere life.' },
      { word: 'bolster', pos: 'v.', meaning: '支持，支撑，鼓励，巩固', phonetic: "/'bəʊlstə(r)/", example: 'New evidence bolstered his argument.' },
      { word: 'brevity', pos: 'n.', meaning: '简洁，简短，短暂', phonetic: "/'brevəti/", example: 'Brevity is the soul of wit.' },
      { word: 'candid', pos: 'adj.', meaning: '坦白的，率直的，直言不讳的', phonetic: "/'kændɪd/", example: 'I appreciate your candid opinion.' },
      { word: 'capricious', pos: 'adj.', meaning: '反复无常的，变化莫测的', phonetic: "/kə'prɪʃəs/", example: 'The weather in spring is capricious.' },
      { word: 'catalyst', pos: 'n.', meaning: '催化剂，促进因素', phonetic: "/'kætəlɪst/", example: 'The protest was a catalyst for reform.' },
      { word: 'coercive', pos: 'adj.', meaning: '强迫的，胁迫性的', phonetic: "/kəʊ'ɜːsɪv/", example: 'Coercive measures were rejected.' },
      { word: 'commence', pos: 'v.', meaning: '开始，着手，发生', phonetic: "/kə'mens/", example: 'The ceremony will commence shortly.' },
      { word: 'complacent', pos: 'adj.', meaning: '自满的，得意的，不思进取的', phonetic: "/kəm'pleɪsnt/", example: 'We cannot afford to be complacent.' }
    ],
    kaoyan: [
      { word: 'apple', pos: 'n.', meaning: '苹果', phonetic: "/'æpl/", example: 'An apple a day keeps the doctor away.' },
      { word: 'ephemeral', pos: 'adj.', meaning: '短暂的，瞬息的', phonetic: "/ɪ'femərəl/", example: 'Human life is ephemeral compared to stars.' },
      { word: 'benevolent', pos: 'adj.', meaning: '仁慈的，慈善的', phonetic: "/bə'nevələnt/", example: 'A benevolent ruler praised by all.' },
      { word: 'melancholy', pos: 'adj.', meaning: '忧郁的，愁闷的', phonetic: "/'melənkəli/", example: 'Feeling melancholy on rainy days.' },
      { word: 'serendipity', pos: 'n.', meaning: '意外惊喜，机缘巧合', phonetic: "/ˌserən'dɪpəti/", example: 'Meeting my best friend was serendipity.' },
      { word: 'ubiquitous', pos: 'adj.', meaning: '无处不在的', phonetic: "/juː'bɪkwɪtəs/", example: 'WiFi is ubiquitous in modern cities.' },
      { word: 'pragmatic', pos: 'adj.', meaning: '务实的，重实效的', phonetic: "/præɡ'mætɪk/", example: 'Take a pragmatic approach to study.' },
      { word: 'resilient', pos: 'adj.', meaning: '有弹性的，适应力强的，能迅速复原的', phonetic: "/rɪ'zɪliənt/", example: 'Kids are remarkably resilient.' },
      { word: 'scrutinize', pos: 'v.', meaning: '仔细检查，审视', phonetic: "/'skruːtənaɪz/", example: 'The inspector scrutinized every detail.' },
      { word: 'tenacious', pos: 'adj.', meaning: '坚韧不拔的，执着的', phonetic: "/tə'neɪʃəs/", example: 'She displayed a tenacious grip on her goal.' },
      { word: 'meticulous', pos: 'adj.', meaning: '一丝不苟的，极注意细节的', phonetic: "/mə'tɪkjələs/", example: 'He is meticulous about his work.' },
      { word: 'perseverance', pos: 'n.', meaning: '坚持不懈，不屈不挠', phonetic: "/ˌpɜːsɪ'vɪərəns/", example: 'Perseverance pays off in the end.' },
      { word: 'eloquent', pos: 'adj.', meaning: '雄辩的，滔滔不绝的，有说服力的', phonetic: "/'eləkwənt/", example: 'An eloquent speech moved the crowd.' },
      { word: 'lucid', pos: 'adj.', meaning: '清晰易懂的，神志清醒的', phonetic: "/'luːsɪd/", example: 'Her explanation was clear and lucid.' },
      { word: 'subtle', pos: 'adj.', meaning: '微妙的，细微的，精妙的', phonetic: "/'sʌtl/", example: 'A subtle difference in color.' }
    ],
    ielts: [
      { word: 'hypothesis', pos: 'n.', meaning: '假设，假说', phonetic: "/haɪ'pɒθəsɪs/", example: 'Formulate a scientific hypothesis.' },
      { word: 'empirical', pos: 'adj.', meaning: '实证的，凭经验的', phonetic: "/ɪm'pɪrɪkl/", example: 'Empirical data supports the claim.' },
      { word: 'methodology', pos: 'n.', meaning: '方法论，教学法', phonetic: "/ˌmeθə'dɒlədʒi/", example: 'The research methodology was sound.' },
      { word: 'phenomenon', pos: 'n.', meaning: '现象，奇迹', phonetic: "/fə'nɒmɪnən/", example: 'A strange natural phenomenon occurred.' },
      { word: 'sustainable', pos: 'adj.', meaning: '可持续的，可长久维持的', phonetic: "/sə'steɪnəbl/", example: 'Promote sustainable economic growth.' },
      { word: 'biodiversity', pos: 'n.', meaning: '生物多样性', phonetic: "/ˌbaɪəʊdaɪ'vɜːsəti/", example: 'Protecting rainforest biodiversity is vital.' },
      { word: 'infrastructure', pos: 'n.', meaning: '基础设施，下层建筑', phonetic: "/'ɪnfrəstrʌktʃə(r)/", example: 'Invest heavily in urban infrastructure.' },
      { word: 'paradigm', pos: 'n.', meaning: '范例，典范，模式', phonetic: "/'pærədaɪm/", example: 'A new paradigm in modern medicine.' },
      { word: 'deteriorate', pos: 'v.', meaning: '恶化，退化，变坏', phonetic: "/dɪ'tɪəriəreɪt/", example: 'Air quality continues to deteriorate.' },
      { word: 'implement', pos: 'v.', meaning: '实施，执行，贯彻', phonetic: "/'ɪmplɪment/", example: 'Implement the new policy next month.' }
    ],
    toefl: [
      { word: 'glacier', pos: 'n.', meaning: '冰川，冰河', phonetic: "/'ɡlæsiə(r)/", example: 'Glaciers are melting rapidly.' },
      { word: 'ecosystem', pos: 'n.', meaning: '生态系统', phonetic: "/'iːkəʊsɪstəm/", example: 'Coral reefs are delicate ecosystems.' },
      { word: 'sediment', pos: 'n.', meaning: '沉淀物，沉积物', phonetic: "/'sedɪmənt/", example: 'Thick sediment layered at river bottom.' },
      { word: 'fossilize', pos: 'v.', meaning: '变成化石，使石化', phonetic: "/'fɒsəlaɪz/", example: 'Bones fossilize over millions of years.' },
      { word: 'photosynthesis', pos: 'n.', meaning: '光合作用', phonetic: "/ˌfəʊtəʊ'sɪnθəsɪs/", example: 'Plants create food via photosynthesis.' },
      { word: 'archaeology', pos: 'n.', meaning: '考古学', phonetic: "/ˌɑːki'ɒlədʒi/", example: 'Archaeology unveils ancient secrets.' },
      { word: 'hemisphere', pos: 'n.', meaning: '半球，大脑半球', phonetic: "/'hemɪsfɪə(r)/", example: 'The Northern Hemisphere in summer.' },
      { word: 'precipitation', pos: 'n.', meaning: '降水，降水量，沉淀', phonetic: "/prɪˌsɪpɪ'teɪʃn/", example: 'Expect heavy precipitation tomorrow.' },
      { word: 'terrestrial', pos: 'adj.', meaning: '陆地的，地球的', phonetic: "/tə'restriəl/", example: 'Terrestrial animals live on land.' },
      { word: 'volcanic', pos: 'adj.', meaning: '火山的，火山引起的', phonetic: "/vɒl'kænɪk/", example: 'Volcanic ash covered the nearby town.' }
    ],
    gre: [
      { word: 'equanimity', pos: 'n.', meaning: '镇定，沉着，平静', phonetic: "/ˌiːkwə'nɪməti/", example: 'She faced the crisis with equanimity.' },
      { word: 'fastidious', pos: 'adj.', meaning: '挑剔的，严苛的，讲究的', phonetic: "/fæ'stɪdiəs/", example: 'He is fastidious about his appearance.' },
      { word: 'garrulous', pos: 'adj.', meaning: '喋喋不休的，饶舌的', phonetic: "/'ɡærələs/", example: 'A garrulous neighbor talked endlessly.' },
      { word: 'iconoclast', pos: 'n.', meaning: '打破旧习者，反传统人士', phonetic: "/aɪ'kɒnəklæst/", example: 'The artist was a true iconoclast.' },
      { word: 'juxtapose', pos: 'v.', meaning: '并置，并列对比', phonetic: "/ˌdʒʌkstə'pəʊz/", example: 'Juxtapose black and white photos.' },
      { word: 'loquacious', pos: 'adj.', meaning: '话多的，健谈的', phonetic: "/lə'kweɪʃəs/", example: 'A loquacious speaker captivated the room.' },
      { word: 'magnanimous', pos: 'adj.', meaning: '宽宏大量的，慷慨的', phonetic: "/mæɡ'nænɪməs/", example: 'A magnanimous gesture toward an enemy.' },
      { word: 'obfuscate', pos: 'v.', meaning: '使困惑，使模糊，混淆', phonetic: "/'ɒbfəskeɪt/", example: 'Do not obfuscate the truth with jargon.' },
      { word: 'pusillanimous', pos: 'adj.', meaning: '胆小的，怯懦的', phonetic: "/ˌpjuːsɪ'lænɪməs/", example: 'A pusillanimous response to danger.' },
      { word: 'recondite', pos: 'adj.', meaning: '深奥的，晦涩难懂的', phonetic: "/'rekəndaɪt/", example: 'A recondite treatise on philosophy.' }
    ],
    common3000: [
      { word: 'hello', pos: 'int.', meaning: '你好，喂', phonetic: "/hə'ləʊ/", example: 'Hello, glad to meet you!' },
      { word: 'world', pos: 'n.', meaning: '世界，地球', phonetic: "/wɜːld/", example: 'Welcome to our wonderful world.' },
      { word: 'friend', pos: 'n.', meaning: '朋友，友人', phonetic: "/frend/", example: 'A true friend is forever.' },
      { word: 'journey', pos: 'n.', meaning: '旅程，旅行，历程', phonetic: "/'dʒɜːni/", example: 'Life is a long journey.' },
      { word: 'courage', pos: 'n.', meaning: '勇气，胆量', phonetic: "/'kʌrɪdʒ/", example: 'Have the courage to follow your heart.' },
      { word: 'wisdom', pos: 'n.', meaning: '智慧，才智', phonetic: "/'wɪzdəm/", example: 'Wisdom comes with experience.' },
      { word: 'harmony', pos: 'n.', meaning: '和谐，融洽，和声', phonetic: "/'hɑːməni/", example: 'Live in harmony with nature.' },
      { word: 'passion', pos: 'n.', meaning: '激情，热情', phonetic: "/'pæʃn/", example: 'Pursue your goals with passion.' },
      { word: 'clarity', pos: 'n.', meaning: '清晰，明晰，清澈', phonetic: "/'klærəti/", example: 'Speak with total clarity.' },
      { word: 'horizon', pos: 'n.', meaning: '地平线，眼界，视野', phonetic: "/hə'raɪzn/", example: 'Broaden your intellectual horizon.' }
    ]
  };

  const selected = rawData[libId] || rawData['cet4'];
  
  // Return mapping
  return selected.map((item, idx) => ({
    id: `${libId}_${idx + 1}_${item.word}`,
    word: item.word,
    meaning: item.meaning,
    pos: item.pos,
    phonetic: item.phonetic,
    example: item.example
  }));
}
