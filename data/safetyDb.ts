
import { SafetyInfo } from '../types';

export const localSafetyDb: Record<string, SafetyInfo> = {
  '硝酸银': {
    name: '硝酸银 (Silver Nitrate)',
    ghsSignals: ['氧化性', '腐蚀性', '环境危害'],
    hazards: ['强氧化剂，可引起火灾', '引起严重的皮肤灼伤和眼睛损伤', '对水生生物有极高毒性'],
    precautions: '储存于阴凉通风库房，远离火种热源。包装密封，切勿受潮。',
    environmentalImpact: '严禁倒入下水道，对水生生物具有长期持续毒性。废液需收集，可用氯化钠沉淀后回收银，或按实验室废弃物处置。',
    personnelSafety: '操作时佩戴头罩型电动送风过滤式防尘呼吸器，穿胶布防毒衣，戴氯丁橡胶手套。溅到皮肤会产生黑色斑点，需立即冲洗。',
    equipmentSafety: '应与易燃物、还原剂、碱类、醇类分开存放。须储存于棕色玻璃瓶中避光保存。'
  },
  '铬酸钾': {
    name: '铬酸钾 (Potassium Chromate)',
    ghsSignals: ['致癌', '致突变', '腐蚀性', '环境危害'],
    hazards: ['吸入可能致癌', '引起皮肤过敏', '对水生生物有长期持续毒性', '氧化性'],
    precautions: '仅在通风橱内使用。操作人员须经过专门培训，严禁产生粉尘。',
    environmentalImpact: '六价铬是一类污染物。废液严禁直排，必须经过化学还原（如用焦亚硫酸钠将六价铬还原为三价铬）并调节pH沉淀后，交专业机构处理。',
    personnelSafety: '严格佩戴双层手套和KN95级别口罩。避免粉尘吸入。若接触需立即脱去污染衣物，用大量流动清水冲洗。',
    equipmentSafety: '强氧化性，避免与还原剂、易燃物、活性金属粉末接触。对金属有明显腐蚀性，实验后仪器需深度清洁。'
  },
  '乙醇': {
    name: '乙醇 (Ethanol)',
    ghsSignals: ['易燃', '刺激'],
    hazards: ['高度易燃液体和蒸气', '引起严重的眼睛刺激'],
    precautions: '远离热源、火花、明火。保持容器密闭，库温不超过30℃。',
    environmentalImpact: '具有生物可降解性。但大量排放会导致水体富营养化或直接危害水生生物。废液应收集进行有机废液处理。',
    personnelSafety: '穿防静电工作服，戴化学安全防护眼镜。大规模使用时需配备自吸过滤式防毒面具。',
    equipmentSafety: '避免使用易产生火花的机械设备和工具。注意容器密封，防止由于挥发导致环境浓度超标。'
  },
  '氯化钠': {
    name: '氯化钠 (Sodium Chloride)',
    ghsSignals: ['常规'],
    hazards: ['基本无毒', '高浓度粉尘可能引起呼吸道刺激'],
    precautions: '常规实验室防护。注意防潮，防止结块。',
    environmentalImpact: '低毒性，但高盐废液可能改变水体渗透压，影响特定水生生态，不宜大规模倾倒。',
    personnelSafety: '佩戴自吸过滤式防尘口罩和防护眼镜。穿防毒物渗透工作服。',
    equipmentSafety: '具有严重的盐雾腐蚀性。长期接触会导致不锈钢和铝合金产生点蚀。使用后必须用去离子水彻底冲洗设备。'
  }
};

export const getLocalSafetyInfo = (query: string): SafetyInfo | null => {
  const normalizedQuery = query.trim().toLowerCase();
  for (const key in localSafetyDb) {
    if (key.toLowerCase() === normalizedQuery || localSafetyDb[key].name.toLowerCase().includes(normalizedQuery)) {
      return localSafetyDb[key];
    }
  }
  return null;
};
