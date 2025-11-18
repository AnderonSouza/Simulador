// FIX: Completed the App component, added missing page components, and added a default export to resolve the import error in index.tsx.

import React, { useState, useMemo, useEffect } from 'react';
import type { Page, FormData, AllResults, AllIncomeStatements, IncomeStatement, AnexoType, EnquadramentoType, AreaAtuacaoType, SnFaixa, TaxRates, TaxRateData, TributoKey, RegimeResult, SavedSimulation } from './types';
import { pageTitles } from './types';
import { runCalculations, getSnTable } from './services/calculator';

// --- Type Augmentation for libraries from CDN ---
declare global {
    interface Window {
        jspdf: any;
        html2canvas: any;
    }
}


// --- Helper Functions ---
const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatPercent = (value: number) => {
    if (isNaN(value) || !isFinite(value)) {
        return '0,00%';
    }
    return `${(value * 100).toFixed(2).replace('.', ',')}%`;
};

// --- Child Components (defined outside App to prevent re-renders) ---

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, isOpen, setIsOpen }) => {
  const menuItems: { id: Page; label: string }[] = [
    { id: 'instrucoes', label: '1. Instruções' },
    { id: 'entrada-dados', label: '2. Entrada de Dados' },
    { id: 'aliquota-imposto', label: '3. Alíquota de Imposto' },
    { id: 'resultados', label: '4. Resultados' },
    { id: 'tabelas-sn', label: '5. Tabelas SN' },
    { id: 'demonstracao-resultado', label: '6. Demonstração Resultado' },
    { id: 'resumo-carga-tributaria', label: '7. Resumo Carga Tributária' },
    { id: 'simulacoes-salvas', label: 'Simulações Salvas' },
    { id: 'sobre-empresa', label: 'Sobre a empresa' },
  ];

  const handleItemClick = (page: Page) => {
    setActivePage(page);
    setIsOpen(false); // Close sidebar on mobile after navigation
  };

  return (
    <div className={`w-64 bg-[#0A2E5D] text-white flex flex-col transition-transform duration-300 ease-in-out fixed md:relative h-full z-20 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
      <div className="p-4 bg-[#2C3E50] text-center">
        <h2 className="text-xl font-bold">Menu</h2>
      </div>
      <nav className="flex-grow">
        <ul>
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleItemClick(item.id)}
                className={`w-full text-left p-3 text-sm hover:bg-[#2C3E50] transition-colors duration-200 ${
                  activePage === item.id ? 'bg-[#1ABC9C] font-bold' : ''
                }`}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

const Header: React.FC<{ title: string; onMenuClick: () => void; }> = ({ title, onMenuClick }) => {
  return (
    <header className="p-4 bg-white shadow-md flex items-center justify-between gap-4">
        <div className="flex items-center">
             <button onClick={onMenuClick} className="md:hidden p-1 mr-2 text-[#0A2E5D] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#1ABC9C]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-[#0A2E5D]">Contrato Consultoria</h1>
        </div>
        <h2 className="text-lg text-right md:text-2xl font-light text-gray-700">{title}</h2>
    </header>
  );
};

const PageContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="p-4 md:p-8 bg-gray-100 flex-grow">{children}</div>
);

// --- Page Components ---

const Instrucoes: React.FC = () => (
    <PageContainer>
        <div className="bg-white p-6 rounded-lg shadow">
            <p className="mb-4 text-gray-700">Esta Ferramenta tem o intuito de contribuir com o Planejamento Tributário das Empresas.</p>
            <p className="mb-4 text-gray-700">O método utilizado é estimar os tributos através de informações disponíveis dentro da Escrituração Contábil. As etapas para o cálculo são:</p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-6">
                <li>Estimar informações anuais de Receita e de Despesas na opção <strong>Entrada de Dados</strong>.</li>
                <li>Validar as alíquotas básicas dos impostos na opção <strong>Alíquota de Impostos</strong>.</li>
                <li>Clicar em <strong>Calcular Simulação</strong>.</li>
                <li>Analisar os resultados da planilha nas telas de resultado.</li>
            </ol>
            <p className="mb-4 text-gray-700">Buscamos dentro da Legislação apresentar um comparativo de carga tributária entre os regimes de apuração de impostos disponíveis em nosso país, de forma a permitir um fôlego de caixa ao seu negócio.</p>
            <p className="text-gray-700">Diante da complexidade tributária que as empresas estão sujeitas, um bom Planejamento Tributário é um diferencial competitivo fundamental no avanço do seu empreendimento empresarial.</p>
        </div>
    </PageContainer>
);

interface DataEntryProps {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    onCalculate: () => void;
}
const EntradaDados: React.FC<DataEntryProps> = ({ formData, setFormData, onCalculate }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const isNumber = e.target.getAttribute('type') === 'number';
        setFormData(prev => ({ ...prev, [name]: isNumber ? Number(value) || 0 : value }));
    }

    const enquadramentoOptions: EnquadramentoType[] = ['Simples Nacional', 'Lucro Real', 'Lucro Presumido'];
    const areaAtuacaoOptions: AreaAtuacaoType[] = ['Comércio', 'Indústria', 'Serviços III', 'Serviços IV', 'Serviços V'];
    const anexoOptions: AnexoType[] = ['ANEXO I', 'ANEXO II', 'ANEXO III', 'ANEXO IV', 'ANEXO V'];

    return (
        <PageContainer>
            <div className="bg-white p-6 rounded-lg shadow max-w-4xl mx-auto">
                <div className="bg-[#0A2E5D] text-white p-3 text-center font-bold rounded-t-md text-lg">
                    CADASTRO
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 p-6 border border-t-0 border-gray-300 rounded-b-md">
                    <h3 className="col-span-2 text-lg font-semibold text-gray-700 border-b pb-2 mb-2">Informações da Empresa</h3>
                    
                    <label htmlFor="nomeEmpresa" className="font-medium text-gray-600">Nome da Empresa</label>
                    <input type="text" id="nomeEmpresa" name="nomeEmpresa" value={formData.nomeEmpresa} onChange={handleChange} className="p-2 border rounded" />

                    <label htmlFor="cnpj" className="font-medium text-gray-600">CNPJ</label>
                    <input type="text" id="cnpj" name="cnpj" value={formData.cnpj} onChange={handleChange} className="p-2 border rounded" />

                    <label htmlFor="enquadramentoAtual" className="font-medium text-gray-600">Enquadramento Atual</label>
                    <select id="enquadramentoAtual" name="enquadramentoAtual" value={formData.enquadramentoAtual} onChange={handleChange} className="p-2 border rounded bg-white">
                        {enquadramentoOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>

                    <label htmlFor="areaAtuacao" className="font-medium text-gray-600">Área de Atuação</label>
                     <select id="areaAtuacao" name="areaAtuacao" value={formData.areaAtuacao} onChange={handleChange} className="p-2 border rounded bg-white">
                        {areaAtuacaoOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>

                    <label htmlFor="anexo" className="font-medium text-gray-600">Anexo (Simples Nacional)</label>
                     <select id="anexo" name="anexo" value={formData.anexo} onChange={handleChange} className="p-2 border rounded bg-white">
                        {anexoOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    
                    <div className="col-span-2 my-4"></div>

                    <h3 className="col-span-2 text-lg font-semibold text-gray-700 border-b pb-2 mb-2">Valores Anuais</h3>

                    <label htmlFor="faturamentoAnual" className="font-medium text-gray-600">Faturamento Anual (R$)</label>
                    <input type="number" id="faturamentoAnual" name="faturamentoAnual" value={formData.faturamentoAnual} onChange={handleChange} className="p-2 border rounded" />

                    <label htmlFor="custosVariavel" className="font-medium text-gray-600">Custos Variáveis (R$)</label>
                    <input type="number" id="custosVariavel" name="custosVariavel" value={formData.custosVariavel} onChange={handleChange} className="p-2 border rounded" />

                    <label htmlFor="despesasFuncionamento" className="font-medium text-gray-600">Despesas de Funcionamento (R$)</label>
                    <input type="number" id="despesasFuncionamento" name="despesasFuncionamento" value={formData.despesasFuncionamento} onChange={handleChange} className="p-2 border rounded" />

                    <label htmlFor="pessoal" className="font-medium text-gray-600">Pessoal (Folha) (R$)</label>
                    <input type="number" id="pessoal" name="pessoal" value={formData.pessoal} onChange={handleChange} className="p-2 border rounded" />
                    
                    <div className="col-span-2 my-4"></div>
                    <h3 className="col-span-2 text-lg font-semibold text-gray-700 border-b pb-2 mb-2">Créditos PIS/COFINS (Lucro Real)</h3>
                    
                    <label htmlFor="alugueisImoveis" className="font-medium text-gray-600">Aluguéis de Imóveis (R$)</label>
                    <input type="number" id="alugueisImoveis" name="alugueisImoveis" value={formData.alugueisImoveis} onChange={handleChange} className="p-2 border rounded" />

                    <label htmlFor="locacoes" className="font-medium text-gray-600">Locações de Bens Móveis (R$)</label>
                    <input type="number" id="locacoes" name="locacoes" value={formData.locacoes} onChange={handleChange} className="p-2 border rounded" />
                    
                    <label htmlFor="energiaEletrica" className="font-medium text-gray-600">Energia Elétrica (R$)</label>
                    <input type="number" id="energiaEletrica" name="energiaEletrica" value={formData.energiaEletrica} onChange={handleChange} className="p-2 border rounded" />
                    
                    <label htmlFor="depreciacaoMaquinas" className="font-medium text-gray-600">Depreciação de Máquinas (R$)</label>
                    <input type="number" id="depreciacaoMaquinas" name="depreciacaoMaquinas" value={formData.depreciacaoMaquinas} onChange={handleChange} className="p-2 border rounded" />
                    
                    <label htmlFor="depreciacaoPredios" className="font-medium text-gray-600">Depreciação de Prédios (R$)</label>
                    <input type="number" id="depreciacaoPredios" name="depreciacaoPredios" value={formData.depreciacaoPredios} onChange={handleChange} className="p-2 border rounded" />
                    
                    <label htmlFor="servicosTerceiros" className="font-medium text-gray-600">Serviços de Terceiros (R$)</label>
                    <input type="number" id="servicosTerceiros" name="servicosTerceiros" value={formData.servicosTerceiros} onChange={handleChange} className="p-2 border rounded" />
                    
                    <div className="col-span-2 my-4"></div>
                    <h3 className="col-span-2 text-lg font-semibold text-gray-700 border-b pb-2 mb-2">Percentuais Específicos (%)</h3>
                    
                    <label htmlFor="percSaidasMonofasicas" className="font-medium text-gray-600">% Saídas Monofásicas (PIS/COFINS)</label>
                    <input type="number" id="percSaidasMonofasicas" name="percSaidasMonofasicas" value={formData.percSaidasMonofasicas} onChange={handleChange} className="p-2 border rounded" />

                    <label htmlFor="percSaidasSubstituicaoTributaria" className="font-medium text-gray-600">% Saídas Substituição Tributária (ICMS)</label>
                    <input type="number" id="percSaidasSubstituicaoTributaria" name="percSaidasSubstituicaoTributaria" value={formData.percSaidasSubstituicaoTributaria} onChange={handleChange} className="p-2 border rounded" />
                    
                    <label htmlFor="percEntradasMonofasicas" className="font-medium text-gray-600">% Entradas Monofásicas (PIS/COFINS)</label>
                    <input type="number" id="percEntradasMonofasicas" name="percEntradasMonofasicas" value={formData.percEntradasMonofasicas} onChange={handleChange} className="p-2 border rounded" />

                    <label htmlFor="percEntradasSubstituicaoTributaria" className="font-medium text-gray-600">% Entradas Substituição Tributária (ICMS)</label>
                    <input type="number" id="percEntradasSubstituicaoTributaria" name="percEntradasSubstituicaoTributaria" value={formData.percEntradasSubstituicaoTributaria} onChange={handleChange} className="p-2 border rounded" />

                    <div className="col-span-2 mt-6 text-center">
                        <button
                            onClick={onCalculate}
                            className="bg-[#1ABC9C] text-white font-bold py-3 px-8 rounded-lg hover:bg-[#16a085] transition-colors duration-300 shadow-lg transform hover:scale-105"
                        >
                            Calcular Simulação
                        </button>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
};

const tributoLabels: Record<TributoKey, string> = {
    PIS_PASEP: 'PIS/PASEP',
    COFINS: 'COFINS',
    IRPJ: 'IRPJ',
    ADICIONAL_IRPJ: 'Adicional IRPJ',
    CSLL: 'CSLL',
    IPI: 'IPI',
    ISS: 'ISS',
    ICMS: 'ICMS',
    RAT: 'RAT',
    CPP: 'CPP',
    INSS_TERCEIROS: 'INSS Terceiros',
    FGTS: 'FGTS',
};

interface AliquotaImpostoProps {
    taxRates: TaxRates;
    setTaxRates: React.Dispatch<React.SetStateAction<TaxRates>>;
}
const AliquotaImposto: React.FC<AliquotaImpostoProps> = ({ taxRates, setTaxRates }) => {
    const handleRateChange = (regime: 'presumido' | 'real', tributo: keyof TaxRateData, value: string) => {
        const numericValue = parseFloat(value.replace(',', '.')) / 100;
        if (isNaN(numericValue)) return;
        setTaxRates(prev => ({
            ...prev,
            [regime]: { ...prev[regime], [tributo]: numericValue },
        }));
    };

    const renderTable = (regime: 'presumido' | 'real') => {
        const data = taxRates[regime];
        const title = regime === 'presumido' ? 'Lucro Presumido' : 'Lucro Real';
        return (
            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h3 className="text-xl font-bold text-[#0A2E5D] mb-4">{title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(Object.keys(data) as Array<keyof TaxRateData>).map(key => (
                        <div key={key} className="flex flex-col">
                            <label htmlFor={`${regime}-${key}`} className="font-medium text-gray-600 mb-1">{tributoLabels[key as TributoKey]}</label>
                            <input
                                type="text"
                                id={`${regime}-${key}`}
                                value={(data[key] * 100).toFixed(2).replace('.', ',')}
                                onChange={(e) => handleRateChange(regime, key, e.target.value)}
                                className="p-2 border rounded text-right"
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <PageContainer>
            {renderTable('presumido')}
            {renderTable('real')}
        </PageContainer>
    );
};

interface ResultadosProps {
    results: AllResults;
}
const Resultados: React.FC<ResultadosProps> = ({ results }) => {
    const regimes: { key: keyof AllResults; name: string }[] = [
        { key: 'simplesNacional', name: 'Simples Nacional' },
        { key: 'lucroPresumido', name: 'Lucro Presumido' },
        { key: 'lucroReal', name: 'Lucro Real' },
    ];
    
    const tributos = Object.keys(tributoLabels) as TributoKey[];

    return (
        <PageContainer>
            <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
                <table className="w-full min-w-[800px] text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Tributo</th>
                            {regimes.map(r => <th key={r.key} scope="col" className="px-6 py-3 text-right" colSpan={2}>{r.name}</th>)}
                        </tr>
                        <tr>
                            <th scope="col" className="px-6 py-3"></th>
                            {regimes.map(r => <React.Fragment key={r.key}>
                                <th scope="col" className="px-6 py-3 text-right">Valor (R$)</th>
                                <th scope="col" className="px-6 py-3 text-right">%</th>
                            </React.Fragment>)}
                        </tr>
                    </thead>
                    <tbody>
                        {tributos.map(tributoKey => (
                            <tr key={tributoKey} className="bg-white border-b">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{tributoLabels[tributoKey]}</th>
                                {regimes.map(regime => (
                                    <React.Fragment key={regime.key}>
                                        <td className="px-6 py-4 text-right">{formatCurrency(results[regime.key][tributoKey].valor)}</td>
                                        <td className="px-6 py-4 text-right">{formatPercent(results[regime.key][tributoKey].percentual)}</td>
                                    </React.Fragment>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="font-bold text-gray-700 bg-gray-50">
                        <tr>
                            <td className="px-6 py-4">Total</td>
                            {regimes.map(regime => (
                                <React.Fragment key={regime.key}>
                                    <td className="px-6 py-4 text-right">{formatCurrency(results[regime.key].totalValor)}</td>
                                    <td className="px-6 py-4 text-right">{formatPercent(results[regime.key].totalPercentual)}</td>
                                </React.Fragment>
                            ))}
                        </tr>
                    </tfoot>
                </table>
            </div>
        </PageContainer>
    );
};

interface TabelasSnProps {
    anexo: AnexoType;
}
const TabelasSn: React.FC<TabelasSnProps> = ({ anexo }) => {
    const tableData = getSnTable(anexo);

    return (
        <PageContainer>
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold text-[#0A2E5D] mb-4">Tabela do Simples Nacional - {anexo}</h3>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Faixa</th>
                                <th scope="col" className="px-6 py-3">Receita Bruta em 12 Meses (R$)</th>
                                <th scope="col" className="px-6 py-3">Alíquota</th>
                                <th scope="col" className="px-6 py-3">Valor a Deduzir (R$)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.map((faixa, index) => (
                                <tr key={index} className="bg-white border-b">
                                    <td className="px-6 py-4">{index + 1}ª</td>
                                    <td className="px-6 py-4">De {formatCurrency(faixa.limInferior)} a {formatCurrency(faixa.limSuperior)}</td>
                                    <td className="px-6 py-4">{formatPercent(faixa.aliquota)}</td>
                                    <td className="px-6 py-4">{formatCurrency(faixa.deduzir)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </PageContainer>
    );
};

interface DemonstracaoResultadoProps {
    incomes: AllIncomeStatements;
}
const DemonstracaoResultado: React.FC<DemonstracaoResultadoProps> = ({ incomes }) => {
    const regimes: { key: keyof AllIncomeStatements; name: string }[] = [
        { key: 'simplesNacional', name: 'Simples Nacional' },
        { key: 'lucroPresumido', name: 'Lucro Presumido' },
        { key: 'lucroReal', name: 'Lucro Real' },
    ];
    const rows: { key: keyof IncomeStatement; label: string, isPercent?: boolean }[] = [
        { key: 'receitaBruta', label: 'Receita Bruta' },
        { key: 'deducoesVendas', label: '(-) Deduções da Receita Bruta' },
        { key: 'receitaLiquida', label: '(=) Receita Líquida' },
        { key: 'custoMercadorias', label: '(-) CMV/CSP/CSV' },
        { key: 'lucroBruto', label: '(=) Lucro Bruto' },
        { key: 'salarios', label: '(-) Salários' },
        { key: 'encargos', label: '(-) Encargos' },
        { key: 'despesasTotais', label: '(-) Despesas Operacionais' },
        { key: 'lucroAntesIRPJCSLL', label: '(=) Lucro antes IRPJ/CSLL' },
        { key: 'irpjCsll', label: '(-) IRPJ/CSLL' },
        { key: 'lucroAposIRPJCSLL', label: '(=) Lucro Líquido' },
        { key: 'lucroMensal', label: 'Lucro Mensal' },
        { key: 'margemReceitaBruta', label: 'Margem sobre Receita Bruta', isPercent: true },
        { key: 'margemLucroBruto', label: 'Margem sobre Lucro Bruto', isPercent: true },
    ];

    return (
        <PageContainer>
            <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
                <table className="w-full min-w-[800px] text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Descrição</th>
                            {regimes.map(r => <th key={r.key} scope="col" className="px-6 py-3 text-right">{r.name}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(row => (
                            <tr key={row.key} className="bg-white border-b">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{row.label}</th>
                                {regimes.map(regime => (
                                    <td key={regime.key} className="px-6 py-4 text-right">
                                        {row.isPercent 
                                          ? formatPercent(incomes[regime.key][row.key]) 
                                          : formatCurrency(incomes[regime.key][row.key])
                                        }
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </PageContainer>
    );
};

interface ResumoProps {
    results: AllResults;
    onSave: () => void;
    formData: FormData;
}
const ResumoCargaTributaria: React.FC<ResumoProps> = ({ results, onSave, formData }) => {
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    
    const regimes = [
        { name: 'Simples Nacional', total: results.simplesNacional.totalValor, percent: results.simplesNacional.totalPercentual },
        { name: 'Lucro Presumido', total: results.lucroPresumido.totalValor, percent: results.lucroPresumido.totalPercentual },
        { name: 'Lucro Real', total: results.lucroReal.totalValor, percent: results.lucroReal.totalPercentual },
    ].sort((a,b) => a.total - b.total);
    
    const bestOption = regimes[0];
    const secondOption = regimes[1];

    const economy = secondOption && bestOption ? secondOption.total - bestOption.total : 0;

    const handleGeneratePdf = async () => {
        setIsGeneratingPdf(true);
        const summaryElement = document.getElementById('simulation-summary-content');
        if (!summaryElement || !window.html2canvas || !window.jspdf) {
            alert('Erro: Biblioteca de geração de PDF não foi carregada.');
            setIsGeneratingPdf(false);
            return;
        }

        try {
            const { jsPDF } = window.jspdf;
            const canvas = await window.html2canvas(summaryElement, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgProps = pdf.getImageProperties(imgData);
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            const fileName = `Simulacao_Tributaria_${formData.nomeEmpresa.replace(/\s+/g, '_')}.pdf`;
            pdf.save(fileName);

        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
            alert("Ocorreu um erro ao tentar gerar o PDF.");
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    return (
        <PageContainer>
            <div id="simulation-summary-content" className="bg-white p-6 rounded-lg shadow max-w-4xl mx-auto">
                 <h3 className="text-xl font-bold text-center text-[#0A2E5D] mb-6">Resumo da Carga Tributária Anual</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {regimes.map((regime, index) => (
                        <div key={regime.name} className={`p-4 rounded-lg text-center border-2 ${index === 0 ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'}`}>
                            <h4 className="font-bold text-lg text-[#0A2E5D]">{regime.name}</h4>
                            <p className="text-2xl font-semibold text-gray-800 my-2">{formatCurrency(regime.total)}</p>
                            <p className="text-md text-gray-600">{formatPercent(regime.percent)}</p>
                            {index === 0 && <p className="mt-3 text-sm font-bold text-green-700">Melhor Opção</p>}
                        </div>
                    ))}
                 </div>
                 {bestOption && secondOption && economy > 0 && (
                    <div className="mt-8 text-center bg-blue-50 p-4 rounded-lg">
                        <p className="text-gray-700">O regime de tributação mais vantajoso é o <strong>{bestOption.name}</strong>, com uma economia estimada de <strong>{formatCurrency(economy)}</strong> em relação ao <strong>{secondOption.name}</strong>.</p>
                    </div>
                 )}
                 <div className="mt-8 text-center flex flex-col sm:flex-row justify-center gap-4">
                    <button
                        onClick={onSave}
                        className="bg-[#0A2E5D] text-white font-bold py-3 px-8 rounded-lg hover:bg-[#2C3E50] transition-colors duration-300 shadow-lg"
                    >
                        Salvar Simulação
                    </button>
                    <button
                        onClick={handleGeneratePdf}
                        disabled={isGeneratingPdf}
                        className="bg-[#1ABC9C] text-white font-bold py-3 px-8 rounded-lg hover:bg-[#16a085] transition-colors duration-300 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isGeneratingPdf ? 'Gerando PDF...' : 'Gerar PDF'}
                    </button>
                </div>
            </div>
        </PageContainer>
    );
};


const SobreEmpresa: React.FC = () => (
    <PageContainer>
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-[#0A2E5D] mb-4">Sobre a Contrato Consultoria</h2>
            <p className="text-gray-700 mb-4">
                Somos uma empresa especializada em consultoria tributária, contábil e financeira. Nossa missão é ajudar empresas a otimizarem sua carga tributária e a tomarem decisões mais estratégicas, garantindo conformidade e impulsionando o crescimento.
            </p>
            <p className="text-gray-700">
                Esta ferramenta foi desenvolvida para fornecer uma simulação e um comparativo inicial entre os regimes tributários. Para um planejamento tributário completo e personalizado, entre em contato com nossos especialistas.
            </p>
        </div>
    </PageContainer>
);

interface SimulacoesSalvasProps {
    simulations: SavedSimulation[];
    onLoad: (id: number) => void;
    onDelete: (id: number) => void;
}

const SimulacoesSalvas: React.FC<SimulacoesSalvasProps> = ({ simulations, onLoad, onDelete }) => (
    <PageContainer>
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-[#0A2E5D] mb-4">Simulações Salvas</h2>
            {simulations.length === 0 ? (
                <p className="text-gray-600">Nenhuma simulação foi salva ainda.</p>
            ) : (
                <div className="space-y-4">
                    {simulations.map(sim => (
                        <div key={sim.id} className="p-4 border rounded-lg flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <p className="font-bold text-gray-800">{sim.nomeEmpresa}</p>
                                <p className="text-sm text-gray-600">CNPJ: {sim.cnpj}</p>
                                <p className="text-xs text-gray-500">Salvo em: {sim.timestamp}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onLoad(sim.id)}
                                    className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm"
                                >
                                    Carregar
                                </button>
                                <button
                                    onClick={() => onDelete(sim.id)}
                                    className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm"
                                >
                                    Excluir
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </PageContainer>
);


// --- Main App Component ---
const App: React.FC = () => {
    const [activePage, setActivePage] = useState<Page>('instrucoes');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        nomeEmpresa: 'Minha Empresa',
        cnpj: '00.000.000/0001-00',
        enquadramentoAtual: 'Simples Nacional',
        areaAtuacao: 'Comércio',
        anexo: 'ANEXO I',
        faturamentoAnual: 500000,
        custosVariavel: 250000,
        despesasFuncionamento: 60000,
        pessoal: 80000,
        alugueisImoveis: 0,
        locacoes: 0,
        energiaEletrica: 0,
        depreciacaoMaquinas: 0,
        depreciacaoPredios: 0,
        servicosTerceiros: 0,
        percSaidasMonofasicas: 0,
        percSaidasSubstituicaoTributaria: 0,
        percEntradasMonofasicas: 0,
        percEntradasSubstituicaoTributaria: 0,
    });
    const [taxRates, setTaxRates] = useState<TaxRates>({
        presumido: {
            PIS_PASEP: 0.0065, COFINS: 0.03, IRPJ: 0.15, ADICIONAL_IRPJ: 0.1, CSLL: 0.09,
            IPI: 0, ISS: 0.05, ICMS: 0.18, RAT: 0.02, CPP: 0.2, INSS_TERCEIROS: 0.058, FGTS: 0.08,
        },
        real: {
            PIS_PASEP: 0.0165, COFINS: 0.076, IRPJ: 0.15, ADICIONAL_IRPJ: 0.1, CSLL: 0.09,
            IPI: 0, ISS: 0.05, ICMS: 0.18, RAT: 0.02, CPP: 0.2, INSS_TERCEIROS: 0.058, FGTS: 0.08,
        }
    });

    const calculationResults = useMemo(() => runCalculations(formData, taxRates), [formData, taxRates]);
    const [savedSimulations, setSavedSimulations] = useState<SavedSimulation[]>([]);
    const LOCAL_STORAGE_KEY = 'taxSimulations';

    useEffect(() => {
        try {
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (saved) {
                setSavedSimulations(JSON.parse(saved));
            }
        } catch (error) {
            console.error("Failed to load simulations from localStorage", error);
        }
    }, []);

    const handleCalculate = () => {
        setActivePage('resumo-carga-tributaria');
    };
    
    const handleSaveSimulation = () => {
        const newSimulation: SavedSimulation = {
            id: Date.now(),
            nomeEmpresa: formData.nomeEmpresa.split(' ')[0] || formData.nomeEmpresa,
            cnpj: formData.cnpj,
            timestamp: new Date().toLocaleString('pt-BR'),
            formData,
            taxRates,
        };
        const updatedSimulations = [...savedSimulations, newSimulation];
        setSavedSimulations(updatedSimulations);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedSimulations));
        alert('Simulação salva com sucesso!');
    };

    const handleLoadSimulation = (id: number) => {
        const simulationToLoad = savedSimulations.find(sim => sim.id === id);
        if (simulationToLoad) {
            setFormData(simulationToLoad.formData);
            setTaxRates(simulationToLoad.taxRates);
            setActivePage('resumo-carga-tributaria');
        }
    };

    const handleDeleteSimulation = (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir esta simulação?')) {
            const updatedSimulations = savedSimulations.filter(sim => sim.id !== id);
            setSavedSimulations(updatedSimulations);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedSimulations));
        }
    };


    const renderPage = () => {
        switch(activePage) {
            case 'instrucoes': return <Instrucoes />;
            case 'entrada-dados': return <EntradaDados formData={formData} setFormData={setFormData} onCalculate={handleCalculate} />;
            case 'aliquota-imposto': return <AliquotaImposto taxRates={taxRates} setTaxRates={setTaxRates} />;
            case 'resultados': return <Resultados results={calculationResults.allResults} />;
            case 'tabelas-sn': return <TabelasSn anexo={formData.anexo} />;
            case 'demonstracao-resultado': return <DemonstracaoResultado incomes={calculationResults.allIncomes} />;
            case 'resumo-carga-tributaria': return <ResumoCargaTributaria results={calculationResults.allResults} onSave={handleSaveSimulation} formData={formData} />;
            case 'simulacoes-salvas': return <SimulacoesSalvas simulations={savedSimulations} onLoad={handleLoadSimulation} onDelete={handleDeleteSimulation} />;
            case 'sobre-empresa': return <SobreEmpresa />;
            default: return <Instrucoes />;
        }
    };
    
    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar activePage={activePage} setActivePage={setActivePage} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title={pageTitles[activePage]} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                    {renderPage()}
                </main>
            </div>
        </div>
    );
};

export default App;
