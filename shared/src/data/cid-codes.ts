export interface CIDCode {
  code: string;
  description: string;
  category: string;
}

export const CID_CODES: CIDCode[] = [
  // Doenças do sistema nervoso (G00-G99)
  { code: 'G80', description: 'Paralisia cerebral', category: 'Sistema Nervoso' },
  { code: 'G81', description: 'Hemiplegia', category: 'Sistema Nervoso' },
  { code: 'G82', description: 'Paraplegia e tetraplegia', category: 'Sistema Nervoso' },
  { code: 'G83', description: 'Outras síndromes paralíticas', category: 'Sistema Nervoso' },
  { code: 'G93', description: 'Outros transtornos do encéfalo', category: 'Sistema Nervoso' },
  { code: 'G95', description: 'Outras doenças da medula espinal', category: 'Sistema Nervoso' },
  
  // Doenças do sistema osteomuscular (M00-M99)
  { code: 'M15', description: 'Poliartrose', category: 'Sistema Osteomuscular' },
  { code: 'M16', description: 'Coxartrose [artrose do quadril]', category: 'Sistema Osteomuscular' },
  { code: 'M17', description: 'Gonartrose [artrose do joelho]', category: 'Sistema Osteomuscular' },
  { code: 'M19', description: 'Outras artroses', category: 'Sistema Osteomuscular' },
  { code: 'M25', description: 'Outros transtornos articulares', category: 'Sistema Osteomuscular' },
  { code: 'M41', description: 'Escoliose', category: 'Sistema Osteomuscular' },
  { code: 'M42', description: 'Cifose espinhal', category: 'Sistema Osteomuscular' },
  { code: 'M47', description: 'Espondilose', category: 'Sistema Osteomuscular' },
  { code: 'M48', description: 'Outras espondilopatias', category: 'Sistema Osteomuscular' },
  { code: 'M50', description: 'Transtornos dos discos cervicais', category: 'Sistema Osteomuscular' },
  { code: 'M51', description: 'Outros transtornos de discos intervertebrais', category: 'Sistema Osteomuscular' },
  { code: 'M54', description: 'Dorsalgia', category: 'Sistema Osteomuscular' },
  { code: 'M60', description: 'Miosite', category: 'Sistema Osteomuscular' },
  { code: 'M62', description: 'Outros transtornos musculares', category: 'Sistema Osteomuscular' },
  { code: 'M70', description: 'Transtornos dos tecidos moles relacionados com o uso', category: 'Sistema Osteomuscular' },
  { code: 'M71', description: 'Outras bursopatias', category: 'Sistema Osteomuscular' },
  { code: 'M75', description: 'Lesões do ombro', category: 'Sistema Osteomuscular' },
  { code: 'M76', description: 'Entesopatias do membro inferior', category: 'Sistema Osteomuscular' },
  { code: 'M77', description: 'Outras entesopatias', category: 'Sistema Osteomuscular' },
  { code: 'M79', description: 'Outros transtornos dos tecidos moles', category: 'Sistema Osteomuscular' },
  
  // Lesões e traumatismos (S00-T98)
  { code: 'S06', description: 'Traumatismo intracraniano', category: 'Traumatismo' },
  { code: 'S12', description: 'Fratura do pescoço', category: 'Traumatismo' },
  { code: 'S22', description: 'Fratura de costela(s), esterno e coluna torácica', category: 'Traumatismo' },
  { code: 'S32', description: 'Fratura da coluna lombar e da pelve', category: 'Traumatismo' },
  { code: 'S42', description: 'Fratura do ombro e do braço', category: 'Traumatismo' },
  { code: 'S52', description: 'Fratura do antebraço', category: 'Traumatismo' },
  { code: 'S62', description: 'Fratura ao nível do punho e da mão', category: 'Traumatismo' },
  { code: 'S72', description: 'Fratura do fêmur', category: 'Traumatismo' },
  { code: 'S82', description: 'Fratura da perna, incluindo tornozelo', category: 'Traumatismo' },
  { code: 'S92', description: 'Fratura do pé', category: 'Traumatismo' },
  
  // Doenças do aparelho circulatório (I00-I99)
  { code: 'I20', description: 'Angina pectoris', category: 'Sistema Circulatório' },
  { code: 'I21', description: 'Infarto agudo do miocárdio', category: 'Sistema Circulatório' },
  { code: 'I25', description: 'Doença isquêmica crônica do coração', category: 'Sistema Circulatório' },
  { code: 'I50', description: 'Insuficiência cardíaca', category: 'Sistema Circulatório' },
  { code: 'I63', description: 'Infarto cerebral', category: 'Sistema Circulatório' },
  { code: 'I64', description: 'Acidente vascular cerebral', category: 'Sistema Circulatório' },
  { code: 'I69', description: 'Sequelas de doenças cerebrovasculares', category: 'Sistema Circulatório' },
  
  // Doenças do aparelho respiratório (J00-J99)
  { code: 'J44', description: 'Doença pulmonar obstrutiva crônica', category: 'Sistema Respiratório' },
  { code: 'J45', description: 'Asma', category: 'Sistema Respiratório' },
  { code: 'J46', description: 'Estado de mal asmático', category: 'Sistema Respiratório' },
  
  // Outros códigos comuns em fisioterapia
  { code: 'Z50', description: 'Cuidados envolvendo o uso de procedimentos de reabilitação', category: 'Reabilitação' },
  { code: 'Z51', description: 'Outros cuidados médicos', category: 'Reabilitação' },
];

export const CID_CATEGORIES = [
  'Sistema Nervoso',
  'Sistema Osteomuscular', 
  'Traumatismo',
  'Sistema Circulatório',
  'Sistema Respiratório',
  'Reabilitação'
];

export const getCIDByCode = (code: string): CIDCode | undefined => {
  return CID_CODES.find(cid => cid.code === code);
};

export const getCIDsByCategory = (category: string): CIDCode[] => {
  return CID_CODES.filter(cid => cid.category === category);
};