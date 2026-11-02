import React, { useState } from 'react';
import {
  Layers,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  FlaskConical,
  X,
  ChevronDown,
} from 'lucide-react';
import { useLIS } from '../context/LISContext';
import { TestDefinition, ParameterDefinition } from '../types/lis';

export const CatalogueView: React.FC = () => {
  const { currentLab, tests, departments, addTestDefinition, updateTestDefinition } = useLIS();

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestId, setEditingTestId] = useState<string | null>(null);

  // Form Fields
  const [testName, setTestName] = useState('');
  const [testCode, setTestCode] = useState('');
  const [selectedDept, setSelectedDept] = useState(departments[0]?.name || 'Haematology & Coagulation');
  const [description, setDescription] = useState('');
  const [specimenType, setSpecimenType] = useState('Serum');
  const [container, setContainer] = useState('SST Gold Top');
  const [method, setMethod] = useState('Automated Spectrophotometry');
  const [price, setPrice] = useState<number>(5000);
  const [turnaroundHours, setTurnaroundHours] = useState<number>(2);

  // Parameters Builder
  const [parameters, setParameters] = useState<ParameterDefinition[]>([
    {
      id: `p-${Date.now()}`,
      name: 'Primary Marker',
      code: 'MARKER',
      unit: 'mg/dL',
      dataType: 'numeric',
      normalMin: 0,
      normalMax: 100,
      referenceRangeText: '0 - 100 mg/dL',
    },
  ]);

  const filteredTests = tests.filter((t) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      t.name.toLowerCase().includes(term) ||
      t.code.toLowerCase().includes(term) ||
      t.department.toLowerCase().includes(term);

    const matchesDept = departmentFilter === 'all' || t.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const handleOpenAdd = () => {
    setEditingTestId(null);
    setTestName('');
    setTestCode('');
    setSelectedDept(departments[0]?.name || 'Haematology & Coagulation');
    setDescription('');
    setSpecimenType('Serum');
    setContainer('SST Gold Top');
    setMethod('Automated Spectrophotometry');
    setPrice(5000);
    setTurnaroundHours(2);
    setParameters([
      {
        id: `p-${Date.now()}`,
        name: 'Primary Marker',
        code: 'MARKER',
        unit: 'mg/dL',
        dataType: 'numeric',
        normalMin: 0,
        normalMax: 100,
        referenceRangeText: '0 - 100 mg/dL',
      },
    ]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (test: TestDefinition) => {
    setEditingTestId(test.id);
    setTestName(test.name);
    setTestCode(test.code);
    setSelectedDept(test.department);
    setDescription(test.description);
    setSpecimenType(test.specimenType);
    setContainer(test.container);
    setMethod(test.method);
    setPrice(test.price);
    setTurnaroundHours(test.turnaroundHours);
    setParameters(test.parameters || []);
    setIsModalOpen(true);
  };

  const handleAddParameter = () => {
    const newParam: ParameterDefinition = {
      id: `p-${Date.now()}-${parameters.length}`,
      name: `Parameter ${parameters.length + 1}`,
      code: `PARAM_${parameters.length + 1}`,
      unit: 'U/L',
      dataType: 'numeric',
      normalMin: 0,
      normalMax: 50,
      referenceRangeText: '0 - 50 U/L',
    };
    setParameters([...parameters, newParam]);
  };

  const handleRemoveParameter = (id: string) => {
    if (parameters.length <= 1) return;
    setParameters(parameters.filter((p) => p.id !== id));
  };

  const handleUpdateParameter = (id: string, field: keyof ParameterDefinition, val: any) => {
    setParameters(
      parameters.map((p) => {
        if (p.id === id) {
          const updated = { ...p, [field]: val };
          if (field === 'normalMin' || field === 'normalMax') {
            updated.referenceRangeText = `${updated.normalMin || 0} - ${updated.normalMax || 0} ${updated.unit || ''}`;
          }
          return updated;
        }
        return p;
      })
    );
  };

  const handleSaveTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName.trim() || !testCode.trim()) return;

    if (editingTestId) {
      updateTestDefinition(editingTestId, {
        name: testName.trim(),
        code: testCode.trim().toUpperCase(),
        department: selectedDept,
        description: description.trim(),
        specimenType,
        container,
        method,
        price: Number(price),
        turnaroundHours: Number(turnaroundHours),
        parameters,
      });
    } else {
      addTestDefinition({
        name: testName.trim(),
        code: testCode.trim().toUpperCase(),
        department: selectedDept,
        description: description.trim(),
        specimenType,
        container,
        method,
        price: Number(price),
        turnaroundHours: Number(turnaroundHours),
        parameters,
        isActive: true,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-teal-700" />
            Configurable Laboratory Test Catalogue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Define diagnostic assays, specimen tubes, analytical methods, biological intervals, and pricing for {currentLab.name}.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Configure New Test
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search test name, code, or department..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 shrink-0">
          <span>Department:</span>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs outline-hidden font-medium"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Test Catalogue Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTests.map((test) => (
          <div
            key={test.id}
            className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="font-mono text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                    {test.code}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-1 leading-snug">{test.name}</h3>
                </div>
                <span className="font-bold text-sm text-slate-900">
                  {currentLab.currencySymbol}{test.price.toLocaleString()}
                </span>
              </div>

              <p className="text-[11px] text-slate-500 line-clamp-2 mb-3">
                {test.description}
              </p>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-[11px] space-y-1 mb-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Department:</span>
                  <span className="font-medium text-slate-800">{test.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Specimen / Tube:</span>
                  <span className="font-medium text-slate-800">{test.specimenType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Turnaround Time:</span>
                  <span className="font-medium text-slate-800">{test.turnaroundHours} Hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Parameters:</span>
                  <span className="font-semibold text-teal-800">{test.parameters.length} defined</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                  test.isActive ? 'text-emerald-700' : 'text-slate-400'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${test.isActive ? 'bg-emerald-600' : 'bg-slate-400'}`} />
                {test.isActive ? 'Active Assays' : 'Disabled'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateTestDefinition(test.id, { isActive: !test.isActive })}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                >
                  {test.isActive ? 'Disable' : 'Enable'}
                </button>
                <button
                  onClick={() => handleOpenEdit(test)}
                  className="p-1 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded"
                  title="Edit Configuration"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Test Modal with Parameter Builder */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <h2 className="text-sm font-bold">
                {editingTestId ? 'Edit Test Assay Configuration' : 'Configure New Laboratory Test'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTest} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Test Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    placeholder="e.g. Full Blood Count"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Test Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={testCode}
                    onChange={(e) => setTestCode(e.target.value)}
                    placeholder="e.g. FBC-01"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs font-mono uppercase focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Laboratory Department
                  </label>
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs outline-hidden"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Price ({currentLab.currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs font-mono outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Specimen Type
                  </label>
                  <input
                    type="text"
                    value={specimenType}
                    onChange={(e) => setSpecimenType(e.target.value)}
                    placeholder="e.g. Whole Blood"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sample Container
                  </label>
                  <input
                    type="text"
                    value={container}
                    onChange={(e) => setContainer(e.target.value)}
                    placeholder="e.g. EDTA Lavender top"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Turnaround (Hrs)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={turnaroundHours}
                    onChange={(e) => setTurnaroundHours(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description / Clinical Indication
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Clinical purpose and overview of this laboratory assay."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs outline-hidden"
                />
              </div>

              {/* Parameters Builder Section */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Analytical Parameters & Biological Reference Intervals
                  </span>
                  <button
                    type="button"
                    onClick={handleAddParameter}
                    className="text-xs text-teal-700 font-semibold hover:text-teal-800 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Parameter
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {parameters.map((param, index) => (
                    <div
                      key={param.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-700 text-[11px]">
                          #{index + 1}
                        </span>
                        <input
                          type="text"
                          placeholder="Parameter Name (e.g. Haemoglobin)"
                          value={param.name}
                          onChange={(e) => handleUpdateParameter(param.id, 'name', e.target.value)}
                          className="flex-1 px-2.5 py-1 bg-white border border-slate-300 rounded text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Code (e.g. HGB)"
                          value={param.code}
                          onChange={(e) => handleUpdateParameter(param.id, 'code', e.target.value)}
                          className="w-24 px-2.5 py-1 bg-white border border-slate-300 rounded text-xs font-mono uppercase"
                        />
                        {parameters.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveParameter(param.id)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-500 block">Unit</label>
                          <input
                            type="text"
                            placeholder="g/dL, U/L, etc."
                            value={param.unit}
                            onChange={(e) => handleUpdateParameter(param.id, 'unit', e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block">Normal Min</label>
                          <input
                            type="number"
                            step="any"
                            value={param.normalMin ?? ''}
                            onChange={(e) => handleUpdateParameter(param.id, 'normalMin', Number(e.target.value))}
                            className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block">Normal Max</label>
                          <input
                            type="number"
                            step="any"
                            value={param.normalMax ?? ''}
                            onChange={(e) => handleUpdateParameter(param.id, 'normalMax', Number(e.target.value))}
                            className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block">Data Type</label>
                          <select
                            value={param.dataType}
                            onChange={(e) => handleUpdateParameter(param.id, 'dataType', e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                          >
                            <option value="numeric">Numeric</option>
                            <option value="qualitative">Qualitative</option>
                            <option value="text">Text / Micro</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-semibold shadow-xs"
                >
                  Save Test Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
