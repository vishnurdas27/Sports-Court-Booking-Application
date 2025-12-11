import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  fetchCourts, createCourt, deleteCourt, fetchAllBookings,
  fetchRules, createRule, deleteRule,
  createEquipment, deleteEquipment, fetchEquipment,
  createCoach, deleteCoach, fetchCoaches, updateCourtStatus
} from '../services/api';
import { Trash2, Calendar, LayoutGrid, Dumbbell, User, DollarSign, Power } from 'lucide-react';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('courts');

  // --- DATA STATES ---
  const [data, setData] = useState({
    courts: [],
    bookings: [],
    rules: [],
    equipment: [],
    coaches: []
  });

  // --- FORM STATES ---
  const [forms, setForms] = useState({
    court: { name: '', type: 'indoor', basePricePerHour: 20 },
    rule: { name: '', type: 'peak_hour', multiplier: 1.5, startTime: '18:00', endTime: '21:00' },
    item: { name: '', type: 'racket', totalStock: 5, pricePerUnit: 5 },
    coach: { name: '', hourlyRate: 20, specialization: '' }
  });

  // --- DATA LOADING ---
  const loadData = useCallback(async () => {
    if (!user?.token) return;
    const token = user.token;

    try {
      if (activeTab === 'courts') setData(prev => ({ ...prev, courts: [] })); // clear before fetch
      
      let result = [];
      if (activeTab === 'courts') result = (await fetchCourts()).data;
      else if (activeTab === 'bookings') result = (await fetchAllBookings(token)).data;
      else if (activeTab === 'rules') result = (await fetchRules(token)).data;
      else if (activeTab === 'equipment') result = (await fetchEquipment()).data;
      else if (activeTab === 'coaches') result = (await fetchCoaches()).data;

      setData(prev => ({ ...prev, [activeTab]: result }));
    } catch (error) {
      console.error("Failed to load data for tab:", activeTab, error);
    }
  }, [user, activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- GENERIC HANDLERS ---
  const handleCreate = async (apiFunc, formKey, defaultState) => {
    try {
      await apiFunc(forms[formKey], user.token);
      setForms(prev => ({ ...prev, [formKey]: defaultState }));
      loadData();
    } catch (error) {
      alert('Failed to create item');
    }
  };

  const handleDelete = async (apiFunc, id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await apiFunc(id, user.token);
        loadData();
      } catch (error) {
        alert('Delete failed');
      }
    }
  };

  const handleToggleCourt = async (court) => {
    try {
      await updateCourtStatus(court.id, { isActive: !court.isActive }, user.token);
      loadData();
    } catch (error) {
      alert('Update failed');
    }
  };

  // Helper to update form state
  const updateForm = (key, field, value) => {
    setForms(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Control Panel</h1>

        {/* --- NAVIGATION --- */}
        <div className="flex flex-wrap gap-4 mb-8">
          {[
            { id: 'courts', icon: LayoutGrid, label: 'Courts' },
            { id: 'equipment', icon: Dumbbell, label: 'Inventory' },
            { id: 'coaches', icon: User, label: 'Coaches' },
            { id: 'rules', icon: DollarSign, label: 'Pricing' },
            { id: 'bookings', icon: Calendar, label: 'Bookings' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 rounded-lg font-bold flex items-center gap-2 transition-all ${
                activeTab === tab.id 
                  ? 'bg-emerald-600 text-white shadow-md transform scale-105' 
                  : 'bg-white text-slate-600 hover:bg-emerald-50'
              }`}
            >
              <tab.icon className="w-5 h-5" /> {tab.label}
            </button>
          ))}
        </div>

        {/* --- COURTS TAB --- */}
        {activeTab === 'courts' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              {data.courts.map(c => (
                <div key={c.id} className={`bg-white p-4 rounded-lg shadow-sm flex justify-between items-center ${!c.isActive ? 'opacity-70 bg-gray-50' : ''}`}>
                  <div>
                    <h3 className="font-bold text-lg">{c.name} {c.isActive ? '' : '(Disabled)'}</h3>
                    <p className="text-sm text-gray-500 capitalize">{c.type} • ${c.basePricePerHour}/hr</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleToggleCourt(c)} className={`p-2 rounded-full transition-colors ${c.isActive ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-gray-400 bg-gray-200 hover:bg-gray-300'}`}>
                      <Power className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(deleteCourt, c.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm h-fit border border-gray-100">
              <h3 className="font-bold mb-4 text-lg">Add New Court</h3>
              <input className="w-full mb-3 p-2 border rounded" placeholder="Name" value={forms.court.name} onChange={e => updateForm('court', 'name', e.target.value)} />
              <select className="w-full mb-3 p-2 border rounded" value={forms.court.type} onChange={e => updateForm('court', 'type', e.target.value)}>
                <option value="indoor">Indoor</option>
                <option value="outdoor">Outdoor</option>
              </select>
              <input className="w-full mb-3 p-2 border rounded" type="number" placeholder="Price ($/hr)" value={forms.court.basePricePerHour} onChange={e => updateForm('court', 'basePricePerHour', e.target.value)} />
              <button onClick={() => handleCreate(createCourt, 'court', { name: '', type: 'indoor', basePricePerHour: 20 })} className="w-full bg-emerald-600 text-white py-2 rounded font-bold hover:bg-emerald-700">Add Court</button>
            </div>
          </div>
        )}

        {/* --- EQUIPMENT TAB --- */}
        {activeTab === 'equipment' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.equipment.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-orange-400 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-800">{item.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">Stock: {item.totalStock} • ${item.pricePerUnit}</p>
                  </div>
                  <button onClick={() => handleDelete(deleteEquipment, item.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm h-fit border border-gray-100">
              <h3 className="font-bold mb-4 text-lg">Add Equipment</h3>
              <input className="w-full mb-3 p-2 border rounded" placeholder="Item Name" value={forms.item.name} onChange={e => updateForm('item', 'name', e.target.value)} />
              <input className="w-full mb-3 p-2 border rounded" type="number" placeholder="Stock Qty" value={forms.item.totalStock} onChange={e => updateForm('item', 'totalStock', e.target.value)} />
              <input className="w-full mb-3 p-2 border rounded" type="number" placeholder="Price ($)" value={forms.item.pricePerUnit} onChange={e => updateForm('item', 'pricePerUnit', e.target.value)} />
              <button onClick={() => handleCreate(createEquipment, 'item', { name: '', type: 'racket', totalStock: 5, pricePerUnit: 5 })} className="w-full bg-emerald-600 text-white py-2 rounded font-bold hover:bg-emerald-700">Add Item</button>
            </div>
          </div>
        )}

        {/* --- COACHES TAB --- */}
        {activeTab === 'coaches' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              {data.coaches.map(c => (
                <div key={c.id} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-indigo-500 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-800">{c.name}</h3>
                    <p className="text-sm text-gray-500">{c.specialization} • ${c.hourlyRate}/hr</p>
                  </div>
                  <button onClick={() => handleDelete(deleteCoach, c.id)} className="text-red-400 hover:text-red-600 p-2"><Trash2 className="w-5 h-5" /></button>
                </div>
              ))}
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm h-fit border border-gray-100">
              <h3 className="font-bold mb-4 text-lg">Add Coach</h3>
              <input className="w-full mb-3 p-2 border rounded" placeholder="Coach Name" value={forms.coach.name} onChange={e => updateForm('coach', 'name', e.target.value)} />
              <input className="w-full mb-3 p-2 border rounded" placeholder="Specialty" value={forms.coach.specialization} onChange={e => updateForm('coach', 'specialization', e.target.value)} />
              <input className="w-full mb-3 p-2 border rounded" type="number" placeholder="Rate ($/hr)" value={forms.coach.hourlyRate} onChange={e => updateForm('coach', 'hourlyRate', e.target.value)} />
              <button onClick={() => handleCreate(createCoach, 'coach', { name: '', hourlyRate: 20, specialization: '' })} className="w-full bg-emerald-600 text-white py-2 rounded font-bold hover:bg-emerald-700">Add Coach</button>
            </div>
          </div>
        )}

        {/* --- RULES TAB --- */}
        {activeTab === 'rules' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              {data.rules.map(r => (
                <div key={r.id} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-400 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-800">{r.name}</h3>
                    <p className="text-sm text-gray-500">
                       x{r.multiplier} Multiplier • {r.type === 'weekend' ? 'Weekends' : `${r.startTime} - ${r.endTime}`}
                    </p>
                  </div>
                  <button onClick={() => handleDelete(deleteRule, r.id)} className="text-red-400 hover:text-red-600 p-2"><Trash2 className="w-5 h-5" /></button>
                </div>
              ))}
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm h-fit border border-gray-100">
              <h3 className="font-bold mb-4 text-lg">New Rule</h3>
              <input className="w-full mb-3 p-2 border rounded" placeholder="Rule Name" value={forms.rule.name} onChange={e => updateForm('rule', 'name', e.target.value)} />
              <select className="w-full mb-3 p-2 border rounded" value={forms.rule.type} onChange={e => updateForm('rule', 'type', e.target.value)}>
                <option value="peak_hour">Peak Hour</option>
                <option value="weekend">Weekend</option>
              </select>
              <input className="w-full mb-3 p-2 border rounded" type="number" placeholder="Multiplier (e.g. 1.5)" value={forms.rule.multiplier} onChange={e => updateForm('rule', 'multiplier', e.target.value)} />
              {forms.rule.type === 'peak_hour' && (
                <div className="flex gap-2 mb-3">
                    <input className="w-1/2 p-2 border rounded" type="time" value={forms.rule.startTime} onChange={e => updateForm('rule', 'startTime', e.target.value)} />
                    <input className="w-1/2 p-2 border rounded" type="time" value={forms.rule.endTime} onChange={e => updateForm('rule', 'endTime', e.target.value)} />
                </div>
              )}
              <button onClick={() => handleCreate(createRule, 'rule', { name: '', type: 'peak_hour', multiplier: 1.5, startTime: '18:00', endTime: '21:00' })} className="w-full bg-emerald-600 text-white py-2 rounded font-bold hover:bg-emerald-700">Create Rule</button>
            </div>
          </div>
        )}

        {/* --- BOOKINGS TAB --- */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            {data.bookings.length === 0 ? (
               <p className="p-8 text-center text-slate-500 italic">No bookings found.</p>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4 font-bold text-slate-600">ID</th>
                    <th className="p-4 font-bold text-slate-600">User</th>
                    <th className="p-4 font-bold text-slate-600">Court</th>
                    <th className="p-4 font-bold text-slate-600">Date</th>
                    <th className="p-4 font-bold text-slate-600">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.bookings.map(b => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="p-4 text-slate-500 font-mono text-sm">#{b.id}</td>
                      <td className="p-4 font-medium text-slate-800">{b.User?.name || 'Unknown'}</td>
                      <td className="p-4 text-slate-600">{b.Court?.name}</td>
                      <td className="p-4 text-slate-600">
                        {format(new Date(b.startTime), 'MMM d, yyyy')} <br/>
                        <span className="text-xs text-slate-400">{format(new Date(b.startTime), 'h:mm a')}</span>
                      </td>
                      <td className="p-4 font-bold text-emerald-600">${b.totalPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;