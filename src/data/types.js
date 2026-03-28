export const types = {
  INTJ: {
    nickname: { zh: '策略家', en: 'The Architect' },
    rarity: '2.1%',
    description: {
      zh: '独立、自信、果断，以高度战略眼光看待世界。你为自己设立宏大目标，并以罕见的决心推动实现。知识渊博而鲜于外露，是天生的系统架构师。',
      en: 'Independent, confident, and decisive, you see the world through a highly strategic lens. You set ambitious goals and pursue them with rare determination — deeply knowledgeable yet rarely showy, a born architect of systems.',
    },
    strengths: {
      zh: ['战略眼光', '自律专注', '分析力强', '目标导向', '独立思考'],
      en: ['Strategic vision', 'Self-discipline', 'Sharp analysis', 'Goal-driven', 'Independent thinking'],
    },
    careers: {
      zh: ['战略顾问', '软件架构师', '科学研究员', '企业高管', '系统工程师'],
      en: ['Strategic consultant', 'Software architect', 'Research scientist', 'Executive', 'Systems engineer'],
    },
    famous: ['Elon Musk', 'Nikola Tesla', 'Isaac Newton'],
    bestMatch: ['ENFP', 'ENTP'],
    cognitiveStack: 'Ni Te Fi Se',
  },
  INTP: {
    nickname: { zh: '逻辑学家', en: 'The Logician' },
    rarity: '3.3%',
    description: {
      zh: '思维敏锐、喜好分析，对未解之谜有无穷的好奇心。你热爱理论、讨厌规则，追求知识本身的纯粹乐趣。在思想的宇宙里，你永远在探索边界。',
      en: 'Sharp, analytical, and endlessly curious about unsolved puzzles. You love theory and loathe rigid rules, pursuing knowledge for its own sake. In the universe of ideas, you are always pushing the boundary.',
    },
    strengths: {
      zh: ['逻辑严密', '创意思维', '客观分析', '自我驱动', '深度学习'],
      en: ['Logical rigor', 'Creative thinking', 'Objective analysis', 'Self-motivation', 'Deep learning'],
    },
    careers: {
      zh: ['数学研究员', '哲学家', '程序员', '经济学家', '物理学家'],
      en: ['Mathematician', 'Philosopher', 'Software developer', 'Economist', 'Physicist'],
    },
    famous: ['Albert Einstein', 'Bill Gates', 'Charles Darwin'],
    bestMatch: ['ENFJ', 'ENTJ'],
    cognitiveStack: 'Ti Ne Si Fe',
  },
  ENTJ: {
    nickname: { zh: '指挥官', en: 'The Commander' },
    rarity: '1.8%',
    description: {
      zh: '天生的领导者，目标明确、行动力强。你擅长识别低效并制定解决方案，在混乱中带来秩序。你相信意志力可以改变一切。',
      en: 'A born leader — goal-driven and action-oriented. You spot inefficiency and build solutions, bringing order to chaos. You believe that willpower can change everything.',
    },
    strengths: {
      zh: ['领导力', '决断力', '战略规划', '执行力', '自信心'],
      en: ['Leadership', 'Decisiveness', 'Strategic planning', 'Execution', 'Confidence'],
    },
    careers: {
      zh: ['CEO', '律师', '创业者', '项目总监', '政治家'],
      en: ['CEO', 'Lawyer', 'Entrepreneur', 'Project director', 'Politician'],
    },
    famous: ['Steve Jobs', 'Napoleon Bonaparte', 'Margaret Thatcher'],
    bestMatch: ['INTP', 'INFP'],
    cognitiveStack: 'Te Ni Se Fi',
  },
  ENTP: {
    nickname: { zh: '辩论家', en: 'The Debater' },
    rarity: '3.2%',
    description: {
      zh: '机智、好辩、充满创意，喜欢挑战既有观念。你不为传统所束缚，总能从意想不到的角度找到突破口。辩论对你来说是思维的竞技场，也是最好的玩具。',
      en: 'Witty, argumentative, and brimming with ideas, you love challenging established thinking. Unbound by convention, you find breakthroughs from unexpected angles. Debate is your intellectual playground.',
    },
    strengths: {
      zh: ['创新能力', '快速思维', '表达能力', '挑战精神', '多维视角'],
      en: ['Innovation', 'Quick thinking', 'Articulation', 'Challenger mindset', 'Multiple perspectives'],
    },
    careers: {
      zh: ['创业者', '律师', '创意总监', '产品经理', '营销策划'],
      en: ['Entrepreneur', 'Lawyer', 'Creative director', 'Product manager', 'Marketing strategist'],
    },
    famous: ['Mark Twain', 'Walt Disney', 'Thomas Edison'],
    bestMatch: ['INFJ', 'INTJ'],
    cognitiveStack: 'Ne Ti Fe Si',
  },
  INFJ: {
    nickname: { zh: '倡导者', en: 'The Advocate' },
    rarity: '1.5%',
    description: {
      zh: '少数中的少数，兼具理想主义的热忱与实用主义的执行力。你对人性有深刻的洞察，对世界有宏大的愿景，同时对自己保持沉默与克制。',
      en: 'Rare and paradoxical — idealistic in vision yet practical in action. You possess deep insight into human nature and a grand vision for the world, while remaining quietly self-contained.',
    },
    strengths: {
      zh: ['洞察力', '共情能力', '有远见', '坚定信念', '富有创造力'],
      en: ['Insight', 'Empathy', 'Vision', 'Conviction', 'Creativity'],
    },
    careers: {
      zh: ['心理咨询师', '作家', '社会活动家', '教育者', '艺术治疗师'],
      en: ['Counselor', 'Writer', 'Social activist', 'Educator', 'Art therapist'],
    },
    famous: ['Martin Luther King', 'Taylor Swift', 'Oprah Winfrey'],
    bestMatch: ['ENTP', 'ENFP'],
    cognitiveStack: 'Ni Fe Ti Se',
  },
  INFP: {
    nickname: { zh: '调停者', en: 'The Mediator' },
    rarity: '4.4%',
    description: {
      zh: '内心世界丰富而细腻，由强烈的价值观驱动。你不断寻找生命的意义，对弱势群体充满同情，是真正的理想主义者。创作是你与世界对话的方式。',
      en: 'Rich inner world driven by deep personal values. You endlessly seek meaning, feel compassion for the marginalized, and are a true idealist. Creative expression is how you speak to the world.',
    },
    strengths: {
      zh: ['感受力强', '忠于价值观', '创造力', '同理心', '适应灵活'],
      en: ['Deep sensitivity', 'Value-driven', 'Creativity', 'Empathy', 'Adaptability'],
    },
    careers: {
      zh: ['作家', '艺术家', '心理咨询师', '音乐人', 'NGO工作者'],
      en: ['Writer', 'Artist', 'Counselor', 'Musician', 'NGO worker'],
    },
    famous: ['J.R.R. Tolkien', 'Princess Diana', 'Johnny Depp'],
    bestMatch: ['ENTJ', 'ENFJ'],
    cognitiveStack: 'Fi Ne Si Te',
  },
  ENFJ: {
    nickname: { zh: '主角', en: 'The Protagonist' },
    rarity: '2.5%',
    description: {
      zh: '充满魅力的天生领导者，以帮助他人实现潜力为使命。你对人有天赋的感知力，能轻易在不同性格的人之间建立联结，是真正的主角型人格。',
      en: 'A charismatic natural leader whose mission is helping others reach their potential. You have a gift for reading people and building bridges across personalities — a true protagonist.',
    },
    strengths: {
      zh: ['感召力', '组织协调', '共情', '积极影响力', '沟通表达'],
      en: ['Charisma', 'Coordination', 'Empathy', 'Positive influence', 'Communication'],
    },
    careers: {
      zh: ['培训师', '教师', '政治家', '公关顾问', '生涯规划师'],
      en: ['Trainer', 'Teacher', 'Politician', 'PR consultant', 'Career counselor'],
    },
    famous: ['Barack Obama', 'Oprah Winfrey', 'Nelson Mandela'],
    bestMatch: ['INFP', 'INTP'],
    cognitiveStack: 'Fe Ni Se Ti',
  },
  ENFP: {
    nickname: { zh: '竞选者', en: 'The Campaigner' },
    rarity: '8.1%',
    description: {
      zh: '热情、富有创造力，充满对生活的好奇心。你连接想法与人，以无尽的热忱探索每一种可能性。你的存在本身就是一种鼓舞。',
      en: 'Enthusiastic, creative, and perpetually curious about life. You connect ideas and people, exploring every possibility with boundless energy. Your mere presence is an inspiration.',
    },
    strengths: {
      zh: ['热情感染力', '创意无限', '社交魅力', '好奇心强', '善于鼓励'],
      en: ['Infectious enthusiasm', 'Boundless creativity', 'Social charm', 'Curiosity', 'Encouraging others'],
    },
    careers: {
      zh: ['创意总监', '演员', '记者', '生涯规划师', '市场营销'],
      en: ['Creative director', 'Actor', 'Journalist', 'Career counselor', 'Marketing'],
    },
    famous: ['Robin Williams', 'Ellen DeGeneres', 'Will Smith'],
    bestMatch: ['INFJ', 'INTJ'],
    cognitiveStack: 'Ne Fi Te Si',
  },
  ISTJ: {
    nickname: { zh: '检查员', en: 'The Logistician' },
    rarity: '11.6%',
    description: {
      zh: '可靠、有条理、负责任，以事实和逻辑为行动依据。你重视传统、履行承诺，是团队中真正能依靠的人。稳如磐石，不为情绪左右。',
      en: 'Reliable, organized, and responsible, guided by facts and logic. You value tradition, keep your word, and are the person your team can truly depend on. Steady as a rock, undistracted by emotion.',
    },
    strengths: {
      zh: ['可靠负责', '注重细节', '执行力强', '诚实守信', '条理清晰'],
      en: ['Reliability', 'Attention to detail', 'Strong execution', 'Integrity', 'Organization'],
    },
    careers: {
      zh: ['会计师', '法官', '军事指挥官', '系统管理员', '财务分析师'],
      en: ['Accountant', 'Judge', 'Military officer', 'Systems administrator', 'Financial analyst'],
    },
    famous: ['Warren Buffett', 'Angela Merkel', 'George Washington'],
    bestMatch: ['ESFP', 'ESTP'],
    cognitiveStack: 'Si Te Fi Ne',
  },
  ISFJ: {
    nickname: { zh: '守护者', en: 'The Defender' },
    rarity: '13.8%',
    description: {
      zh: '温暖而尽职的守护者，总是把他人的需求放在自己之前。你注重细节，有惊人的记忆力，默默地为周围的人创造稳定与安全感。',
      en: 'A warm and dedicated protector who consistently puts others\' needs first. Detail-oriented with a remarkable memory, you quietly create stability and safety for those around you.',
    },
    strengths: {
      zh: ['细心体贴', '记忆力强', '忠诚可靠', '实践能力', '支持他人'],
      en: ['Attentiveness', 'Strong memory', 'Loyalty', 'Practical skills', 'Supporting others'],
    },
    careers: {
      zh: ['护士', '教师', '行政管理', '社会工作者', '室内设计师'],
      en: ['Nurse', 'Teacher', 'Administrator', 'Social worker', 'Interior designer'],
    },
    famous: ['Mother Teresa', 'Beyoncé', 'Kate Middleton'],
    bestMatch: ['ESTP', 'ESFP'],
    cognitiveStack: 'Si Fe Ti Ne',
  },
  ESTJ: {
    nickname: { zh: '总经理', en: 'The Executive' },
    rarity: '8.7%',
    description: {
      zh: '务实、果断、注重秩序，擅长组织人员和资源实现目标。你相信规则和传统是社会运作的基石，并以身作则维护标准。',
      en: 'Practical, decisive, and order-focused, you excel at organizing people and resources to achieve goals. You believe rules and tradition are the bedrock of society, and you uphold standards by example.',
    },
    strengths: {
      zh: ['组织管理', '果断执行', '规则意识', '责任心强', '领导力'],
      en: ['Organization', 'Decisive execution', 'Rule-conscious', 'Strong responsibility', 'Leadership'],
    },
    careers: {
      zh: ['企业管理者', '法官', '军官', '项目经理', '运营总监'],
      en: ['Business manager', 'Judge', 'Military officer', 'Project manager', 'Operations director'],
    },
    famous: ['Michelle Obama', 'Frank Sinatra', 'Sonia Sotomayor'],
    bestMatch: ['ISFP', 'ISTP'],
    cognitiveStack: 'Te Si Ne Fi',
  },
  ESFJ: {
    nickname: { zh: '执政官', en: 'The Consul' },
    rarity: '12.3%',
    description: {
      zh: '关怀他人、重视和谐，天生的连接者。你有强烈的责任心，擅长照顾身边的人，让每个人都感到被接纳和重视。',
      en: 'Caring, harmony-seeking, and a natural connector. Your strong sense of duty combined with a talent for nurturing others makes everyone around you feel welcomed and valued.',
    },
    strengths: {
      zh: ['关怀体贴', '团队凝聚', '忠诚奉献', '社交能力', '组织能力'],
      en: ['Caring', 'Team cohesion', 'Dedication', 'Social skills', 'Organization'],
    },
    careers: {
      zh: ['教师', '护士', '活动策划', '人力资源', '公关'],
      en: ['Teacher', 'Nurse', 'Event planner', 'HR professional', 'Public relations'],
    },
    famous: ['Taylor Swift', 'Prince William', 'Jennifer Garner'],
    bestMatch: ['ISTP', 'ISFP'],
    cognitiveStack: 'Fe Si Ne Ti',
  },
  ISTP: {
    nickname: { zh: '鉴赏家', en: 'The Virtuoso' },
    rarity: '5.4%',
    description: {
      zh: '冷静、分析力强，对机械和工具有天生的亲和力。你用双手理解世界，享受拆解问题直到找到根本原因。行动比言语更能代表你。',
      en: 'Cool, analytical, and naturally in tune with tools and mechanics. You understand the world through your hands, enjoying the process of breaking down problems to their root cause. Actions speak louder than words for you.',
    },
    strengths: {
      zh: ['动手能力', '冷静判断', '灵活应变', '技术专精', '独立解决问题'],
      en: ['Hands-on ability', 'Calm judgment', 'Adaptability', 'Technical mastery', 'Independent problem-solving'],
    },
    careers: {
      zh: ['工程师', '外科医生', '飞行员', '程序员', '技工'],
      en: ['Engineer', 'Surgeon', 'Pilot', 'Developer', 'Mechanic'],
    },
    famous: ['Clint Eastwood', 'Michael Jordan', 'Bruce Lee'],
    bestMatch: ['ESTJ', 'ESFJ'],
    cognitiveStack: 'Ti Se Ni Fe',
  },
  ISFP: {
    nickname: { zh: '探险家', en: 'The Adventurer' },
    rarity: '8.8%',
    description: {
      zh: '温柔、开放，活在当下的艺术家。你不强加观点于人，以高度审美感知世界的美丽，用行动而非言语表达内心。',
      en: 'Gentle, open-minded, and present-focused — a true artist. You impose no views on others, perceive the world\'s beauty through refined aesthetic sense, and express your inner world through action, not words.',
    },
    strengths: {
      zh: ['审美敏感', '真实自我', '随机应变', '艺术天赋', '包容他人'],
      en: ['Aesthetic sensitivity', 'Authenticity', 'Adaptability', 'Artistic talent', 'Acceptance of others'],
    },
    careers: {
      zh: ['设计师', '音乐人', '摄影师', '厨师', '理疗师'],
      en: ['Designer', 'Musician', 'Photographer', 'Chef', 'Therapist'],
    },
    famous: ['Michael Jackson', 'Frida Kahlo', 'Britney Spears'],
    bestMatch: ['ESTJ', 'ESFJ'],
    cognitiveStack: 'Fi Se Ni Te',
  },
  ESTP: {
    nickname: { zh: '企业家', en: 'The Entrepreneur' },
    rarity: '4.3%',
    description: {
      zh: '大胆、实际、精力充沛，最活在当下的人格之一。你善于感知周围的一切，享受刺激和即时行动，在危机中反而表现出色。',
      en: 'Bold, practical, and energetic — one of the most present-focused personalities. Acutely aware of your surroundings, you thrive on excitement and immediate action, performing your best under pressure.',
    },
    strengths: {
      zh: ['行动力', '观察力', '魅力四射', '危机处理', '现实感强'],
      en: ['Action-oriented', 'Sharp observation', 'Charisma', 'Crisis handling', 'Realism'],
    },
    careers: {
      zh: ['创业者', '销售', '警察', '运动员', '经纪人'],
      en: ['Entrepreneur', 'Sales', 'Police officer', 'Athlete', 'Agent'],
    },
    famous: ['Donald Trump', 'Madonna', 'Ernest Hemingway'],
    bestMatch: ['ISFJ', 'ISTJ'],
    cognitiveStack: 'Se Ti Fe Ni',
  },
  ESFP: {
    nickname: { zh: '表演者', en: 'The Entertainer' },
    rarity: '8.5%',
    description: {
      zh: '自发、精力旺盛、充满感染力，是聚会的灵魂人物。你活在感官和当下，享受生活的每一刻，用真实的快乐感染身边的每一个人。',
      en: 'Spontaneous, energetic, and infectiously fun — you are the life of the party. Living in the senses and the present, you enjoy every moment and share genuine joy with everyone around you.',
    },
    strengths: {
      zh: ['感染力', '实践能力', '审美品味', '人际温暖', '即兴创造'],
      en: ['Infectious energy', 'Practical ability', 'Aesthetic taste', 'Warmth', 'Improvisation'],
    },
    careers: {
      zh: ['演员', '活动策划', '导游', '销售', '幼儿教师'],
      en: ['Actor', 'Event planner', 'Tour guide', 'Sales', 'Early childhood educator'],
    },
    famous: ['Elvis Presley', 'Marilyn Monroe', 'Adele'],
    bestMatch: ['ISTJ', 'ISFJ'],
    cognitiveStack: 'Se Fi Te Ni',
  },
}
