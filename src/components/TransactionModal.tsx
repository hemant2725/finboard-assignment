import { useState, useEffect } from 'react';
import { Calendar, IndianRupee, Tag, FileText, User, X, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { INR_SYMBOL } from '@/lib/currency';
import { useDashboard } from '@/context/DashboardContext';
import { toast } from 'sonner';

const categories = [
  'Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 
  'Salary', 'Freelance', 'Investment', 'Health', 'Education', 'Software', 'Other'
];

export function TransactionModal() {
  const { 
    state, 
    addTransaction, 
    updateTransaction, 
    setAddModalOpen, 
    setEditingTransaction 
  } = useDashboard();

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    type: 'expense' as 'income' | 'expense',
    date: new Date().toISOString().split('T')[0],
    recipient: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);//show success animation

  useEffect(() => {
    if (state.editingTransaction) {
      setFormData({
        description: state.editingTransaction.description,
        amount: state.editingTransaction.amount.toString(),
        category: state.editingTransaction.category,
        type: state.editingTransaction.type,
        date: state.editingTransaction.date,
        recipient: state.editingTransaction.recipient || '',
      });
    } else {
      // Reset form for new transaction
      setFormData({
        description: '',
        amount: '',
        category: '',
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        recipient: '',
      });
    }
    setErrors({});
    setSuccess(false);
  }, [state.editingTransaction, state.isAddModalOpen]);

  //form validation logic
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 2) {
      newErrors.description = 'Description must be at least 2 characters';
    }
    
    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else {
      const numAmount = parseFloat(formData.amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        newErrors.amount = 'Please enter a valid amount';
      } else if (numAmount > 1000000) {
        newErrors.amount = `Amount cannot exceed ${INR_SYMBOL}1,000,000`;
      }
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClose = () => {
    setAddModalOpen(false);
    setEditingTransaction(null);
    setFormData({
      description: '',
      amount: '',
      category: '',
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      recipient: '',
    });
    setErrors({});
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);//it disable buttons while submitting

    const transactionData = {
      description: formData.description.trim(),
      amount: parseFloat(formData.amount),
      category: formData.category as any,
      type: formData.type,
      date: formData.date,
      recipient: formData.recipient.trim() || undefined,
    };

    let didSave = false;

    //it handled submission with proper loading, success feedback, and error handling
    try {
      if (state.editingTransaction) {
        await updateTransaction({
          ...transactionData,
          id: state.editingTransaction.id,
        } as any);
        didSave = true;
        setSuccess(true);
        toast.success('Transaction updated successfully');
      } else {
        await addTransaction(transactionData);
        didSave = true;
        setSuccess(true);
        toast.success('Transaction added successfully');
      }
    } catch (submitError) {
      toast.error(submitError instanceof Error ? submitError.message : 'Unable to save transaction');
      setSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
    
    // Close modal after showing success
    if (didSave) {
      setTimeout(() => {
        handleClose();
      }, 1200);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!state.isAddModalOpen || state.userRole !== 'admin') return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-dark-card border border-white/10 rounded-2xl lg:rounded-3xl p-4 sm:p-5 lg:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 lg:mb-5">
          <h3 className="text-base lg:text-lg font-heading font-semibold text-text-primary">
            {state.editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
          </h3>
          <button 
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4 lg:w-5 lg:h-5 text-text-secondary" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center">
            <div className="w-14 h-14 rounded-full bg-lime/10 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle className="w-7 h-7 text-lime" />
            </div>
            <p className="text-text-primary font-medium">
              {state.editingTransaction ? 'Updated!' : 'Added!'}
            </p>
            <p className="text-xs text-text-secondary mt-1">
              {state.editingTransaction ? 'Transaction updated successfully' : 'Transaction added successfully'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 lg:space-y-4">
            {/* Type Selection */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-dark-elevated rounded-xl">
              <button
                type="button"
                onClick={() => handleInputChange('type', 'expense')}
                className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                  formData.type === 'expense'
                    ? 'bg-orange-500/20 text-orange-400'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => handleInputChange('type', 'income')}
                className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                  formData.type === 'income'
                    ? 'bg-lime/20 text-lime'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Income
              </button>
            </div>

            <div>
              <label className="text-xs text-text-secondary mb-1 block">Description *</label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  type="text"
                  placeholder="e.g., Grocery shopping"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={`w-full pl-9 pr-3 py-2.5 bg-dark-elevated border rounded-lg text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none transition-colors ${
                    errors.description ? 'border-red-500/50' : 'border-white/[0.06] focus:border-lime/50'
                  }`}
                />
              </div>
              {errors.description && <p className="text-[10px] text-red-400 mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="text-xs text-text-secondary mb-1 block">Amount *</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="1000000"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  className={`w-full pl-9 pr-3 py-2.5 bg-dark-elevated border rounded-lg text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none transition-colors ${
                    errors.amount ? 'border-red-500/50' : 'border-white/[0.06] focus:border-lime/50'
                  }`}
                />
              </div>
              {errors.amount && <p className="text-[10px] text-red-400 mt-1">{errors.amount}</p>}
            </div>

 
            <div>
              <label className="text-xs text-text-secondary mb-1 block">Category *</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className={`w-full pl-9 pr-3 py-2.5 bg-dark-elevated border rounded-lg text-sm text-text-primary focus:outline-none appearance-none transition-colors ${
                    errors.category ? 'border-red-500/50' : 'border-white/[0.06] focus:border-lime/50'
                  } ${!formData.category ? 'text-text-secondary/50' : ''}`}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              {errors.category && <p className="text-[10px] text-red-400 mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="text-xs text-text-secondary mb-1 block">Date *</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className={`w-full pl-9 pr-3 py-2.5 bg-dark-elevated border rounded-lg text-sm text-text-primary focus:outline-none transition-colors ${
                    errors.date ? 'border-red-500/50' : 'border-white/[0.06] focus:border-lime/50'
                  }`}
                />
              </div>
              {errors.date && <p className="text-[10px] text-red-400 mt-1">{errors.date}</p>}
            </div>

            {/* Recipient (Optional) */}
            <div>
              <label className="text-xs text-text-secondary mb-1 block">Recipient (Optional)</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  type="text"
                  placeholder="e.g., Whole Foods"
                  value={formData.recipient}
                  onChange={(e) => handleInputChange('recipient', e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-dark-elevated border border-white/[0.06] rounded-lg text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-lime/50"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 lg:gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 border-white/10 text-text-primary hover:bg-white/5 text-xs lg:text-sm py-2.5 h-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-lime text-dark-bg hover:bg-lime-light text-xs lg:text-sm py-2.5 h-auto disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  state.editingTransaction ? 'Update' : 'Add'
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
