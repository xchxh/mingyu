/**
 * 干支智能知识库
 * 用于为 AI 提供精准的六十甲子意象和日柱断语
 */

interface JiaZiInfo {
  nayin: string;
  image: string; // 意象
  description: string; // 简批
}

// 六十甲子详解
export const JIA_ZI_KNOWLEDGE: Record<string, JiaZiInfo> = {
  '甲子': { nayin: '海中金', image: '屋上之鼠', description: '精明能干，自视高傲，多学少成，早年平平，中年成就。' },
  '乙丑': { nayin: '海中金', image: '海内之牛', description: '少年运气佳，为人慷慨，喜做善事，多才多艺。' },
  '丙寅': { nayin: '炉中火', image: '山林之虎', description: '口快心直，利官近贵，身闲心不空，晚景荣华。' },
  '丁卯': { nayin: '炉中火', image: '望月之兔', description: '手足不停，身心不闲，衣禄不少，性巧聪明。' },
  '戊辰': { nayin: '大林木', image: '清温之龙', description: '喜气春风，利官近贵，骨肉刑伤，儿女不孤。' },
  '己巳': { nayin: '大林木', image: '福气之蛇', description: '聪明伶俐，有功名之分，夫妻和顺，衣食不少。' },
  '庚午': { nayin: '路旁土', image: '堂里之马', description: '快口无心，利官近贵，衣禄丰足，男人权柄。' },
  '辛未': { nayin: '路旁土', image: '得禄之羊', description: '有志气，有技艺，少年多灾，头见女吉。' },
  '壬申': { nayin: '剑锋金', image: '清秀之猴', description: '性巧聪明，机谋多变，重义轻财，近官利贵。' },
  '癸酉': { nayin: '剑锋金', image: '栖宿之鸡', description: '心直口快，人能自强，利官近贵，身闲心不闲。' },
  '甲戌': { nayin: '山头火', image: '守身之狗', description: '口快舌便，身闲心不空，有权柄，名声远播。' },
  '乙亥': { nayin: '山头火', image: '过往之猪', description: '有计谋，善机变，志气高昂，衣食如意。' },
  '丙子': { nayin: '涧下水', image: '田内之鼠', description: '胆大言广，有权柄，谋略过人，早年平平。' },
  '丁丑': { nayin: '涧下水', image: '湖内之牛', description: '和之气，为人衣禄不少，初年有财，晚景荣华。' },
  '戊寅': { nayin: '城头土', image: '过山之虎', description: '猛烈异常，易冷易热，反目无情，早年勤俭。' },
  '己卯': { nayin: '城头土', image: '出林之兔', description: '为人风流，一生衣禄丰足，自然清闲，游山玩水。' },
  '庚辰': { nayin: '白蜡金', image: '恕性之龙', description: '春风和气，劳碌雪霜，利官近贵，名利双全。' },
  '辛巳': { nayin: '白蜡金', image: '冬藏之蛇', description: '有计谋，多机变，志气过人，衣食足用。' },
  '壬午': { nayin: '杨柳木', image: '军中之马', description: '勤俭持家，早年多灾，晚景荣华，妻贤子孝。' },
  '癸未': { nayin: '杨柳木', image: '群内之羊', description: '心急口快，救人无义，反招是非，先祖基业。' },
  '甲申': { nayin: '泉中水', image: '过树之猴', description: '衣禄不少，心性温柔，出入压众，初年颠倒。' },
  '乙酉': { nayin: '泉中水', image: '唱午之鸡', description: '口快心直，志气轩昂，衣禄足用，福寿双全。' },
  '丙戌': { nayin: '屋上土', image: '自眠之狗', description: '豪杰和顺，招财得宝，自立家业，前程远大。' },
  '丁亥': { nayin: '屋上土', image: '过山之猪', description: '性巧聪明，自立自强，衣禄有余，晚景荣华。' },
  '戊子': { nayin: '霹雳火', image: '仓内之鼠', description: '计算聪明，精通文武，早生儿女，迟生保财。' },
  '己丑': { nayin: '霹雳火', image: '栏内之牛', description: '口快心直，通文知武，衣禄不少，男女有情。' },
  '庚寅': { nayin: '松柏木', image: '出山之虎', description: '心性急快，有口无心，易好易怒，反复无常。' },
  '辛卯': { nayin: '松柏木', image: '蟾窟之兔', description: '口快心直，有志气，有权柄，利官近贵。' },
  '壬辰': { nayin: '长流水', image: '行雨之龙', description: '劳碌雪霜，一生衣食不缺，手足不停，早年难聚。' },
  '癸巳': { nayin: '长流水', image: '草中之蛇', description: '聪明伶俐，财谷聚散，主近贵人，中年风霜。' },
  '甲午': { nayin: '沙中金', image: '云中之马', description: '和气待人，交接四海，衣禄丰足，晚年大发。' },
  '乙未': { nayin: '沙中金', image: '敬重之羊', description: '少年勤俭，初年平顺，兄弟少力，子息不孤。' },
  '丙申': { nayin: '山下火', image: '山上之猴', description: '衣食足用，交易买卖，利路亨通，牛田有分。' },
  '丁酉': { nayin: '山下火', image: '独立之鸡', description: '好春风，多情重义，利官近贵，初年劳碌。' },
  '戊戌': { nayin: '平地木', image: '进山之狗', description: '和气待人，家业自创，早年辛勤，晚景荣华。' },
  '己亥': { nayin: '平地木', image: '道院之猪', description: '巧计伶俐，衣食安稳，骨肉刑伤，迟生儿女。' },
  '庚子': { nayin: '壁上土', image: '梁上之鼠', description: '尊重安稳，一生衣禄无亏，持家有权，主有贵人。' },
  '辛丑': { nayin: '壁上土', image: '路途之牛', description: '心性温和，初年有惊恐，衣禄不少，晚景荣华。' },
  '壬寅': { nayin: '金箔金', image: '过林之虎', description: '口快心直，有时不藏，男女早婚，夫妻偕老。' },
  '癸卯': { nayin: '金箔金', image: '出林之兔', description: '衣食不少，凶中化吉，早年不聚，晚景兴隆。' },
  '甲辰': { nayin: '覆灯火', image: '伏潭之龙', description: '衣食丰足，清闲心情，早年平平，中年成就。' },
  '乙巳': { nayin: '覆灯火', image: '出穴之蛇', description: '气象端庄，能文能武，一生衣禄，晚景荣华。' },
  '丙午': { nayin: '天河水', image: '行路之马', description: '清闲心情，身闲心不闲，手足不停，晚景兴隆。' },
  '丁未': { nayin: '天河水', image: '失群之羊', description: '喜怒不常，口驰舌辩，名利有分，衣禄皆足。' },
  '戊申': { nayin: '大驿土', image: '独立之猴', description: '性急心慈，作事反复，初年劳碌，晚景荣华。' },
  '己酉': { nayin: '大驿土', image: '报晓之鸡', description: '心灵性巧，机谋多变，身闲心不闲，衣禄有余。' },
  '庚戌': { nayin: '钗钏金', image: '寺观之狗', description: '快口无心，利官近贵，身闲心不空，有权柄。' },
  '辛亥': { nayin: '钗钏金', image: '圈里之猪', description: '不惹闲事，百事谋求，早年不聚，晚景荣华。' },
  '壬子': { nayin: '桑松木', image: '山上之鼠', description: '幼年有灾，中年衣食足用，男招好妻，身闲心苦。' },
  '癸丑': { nayin: '桑松木', image: '栏内之牛', description: '衣禄不少，财帛早聚，一生尊重，不惹是非。' },
  '甲寅': { nayin: '大溪水', image: '立定之虎', description: '利官近贵，家道兴隆，衣食足用，父母有刑。' },
  '乙卯': { nayin: '大溪水', image: '得道之兔', description: '志气轩昂，计谋巧妙，一生近贵，百事如意。' },
  '丙辰': { nayin: '沙中土', image: '天上之龙', description: '聪明伶俐，四海春风，一生衣禄，晚景荣华。' },
  '丁巳': { nayin: '沙中土', image: '塘内之蛇', description: '利官近贵，禀性刚强，总有计谋，功名有分。' },
  '戊午': { nayin: '天上火', image: '厩内之马', description: '志气高昂，机谋多变，一生衣禄，晚景荣华。' },
  '己未': { nayin: '天上火', image: '草野之羊', description: '口快心直，衣禄自来，前程显达，得贵人助。' },
  '庚申': { nayin: '石榴木', image: '食果之猴', description: '一生手足不停，名行清高，利官近贵，衣禄足用。' },
  '辛酉': { nayin: '石榴木', image: '笼内之鸡', description: '一生伶俐，精神爽快，口舌能辩，受人敬重。' },
  '壬戌': { nayin: '大海水', image: '顾家之狗', description: '好善乐施，衣食不缺，早年有灾，晚景荣华。' },
  '癸亥': { nayin: '大海水', image: '林下之猪', description: '性巧聪明，自立自强，衣禄有余，晚景荣华。' }
}

/**
 * 获取干支的详细解读
 * @param ganZhi 干支字符串 (如 "甲子")
 * @returns 包含意象和描述的对象
 */
export function getGanZhiKnowledge(ganZhi: string): JiaZiInfo | null {
  return JIA_ZI_KNOWLEDGE[ganZhi] || null
}

/**
 * 格式化日柱专断信息
 * @param dayGanZhi 日柱干支
 */
export function getDayPillarAnalysis(dayGanZhi: string): string {
  const info = getGanZhiKnowledge(dayGanZhi)
  if (!info) return ''
  return `日柱【${dayGanZhi}】为${info.nayin}命，意象为“${info.image}”。其人${info.description}`
}
