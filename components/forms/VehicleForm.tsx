import React, { useState, useEffect, FormEvent, ChangeEvent, useMemo } from 'react';
import { Vehicle, MaintenanceRecord } from '../../types';
import { useData } from '../../hooks/useMockData';
import { CarIcon } from '../icons/CarIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { PlusIcon } from '../icons/PlusIcon';
import { UploadIcon } from '../icons/UploadIcon';
import { formatCurrency, parseCurrency } from '../../utils/calculationUtils';
import { CalculatorIcon } from '../icons/CalculatorIcon';

interface VehicleFormProps {
  initialData?: Vehicle;
  onClose: () => void;
  companyId: string;
}

interface VehicleFormData {
  brand: string;
  model: string;
  category: string;
  color: string;
  plate: string;
  purchasePrice: number;
  announcedPrice: number;
  discount: number;
  entryDate: string;
  dailyCost: number;
  saleGoalDays: number;
  adCost: number;
  imageUrl: string;
  description: string;
  ipvaCost: number;
  ipvaDueDate: string;
  // New detailed fields
  modelYear?: number;
  fabricationYear?: number;
  renavam?: string;
  mileage?: number;
  fuelType?: Vehicle['fuelType'];
  transmission?: Vehicle['transmission'];
  traction?: Vehicle['traction'];
  doors?: number;
  occupants?: number;
  chassis?: string;
  history?: string;
  revisions?: string;
  standardItems?: string;
  additionalAccessories?: string;
  documentStatus?: string;
}

const FormField: React.FC<{ label: string; name: string; type?: string; value: string | number | undefined; onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; step?: string; required?: boolean; placeholder?: string; }> = ({ label, name, type = 'text', value, onChange, step, required = false, placeholder }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-dark-secondary mb-1">{label}</label>
      <input
        type={type}
        name={name}
        id={name}
        value={value || ''}
        onChange={onChange}
        className="w-full px-3 py-2 bg-dark-background border border-dark-border rounded-md focus:ring-dark-primary focus:border-dark-primary"
        required={required}
        step={step}
        placeholder={placeholder}
      />
    </div>
);

const MaintenanceEditor: React.FC<{
    records: MaintenanceRecord[];
    onAdd: (record: Omit<MaintenanceRecord, 'id' | 'vehicleId' | 'date'>) => void;
    onDelete: (id: string) => void;
}> = ({ records, onAdd, onDelete }) => {
    const [description, setDescription] = useState('');
    const [cost, setCost] = useState('');
    const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
    const [invoiceName, setInvoiceName] = useState<string | null>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setInvoiceUrl(reader.result as string);
                setInvoiceName(file.name);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleAdd = () => {
        if (!description || !cost) return;
        onAdd({ description, cost: parseCurrency(cost), invoiceUrl: invoiceUrl || undefined });
        setDescription('');
        setCost('');
        setInvoiceUrl(null);
        setInvoiceName(null);
    };

    return (
        <fieldset className="border border-dark-border p-4 rounded-lg mt-4">
            <legend className="px-2 font-semibold text-dark-text">Registros de Manutenção</legend>
            <div className="space-y-3 max-h-40 overflow-y-auto pr-2 mb-4">
                {records.length > 0 ? records.map(rec => (
                    <div key={rec.id} className="flex justify-between items-center bg-dark-background p-2 rounded-md">
                        <div>
                            <p className="font-medium text-sm">{rec.description}</p>
                            <p className="text-xs text-dark-secondary">{new Date(rec.date).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-3">
                             <span className="font-bold text-sm">{formatCurrency(rec.cost)}</span>
                             <button type="button" onClick={() => onDelete(rec.id)} className="text-red-500/70 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>
                        </div>
                    </div>
                )) : <p className="text-sm text-dark-secondary text-center py-2">Nenhum registro de manutenção.</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-dark-border">
                <input type="text" placeholder="Descrição do serviço" value={description} onChange={e => setDescription(e.target.value)} className="input-field-small" />
                <input 
                    type="text" 
                    placeholder="Custo (R$)" 
                    value={cost} 
                    onChange={e => setCost(e.target.value)} 
                    onBlur={() => setCost(formatCurrency(parseCurrency(cost)))}
                    onFocus={() => {
                        const num = parseCurrency(cost);
                        if (num > 0) setCost(String(num)); else setCost('');
                    }}
                    className="input-field-small" 
                />
                <div className="sm:col-span-2 flex items-center justify-between gap-3">
                    <label htmlFor="invoice-upload" className="cursor-pointer flex-1 text-center bg-dark-border/50 hover:bg-dark-border text-dark-text font-medium py-2 px-3 rounded-md transition-colors text-sm flex items-center justify-center gap-2">
                        <UploadIcon className="w-4 h-4"/>
                        <span>{invoiceName || 'Nota Fiscal (Opcional)'}</span>
                    </label>
                    <input id="invoice-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg, application/pdf" />
                    <button type="button" onClick={handleAdd} className="p-2 rounded-md bg-dark-primary text-dark-background font-bold hover:opacity-90"><PlusIcon/></button>
                </div>
            </div>
        </fieldset>
    );
}

const CalculatorSelect: React.FC<{ label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, children: React.ReactNode }> = ({ label, name, value, onChange, children }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-dark-secondary mb-1">{label}</label>
        <select
            id={name} name={name} value={value} onChange={onChange}
            className="w-full px-3 py-2 bg-dark-card border border-dark-border rounded-md"
        >
            {children}
        </select>
    </div>
);


const VehicleForm: React.FC<VehicleFormProps> = ({ initialData, onClose, companyId }) => {
  const { addVehicle, updateVehicle, maintenanceRecords: allMaintenanceRecords } = useData();
  const [formData, setFormData] = useState<VehicleFormData>({
    brand: '', model: '', category: '', color: '', plate: '', purchasePrice: 0, announcedPrice: 0, discount: 0,
    entryDate: new Date().toISOString().split('T')[0],
    dailyCost: 0, saleGoalDays: 30, adCost: 0, imageUrl: '', description: '',
    ipvaCost: 0, ipvaDueDate: '',
  });

  // String states for currency inputs
  const [purchasePriceInput, setPurchasePriceInput] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [discountInput, setDiscountInput] = useState('');
  const [dailyCostInput, setDailyCostInput] = useState('');
  const [adCostInput, setAdCostInput] = useState('');
  const [ipvaCostInput, setIpvaCostInput] = useState('');
  
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Calculator State
  const [isCalculatorOpen, setCalculatorOpen] = useState(false);
  const [calcInputs, setCalcInputs] = useState({
      despesasFixasMes: 90000,
      estoqueMedio: 45,
      valorCompra: 70000,
      origemDinheiro: 'emprestado',
      jurosMensal: 2,
      modoDepreciacao: 'padrao',
      idadeVeiculo: '3-5',
      depPctMensal: 0,
      depValorMensal: 0,
      custoLimpeza: 50,
      frequenciaLimpeza: 'semanal',
  });
  const [calcStringInputs, setCalcStringInputs] = useState({
      despesasFixasMes: formatCurrency(90000),
      valorCompra: formatCurrency(70000),
      depValorMensal: formatCurrency(0),
      custoLimpeza: formatCurrency(50),
  });
  const [estoqueMedioError, setEstoqueMedioError] = useState('');

  const initialFormData: VehicleFormData = {
    brand: '', model: '', category: '', color: '', plate: '', purchasePrice: 0, announcedPrice: 0, discount: 0,
    entryDate: new Date().toISOString().split('T')[0],
    dailyCost: 0, saleGoalDays: 30, adCost: 0, imageUrl: '', description: '',
    ipvaCost: 0, ipvaDueDate: '',
    modelYear: undefined, fabricationYear: undefined, renavam: '', mileage: undefined,
    fuelType: undefined, transmission: undefined, traction: undefined, doors: undefined,
    occupants: undefined, chassis: '', history: '', revisions: '', standardItems: '',
    additionalAccessories: '', documentStatus: '',
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialFormData,
        ...initialData,
        entryDate: new Date(initialData.entryDate).toISOString().split('T')[0],
        ipvaDueDate: initialData.ipvaDueDate ? new Date(initialData.ipvaDueDate).toISOString().split('T')[0] : '',
      });
      setPurchasePriceInput(formatCurrency(initialData.purchasePrice));
      setPriceInput(formatCurrency(initialData.announcedPrice));
      setDiscountInput(formatCurrency(initialData.discount));
      setDailyCostInput(formatCurrency(initialData.dailyCost));
      setAdCostInput(formatCurrency(initialData.adCost));
      setIpvaCostInput(formatCurrency(initialData.ipvaCost || 0));
      setMaintenanceRecords(allMaintenanceRecords.filter(r => r.vehicleId === initialData.id));
      if (initialData.imageUrl) setImagePreview(initialData.imageUrl);
      
      const initialValorCompra = initialData.purchasePrice;
      setCalcInputs(prev => ({ ...prev, valorCompra: initialValorCompra }));
      setCalcStringInputs(prev => ({...prev, valorCompra: formatCurrency(initialValorCompra)}));
    } else {
        setFormData(initialFormData);
        setPurchasePriceInput('');
        setPriceInput('');
        setDiscountInput('');
        setDailyCostInput('');
        setAdCostInput('');
        setIpvaCostInput('');
        setMaintenanceRecords([]);
        setImagePreview(null);
    }
  }, [initialData, allMaintenanceRecords]);

  // Generic handlers for main form currency fields
  const handleCurrencyInputChange = (e: ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>, fieldName: keyof VehicleFormData) => {
    const rawValue = e.target.value;
    setter(rawValue);
    const numericValue = parseCurrency(rawValue);
    setFormData(prev => ({ ...prev, [fieldName]: numericValue }));
  };

  const handleCurrencyInputBlur = (setter: React.Dispatch<React.SetStateAction<string>>, value: number) => {
    setter(formatCurrency(value));
  };

  const handleCurrencyInputFocus = (setter: React.Dispatch<React.SetStateAction<string>>, value: number) => {
    if (value > 0) setter(String(value)); else setter('');
  };

  // Calculator handlers
  const handleCalcChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const isNumber = type === 'number';
      
      if (name === 'estoqueMedio' && isNumber && Number(value) <= 0) {
          setEstoqueMedioError('O estoque médio deve ser maior que zero.');
      } else if (name === 'estoqueMedio') {
          setEstoqueMedioError('');
      }

      setCalcInputs(prev => ({
          ...prev,
          [name]: isNumber ? Number(value) : value
      }));
  };
  
  const handleCalcCurrencyChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCalcStringInputs(prev => ({...prev, [name]: value}));
    setCalcInputs(prev => ({ ...prev, [name]: parseCurrency(value) }));
  }
  const handleCalcCurrencyBlur = (e: ChangeEvent<HTMLInputElement>) => {
      const { name } = e.target;
      const value = calcInputs[name as keyof typeof calcInputs] as number;
      setCalcStringInputs(prev => ({...prev, [name]: formatCurrency(value)}));
  }
  const handleCalcCurrencyFocus = (e: ChangeEvent<HTMLInputElement>) => {
      const { name } = e.target;
      const value = calcInputs[name as keyof typeof calcInputs] as number;
      if (value > 0) setCalcStringInputs(prev => ({...prev, [name]: String(value)}));
      else setCalcStringInputs(prev => ({...prev, [name]: ''}));
  }


  const calculatedCosts = useMemo(() => {
      const { despesasFixasMes, estoqueMedio, valorCompra, origemDinheiro, jurosMensal, modoDepreciacao, idadeVeiculo, depPctMensal, depValorMensal, custoLimpeza, frequenciaLimpeza } = calcInputs;
      
      if (estoqueMedio <= 0) return { custoDia: 0, custoMes: 0, custoTotalEstoque: 0 };
      
      const fixoDia = despesasFixasMes / (estoqueMedio * 30);
      const jurosDia = origemDinheiro === 'emprestado' ? (valorCompra * (jurosMensal / 100)) / 30 : 0;
      
      let depDia = 0;
      if (modoDepreciacao === 'percentual') {
          depDia = (valorCompra * (depPctMensal / 100)) / 30;
      } else if (modoDepreciacao === 'valor_fixo') {
          depDia = depValorMensal / 30;
      } else { // padrão
          const pctPadraoMap: { [key: string]: number } = { '0-2': 0.01, '3-5': 0.008, '6-9': 0.006, '10+': 0.004, 'padrao': 0.008 };
          const pct = pctPadraoMap[idadeVeiculo] || 0.008;
          depDia = (valorCompra * pct) / 30;
      }

      const custoPatioDia = custoLimpeza / (frequenciaLimpeza === 'semanal' ? 7 : 15);
      const custoDia = fixoDia + jurosDia + depDia + custoPatioDia;
      
      return {
          custoDia: parseFloat(custoDia.toFixed(2)),
          custoMes: parseFloat((custoDia * 30).toFixed(2)),
          custoTotalEstoque: parseFloat((custoDia * estoqueMedio).toFixed(2)),
      };
  }, [calcInputs]);

  const handleApplyCost = () => {
    setFormData(prev => ({
        ...prev,
        dailyCost: calculatedCosts.custoDia
    }));
    setDailyCostInput(formatCurrency(calculatedCosts.custoDia));
    setCalculatorOpen(false);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isNumberInput = type === 'number';
    setFormData(prev => ({ 
        ...prev, 
        [name]: isNumberInput ? (value === '' ? undefined : parseInt(value, 10)) : value 
    }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setImagePreview(base64String);
            setFormData(prev => ({ ...prev, imageUrl: base64String }));
        };
        reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const finalVehicleData = {
        ...formData,
        entryDate: new Date(formData.entryDate).toISOString(),
        ipvaDueDate: formData.ipvaDueDate ? new Date(formData.ipvaDueDate).toISOString() : undefined,
        ipvaCost: formData.ipvaCost > 0 ? formData.ipvaCost : undefined,
    };
    
    if (initialData?.id) {
      updateVehicle({ ...initialData, ...finalVehicleData, maintenance: maintenanceRecords });
    } else {
      addVehicle({ ...finalVehicleData, companyId, maintenance: maintenanceRecords });
    }
    onClose();
  };
  
    const handleAddMaintenance = (record: Omit<MaintenanceRecord, 'id' | 'vehicleId' | 'date'>) => {
        const newRecord: MaintenanceRecord = {
            ...record,
            id: crypto.randomUUID(), // Temporary client-side ID
            vehicleId: initialData?.id || 'temp',
            date: new Date().toISOString(),
        };
        setMaintenanceRecords(prev => [...prev, newRecord]);
    };

    const handleDeleteMaintenance = (id: string) => {
        setMaintenanceRecords(prev => prev.filter(rec => rec.id !== id));
    };


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold text-center mb-6">{initialData ? 'Editar Veículo' : 'Cadastrar Veículo'}</h2>
      
       <div>
            <label className="block text-sm font-medium text-dark-secondary mb-2">Foto do Veículo</label>
            <div className="flex items-center gap-4">
                {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-28 h-20 object-cover rounded-md border border-dark-border" />
                ) : (
                    <div className="w-28 h-20 flex items-center justify-center bg-dark-background border-2 border-dashed border-dark-border rounded-md">
                        <CarIcon className="w-8 h-8 text-dark-secondary" />
                    </div>
                )}
                <label htmlFor="image-upload" className="cursor-pointer bg-dark-border/50 hover:bg-dark-border text-dark-text font-medium py-2 px-4 rounded-md transition-colors text-sm">
                    <span>Selecionar Imagem</span>
                </label>
                <input id="image-upload" name="image-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/png, image/jpeg" />
            </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        <FormField label="Marca" name="brand" value={formData.brand} onChange={handleChange} />
        <FormField label="Modelo" name="model" value={formData.model} onChange={handleChange} />
        <div>
            <label htmlFor="category" className="block text-sm font-medium text-dark-secondary mb-1">Categoria</label>
            <select name="category" id="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2 bg-dark-background border border-dark-border rounded-md focus:ring-dark-primary focus:border-dark-primary">
                <option value="" disabled>Selecione...</option>
                <option value="Hatch">Hatch</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Caminhonete">Caminhonete</option>
                <option value="Esportivo">Esportivo</option>
                <option value="Van">Van</option>
            </select>
        </div>
        <FormField label="Cor" name="color" value={formData.color} onChange={handleChange} />
        <FormField label="Placa" name="plate" value={formData.plate} onChange={handleChange} />
        <div>
          <label htmlFor="purchasePrice" className="block text-sm font-medium text-dark-secondary mb-1">Preço de Compra (R$)</label>
          <input
            type="text"
            name="purchasePrice"
            id="purchasePrice"
            value={purchasePriceInput}
            onChange={e => handleCurrencyInputChange(e, setPurchasePriceInput, 'purchasePrice')}
            onBlur={() => handleCurrencyInputBlur(setPurchasePriceInput, formData.purchasePrice)}
            onFocus={() => handleCurrencyInputFocus(setPurchasePriceInput, formData.purchasePrice)}
            className="w-full px-3 py-2 bg-dark-background border border-dark-border rounded-md focus:ring-dark-primary focus:border-dark-primary"
            placeholder="R$ 0,00"
          />
        </div>
        <div>
          <label htmlFor="announcedPrice" className="block text-sm font-medium text-dark-secondary mb-1">Preço Anunciado (R$)</label>
          <input
            type="text"
            name="announcedPrice"
            id="announcedPrice"
            value={priceInput}
            onChange={e => handleCurrencyInputChange(e, setPriceInput, 'announcedPrice')}
            onBlur={() => handleCurrencyInputBlur(setPriceInput, formData.announcedPrice)}
            onFocus={() => handleCurrencyInputFocus(setPriceInput, formData.announcedPrice)}
            className="w-full px-3 py-2 bg-dark-background border border-dark-border rounded-md focus:ring-dark-primary focus:border-dark-primary"
            placeholder="R$ 0,00"
          />
        </div>
        <div>
          <label htmlFor="discount" className="block text-sm font-medium text-dark-secondary mb-1">Desconto (R$)</label>
          <input
            type="text" name="discount" id="discount" value={discountInput}
            onChange={e => handleCurrencyInputChange(e, setDiscountInput, 'discount')}
            onBlur={() => handleCurrencyInputBlur(setDiscountInput, formData.discount)}
            onFocus={() => handleCurrencyInputFocus(setDiscountInput, formData.discount)}
            className="w-full px-3 py-2 bg-dark-background border border-dark-border rounded-md"
            placeholder="R$ 0,00"
          />
        </div>
        <div>
            <label htmlFor="dailyCost" className="block text-sm font-medium text-dark-secondary mb-1">Custo Diário (R$)</label>
            <div className="flex items-center gap-2">
                <input
                    type="text" name="dailyCost" id="dailyCost" value={dailyCostInput}
                    onChange={e => handleCurrencyInputChange(e, setDailyCostInput, 'dailyCost')}
                    onBlur={() => handleCurrencyInputBlur(setDailyCostInput, formData.dailyCost)}
                    onFocus={() => handleCurrencyInputFocus(setDailyCostInput, formData.dailyCost)}
                    className="w-full px-3 py-2 bg-dark-background border border-dark-border rounded-md"
                    placeholder="R$ 0,00"
                />
                <button type="button" onClick={() => setCalculatorOpen(prev => !prev)} className="p-2.5 rounded-md bg-dark-border/50 hover:bg-dark-border transition-colors flex-shrink-0">
                    <CalculatorIcon className="w-5 h-5 text-dark-secondary" />
                </button>
            </div>
        </div>
        <div>
          <label htmlFor="adCost" className="block text-sm font-medium text-dark-secondary mb-1">Custo Anúncio (R$)</label>
          <input
            type="text" name="adCost" id="adCost" value={adCostInput}
            onChange={e => handleCurrencyInputChange(e, setAdCostInput, 'adCost')}
            onBlur={() => handleCurrencyInputBlur(setAdCostInput, formData.adCost)}
            onFocus={() => handleCurrencyInputFocus(setAdCostInput, formData.adCost)}
            className="w-full px-3 py-2 bg-dark-background border border-dark-border rounded-md"
            placeholder="R$ 0,00"
          />
        </div>
        <FormField label="Meta de Venda (dias)" name="saleGoalDays" type="number" value={formData.saleGoalDays} onChange={handleChange} />
        <FormField label="Data de Entrada" name="entryDate" type="date" value={formData.entryDate} onChange={handleChange} />
        <div>
          <label htmlFor="ipvaCost" className="block text-sm font-medium text-dark-secondary mb-1">Custo do IPVA (R$)</label>
          <input
            type="text" name="ipvaCost" id="ipvaCost" value={ipvaCostInput}
            onChange={e => handleCurrencyInputChange(e, setIpvaCostInput, 'ipvaCost')}
            onBlur={() => handleCurrencyInputBlur(setIpvaCostInput, formData.ipvaCost)}
            onFocus={() => handleCurrencyInputFocus(setIpvaCostInput, formData.ipvaCost)}
            className="w-full px-3 py-2 bg-dark-background border border-dark-border rounded-md"
            placeholder="R$ 0,00"
          />
        </div>
        <FormField label="Vencimento do IPVA" name="ipvaDueDate" type="date" value={formData.ipvaDueDate} onChange={handleChange} />
      </div>

      {isCalculatorOpen && (
        <div className="bg-dark-background p-4 rounded-lg border border-dark-border space-y-4 animate-fade-in">
            <h4 className="text-lg font-bold text-dark-text text-center">Calculadora de Custo Diário do Veículo</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="despesasFixasMes" className="block text-sm font-medium text-dark-secondary mb-1">Despesas Fixas Mensais (R$)</label>
                    <input id="despesasFixasMes" name="despesasFixasMes" value={calcStringInputs.despesasFixasMes} onChange={handleCalcCurrencyChange} onBlur={handleCalcCurrencyBlur} onFocus={handleCalcCurrencyFocus} type="text" className="w-full px-3 py-2 bg-dark-card border border-dark-border rounded-md"/>
                 </div>
                 <div>
                    <label htmlFor="estoqueMedio" className="block text-sm font-medium text-dark-secondary mb-1">Estoque Médio (unidades)</label>
                    <input id="estoqueMedio" name="estoqueMedio" value={calcInputs.estoqueMedio} onChange={handleCalcChange} type="number" min="1" className={`w-full px-3 py-2 bg-dark-card border rounded-md ${estoqueMedioError ? 'border-red-500' : 'border-dark-border'}`}/>
                    {estoqueMedioError && <p className="text-xs text-red-400 mt-1">{estoqueMedioError}</p>}
                 </div>
                 <div>
                    <label htmlFor="valorCompra" className="block text-sm font-medium text-dark-secondary mb-1">Valor de Compra do Veículo (R$)</label>
                    <input id="valorCompra" name="valorCompra" value={calcStringInputs.valorCompra} onChange={handleCalcCurrencyChange} onBlur={handleCalcCurrencyBlur} onFocus={handleCalcCurrencyFocus} type="text" className="w-full px-3 py-2 bg-dark-card border border-dark-border rounded-md"/>
                 </div>
                 <CalculatorSelect label="Origem do Capital" name="origemDinheiro" value={calcInputs.origemDinheiro} onChange={handleCalcChange}>
                    <option value="proprio">Próprio</option>
                    <option value="emprestado">Emprestado</option>
                 </CalculatorSelect>
            </div>
            {calcInputs.origemDinheiro === 'emprestado' && (
                <div>
                    <label htmlFor="jurosMensal" className="block text-sm font-medium text-dark-secondary mb-1">Taxa de Juros Mensal (%)</label>
                    <input id="jurosMensal" name="jurosMensal" value={calcInputs.jurosMensal} onChange={handleCalcChange} type="number" className="w-full px-3 py-2 bg-dark-card border border-dark-border rounded-md"/>
                </div>
            )}

             <CalculatorSelect label="Método de Depreciação" name="modoDepreciacao" value={calcInputs.modoDepreciacao} onChange={handleCalcChange}>
                <option value="padrao">Padrão (por idade)</option>
                <option value="percentual">Percentual Mensal</option>
                <option value="valor_fixo">Valor Fixo Mensal</option>
             </CalculatorSelect>

            {calcInputs.modoDepreciacao === 'padrao' && (
                <CalculatorSelect label="Idade do Veículo" name="idadeVeiculo" value={calcInputs.idadeVeiculo} onChange={handleCalcChange}>
                    <option value="0-2">0-2 anos</option>
                    <option value="3-5">3-5 anos</option>
                    <option value="6-9">6-9 anos</option>
                    <option value="10+">10+ anos</option>
                    <option value="padrao">Não sei / Padrão (3-5 anos)</option>
                </CalculatorSelect>
            )}
            {calcInputs.modoDepreciacao === 'percentual' && (
                <div>
                    <label htmlFor="depPctMensal" className="block text-sm font-medium text-dark-secondary mb-1">Depreciação Mensal (%)</label>
                    <input id="depPctMensal" name="depPctMensal" value={calcInputs.depPctMensal} onChange={handleCalcChange} type="number" className="w-full px-3 py-2 bg-dark-card border border-dark-border rounded-md"/>
                </div>
            )}
            {calcInputs.modoDepreciacao === 'valor_fixo' && (
                 <div>
                    <label htmlFor="depValorMensal" className="block text-sm font-medium text-dark-secondary mb-1">Depreciação Mensal (R$)</label>
                    <input id="depValorMensal" name="depValorMensal" value={calcStringInputs.depValorMensal} onChange={handleCalcCurrencyChange} onBlur={handleCalcCurrencyBlur} onFocus={handleCalcCurrencyFocus} type="text" className="w-full px-3 py-2 bg-dark-card border border-dark-border rounded-md"/>
                 </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="custoLimpeza" className="block text-sm font-medium text-dark-secondary mb-1">Custo por Limpeza/Lavagem (R$)</label>
                    <input id="custoLimpeza" name="custoLimpeza" value={calcStringInputs.custoLimpeza} onChange={handleCalcCurrencyChange} onBlur={handleCalcCurrencyBlur} onFocus={handleCalcCurrencyFocus} type="text" className="w-full px-3 py-2 bg-dark-card border border-dark-border rounded-md"/>
                </div>
                <CalculatorSelect label="Frequência de Limpeza" name="frequenciaLimpeza" value={calcInputs.frequenciaLimpeza} onChange={handleCalcChange}>
                    <option value="semanal">Semanal</option>
                    <option value="quinzenal">Quinzenal</option>
                </CalculatorSelect>
            </div>


            <div className="text-center bg-dark-card py-3 px-4 rounded-lg border border-dark-border mt-4 space-y-2">
                <p className="text-sm text-dark-secondary">Custo diário estimado por veículo:</p>
                <p className="text-3xl font-bold text-dark-primary">{formatCurrency(calculatedCosts.custoDia)}</p>
                <div className="flex justify-around text-xs pt-2">
                    <p className="text-dark-secondary">Custo Mensal: <span className="font-bold text-dark-text">{formatCurrency(calculatedCosts.custoMes)}</span></p>
                    <p className="text-dark-secondary">Custo Estoque/Dia: <span className="font-bold text-dark-text">{formatCurrency(calculatedCosts.custoTotalEstoque)}</span></p>
                </div>
            </div>
             <button type="button" onClick={handleApplyCost} disabled={!!estoqueMedioError} className="w-full px-4 py-2 mt-2 rounded-md bg-dark-primary text-dark-background font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                Aplicar Custo no Formulário
            </button>
        </div>
      )}
      
       <div>
          <label htmlFor="description" className="block text-sm font-medium text-dark-secondary mb-1">Descrição Completa (para anúncios)</label>
          <textarea
            name="description"
            id="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-dark-background border border-dark-border rounded-md focus:ring-dark-primary focus:border-dark-primary"
            placeholder="Ex: Veículo completo, único dono, baixa quilometragem..."
          />
       </div>

        <details className="border border-dark-border rounded-lg">
            <summary className="p-4 font-semibold text-dark-text cursor-pointer">Detalhes Adicionais do Veículo</summary>
            <div className="p-4 border-t border-dark-border grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Ano/Modelo" name="modelYear" type="number" value={formData.modelYear} onChange={handleChange} />
                <FormField label="Ano Fabricação" name="fabricationYear" type="number" value={formData.fabricationYear} onChange={handleChange} />
                <FormField label="Quilometragem" name="mileage" type="number" value={formData.mileage} onChange={handleChange} placeholder="Ex: 50000"/>
                <FormField label="RENAVAM" name="renavam" value={formData.renavam} onChange={handleChange} />
                <div>
                    <label htmlFor="fuelType" className="block text-sm font-medium text-dark-secondary mb-1">Combustível</label>
                    <select name="fuelType" value={formData.fuelType || ''} onChange={handleChange} className="w-full px-3 py-2 bg-dark-background border border-dark-border rounded-md">
                        <option value="">Selecione...</option>
                        <option>Gasolina</option><option>Etanol</option><option>Flex</option>
                        <option>Diesel</option><option>Híbrido</option><option>Elétrico</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="transmission" className="block text-sm font-medium text-dark-secondary mb-1">Câmbio</label>
                    <select name="transmission" value={formData.transmission || ''} onChange={handleChange} className="w-full px-3 py-2 bg-dark-background border border-dark-border rounded-md">
                        <option value="">Selecione...</option>
                        <option>Manual</option><option>Automático</option><option>CVT</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="traction" className="block text-sm font-medium text-dark-secondary mb-1">Tração</label>
                    <select name="traction" value={formData.traction || ''} onChange={handleChange} className="w-full px-3 py-2 bg-dark-background border border-dark-border rounded-md">
                        <option value="">Selecione...</option>
                        <option>Dianteira</option><option>Traseira</option><option>4x4</option>
                    </select>
                </div>
                <FormField label="Nº de Portas" name="doors" type="number" value={formData.doors} onChange={handleChange} />
                <FormField label="Nº de Ocupantes" name="occupants" type="number" value={formData.occupants} onChange={handleChange} />
                <FormField label="Chassi" name="chassis" value={formData.chassis} onChange={handleChange} />
                <FormField label="Situação Documental" name="documentStatus" value={formData.documentStatus} onChange={handleChange} placeholder="Ex: IPVA 2024 pago"/>
                <div className="md:col-span-2">
                    <label htmlFor="standardItems" className="block text-sm font-medium text-dark-secondary mb-1">Itens de Série</label>
                    <textarea name="standardItems" rows={3} value={formData.standardItems || ''} onChange={handleChange} className="w-full px-3 py-2 bg-dark-background border border-dark-border rounded-md" placeholder="Ex: Ar-condicionado, Airbags, Freios ABS..."/>
                </div>
                 <div className="md:col-span-2">
                    <label htmlFor="additionalAccessories" className="block text-sm font-medium text-dark-secondary mb-1">Acessórios Adicionais</label>
                    <textarea name="additionalAccessories" rows={3} value={formData.additionalAccessories || ''} onChange={handleChange} className="w-full px-3 py-2 bg-dark-background border border-dark-border rounded-md" placeholder="Ex: Multimídia, Teto Solar, Bancos de Couro..."/>
                </div>
                 <div className="md:col-span-2">
                    <label htmlFor="history" className="block text-sm font-medium text-dark-secondary mb-1">Histórico</label>
                    <textarea name="history" rows={3} value={formData.history || ''} onChange={handleChange} className="w-full px-3 py-2 bg-dark-background border border-dark-border rounded-md" placeholder="Ex: Único dono, sem sinistros, veículo de não fumante..."/>
                </div>
                 <div className="md:col-span-2">
                    <label htmlFor="revisions" className="block text-sm font-medium text-dark-secondary mb-1">Revisões</label>
                    <textarea name="revisions" rows={3} value={formData.revisions || ''} onChange={handleChange} className="w-full px-3 py-2 bg-dark-background border border-dark-border rounded-md" placeholder="Ex: Todas as revisões feitas na concessionária, última revisão em JAN/2024..."/>
                </div>
            </div>
        </details>

      <MaintenanceEditor records={maintenanceRecords} onAdd={handleAddMaintenance} onDelete={handleDeleteMaintenance} />

      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-dark-border/50 hover:bg-dark-border transition-colors">Cancelar</button>
        <button type="submit" className="px-4 py-2 rounded-md bg-dark-primary text-dark-background font-bold hover:opacity-90 transition-opacity">Salvar</button>
      </div>
      
       <style>{`
            .input-field-small {
                padding: 0.5rem 0.75rem;
                font-size: 0.875rem;
                background-color: #0A0F1E;
                border: 1px solid #243049;
                border-radius: 0.375rem;
                color: #E0E0E0;
            }
            .input-field-small:focus {
                outline: none;
                box-shadow: 0 0 0 2px #00D1FF;
            }
        `}</style>
    </form>
  );
};

export default VehicleForm;