
export type Category = 'Groceries' | 'Entertainment' | 'Travel' | 'Housing' | 'Utilities' | 'Health' | 'Education' | 'Other';

export interface Transaction {
  id: string;
  amount: number;
  category: Category;
  description: string;
  date: string;
  type: 'expense' | 'income';
  taskId?: string;
}

export interface Budget {
  category: Category;
  limit: number;
  spent: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  priority: number; // 1 is highest
  isEmergencyFund: boolean;
  categoryPreference?: string; // e.g., "Gold", "Stocks", "Real Estate"
}

export interface ExpenseTask {
  id: string;
  name: string;
  budget: number;
  spent: number;
  items: { id: string; name: string; amount: number }[];
  isActive: boolean;
}

export interface AIInsight {
  type: 'alert' | 'advice' | 'investment';
  title: string;
  content: string;
  severity: 'low' | 'medium' | 'high';
}

export interface UserPersona {
  name: string;
  salary: number;
  familySize: number;
  totalLoans: number;
  investmentNiche: string;
  isSetup: boolean;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: Category;
  isPaid: boolean;
}
