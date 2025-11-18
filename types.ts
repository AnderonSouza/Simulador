export type Page = 
  | 'instrucoes'
  | 'entrada-dados'
  | 'aliquota-imposto'
  | 'resultados'
  | 'tabelas-sn'
  | 'demonstracao-resultado'
  | 'resumo-carga-tributaria'
  | 'simulacoes-salvas'
  | 'sobre-empresa';

export const pageTitles: Record<Page, string> = {
  'instrucoes': '1. Instruções',
  'entrada-dados': '2. Entrada de Dados',
  'aliquota-imposto': '3. Alíquota de Imposto',
  'resultados': '4. Resultado dos Impostos',
  'tabelas-sn': '5. Tabelas SN',
  'demonstracao-resultado': '6. Demonstração Resultado',
  'resumo-carga-tributaria': '7. Resumo Carga Tributária',
  'simulacoes-salvas': 'Simulações Salvas',
  'sobre-empresa': 'Sobre a empresa',
};

export type AnexoType = 'ANEXO I' | 'ANEXO II' | 'ANEXO III' | 'ANEXO IV' | 'ANEXO V';
export type EnquadramentoType = 'Simples Nacional' | 'Lucro Real' | 'Lucro Presumido';
export type AreaAtuacaoType = 'Comércio' | 'Indústria' | 'Serviços III' | 'Serviços IV' | 'Serviços V';


export interface FormData {
  nomeEmpresa: string;
  cnpj: string;
  enquadramentoAtual: EnquadramentoType;
  areaAtuacao: AreaAtuacaoType;
  anexo: AnexoType;
  faturamentoAnual: number;
  custosVariavel: number;
  despesasFuncionamento: number;
  pessoal: number;
  alugueisImoveis: number;
  locacoes: number;
  energiaEletrica: number;
  depreciacaoMaquinas: number;
  depreciacaoPredios: number;
  servicosTerceiros: number;
  percSaidasMonofasicas: number;
  percSaidasSubstituicaoTributaria: number;
  percEntradasMonofasicas: number;
  percEntradasSubstituicaoTributaria: number;
}

export interface TaxResult {
  percentual: number;
  valor: number;
}

export interface RegimeResult {
  PIS_PASEP: TaxResult;
  COFINS: TaxResult;
  IRPJ: TaxResult;
  ADICIONAL_IRPJ: TaxResult;
  CSLL: TaxResult;
  IPI: TaxResult;
  ISS: TaxResult;
  ICMS: TaxResult;
  RAT: TaxResult;
  CPP: TaxResult;
  INSS_TERCEIROS: TaxResult;
  FGTS: TaxResult;
  totalPercentual: number;
  totalValor: number;
}

export type TributoKey = keyof Omit<RegimeResult, 'totalPercentual' | 'totalValor'>;

export interface TaxRateData {
  PIS_PASEP: number;
  COFINS: number;
  IRPJ: number;
  ADICIONAL_IRPJ: number;
  CSLL: number;
  IPI: number;
  ISS: number;
  ICMS: number;
  RAT: number;
  CPP: number;
  INSS_TERCEIROS: number;
  FGTS: number;
}
export interface TaxRates {
  presumido: TaxRateData;
  real: TaxRateData;
}


export interface AllResults {
  lucroPresumido: RegimeResult;
  lucroReal: RegimeResult;
  simplesNacional: RegimeResult;
}

export interface IncomeStatement {
  receitaBruta: number;
  deducoesVendas: number;
  receitaLiquida: number;
  custoMercadorias: number;
  lucroBruto: number;
  salarios: number;
  encargos: number;
  despesasTotais: number;
  lucroAntesIRPJCSLL: number;
  irpjCsll: number;
  lucroAposIRPJCSLL: number;
  lucroMensal: number;
  margemReceitaBruta: number;
  margemLucroBruto: number;
}

export interface AllIncomeStatements {
  lucroPresumido: IncomeStatement;
  lucroReal: IncomeStatement;
  simplesNacional: IncomeStatement;
}

export interface PartilhaTributos {
  IRPJ: number;
  CSLL: number;
  COFINS: number;
  PIS_PASEP: number;
  CPP: number;
  ICMS?: number;
  IPI?: number;
  ISS?: number;
}

export interface SnFaixa {
  limInferior: number;
  limSuperior: number;
  aliquota: number;
  deduzir: number;
  partilha: PartilhaTributos;
}

export interface SavedSimulation {
  id: number;
  nomeEmpresa: string;
  cnpj: string;
  timestamp: string;
  formData: FormData;
  taxRates: TaxRates;
}
