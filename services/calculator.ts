import type { FormData, AllResults, AllIncomeStatements, RegimeResult, IncomeStatement, AnexoType, SnFaixa, TaxRates, TaxRateData } from '../types';

const SN_TABLES: Record<AnexoType, SnFaixa[]> = {
    'ANEXO I': [
        { limInferior: 0, limSuperior: 180000, aliquota: 0.04, deduzir: 0, partilha: { IRPJ: 0.055, CSLL: 0.035, COFINS: 0.1274, PIS_PASEP: 0.0276, CPP: 0.415, ICMS: 0.34 } },
        { limInferior: 180000.01, limSuperior: 360000, aliquota: 0.073, deduzir: 5940, partilha: { IRPJ: 0.055, CSLL: 0.035, COFINS: 0.1274, PIS_PASEP: 0.0276, CPP: 0.415, ICMS: 0.34 } },
        { limInferior: 360000.01, limSuperior: 720000, aliquota: 0.095, deduzir: 13860, partilha: { IRPJ: 0.055, CSLL: 0.035, COFINS: 0.1274, PIS_PASEP: 0.0276, CPP: 0.42, ICMS: 0.335 } },
        { limInferior: 720000.01, limSuperior: 1800000, aliquota: 0.107, deduzir: 22500, partilha: { IRPJ: 0.055, CSLL: 0.035, COFINS: 0.1274, PIS_PASEP: 0.0276, CPP: 0.42, ICMS: 0.335 } },
        { limInferior: 1800000.01, limSuperior: 3600000, aliquota: 0.143, deduzir: 87300, partilha: { IRPJ: 0.055, CSLL: 0.035, COFINS: 0.1274, PIS_PASEP: 0.0276, CPP: 0.42, ICMS: 0.335 } },
        { limInferior: 3600000.01, limSuperior: 4800000, aliquota: 0.19, deduzir: 378000, partilha: { IRPJ: 0.135, CSLL: 0.10, COFINS: 0.2827, PIS_PASEP: 0.0613, CPP: 0.421, ICMS: 0.00 } },
    ],
    'ANEXO II': [
        { limInferior: 0, limSuperior: 180000, aliquota: 0.045, deduzir: 0, partilha: { IRPJ: 0.055, CSLL: 0.035, COFINS: 0.1274, PIS_PASEP: 0.0276, CPP: 0.415, IPI: 0.075, ICMS: 0.34 } },
        { limInferior: 180000.01, limSuperior: 360000, aliquota: 0.078, deduzir: 5940, partilha: { IRPJ: 0.055, CSLL: 0.035, COFINS: 0.1274, PIS_PASEP: 0.0276, CPP: 0.415, IPI: 0.075, ICMS: 0.34 } },
        { limInferior: 360000.01, limSuperior: 720000, aliquota: 0.10, deduzir: 13860, partilha: { IRPJ: 0.055, CSLL: 0.035, COFINS: 0.1274, PIS_PASEP: 0.0276, CPP: 0.42, IPI: 0.075, ICMS: 0.335 } },
        { limInferior: 720000.01, limSuperior: 1800000, aliquota: 0.112, deduzir: 22500, partilha: { IRPJ: 0.055, CSLL: 0.035, COFINS: 0.1274, PIS_PASEP: 0.0276, CPP: 0.42, IPI: 0.075, ICMS: 0.335 } },
        { limInferior: 1800000.01, limSuperior: 3600000, aliquota: 0.147, deduzir: 85500, partilha: { IRPJ: 0.055, CSLL: 0.035, COFINS: 0.1274, PIS_PASEP: 0.0276, CPP: 0.42, IPI: 0.075, ICMS: 0.335 } },
        { limInferior: 3600000.01, limSuperior: 4800000, aliquota: 0.30, deduzir: 720000, partilha: { IRPJ: 0.135, CSLL: 0.10, COFINS: 0.2827, PIS_PASEP: 0.0613, CPP: 0.421, IPI: 0.00, ICMS: 0.00 } },
    ],
    'ANEXO III': [
        { limInferior: 0, limSuperior: 180000, aliquota: 0.06, deduzir: 0, partilha: { IRPJ: 0.04, CSLL: 0.035, COFINS: 0.1282, PIS_PASEP: 0.0278, CPP: 0.434, ISS: 0.335 } },
        { limInferior: 180000.01, limSuperior: 360000, aliquota: 0.112, deduzir: 9360, partilha: { IRPJ: 0.04, CSLL: 0.035, COFINS: 0.1364, PIS_PASEP: 0.0296, CPP: 0.434, ISS: 0.325 } },
        { limInferior: 360000.01, limSuperior: 720000, aliquota: 0.135, deduzir: 17640, partilha: { IRPJ: 0.04, CSLL: 0.035, COFINS: 0.1364, PIS_PASEP: 0.0296, CPP: 0.434, ISS: 0.325 } },
        { limInferior: 720000.01, limSuperior: 1800000, aliquota: 0.16, deduzir: 35640, partilha: { IRPJ: 0.04, CSLL: 0.035, COFINS: 0.1282, PIS_PASEP: 0.0278, CPP: 0.434, ISS: 0.335 } },
        { limInferior: 1800000.01, limSuperior: 3600000, aliquota: 0.21, deduzir: 125640, partilha: { IRPJ: 0.125, CSLL: 0.15, COFINS: 0.1282, PIS_PASEP: 0.0278, CPP: 0.35, ISS: 0.219 } },
        { limInferior: 3600000.01, limSuperior: 4800000, aliquota: 0.33, deduzir: 648000, partilha: { IRPJ: 0.35, CSLL: 0.15, COFINS: 0.1603, PIS_PASEP: 0.0347, CPP: 0.305, ISS: 0.00 } },
    ],
    'ANEXO IV': [
        { limInferior: 0, limSuperior: 180000, aliquota: 0.045, deduzir: 0, partilha: { IRPJ: 0.188, CSLL: 0.152, COFINS: 0.1767, PIS_PASEP: 0.0383, CPP: 0, ISS: 0.445 } },
        { limInferior: 180000.01, limSuperior: 360000, aliquota: 0.09, deduzir: 8100, partilha: { IRPJ: 0.208, CSLL: 0.152, COFINS: 0.2055, PIS_PASEP: 0.0445, CPP: 0, ISS: 0.4 } },
        { limInferior: 360000.01, limSuperior: 720000, aliquota: 0.102, deduzir: 12420, partilha: { IRPJ: 0.208, CSLL: 0.152, COFINS: 0.1973, PIS_PASEP: 0.0427, CPP: 0, ISS: 0.4 } },
        { limInferior: 720000.01, limSuperior: 1800000, aliquota: 0.14, deduzir: 39780, partilha: { IRPJ: 0.178, CSLL: 0.192, COFINS: 0.188, PIS_PASEP: 0.041, CPP: 0, ISS: 0.401 } },
        { limInferior: 1800000.01, limSuperior: 3600000, aliquota: 0.22, deduzir: 183780, partilha: { IRPJ: 0.188, CSLL: 0.192, COFINS: 0.1808, PIS_PASEP: 0.0392, CPP: 0, ISS: 0.4 } },
        { limInferior: 3600000.01, limSuperior: 4800000, aliquota: 0.33, deduzir: 828000, partilha: { IRPJ: 0.535, CSLL: 0.215, COFINS: 0.2055, PIS_PASEP: 0.0445, CPP: 0, ISS: 0.00 } },
    ],
    'ANEXO V': [
        { limInferior: 0, limSuperior: 180000, aliquota: 0.155, deduzir: 0, partilha: { IRPJ: 0.25, CSLL: 0.15, COFINS: 0.141, PIS_PASEP: 0.0305, CPP: 0.2885, ISS: 0.14 } },
        { limInferior: 180000.01, limSuperior: 360000, aliquota: 0.18, deduzir: 4500, partilha: { IRPJ: 0.23, CSLL: 0.15, COFINS: 0.141, PIS_PASEP: 0.0305, CPP: 0.2785, ISS: 0.17 } },
        { limInferior: 360000.01, limSuperior: 720000, aliquota: 0.195, deduzir: 9900, partilha: { IRPJ: 0.24, CSLL: 0.15, COFINS: 0.1482, PIS_PASEP: 0.0323, CPP: 0.2385, ISS: 0.191 } },
        { limInferior: 720000.01, limSuperior: 1800000, aliquota: 0.205, deduzir: 17100, partilha: { IRPJ: 0.21, CSLL: 0.15, COFINS: 0.1574, PIS_PASEP: 0.0341, CPP: 0.2385, ISS: 0.21 } },
        { limInferior: 1800000.01, limSuperior: 3600000, aliquota: 0.23, deduzir: 62100, partilha: { IRPJ: 0.23, CSLL: 0.125, COFINS: 0.1416, PIS_PASEP: 0.0305, CPP: 0.2385, ISS: 0.2344 } },
        { limInferior: 3600000.01, limSuperior: 4800000, aliquota: 0.305, deduzir: 540000, partilha: { IRPJ: 0.35, CSLL: 0.155, COFINS: 0.1644, PIS_PASEP: 0.0356, CPP: 0.295, ISS: 0.00 } },
    ]
};

const calculateLucroPresumido = (data: FormData, rates: TaxRateData): RegimeResult => {
  let percentualPresuncaoIRPJ: number;
  let percentualPresuncaoCSLL: number;

  switch (data.areaAtuacao) {
    case 'Comércio':
    case 'Indústria':
      percentualPresuncaoIRPJ = 0.08;
      percentualPresuncaoCSLL = 0.12;
      break;
    case 'Serviços III':
    case 'Serviços IV':
    case 'Serviços V':
      percentualPresuncaoIRPJ = 0.32;
      percentualPresuncaoCSLL = 0.32;
      break;
    default:
      // Fallback to a default, though this case should be handled by the UI
      percentualPresuncaoIRPJ = 0.08;
      percentualPresuncaoCSLL = 0.12;
  }

  const basePresuncaoIRPJ = data.faturamentoAnual * percentualPresuncaoIRPJ;
  const basePresuncaoCSLL = data.faturamentoAnual * percentualPresuncaoCSLL;
  
  const irpj = basePresuncaoIRPJ * rates.IRPJ;
  const adicionalIrpjValor = Math.max(0, (basePresuncaoIRPJ / 12 - 20000) * rates.ADICIONAL_IRPJ) * 12;
  const csll = basePresuncaoCSLL * rates.CSLL;
  
  const faturamentoTributavelPisCofins = data.faturamentoAnual * (1 - (data.percSaidasMonofasicas / 100));
  const pis = faturamentoTributavelPisCofins * rates.PIS_PASEP;
  const cofins = faturamentoTributavelPisCofins * rates.COFINS;
  
  const faturamentoTributavelIcms = data.faturamentoAnual * (1 - (data.percSaidasSubstituicaoTributaria / 100));
  const icms = faturamentoTributavelIcms * rates.ICMS; // Simplified calculation for presumed profit
  
  const ipi = data.faturamentoAnual * rates.IPI;
  const iss = data.faturamentoAnual * rates.ISS;
  
  const cpp = data.pessoal * rates.CPP;
  const inssTerceiros = data.pessoal * rates.INSS_TERCEIROS;
  const rat = data.pessoal * rates.RAT;
  const fgts = data.pessoal * rates.FGTS;
  
  const total = irpj + adicionalIrpjValor + csll + pis + cofins + icms + cpp + inssTerceiros + rat + fgts + ipi + iss;

  return {
    PIS_PASEP: { valor: pis, percentual: data.faturamentoAnual > 0 ? pis / data.faturamentoAnual : 0 },
    COFINS: { valor: cofins, percentual: data.faturamentoAnual > 0 ? cofins / data.faturamentoAnual : 0 },
    IRPJ: { valor: irpj, percentual: data.faturamentoAnual > 0 ? irpj / data.faturamentoAnual : 0 },
    ADICIONAL_IRPJ: { valor: adicionalIrpjValor, percentual: data.faturamentoAnual > 0 ? adicionalIrpjValor / data.faturamentoAnual : 0 },
    CSLL: { valor: csll, percentual: data.faturamentoAnual > 0 ? csll / data.faturamentoAnual : 0 },
    IPI: { valor: ipi, percentual: data.faturamentoAnual > 0 ? ipi / data.faturamentoAnual : 0 },
    ISS: { valor: iss, percentual: data.faturamentoAnual > 0 ? iss / data.faturamentoAnual : 0 },
    ICMS: { valor: icms, percentual: data.faturamentoAnual > 0 ? icms / data.faturamentoAnual : 0 },
    RAT: { valor: rat, percentual: data.faturamentoAnual > 0 ? rat / data.faturamentoAnual : 0 },
    CPP: { valor: cpp, percentual: data.faturamentoAnual > 0 ? cpp / data.faturamentoAnual : 0 },
    INSS_TERCEIROS: { valor: inssTerceiros, percentual: data.faturamentoAnual > 0 ? inssTerceiros / data.faturamentoAnual : 0 },
    FGTS: { valor: fgts, percentual: data.faturamentoAnual > 0 ? fgts / data.faturamentoAnual : 0 },
    totalValor: total,
    totalPercentual: data.faturamentoAnual > 0 ? total / data.faturamentoAnual : 0,
  };
};

const calculateLucroReal = (data: FormData, rates: TaxRateData): RegimeResult => {
    // 1. Calculate taxes that are deductions from revenue or are expenses, but don't depend on profit.
    const faturamentoTributavelPisCofins = data.faturamentoAnual * (1 - (data.percSaidasMonofasicas / 100));
    const creditosCustosVariaveis = data.custosVariavel * (1 - (data.percEntradasMonofasicas / 100));
    const totalBaseCreditosPisCofins = creditosCustosVariaveis +
        data.alugueisImoveis +
        data.locacoes +
        data.energiaEletrica +
        data.depreciacaoMaquinas +
        data.depreciacaoPredios +
        data.servicosTerceiros;
        
    const pis = Math.max(0, (faturamentoTributavelPisCofins * rates.PIS_PASEP) - (totalBaseCreditosPisCofins * rates.PIS_PASEP));
    const cofins = Math.max(0, (faturamentoTributavelPisCofins * rates.COFINS) - (totalBaseCreditosPisCofins * rates.COFINS));

    const faturamentoTributavelIcms = data.faturamentoAnual * (1 - (data.percSaidasSubstituicaoTributaria / 100));
    const comprasCreditaveisIcms = data.custosVariavel * (1 - (data.percEntradasSubstituicaoTributaria / 100));
    const icms = Math.max(0, (faturamentoTributavelIcms * rates.ICMS) - (comprasCreditaveisIcms * rates.ICMS));
    
    const ipi = data.faturamentoAnual * rates.IPI;
    const iss = data.faturamentoAnual * rates.ISS;
    
    const cpp = data.pessoal * rates.CPP;
    const inssTerceiros = data.pessoal * rates.INSS_TERCEIROS;
    const rat = data.pessoal * rates.RAT;
    const fgts = data.pessoal * rates.FGTS;

    // 2. Calculate the profit base for IRPJ/CSLL. This is the accounting profit before these two taxes.
    const deducoesDaReceita = pis + cofins + icms + iss;
    const custosEDespesas = data.custosVariavel + 
                            data.despesasFuncionamento + 
                            data.pessoal + 
                            cpp + 
                            inssTerceiros + 
                            rat + 
                            fgts;
    
    const lucroAntesIRPJCSLL = data.faturamentoAnual - deducoesDaReceita - custosEDespesas;
    
    // 3. Calculate IRPJ & CSLL using the profit base.
    // If profit is negative (prejuízo), base becomes 0, and taxes are 0.
    const baseCalculoIRPJCSLL = Math.max(0, lucroAntesIRPJCSLL);
    
    const irpj = baseCalculoIRPJCSLL * rates.IRPJ;
    const adicionalIrpjValor = Math.max(0, (baseCalculoIRPJCSLL / 12 - 20000) * rates.ADICIONAL_IRPJ) * 12;
    const csll = baseCalculoIRPJCSLL * rates.CSLL;

    // 4. Sum up all taxes.
    const total = irpj + adicionalIrpjValor + csll + pis + cofins + icms + cpp + inssTerceiros + rat + fgts + ipi + iss;
    
    // 5. Return the full result object.
    return {
        PIS_PASEP: { valor: pis, percentual: data.faturamentoAnual > 0 ? pis / data.faturamentoAnual : 0 },
        COFINS: { valor: cofins, percentual: data.faturamentoAnual > 0 ? cofins / data.faturamentoAnual : 0 },
        IRPJ: { valor: irpj, percentual: data.faturamentoAnual > 0 ? irpj / data.faturamentoAnual : 0 },
        ADICIONAL_IRPJ: { valor: adicionalIrpjValor, percentual: data.faturamentoAnual > 0 ? adicionalIrpjValor / data.faturamentoAnual : 0 },
        CSLL: { valor: csll, percentual: data.faturamentoAnual > 0 ? csll / data.faturamentoAnual : 0 },
        IPI: { valor: ipi, percentual: data.faturamentoAnual > 0 ? ipi / data.faturamentoAnual : 0 },
        ISS: { valor: iss, percentual: data.faturamentoAnual > 0 ? iss / data.faturamentoAnual : 0 },
        ICMS: { valor: icms, percentual: data.faturamentoAnual > 0 ? icms / data.faturamentoAnual : 0 },
        RAT: { valor: rat, percentual: data.faturamentoAnual > 0 ? rat / data.faturamentoAnual : 0 },
        CPP: { valor: cpp, percentual: data.faturamentoAnual > 0 ? cpp / data.faturamentoAnual : 0 },
        INSS_TERCEIROS: { valor: inssTerceiros, percentual: data.faturamentoAnual > 0 ? inssTerceiros / data.faturamentoAnual : 0 },
        FGTS: { valor: fgts, percentual: data.faturamentoAnual > 0 ? fgts / data.faturamentoAnual : 0 },
        totalValor: total,
        totalPercentual: data.faturamentoAnual > 0 ? total / data.faturamentoAnual : 0,
    };
};

const calculateSimplesNacional = (data: FormData): RegimeResult => {
    const rbt12 = data.faturamentoAnual;
    const snTable = SN_TABLES[data.anexo];
    const faixa = snTable.find(f => rbt12 >= f.limInferior && rbt12 <= f.limSuperior) || snTable[snTable.length-1];

    const aliquotaEfetiva = rbt12 > 0 ? ((rbt12 * faixa.aliquota) - faixa.deduzir) / rbt12 : 0;
    const impostoTotalBase = rbt12 * aliquotaEfetiva;
    const percMonofasico = data.percSaidasMonofasicas / 100;
    const percST = data.percSaidasSubstituicaoTributaria / 100;
    
    const pis = impostoTotalBase * faixa.partilha.PIS_PASEP * (1 - percMonofasico);
    const cofins = impostoTotalBase * faixa.partilha.COFINS * (1 - percMonofasico);
    const irpj = impostoTotalBase * faixa.partilha.IRPJ;
    const csll = impostoTotalBase * faixa.partilha.CSLL;
    const ipi = impostoTotalBase * (faixa.partilha.IPI || 0);
    const iss = impostoTotalBase * (faixa.partilha.ISS || 0);
    const icms = impostoTotalBase * (faixa.partilha.ICMS || 0) * (1 - percST);
    let cpp = impostoTotalBase * (faixa.partilha.CPP || 0);
    
    let inssTerceiros = 0;
    let rat = 0;
    
    // Anexo IV has CPP calculated separately
    if (data.anexo === 'ANEXO IV') {
        cpp = data.pessoal * 0.20; // Using a default value as it's not in the editable rates for SN
        inssTerceiros = data.pessoal * 0.058;
        rat = data.pessoal * 0.02;
    }

    const fgts = data.pessoal * 0.08;
    
    const totalImpostosSimples = pis + cofins + irpj + csll + ipi + iss + icms + (data.anexo !== 'ANEXO IV' ? cpp : 0);
    const encargosForaSimples = fgts + (data.anexo === 'ANEXO IV' ? (cpp + inssTerceiros + rat) : 0);
    const total = totalImpostosSimples + encargosForaSimples;

    return {
        PIS_PASEP: { valor: pis, percentual: rbt12 > 0 ? pis / rbt12 : 0 },
        COFINS: { valor: cofins, percentual: rbt12 > 0 ? cofins / rbt12 : 0 },
        IRPJ: { valor: irpj, percentual: rbt12 > 0 ? irpj / rbt12 : 0 },
        ADICIONAL_IRPJ: { valor: 0, percentual: 0 },
        CSLL: { valor: csll, percentual: rbt12 > 0 ? csll / rbt12 : 0 },
        IPI: { valor: ipi, percentual: rbt12 > 0 ? ipi / rbt12 : 0 },
        ISS: { valor: iss, percentual: rbt12 > 0 ? iss / rbt12 : 0 },
        ICMS: { valor: icms, percentual: rbt12 > 0 ? icms / rbt12 : 0 },
        RAT: { valor: rat, percentual: data.faturamentoAnual > 0 ? rat / data.faturamentoAnual : 0 },
        CPP: { valor: cpp, percentual: data.faturamentoAnual > 0 ? cpp / data.faturamentoAnual : 0 },
        INSS_TERCEIROS: { valor: inssTerceiros, percentual: data.faturamentoAnual > 0 ? inssTerceiros / data.faturamentoAnual : 0 },
        FGTS: { valor: fgts, percentual: data.faturamentoAnual > 0 ? fgts / data.faturamentoAnual : 0 },
        totalValor: total,
        totalPercentual: data.faturamentoAnual > 0 ? total / data.faturamentoAnual : 0,
    };
};

const calculateIncomeStatement = (data: FormData, results: RegimeResult): IncomeStatement => {
    const receitaBruta = data.faturamentoAnual;
    const deducoesVendas = (results.PIS_PASEP.valor + results.COFINS.valor + results.ICMS.valor + results.ISS.valor);
    const receitaLiquida = receitaBruta - deducoesVendas;
    const custoMercadorias = data.custosVariavel;
    const lucroBruto = receitaLiquida - custoMercadorias;
    
    const salarios = data.pessoal;
    const encargos = results.CPP.valor + results.INSS_TERCEIROS.valor + results.RAT.valor + results.FGTS.valor;
    const despesasTotais = data.despesasFuncionamento;
    
    const lucroAntesIRPJCSLL = lucroBruto - salarios - encargos - despesasTotais;
    const irpjCsll = results.IRPJ.valor + results.ADICIONAL_IRPJ.valor + results.CSLL.valor;
    const lucroAposIRPJCSLL = lucroAntesIRPJCSLL - irpjCsll;
    
    const lucroMensal = lucroAposIRPJCSLL / 12;
    const margemReceitaBruta = receitaBruta > 0 ? lucroAposIRPJCSLL / receitaBruta : 0;
    const margemLucroBruto = lucroBruto > 0 ? lucroAposIRPJCSLL / lucroBruto : 0;
    
    return {
        receitaBruta,
        deducoesVendas,
        receitaLiquida,
        custoMercadorias,
        lucroBruto,
        salarios,
        encargos,
        despesasTotais,
        lucroAntesIRPJCSLL,
        irpjCsll,
        lucroAposIRPJCSLL,
        lucroMensal,
        margemReceitaBruta,
        margemLucroBruto,
    };
}


export const runCalculations = (data: FormData, taxRates: TaxRates): { allResults: AllResults, allIncomes: AllIncomeStatements, snTable: SnFaixa[], snFaixa: SnFaixa } => {
    const allResults: AllResults = {
        lucroPresumido: calculateLucroPresumido(data, taxRates.presumido),
        lucroReal: calculateLucroReal(data, taxRates.real),
        simplesNacional: calculateSimplesNacional(data),
    };

    const allIncomes: AllIncomeStatements = {
      lucroPresumido: calculateIncomeStatement(data, allResults.lucroPresumido),
      lucroReal: calculateIncomeStatement(data, allResults.lucroReal),
      simplesNacional: calculateIncomeStatement(data, allResults.simplesNacional),
    };

    const rbt12 = data.faturamentoAnual;
    const snTable = SN_TABLES[data.anexo];
    const snFaixa = snTable.find(f => rbt12 >= f.limInferior && rbt12 <= f.limSuperior) || snTable[snTable.length - 1];

    return { allResults, allIncomes, snTable, snFaixa };
};

export const getSnTable = (anexo: AnexoType): SnFaixa[] => {
    return SN_TABLES[anexo];
}